import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const API_KEY = process.env.MYSCHEME_API_KEY || '';
const SEARCH_URL = 'https://api.myscheme.gov.in/search/v6/schemes';
const OUTPUT_PATH = resolve('public/generated-government-schemes.json');
const PAGE_SIZE = 100;

const headers = {
  origin: 'https://www.myscheme.gov.in',
  referer: 'https://www.myscheme.gov.in/',
  'user-agent': 'Mozilla/5.0 (DhanSathi scheme updater)',
};

if (API_KEY) {
  headers['x-api-key'] = API_KEY;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function loadPrevious() {
  if (!existsSync(OUTPUT_PATH)) return new Map();
  try {
    const parsed = JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'));
    return new Map((parsed.schemes || []).map((scheme) => [scheme.slug || scheme.id, scheme]));
  } catch {
    return new Map();
  }
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

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`myScheme request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (data.statusCode !== 200 || !data.data?.hits?.items) {
    throw new Error(`Unexpected myScheme response: ${JSON.stringify(data).slice(0, 500)}`);
  }

  return data.data;
}

async function main() {
  const previous = loadPrevious();
  const hasPreviousSnapshot = previous.size > 0;
  const now = new Date().toISOString();

  const firstPage = await fetchPage(0);
  const total = firstPage.hits.page.total;
  const facets = firstPage.facets || [];
  const schemes = [...firstPage.hits.items.map((item) => mapScheme(item, previous, now, hasPreviousSnapshot))];

  for (let from = PAGE_SIZE; from < total; from += PAGE_SIZE) {
    const page = await fetchPage(from);
    schemes.push(...page.hits.items.map((item) => mapScheme(item, previous, now, hasPreviousSnapshot)));
    console.log(`Fetched ${Math.min(from + PAGE_SIZE, total)} / ${total}`);
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

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Wrote ${schemes.length} schemes to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
