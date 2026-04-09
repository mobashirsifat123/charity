const EBOOKS = [
  {
    slug: "foundations-of-faith",
    title: "Foundations of Faith",
    category: "Aqeedah",
    author: "IRWA Knowledge Team",
    pages: 96,
    language: "English",
    publishedAt: "2026-03-18",
    summary:
      "A simple guide to core Islamic belief, written for readers who want clarity without technical jargon.",
    description:
      "This ebook introduces the essential beliefs every Muslim should understand, including faith in Allah, the angels, the revealed books, the messengers, the Last Day, and divine decree. It is arranged in short sections for easy reading and teaching.",
    highlight: "Begin here if you want a calm, clear overview of Islamic creed.",
  },
  {
    slug: "mercy-in-dawah",
    title: "Mercy in Dawah",
    category: "Muslim Personality",
    author: "Shaykh Salman Idris",
    pages: 72,
    language: "English",
    publishedAt: "2026-03-10",
    summary:
      "Practical advice on calling people to Islam with gentleness, patience, and wisdom.",
    description:
      "This title explores the manners of giving advice, the importance of sincerity, and how to combine truthfulness with compassion when speaking to family, friends, and wider society.",
    highlight: "Useful for community volunteers, teachers, and anyone active in dawah.",
  },
  {
    slug: "the-heart-in-ramadan",
    title: "The Heart in Ramadan",
    category: "Ramadhan",
    author: "Ustadh Maryam Kareem",
    pages: 84,
    language: "English",
    publishedAt: "2026-02-28",
    summary:
      "A reader-friendly Ramadan companion focused on worship, habits, and spiritual renewal.",
    description:
      "Structured around preparation, fasting, Qur'an recitation, dua, charity, and the last ten nights, this ebook helps readers turn Ramadan into a season of long-term personal growth.",
    highlight: "Ideal for Ramadan study circles and family reading plans.",
  },
  {
    slug: "journey-of-hajj-and-umrah",
    title: "Journey of Hajj and Umrah",
    category: "Hajj & Umrah",
    author: "IRWA Research Desk",
    pages: 118,
    language: "English",
    publishedAt: "2026-03-05",
    summary:
      "A practical handbook that explains the rites, meanings, and common mistakes of Hajj and Umrah.",
    description:
      "Alongside the rituals themselves, this ebook highlights spiritual preparation, travel etiquette, and the mindset of a pilgrim so readers can approach the journey with confidence and reverence.",
    highlight: "Designed as an easy pre-travel companion for pilgrims.",
  },
  {
    slug: "women-of-strength-and-knowledge",
    title: "Women of Strength and Knowledge",
    category: "Woman",
    author: "Dr. Huda Saeed",
    pages: 90,
    language: "English",
    publishedAt: "2026-01-22",
    summary:
      "Stories, reflections, and lessons from remarkable women in Islamic history.",
    description:
      "The book gathers examples of scholarship, service, courage, and devotion from women whose lives continue to inspire Muslim homes and communities today.",
    highlight: "Built to be accessible for young adults and family study.",
  },
  {
    slug: "forty-reflections-on-the-quran",
    title: "Forty Reflections on the Quran",
    category: "Quran",
    author: "Ustadh Bilal Rahman",
    pages: 140,
    language: "English",
    publishedAt: "2026-03-12",
    summary:
      "Short reflections that connect Quranic guidance to daily life, worship, and character.",
    description:
      "Each reflection takes one Quranic theme and turns it into a practical reminder, making this ebook ideal for readers who want gentle, consistent engagement with revelation.",
    highlight: "Well suited for daily reading and halaqah discussion.",
  },
  {
    slug: "the-prophets-as-teachers",
    title: "The Prophets as Teachers",
    category: "Prophets and Messengers",
    author: "IRWA Editorial Team",
    pages: 110,
    language: "English",
    publishedAt: "2026-02-15",
    summary:
      "Lessons in leadership, trust, patience, and reform drawn from the lives of the prophets.",
    description:
      "This ebook focuses on how the stories of the prophets shape a believer's worldview and teach resilience in times of struggle or responsibility.",
    highlight: "A strong introduction for readers who enjoy seerah and history.",
  },
  {
    slug: "acts-of-worship-that-shape-life",
    title: "Acts of Worship That Shape Life",
    category: "Fiqh",
    author: "Shaykh Yusuf Kareem",
    pages: 88,
    language: "English",
    publishedAt: "2026-02-02",
    summary:
      "A plain-language explanation of prayer, fasting, charity, and remembrance in everyday life.",
    description:
      "Instead of technical detail alone, this book explains how worship reforms behavior, builds discipline, and strengthens the relationship between the servant and Allah.",
    highlight: "Helpful for new Muslims and anyone refreshing core practice.",
  },
  {
    slug: "hadith-for-everyday-character",
    title: "Hadith for Everyday Character",
    category: "Hadeeth",
    author: "IRWA Hadith Circle",
    pages: 76,
    language: "English",
    publishedAt: "2026-01-30",
    summary:
      "Selected hadith with short explanations focused on sincerity, manners, and relationships.",
    description:
      "The collection is designed for easy reading and practical application, helping readers take prophetic teachings into family life, work, and community engagement.",
    highlight: "Short chapters make it ideal for weekly study sessions.",
  },
  {
    slug: "lessons-from-islamic-history",
    title: "Lessons from Islamic History",
    category: "History",
    author: "Dr. Anas Qasim",
    pages: 132,
    language: "English",
    publishedAt: "2025-12-18",
    summary:
      "A guided look at defining moments in Islamic history and what they teach Muslims today.",
    description:
      "This book avoids dense chronology and instead focuses on leadership, scholarship, reform, hardship, and renewal across major historical periods.",
    highlight: "Built for readers who want meaning, not just dates and names.",
  },
  {
    slug: "a-guide-to-salah",
    title: "A Guide to Salah",
    category: "Fiqh",
    author: "IRWA Research Desk",
    pages: 64,
    language: "English",
    publishedAt: "2026-03-01",
    summary:
      "A clear handbook on prayer, common mistakes, and building consistency.",
    description:
      "The guide explains prerequisites, pillars, daily structure, concentration, and the most common prayer errors in a concise and practical way.",
    highlight: "A solid starter book for young Muslims and reverts.",
  },
  {
    slug: "building-a-muslim-home",
    title: "Building a Muslim Home",
    category: "Muslim Personality",
    author: "Ustadhah Amina Rashid",
    pages: 102,
    language: "English",
    publishedAt: "2026-02-11",
    summary:
      "Reflections on mercy, routines, learning, and worship inside the family home.",
    description:
      "This title helps readers think about the home as a place of worship, education, emotional safety, and service to others.",
    highlight: "Written for families who want practical, realistic change.",
  },
];

export function listEbooks() {
  return [...EBOOKS].sort(
    (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()
  );
}

export function getEbookBySlug(slug = "") {
  return EBOOKS.find((item) => item.slug === String(slug).trim()) || null;
}

export function listEbookCategories() {
  return Array.from(new Set(EBOOKS.map((item) => item.category))).sort((left, right) =>
    left.localeCompare(right)
  );
}

export function getRelatedEbooks(slug = "", limit = 4) {
  const current = getEbookBySlug(slug);
  if (!current) return [];

  return listEbooks()
    .filter((item) => item.slug !== current.slug)
    .sort((left, right) => {
      const leftScore = left.category === current.category ? 1 : 0;
      const rightScore = right.category === current.category ? 1 : 0;
      if (leftScore !== rightScore) return rightScore - leftScore;
      return new Date(right.publishedAt) - new Date(left.publishedAt);
    })
    .slice(0, limit);
}
