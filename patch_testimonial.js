const fs = require('fs');
let content = fs.readFileSync('src/components/TestimonialOne.jsx', 'utf8');

if (!content.includes('import Image from')) {
    content = 'import Image from "next/image";\n' + content;
}

content = content.replace(
    '<img src={settings.testimonial_avatar_url || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"}',
    '<Image src={settings.testimonial_avatar_url || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"} width={60} height={60}'
);

fs.writeFileSync('src/components/TestimonialOne.jsx', content);
