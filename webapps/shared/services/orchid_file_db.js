'use strict';

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js';
import {
  getStorage,
  uploadBytes,
  deleteObject,
  listAll,
  ref
} from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-storage.js';
import OrchidServices from './orchid_services.js';

const appConfig = await (
  await fetch('http://shared.localhost:8081/services/appConfig.json')
).json();
const app = initializeApp(appConfig);

const storage = getStorage(app);

const OrchidFileDB = {
  add: async function (path, blob) {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    if (OrchidServices.DEBUG) console.log('Uploaded a blob or file!');
  },

  remove: async function (path) {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  },

  list: async function (path) {
    const listRef = ref(storage, 'files/uid');
    const res = await listAll(listRef);
    return {
      prefixes: res.prefixes,
      items: res.items
    };
  }
};

export default OrchidFileDB;
