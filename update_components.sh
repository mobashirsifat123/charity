#!/bin/bash
sed -i '' 's/function BlogOne()/function BlogOne({ initialBlogs })/' src/components/BlogOne.jsx
sed -i '' 's/useState(FALLBACK_POSTS)/useState(initialBlogs || FALLBACK_POSTS)/' src/components/BlogOne.jsx
sed -i '' 's/function FatwaHighlights()/function FatwaHighlights({ initialFatwas })/' src/components/FatwaHighlights.jsx
sed -i '' 's/useState(FALLBACK_FATWAS)/useState(initialFatwas || FALLBACK_FATWAS)/' src/components/FatwaHighlights.jsx
sed -i '' 's/export default function CampaignDiscovery()/export default function CampaignDiscovery({ initialCampaigns })/g' src/components/CampaignDiscovery.jsx
sed -i '' 's/useState(FALLBACK_CAMPAIGNS)/useState(initialCampaigns || FALLBACK_CAMPAIGNS)/' src/components/CampaignDiscovery.jsx
