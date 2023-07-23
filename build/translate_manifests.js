#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const translate = require('translate');

const readdirAsync = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

async function main(lang) {
  try {
    if (!lang) {
      throw new Error('[OpenOrchid Translator] Language code not provided.');
    }

    const webappsDir = './webapps';
    const webapps = await readdirAsync(webappsDir);
    const manifestFiles = [];

    for (const webapp of webapps) {
      const manifestPath = path.join(webappsDir, webapp, 'manifest.json');

      if (fs.existsSync(manifestPath)) {
        manifestFiles.push({
          webapp,
          manifestPath,
        });
      }
    }

    if (manifestFiles.length === 0) {
      console.log('[translator] No manifest.json files found in the webapps directory.');
      return;
    }

    for (const { webapp, manifestPath } of manifestFiles) {
      console.log(`[translator] Translating "${manifestPath}"...`);

      const manifestContent = await readFileAsync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);

      if (manifest.name) {
        manifest.name = await translateText(manifest.name, 'en', lang);
      }

      if (manifest.description) {
        manifest.description = await translateText(manifest.description, 'en', lang);
      }

      const langManifestPath = path.join(webappsDir, webapp, `manifest.${lang}.json`);
      await writeFileAsync(langManifestPath, JSON.stringify(manifest, null, 2), 'utf8');

      console.log(`[translator] Translation of "${manifestPath}" completed successfully.`);
    }

    console.log('[translator] Translations completed successfully.');
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
