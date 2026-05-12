import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importa os teus ficheiros JSON de tradução
import translationPT from './pt.json';
import translationEN from './en.json';
import translationES from './es.json';

const resources = {
  pt: { translation: translationPT },
  en: { translation: translationEN },
  es: { translation: translationES }
};

i18n
  .use(LanguageDetector) // Deteta automaticamente
  .use(initReactI18next)
  .init({
    debug: false,
    initAsync: false, // <--- GARANTE QUE ESTÁ FALSE
    resources: {
      pt: { translation: translationPT },
      en: { translation: translationEN },
      es: { translation: translationES }
    },
    lng: localStorage.getItem('settings_lang') || 'pt',
    fallbackLng: 'pt',
    react: {
      useSuspense: false // <--- ADICIONA ISTO
    },


    detection: {
      // Ordem de prioridade: Primeiro o que está no localStorage
      order: ['localStorage', 'navigator'], 
      
      // A chave exata que o teu colega usa e que o teu dropdown vai atualizar
      lookupLocalStorage: 'settings_lang', 
      
      // Garante que o i18next guarda as futuras trocas nesta mesma chave
      caches: ['localStorage']
    },

    interpolation: {
      escapeValue: false // O React já protege contra XSS
    },
    
  });

export default i18n;