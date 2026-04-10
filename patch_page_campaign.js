const fs = require('fs');
let content = fs.readFileSync('src/app/page.jsx', 'utf8');

// Update imports
content = content.replace(
    'import { fetchPublishedBlogs, fetchPublishedFatwas } from "@/lib/content-data";',
    'import { fetchPublishedBlogs, fetchPublishedFatwas, fetchPublishedCampaigns } from "@/lib/content-data";'
);

// Add fetch
const fetchTarget = 'let initialFatwas = null;';
const newFetch = `let initialFatwas = null;
  let initialCampaigns = null;`;

content = content.replace(fetchTarget, newFetch);

const fetchEndTarget = `try {
    initialFatwas = await fetchPublishedFatwas(3);
  } catch (err) {
    console.error("Failed to fetch initial fatwas", err);
  }`;

const newFetchExt = `try {
    initialFatwas = await fetchPublishedFatwas(3);
  } catch (err) {
    console.error("Failed to fetch initial fatwas", err);
  }

  try {
    initialCampaigns = await fetchPublishedCampaigns(6);
  } catch (err) {
    console.error("Failed to fetch initial campaigns", err);
  }`;

content = content.replace(fetchEndTarget, newFetchExt);

// Replace CampaignDiscovery element
content = content.replace(
    '<CampaignDiscovery />',
    '<CampaignDiscovery initialCampaigns={initialCampaigns} />'
);

fs.writeFileSync('src/app/page.jsx', content);
