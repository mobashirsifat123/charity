const fs = require('fs');

function checkAndInject(file, condition, fallback) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');

        // Add import for notFound securely without overriding existing React stuff excessively
        if (!content.includes('import { notFound }')) {
            content = content.replace('from "next/navigation";', 'from "next/navigation";\nimport { notFound } from "next/navigation";');
        }

        if (!content.includes('if (!loading && !campaign)')) {
            // Find the place right under `if (loading)` and inject our 404 guard
            let loadingRegex = /if \(loading\) \{\s+return \([\s\S]*?\}\);\s+\}/m;
            let replacement = `if (loading) {\n${content.match(loadingRegex)[0].substring(15)}\n\n    if (!campaign) {\n        notFound();\n    }`;
            content = content.replace(loadingRegex, replacement);
            fs.writeFileSync(file, content);
            console.log(`Injected 404 handler into ${file}`);
        }
    }
}

// cause-details
let causeFile = 'src/app/cause-details/[id]/page.jsx';
if (fs.existsSync(causeFile)) {
    let raw = fs.readFileSync(causeFile, 'utf8');
    if (!raw.includes('import { notFound }')) {
        raw = 'import { notFound } from "next/navigation";\n' + raw;
    }
    if (!raw.includes('if (!campaign) return notFound()')) {
        raw = raw.replace(
            /(if \(loading\) \{\s*return \(\s*<section className="page-wrapper">\s*<HeaderOne \/>\s*<BreadcrumbOne.*?\/>\s*<div className="container py-5">\s*<div className="text-center py-5">\s*<div.*?<\/div>\s*<h4.*?>.*?<\/h4>\s*<\/div>\s*<\/div>\s*<FooterOne \/>\s*<\/section>\s*\);\s*\})/,
            '$1\n\n    if (!campaign || campaign.message === "Not Found") return notFound();'
        );
        fs.writeFileSync(causeFile, raw);
        console.log("Updated 404 guard in cause-details");
    }
}

