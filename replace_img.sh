#!/bin/bash

function replace_img() {
    local file=$1
    if ! grep -q "import Image from" "$file"; then
        if grep -q "import Link from" "$file"; then
            sed -i '' 's/import Link from/import Image from "next\/image";\nimport Link from/' "$file"
        else
            sed -i '' '1s/^/import Image from "next\/image";\n/' "$file"
        fi
    fi
}

replace_img src/components/HeaderOne.jsx
sed -i '' 's/<img src={settings.site_logo_url} alt={settings.site_name || '\''Site Logo'\''} className='\''site-logo site-logo--header'\'' \/>/<Image src={settings.site_logo_url} alt={settings.site_name || '\''Site Logo'\''} className='\''site-logo site-logo--header'\'' width={150} height={52} style={{ width: "auto", height: "52px" }} priority \/>/g' src/components/HeaderOne.jsx
sed -i '' 's/<img src={settings.site_logo_url} alt={settings.site_name || '\''Site Logo'\''} className='\''site-logo site-logo--mobile'\'' \/>/<Image src={settings.site_logo_url} alt={settings.site_name || '\''Site Logo'\''} className='\''site-logo site-logo--mobile'\'' width={120} height={44} style={{ width: "auto", height: "44px" }} priority \/>/g' src/components/HeaderOne.jsx

replace_img src/components/FooterOne.jsx
sed -i '' 's/<img src={settings.site_logo_url} alt={settings.site_name || '\''Site Logo'\''} className="site-logo site-logo--footer" \/>/<Image src={settings.site_logo_url} alt={settings.site_name || '\''Site Logo'\''} className="site-logo site-logo--footer" width={160} height={58} style={{ width: "auto", height: "58px" }} \/>/g' src/components/FooterOne.jsx

replace_img src/components/TestimonialOne.jsx
sed -i '' 's/<img src={settings.testimonial_avatar_url || "https:\/\/images.unsplash.com\/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"}/<Image src={settings.testimonial_avatar_url || "https:\/\/images.unsplash.com\/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"} width={100} height={100}/g' src/components/TestimonialOne.jsx

replace_img src/components/TeamOne.jsx
sed -i '' 's/<img src={member.image_url} alt={member.name} className="w-100 h-100 object-fit-cover"/<Image src={member.image_url} alt={member.name} width={400} height={500} className="w-100 h-100 object-fit-cover"/g' src/components/TeamOne.jsx

replace_img src/components/DifferenceOne.jsx
sed -i '' 's/<img/<Image width={600} height={600}/g' src/components/DifferenceOne.jsx
