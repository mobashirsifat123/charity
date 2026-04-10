const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = [
    'src/components/TestimonialOne.jsx',
    'src/components/HeaderOne.jsx',
    'src/components/FooterOne.jsx',
    'src/components/TeamOne.jsx',
    'src/components/DifferenceOne.jsx'
];

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        if (content.includes('"use client";') || content.includes("'use client';")) {
            // remove it
            content = content.replace(/"use client";\n?/g, '');
            content = content.replace(/'use client';\n?/g, '');
            // add to top
            content = '"use client";\n' + content;
            fs.writeFileSync(file, content);
        }
    }
}
