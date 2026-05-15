import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { SettingsManager } from '../api/settingsManager.js';

// Importa os teus ficheiros JSON de tradução
import translationPT from './pt.json';
import translationEN from './en.json';
import translationES from './es.json';

const customLanguageDetector = {
  name: 'settingsManagerDetector',
  lookup() {
    const settings = SettingsManager.GetSetting("LANGUAGE");
    return settings; // Retorna "pt", "en", etc.
  },
  cacheUserLanguage(lng) {
    SettingsManager.SaveSetting('LANGUAGE', lng);
  }
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector(customLanguageDetector);

i18n
  .use(languageDetector) 
  .use(initReactI18next)
  .init({
    debug: false,
    initAsync: false,
    resources: {
      pt: { translation: translationPT },
      en: { translation: translationEN },
      es: { translation: translationES }
    },
    // O fallbackLng será usado se o SettingsManager retornar algo inválido
    fallbackLng: 'pt',
    react: {
      useSuspense: false 
    },
    detection: {
      // Definimos para usar o nosso detector customizado primeiro
      order: ['settingsManagerDetector', 'localStorage', 'navigator'],
      caches: ['settingsManagerDetector']
    },
    interpolation: {
      escapeValue: false 
    },
  });

export default i18n;