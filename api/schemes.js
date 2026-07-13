// Live government-schemes feed, served straight from myScheme.
// No env vars or GitHub token required — the site works out of the box.
//
// MYSCHEME_API_KEY is the public x-api-key that myscheme.gov.in ships to
// every visitor's browser (visible in DevTools > Network). It is not a
// private secret. An env var of the same name overrides the default if
// myScheme ever rotates it.

export const config = { maxDuration: 60 };

const API_KEY =
  process.env.MYSCHEME_API_KEY || 'tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc';
const SEARCH_URL = 'https://api.myscheme.gov.in/search/v6/schemes';
const PAGE_SIZE = 100;
const PARALLEL_PAGES = 10;

const headers = {
  origin: 'https://www.myscheme.gov.in',
  referer: 'https://www.myscheme.gov.in/',
  'user-agent': 'Mozilla/5.0 (DhanSathi scheme updater)',
  'x-api-key': API_KEY,
};

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function mapScheme(item, now) {
  const fields = item.fields || {};
  const slug = fields.slug || slugify(fields.schemeName || item.id);
  const categories = Array.isArray(fields.schemeCategory) ? fields.schemeCategory : [];
  const states = Array.isArray(fields.beneficiaryState) ? fields.beneficiaryState : [];
  const level = fields.level === 'State' ? 'state' : 'central';

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
    is_new: false,
    first_seen_at: now,
    last_seen_at: now,
    created_at: now,
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

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`myScheme request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.statusCode !== 200 || !data.data?.hits?.items) {
    throw new Error(`Unexpected myScheme response: ${JSON.stringify(data).slice(0, 300)}`);
  }

  return data.data;
}

export default async function handler(req, res) {
  try {
    const now = new Date().toISOString();

    const firstPage = await fetchPage(0);
    const total = firstPage.hits.page.total;
    const facets = firstPage.facets || [];
    const schemes = firstPage.hits.items.map((item) => mapScheme(item, now));

    const offsets = [];
    for (let from = PAGE_SIZE; from < total; from += PAGE_SIZE) offsets.push(from);
    for (let i = 0; i < offsets.length; i += PARALLEL_PAGES) {
      const batch = offsets.slice(i, i + PARALLEL_PAGES);
      const pages = await Promise.all(batch.map((from) => fetchPage(from)));
      for (const page of pages) {
        schemes.push(...page.hits.items.map((item) => mapScheme(item, now)));
      }
    }

    // Cache at the edge so myScheme is only hit once a day, not per visitor.
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=86400');
    return res.status(200).json({
      meta: {
        source: 'myScheme',
        source_url: 'https://www.myscheme.gov.in/',
        updated_at: now,
        total,
        fetched: schemes.length,
        new_count: 0,
      },
      facets,
      schemes,
    });
  } catch (error) {
    // The frontend falls back to the committed static snapshot on any error.
    return res.status(502).json({
      meta: { source: 'Live Fail', updated_at: new Date().toISOString() },
      schemes: [],
      error: error.message,
    });
  }
}
