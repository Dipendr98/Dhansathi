import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EXPLICIT_STATE_SCHEMES } from './state_portals.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function decodeHtml(value = '') {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseIndianDate(value) {
  const match = String(value || '').match(/(\d{2})-(\d{2})-(\d{4})/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  return `${yyyy}-${mm}-${dd}`;
}

function isExpired(dateIso) {
  if (!dateIso) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(`${dateIso}T23:59:59+05:30`);
  return date < today;
}

function inferLevels(name) {
  const text = name.toLowerCase();
  const levels = new Set();

  if (text.match(/pre\s*matric|school|class\s*ix|class\s*x|class\s*11|class\s*12|class\s*xi|class\s*xii/i)) {
    levels.add('school');
  }
  if (text.match(/post\s*matric/i)) {
    levels.add('school');
    levels.add('diploma');
    levels.add('graduation');
  }
  if (text.match(/iti|craftsmen|vocational|trade/i)) {
    levels.add('technical');
  }
  if (text.match(/diploma|polytechnic/i)) {
    levels.add('diploma');
  }
  if (text.match(/technical|professional|engineering|aicte|b\.?tech|b\.?e\b|architecture/i)) {
    levels.add('technical');
  }
  if (text.match(/under\s*graduate|undergraduate|ug\b|college|degree|bachelor/i)) {
    levels.add('graduation');
  }
  if (text.match(/post\s*graduate|postgraduate|pg\b|master/i)) {
    levels.add('postgraduation');
  }
  if (text.match(/fellowship|research|ph\.?d|doctorate/i)) {
    levels.add('phd');
  }
  if (text.match(/overseas|abroad/i)) {
    levels.add('abroad');
  }

  if (!levels.size) levels.add('graduation');
  return [...levels];
}

function inferTargetGroups(name, department) {
  const text = `${name} ${department}`.toLowerCase();
  const groups = new Set();

  if (text.includes('disabil')) groups.add('Students with disabilities');
  if (text.includes('sc ') || text.includes('schedule caste') || text.includes('scheduled caste')) groups.add('SC students');
  if (text.includes('st ') || text.includes('schedule tribe') || text.includes('scheduled tribe') || text.includes('tribal')) groups.add('ST students');
  if (text.includes('obc')) groups.add('OBC students');
  if (text.includes('ebc')) groups.add('EBC students');
  if (text.includes('dnt')) groups.add('DNT students');
  if (text.includes('girl') || text.includes('pragati')) groups.add('Girl students');
  if (text.includes('minority')) groups.add('Minority students');
  if (text.includes('transgender')) groups.add('Transgender students');
  if (text.includes('police') || text.includes('armed') || text.includes('railway') || text.includes('rpf')) groups.add('Wards of service personnel');
  if (text.includes('ner') || text.includes('north eastern')) groups.add('North Eastern Region students');
  if (!groups.size) groups.add('Eligible Indian students');

  return [...groups];
}

