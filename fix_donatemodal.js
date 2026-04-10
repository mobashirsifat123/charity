const fs = require('fs');

const file = 'src/components/DonateModal.jsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  // Fix window.location.origin to be safe
  content = content.replace(
    /successUrl: \`\$\{window\.location\.origin\}\/donation\/success\`,/g,
    'successUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/donation/success`,'
  );
  content = content.replace(
    /cancelUrl: campaignId\s*\n\s*\?\s*\`\$\{window\.location\.origin\}\/cause-details\/\$\{campaignId\}\`\s*\n\s*:\s*\`\$\{window\.location\.origin\}\/donation\`/g,
    'cancelUrl: campaignId\n? `${typeof window !== "undefined" ? window.location.origin : ""}/cause-details/${campaignId}`\n: `${typeof window !== "undefined" ? window.location.origin : ""}/donation`'
  );

  fs.writeFileSync(file, content);
}
