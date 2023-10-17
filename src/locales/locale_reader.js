!(function () {
  'use strict';

  const fs = require('fs');
  const path = require('path');
  const { locale } = require('intl-locale');

  let currentLocale;

  async function loadTranslations(lang) {
    try {
      const data = fs.readFileSync(
        path.join(__dirname, '..', '..', 'locales', `${lang}.json`),
        'utf8'
      );
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading translations for ${lang}:`, error);
      return {};
    }
  }

  function setLocale(lang) {
    currentLocale = lang;
  }

  function initializeLocale() {
    try {
      const detectedLocale = locale.split('-')[0];
      currentLocale = fs.existsSync(
        path.join(
          __dirname,
          '..',
          '..',
          '..',
          'locales',
          `${detectedLocale}.json`
        )
      )
        ? detectedLocale
        : 'en';
    } catch (error) {
      console.error('Error detecting OS locale:', error);
      currentLocale = 'en';
    }
  }

  async function l18n(key, data = {}) {
    const translations = await loadTranslations(currentLocale);
    let translation = translations[key] || key;

    // Replace placeholders like {name} with actual values from data
    for (const [placeholder, value] of Object.entries(data)) {
      const regex = new RegExp(`{${placeholder}}`, 'g');
      translation = translation.replace(regex, value);
    }

    return translation;
  }

  module.exports = {
    initializeLocale,
    setLocale,
    l18n
  };
})();
