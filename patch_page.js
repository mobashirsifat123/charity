const fs = require('fs');
let content = fs.readFileSync('src/app/page.jsx', 'utf8');

const importTarget = 'import PrayerTimesWidget from "@/components/home/PrayerTimesWidget";';
const newImports = `import PrayerTimesWidget from "@/components/home/PrayerTimesWidget";
import { fetchPublishedBlogs, fetchPublishedFatwas } from "@/lib/content-data";`;

const fetchTarget = 'const fallbackPrayerTimes = await getFallbackPrayerTimes();';
const newFetch = `const fallbackPrayerTimes = await getFallbackPrayerTimes();
  let initialBlogs = null;
  let initialFatwas = null;

  try {
    initialBlogs = await fetchPublishedBlogs(3);
  } catch (err) {
    console.error("Failed to fetch initial blogs", err);
  }

  try {
    initialFatwas = await fetchPublishedFatwas(3);
  } catch (err) {
    console.error("Failed to fetch initial fatwas", err);
  }`;

content = content.replace(importTarget, newImports);
content = content.replace(fetchTarget, newFetch);
content = content.replace("<FatwaHighlights />", "<FatwaHighlights initialFatwas={initialFatwas} />");
content = content.replace("<BlogOne />", "<BlogOne initialBlogs={initialBlogs} />");

fs.writeFileSync('src/app/page.jsx', content);
