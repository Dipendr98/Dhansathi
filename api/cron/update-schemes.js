// Vercel Cron job: refreshes public/generated-government-schemes.json daily.
// Free replacement for the "Update government schemes" GitHub Actions workflow.
//
// Required Vercel environment variables:
//   MYSCHEME_API_KEY - x-api-key for api.myscheme.gov.in (the public key the
//                      myscheme.gov.in site sends; visible in browser DevTools)
//   GH_TOKEN         - fine-grained GitHub PAT with contents:write on the repo
// Optional:
//   CRON_SECRET      - if set, Vercel sends it as a Bearer token and this
//                      endpoint rejects requests without it

export const config = { maxDuration: 60 };

const API_KEY = process.env.MYSCHEME_API_KEY || '';
const GH_TOKEN = process.env.GH_TOKEN || '';
const REPO = process.env.SCHEMES_REPO || 'Dipendr98/Dhansathi';
const BRANCH = process.env.SCHEMES_BRANCH || 'main';
const FILE_PATH = 'public/generated-government-schemes.json';
const SEARCH_URL = 'https://api.myscheme.gov.in/search/v6/schemes';
const PAGE_SIZE = 100;
const PARALLEL_PAGES = 8;

const mySchemeHeaders = {
  origin: 'https://www.myscheme.gov.in',
  referer: 'https://www.myscheme.gov.in/',
  'user-agent': 'Mozilla/5.0 (DhanSathi scheme updater)',
  ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
};

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function mapScheme(item, previous, now, hasPreviousSnapshot) {
  const fields = item.fields || {};
  const slug = fields.slug || slugify(fields.schemeName || item.id);
  const prior = previous.get(slug);
  const categories = Array.isArray(fields.schemeCategory) ? fields.schemeCategory : [];
  const states = Array.isArray(fields.beneficiaryState) ? fields.beneficiaryState : [];
  const level = fields.level === 'State' ? 'state' : 'central';
  const firstSeenAt = prior?.first_seen_at || now;

  return {
    id: `myscheme-${slug}`,
    slug,
    name: fields.schemeName || fields.schemeShortTitle || slug,
    description: fields.briefDescription || 'Details available on myScheme.',
    ministry: fields.nodalMinistryName || 'Government of India',
    type: level,
    state: states.filter((state) => state !== 'All').join(', ') || undefined,
    benefits: fields.tags?.slice(0, 4).join(', ') || 'See official scheme details',
    eligibility_criteria: {
      states: states.length ? states : undefined,
      gender: 'any',
    },
    documents_required: [],
    status: fields.schemeCloseDate ? 'closed' : 'active',
    deadline: fields.schemeCloseDate || undefined,
    application_url: `https://www.myscheme.gov.in/schemes/${slug}`,
    scheme_categories: categories,
    source: 'myScheme',
    source_url: 'https://www.myscheme.gov.in/',
    is_new: hasPreviousSnapshot && !prior,
    first_seen_at: firstSeenAt,
    last_seen_at: now,
    created_at: firstSeenAt,
    updated_at: now,
  };
}

async function fetchPage(from) {
  const url = new URL(SEARCH_URL);
  url.searchParams.set('lang', 'en');
  url.searchParams.set('q', '');
  url.searchParams.set('keyword', '');
  url.searchParams.set('sort', 'multiple_sort');
  url.searchParams.set('from', String(from));
  url.searchParams.set('size', String(PAGE_SIZE));

  const response = await fetch(url, { headers: mySchemeHeaders });
  if (!response.ok) {
    throw new Error(`myScheme request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.statusCode !== 200 || !data.data?.hits?.items) {
    throw new Error(`Unexpected myScheme response: ${JSON.stringify(data).slice(0, 300)}`);
  }

  return data.data;
}

async function loadPrevious() {
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${FILE_PATH}`
    );
    if (!response.ok) return new Map();
    const parsed = await response.json();
    return new Map((parsed.schemes || []).map((scheme) => [scheme.slug || scheme.id, scheme]));
  } catch {
    return new Map();
  }
}

async function getCurrentFileSha() {
  // The file is >1MB so GET /contents/<file> fails; list the directory instead.
  const response = await fetch(
    `https://api.github.com/repos/${REPO}/contents/public?ref=${BRANCH}`,
    { headers: { authorization: `Bearer ${GH_TOKEN}`, 'user-agent': 'dhansathi-cron' } }
  );
  if (!response.ok) {
    throw new Error(`GitHub contents listing failed: ${response.status}`);
  }
  const entries = await response.json();
  const fileName = FILE_PATH.split('/').pop();
  return entries.find((entry) => entry.name === fileName)?.sha;
}

async function commitFile(content) {
  const sha = await getCurrentFileSha();
  const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${GH_TOKEN}`,
      'user-agent': 'dhansathi-cron',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Update government scheme feed (Vercel cron)',
      content: Buffer.from(content).toString('base64'),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub commit failed: ${response.status} ${body.slice(0, 300)}`);
  }
}

export default async function handler(req, res) {
  const auth = req.headers.authorization || '';
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!GH_TOKEN) {
    return res.status(500).json({ error: 'GH_TOKEN environment variable is not set.' });
  }

  try {
    const previous = await loadPrevious();
    const hasPreviousSnapshot = previous.size > 0;
    const now = new Date().toISOString();

    const firstPage = await fetchPage(0);
    const total = firstPage.hits.page.total;
    const facets = firstPage.facets || [];
    const schemes = firstPage.hits.items.map((item) =>
      mapScheme(item, previous, now, hasPreviousSnapshot)
    );

    const offsets = [];
    for (let from = PAGE_SIZE; from < total; from += PAGE_SIZE) offsets.push(from);
    for (let i = 0; i < offsets.length; i += PARALLEL_PAGES) {
      const batch = offsets.slice(i, i + PARALLEL_PAGES);
      const pages = await Promise.all(batch.map((from) => fetchPage(from)));
      for (const page of pages) {
        schemes.push(
          ...page.hits.items.map((item) => mapScheme(item, previous, now, hasPreviousSnapshot))
        );
      }
    }

    const payload = {
      meta: {
        source: 'myScheme',
        source_url: 'https://www.myscheme.gov.in/',
        updated_at: now,
        total,
        fetched: schemes.length,
        new_count: schemes.filter((scheme) => scheme.is_new).length,
      },
      facets,
      schemes,
    };

    await commitFile(`${JSON.stringify(payload)}\n`);

    return res.status(200).json({
      ok: true,
      total,
      fetched: schemes.length,
      new_count: payload.meta.new_count,
      updated_at: now,
    });
  } catch (error) {
    return res.status(502).json({ ok: false, error: error.message });
  }
}
