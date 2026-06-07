import fs from 'fs';

const liveFeedStr = fs.readFileSync('public/generated-government-schemes.json', 'utf8');
const liveFeed = JSON.parse(liveFeedStr);

const liveSchemes = liveFeed.schemes;

const byKey = new Map();

for (const scheme of liveSchemes) {
  byKey.set(scheme.slug || scheme.name.toLowerCase(), scheme);
}

console.log("Original liveSchemes length:", liveSchemes.length);
console.log("After byKey map length:", byKey.size);
