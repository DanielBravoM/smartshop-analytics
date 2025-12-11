import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

function LanguageSelector() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'eu', name: 'Euskera', flag: 'eu' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
        <Globe size={20} />
        <span className="hidden md:inline">
          {languages.find(lang => lang.code === i18n.language)?.flag || '🌍'}
        </span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition first:rounded-t-lg last:rounded-b-lg ${
              i18n.language === lang.code ? 'bg-purple-50 text-purple-700 font-semibold' : ''
            }`}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span>{lang.name}</span>
            {i18n.language === lang.code && (
              <span className="ml-auto text-purple-600">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default LanguageSelector;