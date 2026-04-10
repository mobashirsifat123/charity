const fs = require('fs');
let file = 'src/app/cause-details/[id]/page.jsx';
if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Ensure 'use client' is the very first line before imports
    content = content.replace('import { notFound } from "next/navigation";\n"use client";', '"use client";\nimport { notFound } from "next/navigation";');
    fs.writeFileSync(file, content);
}