function inferState(department) {
  const text = department.toLowerCase();
  const match = department.match(/(?:State of|UT of|State Schemes? - |Government of)\s*([a-zA-Z\s]+)/i);
  if (match) {
    let name = match[1].trim();
    if (name.toLowerCase() === 'chattisgarh') name = 'Chhattisgarh';
    if (name.toLowerCase().includes('dadra nagar haveli')) name = 'Dadra and Nagar Haveli and Daman and Diu';
    return name;
  }
  const states = ['Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];
  for (const s of states) {
    if (text.includes(s.toLowerCase())) return s;
  }
  return null;
}

function inferPrograms(name, department) {
  const text = `${name} ${department}`.toLowerCase();
  const programs = new Set();
  
  if (text.match(/\bba\b|\bb\.a\b|\barts\b/i)) programs.add('BA');
  if (text.match(/\bbsc\b|\bb\.sc\b|\bscience\b/i)) programs.add('BSc');
  if (text.match(/\bbcom\b|\bb\.com\b|\bcommerce\b/i)) programs.add('BCom');
  if (text.match(/\bbba\b|\bb\.b\.a\b|\bbms\b|\bbbm\b/i)) programs.add('BBA/BMS');
  if (text.match(/\bbca\b|\bb\.c\.a\b/i)) programs.add('BCA');
  if (text.match(/\bbfa\b|\bb\.f\.a\b|\bfine arts\b/i)) programs.add('BFA');
  if (text.match(/\bbjmc\b|\bjournalism\b|\bmass communication\b/i)) programs.add('BJMC/Journalism');

  if (text.match(/\bbtech\b|\bb\.tech\b|\bengineering\b|\bb\.e\b|\bbe\b/i)) programs.add('BTech/BE');
  if (text.match(/\bdiploma\b|\bpolytechnic\b/i)) programs.add('Diploma');
  if (text.match(/\biti\b|\bcraftsmen\b|\bvocational\b/i)) programs.add('ITI');

  if (text.match(/\bmbbs\b|\bbds\b|\bmedical\b|\bneet\b/i)) programs.add('MBBS/BDS');
  if (text.match(/\bbams\b|\bbhms\b|\bayush\b/i)) programs.add('AYUSH (BAMS/BHMS)');
  if (text.match(/\bnursing\b|\bb\.sc nursing\b/i)) programs.add('Nursing');
  if (text.match(/\bpharmacy\b|\bb\.pharm\b|\bd\.pharm\b/i)) programs.add('Pharmacy');
  if (text.match(/\bparamedical\b|\bbpt\b|\bphysiotherapy\b/i)) programs.add('Paramedical/BPT');

  if (text.match(/\bllb\b|\blaw\b|\bclat\b/i)) programs.add('Law (LLB)');
  if (text.match(/\bdesign\b|\bb\.des\b|\bnift\b|\bnid\b/i)) programs.add('Design (B.Des)');
  if (text.match(/\barchitecture\b|\bb\.arch\b|\bplanning\b/i)) programs.add('B.Arch/Planning');
  if (text.match(/\beducation\b|\bb\.ed\b|\bd\.el\.ed\b|\bteaching\b/i)) programs.add('Education (B.Ed/D.El.Ed)');
  if (text.match(/\bagriculture\b|\bhorticulture\b|\bicar\b/i)) programs.add('Agriculture');
  if (text.match(/\bhotel management\b|\bhospitality\b/i)) programs.add('Hotel Management');
  if (text.match(/\bca\b|\bcs\b|\bcma\b|\bchartered accountant\b/i)) programs.add('CA/CS/CMA');

  if (text.match(/\bmsc\b|\bm\.sc\b/i)) programs.add('MSc');
  if (text.match(/\bmba\b|\bm\.b\.a\b/i)) programs.add('MBA');
  if (text.match(/\bmca\b|\bm\.c\.a\b/i)) programs.add('MCA');
  if (text.match(/\bmtech\b|\bm\.tech\b/i)) programs.add('MTech');
  if (text.match(/\bma\b|\bm\.a\b/i)) programs.add('MA');
  if (text.match(/\bmcom\b|\bm\.com\b/i)) programs.add('MCom');

  return [...programs];
}

function inferUniversity(name, department) {
  const text = `${name} ${department}`;
  const uniMatch = text.match(/([A-Za-z\s]+University)/i) || text.match(/([A-Za-z\s]+Institute of Technology)/i);
  if (uniMatch) {
    let uni = uniMatch[1].trim();
    if (uni.length > 50) uni = uni.slice(-50).trim();
    return uni;
  }
  return null;
}

function providerFromDepartment(department) {
  const text = department.toLowerCase();
  if (text.startsWith('state of ') || text.startsWith('ut of ')) return 'state';
  return 'central';
}

function makeId(name, department) {
  return `${department}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 120);
}

function pushCurrent(items, current) {
  if (!current?.name) return;
  items.push(current);
}

function parseNspScholarships(html, sourceUrl) {
  const lines = html.split('\n');
  const items = [];
  let department = 'National Scholarship Portal';
  let current = null;
  let readingDepartment = false;

  for (const line of lines) {
    if (line.includes('accordion-button')) {
      readingDepartment = true;
      continue;
    }

    if (readingDepartment) {
      const possibleDepartment = decodeHtml(line.replace(/<[^>]+>/g, ' '));
      if (possibleDepartment.includes('data-bs-') || possibleDepartment.includes('aria-') || possibleDepartment.includes('collapseOne')) {
        continue;
      }
      if (possibleDepartment) {
        department = possibleDepartment;
        readingDepartment = false;
      }
      continue;
    }

    const deptMatch = line.match(/<button[^>]*accordion-button[^>]*>\s*([^<]+?)\s*<\/button>/i);
    if (deptMatch) {
      department = decodeHtml(deptMatch[1]);
      continue;
    }

    const nameMatch = line.match(/<h6>\s*([^<]+?)\s*<\/h6>/i);
    if (nameMatch) {
      if (line.includes('<!--')) continue;
      pushCurrent(items, current);
      const name = decodeHtml(nameMatch[1]);
      current = {
        id: makeId(name, department),
        name,
        provider: providerFromDepartment(department),
        department,
        education_levels: inferLevels(name),
        target_groups: inferTargetGroups(name, department),
        benefits: 'See official specifications for benefit amount and rules',
        eligibility: 'Eligibility is defined by the live scheme specifications.',
        documents_required: ['Aadhaar', 'Income/category certificate if applicable', 'Previous marksheet', 'Bank account', 'Institution verification'],
        application_url: 'https://scholarships.gov.in/',
        portal: 'National Scholarship Portal',
        source: 'National Scholarship Portal',
        source_url: sourceUrl,
        deadline_hint: 'Check live portal dates before applying',
        status: 'open',
        state: inferState(department),
        university: inferUniversity(name, department),
        programs: inferPrograms(name, department),
      };
      continue;
    }

    if (!current) continue;

    const spanText = decodeHtml(line.replace(/<[^>]+>/g, ' '));
    if (spanText.includes('Scheme') && spanText.includes('Open from')) {
      current.schemeOpenDate = parseIndianDate(spanText);
    }
    if (spanText.includes('Student Application') && spanText.includes('Open till')) {
      current.studentApplicationCloseDate = parseIndianDate(spanText);
      current.deadline_hint = current.studentApplicationCloseDate
        ? `Student application open till ${current.studentApplicationCloseDate}`
        : current.deadline_hint;
      current.status = isExpired(current.studentApplicationCloseDate) ? 'expired' : 'open';
    }

    const links = [...line.matchAll(/<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi)];
    for (const [, href, label] of links) {
      const cleanLabel = decodeHtml(label).toLowerCase();
      const url = href.startsWith('http') ? href : new URL(href, sourceUrl).toString();
      if (cleanLabel.includes('specification')) current.specifications_url = url;
      if (cleanLabel.includes('faq')) current.faq_url = url;
    }
  }

  pushCurrent(items, current);
  return items;
}

function getLiveStateFallbacks(liveNspStates = []) {
  const liveStateSet = new Set(liveNspStates.filter(Boolean));
  
  const otherUTs = [
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
    'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  const generated = otherUTs
    .filter(state => !liveStateSet.has(state))
    .map(state => ({
      id: `state-portal-${state.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: `${state} State Post Matric & Merit Scholarships`,
      provider: 'state',
      department: `Social Welfare / Education Department, ${state}`,
      education_levels: ['school', 'diploma', 'graduation', 'postgraduation', 'technical'],
      target_groups: ['SC students', 'ST students', 'OBC students', 'Minority students', 'Economically Weaker Section'],
      benefits: 'Fee reimbursement and financial assistance for domicile students.',
      eligibility: `Must be a domicile of ${state}. Income and category rules apply.`,
      documents_required: ['Aadhaar', 'Income Certificate', 'Caste/Category Certificate', 'Domicile Certificate'],
      application_url: 'https://scholarships.gov.in/',
      portal: `${state} State Portal`,
      source: 'State Government',
      source_url: 'https://scholarships.gov.in/',
      deadline_hint: 'Check state portal for active dates',
      status: 'open',
      state: state,
      programs: ['BTech/BE', 'BSc', 'BA', 'BCom', 'MSc', 'MA', 'Diploma', 'ITI']
    }));

  return [...EXPLICIT_STATE_SCHEMES, ...generated];
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  // Github Actions can run longer, so timeout is 30s
  const timeout = setTimeout(() => controller.abort(), 30000); 

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        accept: 'text/html,application/xhtml+xml',
        ...options.headers,
      },
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function runScraper() {
  console.log('Starting daily scholarship scraper...');
  try {
    console.log('Fetching NSP Central Schemes...');
    const centralReq = fetchWithTimeout('https://scholarships.gov.in/All-Scholarships');
    
    console.log('Fetching NSP State Schemes...');
    const stateReq = fetchWithTimeout('https://scholarships.gov.in/centralsOrsponsoredOrstate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'central_sponsored_state=statescheme'
    });

    console.log('Fetching NSP Sponsored Schemes...');
    const sponsoredReq = fetchWithTimeout('https://scholarships.gov.in/centralsOrsponsoredOrstate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'central_sponsored_state=sponserscheme'
    });

    const [centralHtml, stateHtml, sponsoredHtml] = await Promise.allSettled([
      centralReq, stateReq, sponsoredReq
    ]);

    let allScholarships = [];

    if (centralHtml.status === 'fulfilled') {
      allScholarships.push(...parseNspScholarships(centralHtml.value, 'https://scholarships.gov.in/All-Scholarships'));
      console.log('Successfully parsed NSP Central');
    }
    if (stateHtml.status === 'fulfilled') {
      allScholarships.push(...parseNspScholarships(stateHtml.value, 'https://scholarships.gov.in/centralsOrsponsoredOrstate?state'));
      console.log('Successfully parsed NSP State');
    }
    if (sponsoredHtml.status === 'fulfilled') {
      allScholarships.push(...parseNspScholarships(sponsoredHtml.value, 'https://scholarships.gov.in/centralsOrsponsoredOrstate?sponsored'));
      console.log('Successfully parsed NSP Sponsored');
    }

    // Filter duplicates by ID
    const uniqueMap = new Map();
    for (const scheme of allScholarships) {
      if (!uniqueMap.has(scheme.id)) {
        uniqueMap.set(scheme.id, scheme);
      }
    }
    
    const fetchedStates = Array.from(uniqueMap.values()).map(s => s.state);
    
    const stateFallbacks = getLiveStateFallbacks(fetchedStates);
    for (const fallback of stateFallbacks) {
      if (!uniqueMap.has(fallback.id)) {
        uniqueMap.set(fallback.id, fallback);
      }
    }

    allScholarships = Array.from(uniqueMap.values());
    console.log(`Total scholarships fetched: ${allScholarships.length}`);

    // Ensure public dir exists
    const publicDir = path.join(__dirname, '../public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write to public/scholarships.json
    const outputPath = path.join(publicDir, 'scholarships.json');
    const outputData = {
      meta: {
        source: 'Automated GitHub Actions Scraper',
        fetched_at: new Date().toISOString(),
        total: allScholarships.length
      },
      scholarships: allScholarships
    };

    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`Successfully wrote to ${outputPath}`);
    process.exit(0);
  } catch (err) {
    console.error('Fatal error in scraper:', err);
    process.exit(1);
  }
}

runScraper();
