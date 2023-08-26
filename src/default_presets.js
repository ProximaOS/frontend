!(function () {
  'use strict';

  const fs = require('fs');
  const path = require('path');

  require('dotenv').config();

  fs.mkdirSync(path.join(process.env.OPENORCHID_DATA), { recursive: true });

  const settingsPath = path.join(process.env.OPENORCHID_DATA, 'settings.json');
  const bookmarksPath = path.join(
    process.env.OPENORCHID_DATA,
    'bookmarks.json'
  );
  const permissionsPath = path.join(process.env.OPENORCHID_DATA, 'permissions.json');
  const contactsPath = path.join(process.env.OPENORCHID_DATA, 'contacts.json');
  const storagePath = process.env.OPENORCHID_STORAGE
    ? process.env.OPENORCHID_STORAGE
    : path.join(process.env.OPENORCHID_DATA, 'storage');

  const settingsInternalPath = path.join(
    process.cwd(),
    'defaults',
    'settings.json'
  );
  const bookmarksInternalPath = path.join(
    process.cwd(),
    'defaults',
    'bookmarks.json'
  );
  const permissionsInternalPath = path.join(
    process.cwd(),
    'defaults',
    'permissions.json'
  );
  const contactsInternalPath = path.join(
    process.cwd(),
    'defaults',
    'contacts.json'
  );

  if (!fs.existsSync(settingsPath)) {
    if (fs.existsSync(settingsInternalPath)) {
      fs.copyFileSync(settingsInternalPath, settingsPath);
    }
  }

  if (!fs.existsSync(bookmarksPath)) {
    if (fs.existsSync(bookmarksInternalPath)) {
      fs.copyFileSync(bookmarksInternalPath, bookmarksPath);
    }
  }

  if (!fs.existsSync(permissionsPath)) {
    if (fs.existsSync(permissionsInternalPath)) {
      fs.copyFileSync(permissionsInternalPath, permissionsPath);
    }
  }

  if (!fs.existsSync(contactsPath)) {
    if (fs.existsSync(contactsInternalPath)) {
      fs.copyFileSync(contactsInternalPath, contactsPath);
    }
  }

  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }
})();
