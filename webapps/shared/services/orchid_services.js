import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
  collection
} from 'https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js';
import OrchidStore from './orchid_store.js';
import Achievements from './achievements.js';
import OrchidAuth2 from './orchid_auth2.js';
import OrchidFileDB from './orchid_file_db.js';
import OrchidArticles from './orchid_articles.js';
import OrchidMessages from './orchid_messages.js';

const appConfig = await (
  await fetch('http://shared.localhost:8081/services/appConfig.json')
).json();
const app = initializeApp(appConfig);
const db = getFirestore(app);

const OrchidServices = {
  DEBUG:
    location.href === 'http://localhost:5500' ||
    location.href === 'http://127.0.0.1:5500/',

  init: function () {
    const loadEvent = new CustomEvent('orchidservicesload', {
      bubbles: true,
      cancelable: true
    });
    window.dispatchEvent(loadEvent);

    window.addEventListener('load', async () => {
      if (this.isUserLoggedIn) {
        await this.set(`profile/${await this.userId()}`, { state: 'online' });
      }
    });

    window.addEventListener('beforeunload', async () => {
      if (this.isUserLoggedIn) {
        await this.set(`profile/${await this.userId()}`, {
          last_active: Date.now(),
          state: 'offline'
        });
      }
    });
  },

  isUserLoggedIn: async function () {
    const token = await ('Settings' in window
      ? Settings.getValue('orchidaccount.token')
      : localStorage.getItem('orchidaccount.token'));
    return !!token;
  },

  userId: async function () {
    return await ('Settings' in window
      ? Settings.getValue('orchidaccount.token')
      : localStorage.getItem('orchidaccount.token'));
  },

  get: async function (path) {
    const docRef = doc(db, path);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      if (this.DEBUG) console.log('Document data: ', docSnap.data());
      return docSnap.data();
    } else {
      if (this.DEBUG) console.log('No such document!');
      return null;
    }
  },

  getWithUpdate: function (path, callback) {
    onSnapshot(doc(db, path), (doc) => {
      if (this.DEBUG) console.log('Document data: ', doc.data());
      callback(doc.data());
    });
  },

  getList: async function (path, callback) {
    const querySnapshot = await getDocs(collection(db, path));
    querySnapshot.forEach((doc) => {
      if (this.DEBUG) console.log(doc.id, ' => ', doc.data());
      callback(doc.data(), doc.id);
    });
  },

  getArrayList: async function (path, callback) {
    const querySnapshot = await getDocs(collection(db, path));
    callback(querySnapshot);
  },

  set: async function (path, value) {
    const docRef = doc(db, path);
    await setDoc(docRef, value, { merge: true });
  },

  auth: OrchidAuth2,
  achievements: Achievements,
  storage: OrchidFileDB,
  messages: OrchidMessages,
  store: OrchidStore,
  articles: OrchidArticles
};

export default OrchidServices;
window.OrchidServices = OrchidServices;

OrchidServices.init(); // Initialize OrchidServices
