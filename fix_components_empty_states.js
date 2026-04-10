const fs = require('fs');

function addEmptyState(file, arrayName, emptyMessage) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');

        // Target the mapping block usually starting with `{arrayName.map(`
        // Or inject exactly after checking `loading` state or finding the array wrapper.
        console.log(`Checking ${file}`);
        
        let targetRegex = new RegExp(`\\{${arrayName}\\.map\\(\\(`, 'g');
        
        if (content.match(targetRegex)) {
            let replacement = `{\(!${arrayName} \|\| ${arrayName}.length === 0\) && !loading ? (\n          <div className="col-12 py-5 text-center text-muted">\n            <p className="mb-0 fs-5">${emptyMessage}</p>\n          </div>\n        ) : ${arrayName}.map((`;
            
            content = content.replace(targetRegex, replacement);
            fs.writeFileSync(file, content);
            console.log(`Added empty state in ${file} for ${arrayName}`);
        }
    }
}

addEmptyState('src/components/FatwaHighlights.jsx', 'fatwas', 'No fatwas are currently available to display.');
addEmptyState('src/components/CampaignDiscovery.jsx', 'campaigns', 'Check back soon for new campaigns.');
addEmptyState('src/components/BlogOne.jsx', 'posts', 'New insights and articles will be published here shortly.');

