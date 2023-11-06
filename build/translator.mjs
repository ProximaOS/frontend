// translator.mjs
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import translate from 'translate';
import { glob } from 'glob';

const translateFiles = async function (sourcePath, lang) {
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
          try {
            const translation = await translate(value, {
              from: 'en',
              to: lang,
              engine: 'google',
              key: 'AIzaSyBJHGk4_lPVNEyL6-n_VkbfmOGuC2bd8dQ'
            });
            translatedLines.push(`${key} = ${translation}`);
          } catch (e) {
            console.error('[translator] Failed to translate:', e);
            // You can choose to return the original text or throw an error here
            translatedLines.push(`${key} = ${text}`);
          }

          console.log(`[translator, ${key}] Translated "${value}" successfully to "${translation}"...`);
        } else {
          translatedLines.push(line);
        }
      }

      await writeFileAsync(filepath, translatedLines.join('\n'), 'utf8');
    }
  });
};

export default translateFiles;
