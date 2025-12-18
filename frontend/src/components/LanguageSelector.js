import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'es', name: 'Español', flag: 'ES' },
    { code: 'eu', name: 'Euskera', flag: 'EU' },
    { code: 'en', name: 'English', flag: 'GB' }
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón del globo */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition text-white"
      >
        <Globe size={22} />
      </button>

      {/* Modal de selección de idioma */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🌍 Selecciona tu idioma
            </h3>
            
            <div className="space-y-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition transform hover:scale-105 ${
                    i18n.language === lang.code
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  <span className="text-3xl">{lang.flag}</span>
                  <span className="text-lg font-semibold flex-1 text-left">{lang.name}</span>
                  {i18n.language === lang.code && (
                    <span className="text-2xl">✓</span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-6 w-full py-2 text-gray-600 hover:text-gray-800 font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default LanguageSelector;