import fs from 'fs';

const raw = fs.readFileSync('scratch/state_raw.txt', 'utf8');

const explicit = [];
const stateBlocks = raw.split(/State:\s*/).filter(Boolean);

for (const block of stateBlocks) {
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
  const stateName = lines[0];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('http')) {
      const parts = line.split(/:\s*http/);
      if (parts.length >= 2) {
        const title = parts[0];
        const url = 'http' + parts[1];
        
        explicit.push({
          id: `${stateName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          name: `${stateName} - ${title}`,
          provider: 'state',
          department: `State Government, ${stateName}`,
          education_levels: ['school', 'diploma', 'graduation', 'postgraduation', 'technical'],
          target_groups: ['SC students', 'ST students', 'OBC students', 'Minority students', 'Economically Weaker Section'],
          benefits: 'Financial aid and fee reimbursement as per specific scheme guidelines.',
          eligibility: `Must be a domicile of ${stateName}. Income, category, and academic rules apply based on the specific scheme.`,
          documents_required: ['Aadhaar', 'Income Certificate', 'Caste/Category Certificate', 'Domicile/Residence Certificate', 'Previous Marksheet'],
          application_url: url,
          portal: title,
          source: 'State Government',
          source_url: url,
          deadline_hint: 'Verify deadline on official website',
          status: 'open',
          state: stateName,
          programs: ['BTech/BE', 'BSc', 'BA', 'BCom', 'MSc', 'MA', 'Diploma', 'ITI']
        });
      }
    }
  }
}

const outStr = `// AUTO-GENERATED from user-provided official sources\nexport const EXPLICIT_STATE_SCHEMES = ${JSON.stringify(explicit, null, 2)};\n`;

fs.writeFileSync('scripts/state_portals.js', outStr);
console.log(`Generated ${explicit.length} state portals.`);
