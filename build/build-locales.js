const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { glob } = require('glob');

require('dotenv').config();

function translateFiles(sourcePath, lang) {
  const readFileAsync = promisify(fs.readFile);
  const writeFileAsync = promisify(fs.writeFile);

  glob(sourcePath.replaceAll('\\', '/')).then(async (locales) => {
    const translateModule = await import('translate');
    const translate = translateModule.default;

    for (const file of locales) {
      console.log(`[translator] Translating "${file}"...`);

      const localeContent = await readFileAsync(path.join(file), 'utf8');
      const filepath = file.replace('en-US', lang);

      const localeLines = localeContent.split('\n');
      const translatedLines = [];

      for (let index = 0; index < localeLines.length; index++) {
        const line = localeLines[index];

        if (line.includes('=') && !line.startsWith('#')) {
          const [key, value] = line.split('=').map((str) => str.trim());

          // Split the value into parts by the placeholder pattern
          const parts = value.match(/(?:\{\{.*?\}\}|[^{]*?(?=\{\{|$))/g);
          console.log(value, parts);

          // Translate non-placeholder parts and retain placeholders as-is
          const translatedParts = await Promise.all(
            parts.map(async (part) => {
              if (/\{\{.*?\}\}/g.test(part)) {
                // If the part is a placeholder, keep it unchanged
                return part;
              } else {
                if (!part || part === '') {
                  return;
                }

                // Translate the non-placeholder part
                const translation = await translate(part, { from: 'en', to: lang, key: process.env.API_KEY_GTRANSLATE });
                return translation;
              }
            })
          );

          const translatedValue = translatedParts.join('');

          console.log(`${key} = ${translatedValue}`);
          translatedLines.push(`${key} = ${translatedValue}`);
        } else {
          translatedLines.push(line);
        }

        console.log(`${Math.round(((index + 1) / localeLines.length) * 100)}% Translated`);
      }

      await writeFileAsync(filepath, translatedLines.join('\n'), 'utf8');
    }
  });
}

module.exports = translateFiles;

const sourcePath = process.argv[2]; // Assuming sourcePath is the first argument
const lang = process.argv[3]; // Assuming lang is the second argument

if (!sourcePath || !lang) {
  console.error('Usage: node translate-script.js <sourcePath> <lang>');
  process.exit(1);
}

translateFiles(sourcePath, lang);
