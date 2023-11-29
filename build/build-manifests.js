#!/usr/bin/env node

const fs = require('fs');
const { glob } = require('glob');
const path = require('path');
const { promisify } = require('util');

function translateManifests (sourcePath, lang) {
  const readFileAsync = promisify(fs.readFile);
  const writeFileAsync = promisify(fs.writeFile);
  const manifestFiles = [];

  glob(sourcePath).then(async (webapps) => {
    const translateModule = await import('translate');
    const translate = translateModule.default;

    for (const webapp of webapps) {
      const manifestPath = path.join(webapp, 'manifest.json');

      if (fs.existsSync(manifestPath)) {
        manifestFiles.push({
          webapp,
          manifestPath
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
        manifest.name = await translate(manifest.name, {
          from: 'en',
          to: lang,
          key: process.env.API_KEY_GTRANSLATE
        });
      }

      if (manifest.description) {
        manifest.description = await translate(manifest.description, {
          from: 'en',
          to: lang,
          key: process.env.API_KEY_GTRANSLATE
        });
      }

      const langManifestPath = path.join(webapp, `manifest.${lang}.json`);
      await writeFileAsync(langManifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    }
  });
}

module.exports = translateManifests;

const sourcePath = process.argv[2]; // Assuming sourcePath is the first argument
const lang = process.argv[3]; // Assuming lang is the second argument

if (!sourcePath || !lang) {
  console.error('Usage: node translate-script.js <sourcePath> <lang>');
  process.exit(1);
}

translateManifests(sourcePath, lang);
