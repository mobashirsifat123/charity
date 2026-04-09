"use client";

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher({ compact = false, className = '' }) {
  const { locale, setLocale, t } = useLanguage();

  const buttonClass = compact ? 'btn btn-sm' : 'btn btn-sm px-3';

  return (
    <div
      className={`d-inline-flex align-items-center gap-1 rounded-pill border border-secondary-subtle bg-white p-1 ${className}`}
      aria-label={t('language', 'Language')}
    >
      <button
        type="button"
        className={`${buttonClass} ${locale === 'en' ? 'btn-primary' : 'btn-light'}`}
        onClick={() => setLocale('en')}
      >
        {t('english', 'English')}
      </button>
      <button
        type="button"
        className={`${buttonClass} ${locale === 'ar' ? 'btn-primary' : 'btn-light'}`}
        onClick={() => setLocale('ar')}
      >
        {t('arabic', 'Arabic')}
      </button>
    </div>
  );
}
