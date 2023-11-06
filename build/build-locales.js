const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const translate = require('google-translate-api');
const { glob } = require('glob');

function translateFiles (sourcePath, lang) {
  const readFileAsync = promisify(fs.readFile);
  const writeFileAsync = promisify(fs.writeFile);

  glob(sourcePath, async (error, locales) => {
    if (error) {
      console.error(error);
      return;
    }

    for (const file of locales) {
      console.log(`[translator] Translating "${file}"...`);

      const localeContent = await readFileAsync(path.join(file), 'utf8');
      const filepath = file.replace('en-US', lang);

      const localeLines = localeContent.split('\n');
      const translatedLines = [];

      for (const line of localeLines) {
        if (line.includes('=') && !line.startsWith('#')) {
          const [key, value] = line.split('=').map((str) => str.trim());
          translate(value, { from: 'en', to: lang })
            .then((res) => {
              console.log(res.text);
              translatedLines.push(`${key} = ${res.text}`);
            })
            .catch((err) => {
              console.error(err);
              translatedLines.push(`${key} = ${text}`);
            });

          console.log(`[translator, ${key}] Translated "${value}" successfully to "${translation}"...`);
        } else {
          translatedLines.push(line);
        }
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

translate(sourcePath, lang);
