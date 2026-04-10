const fs = require('fs');

function replaceImg(file) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        
        if (!content.includes('import Image from')) {
            content = content.replace(/(import .*?;)/, '$1\nimport Image from "next/image";');
        }

        if (file.includes('CampaignDiscovery')) {
            content = content.replace(
                /<img\s*\n\s*src={getImageUrl\(campaign\.image_url\)}\s*\n\s*alt={campaign\.title}\s*\n\s*className="card-img-top object-fit-cover"\s*\n\s*style={{ height: '220px' }}\s*\n\s*\/>/m,
                '<Image\nsrc={getImageUrl(campaign.image_url) || "/assets/images/default-campaign.jpg"}\nalt={campaign.title}\nwidth={400}\nheight={220}\nclassName="card-img-top object-fit-cover w-100"\nstyle={{ height: "220px" }}\n/>'
            );
        } else if (file.includes('CampaignSection')) {
            content = content.replace(
                 /<img\s*\n\s*src={campaign\.image_url\s*\|\|\s*'\/assets\/images\/cause\/one\.png'}\s*\n\s*alt={campaign\.title}\s*\n\s*className="w-100 object-fit-cover"\s*\n\s*style={{ height: '240px' }}\s*\n\s*\/>/,
                 '<Image\nsrc={campaign.image_url || "/assets/images/cause/one.png"}\nalt={campaign.title}\nwidth={400}\nheight={240}\nclassName="w-100 object-fit-cover"\nstyle={{ height: "240px" }}\n/>'
            );
        }
        
        fs.writeFileSync(file, content);
    }
}

replaceImg('src/components/CampaignDiscovery.jsx');
replaceImg('src/components/CampaignSection.jsx');
