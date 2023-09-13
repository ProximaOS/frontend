#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const translate = require('translate');

module.exports = function (sourcePath, lang) {
  const readFileAsync = promisify(fs.readFile);
  const writeFileAsync = promisify(fs.writeFile);
  const manifestFiles = [];

  glob(sourcePath, async (error, webapps) => {
    if (error) {
      console.error(error);
      return;
    }

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
      console.log(
        '[translator] No manifest.json files found in the webapps directory.'
      );
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
          engine: 'google',
          key: 'AIzaSyBJHGk4_lPVNEyL6-n_VkbfmOGuC2bd8dQ' // Replace with your Google Translate API key
        });
      }

      if (manifest.description) {
        manifest.description = await translate(manifest.description, {
          from: 'en',
          to: lang,
          engine: 'google',
          key: 'AIzaSyBJHGk4_lPVNEyL6-n_VkbfmOGuC2bd8dQ' // Replace with your Google Translate API key
        });
      }

      const langManifestPath = path.join(
        webappsDir,
        webapp,
        `manifest.${lang}.json`
      );
      await writeFileAsync(
        langManifestPath,
        JSON.stringify(manifest, null, 2),
        'utf8'
      );
    }
  });
};
