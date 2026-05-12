import React from 'react';
import { useTranslation } from 'react-i18next';
import './language.css';
import '../lang/i18n'; // Força o carregamento da config aqui também

const Language = () => {
  const { i18n } = useTranslation();

  // Nome da chave que o teu colega usa (ajusta se necessário)
  const STORAGE_KEY = 'settings_lang'; 

  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    
    // 1. Muda o idioma no i18next (atualiza a UI instantaneamente)
    i18n.changeLanguage(newLang);
    
    // 2. Guarda no localStorage para o código do teu colega e persistência
    localStorage.setItem(STORAGE_KEY, newLang);
  };

  return (
    <div className="language-dropdown-container">
      <span className="lang-icon">🌐</span>
      <select 
        className="language-select" 
        value={i18n.language} 
        onChange={handleLanguageChange}
      >
        <option value="pt">Português (PT)</option>
        <option value="en">English (EN)</option>
        <option value="es">Espanhol (es)</option>
      </select>
    </div>
  );
};

export default Language;