#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const translate = require('translate');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

async function main(lang) {
  try {
    if (!lang) {
      throw new Error('[OpenOrchid Translator] Language code not provided.');
    }

    const localesIndexPath = 'build/locales_index.txt';
    const localesIndex = await readFileAsync(localesIndexPath, 'utf8');
    const locales = localesIndex.split('\n').filter(Boolean);

    for (const file of locales) {
      console.log(`[translator] Translating "${file}"...`);

      const localeContent = await readFileAsync(path.join(file), 'utf8');
      const filepath = file.replace('en-US', lang);

      const localeLines = localeContent.split('\n');
      const translatedLines = [];

      for (const line of localeLines) {
        if (line.includes('=') && !line.startsWith('#')) {
          const [key, value] = line.split('=').map(str => str.trim());
          const translation = await translateText(value, 'en', lang);

          translatedLines.push(`${key} = ${translation}`);
          console.log(`[translator, ${key}] Translated "${value}" successfully to "${translation}"...`);
        } else {
          translatedLines.push(line);
        }
      }

      await writeFileAsync(filepath, translatedLines.join('\n'), 'utf8');
    }

    console.log('[translator] Translation completed successfully.');
  } catch (error) {
    console.error('[translator] Error occurred:', error);
  }
}

async function translateText(text, sourceLang, targetLang) {
  try {
    const translation = await translate(text, {
      from: sourceLang,
      to: targetLang,
      engine: 'google',
      key: 'AIzaSyBJHGk4_lPVNEyL6-n_VkbfmOGuC2bd8dQ' // Replace with your Google Translate API key
    });
    return translation;
  } catch (e) {
    console.error('[translator] Failed to translate:', e);
    // You can choose to return the original text or throw an error here
    return text;
  }
}

const lang = process.argv[2];
main(lang);
