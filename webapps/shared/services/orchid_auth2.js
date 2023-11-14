'use strict';

import OrchidServices from './orchid_services.js';
import generateUUID from './generate_uuid.js';

const OrchidAuth2 = {
  SALT_ROUNDS: 10,

  login: async function (username, password) {
    const user = await OrchidServices.get('profile');
    const matchingUser = user.find((user) => {
      return user.username === username || user.email === username || user.phone_number === username;
    });

    if (matchingUser && matchingUser.password === CryptoJS.SHA256(password).toString()) {
      OrchidServices.auth.loginWithToken(matchingUser.token);
    } else {
      if (OrchidServices.DEBUG) console.error(`[${matchingUser.username}] Authentication failed.`);
      const loadEvent = new CustomEvent('orchidservices-password-fail', {
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(loadEvent);
    }
  },

  loginWithToken: function (token) {
    const storageKey = 'orchidaccount.token';
    if ('Settings' in window) {
      Settings.setValue(storageKey, token);
    } else {
      localStorage.setItem(storageKey, token);
    }
  },

  signUp: function ({ username, email, phoneNumber, password, birthDate }) {
    const token = generateUUID();
    OrchidServices.set(`profile/${token}`, {
      // System
      token,
      reports: [],
      is_timed_out: false,
      timeout_expiry_date: '',
      is_banned: false,
      ban_expiry_date: '',
      warn_stage: 0,
      // Account
      username,
      email: email || '',
      password: CryptoJS.SHA256(password).toString(),
      profile_picture: '',
      banner: '',
      phone_number: phoneNumber || '',
      birth_date: birthDate || '',
      time_created: Date.now(),
      orchid_points: 0,
      // Sync
      notifications: [],
      browser_bookmarks: [],
      devices: [],
      achievements: [],
      installed_apps: [],
      owned_purchases: [],
      wallet_cards: [],
      // Social
      description: '',
      last_active: Date.now(),
      state: 'online',
      followers: [],
      friends: [],
      custom_badges: [],
      is_verified: false,
      is_moderator: false,
      is_developer: false,
      status: { icon: '', text: '' },
      activities: []
    });
    this.loginWithToken(token);
    if (OrchidServices.DEBUG) console.log('Added document with ID: ', token);
    const loadEvent = new CustomEvent('orchidservices-signedup', {
      bubbles: true,
      cancelable: true
    });
    window.dispatchEvent(loadEvent);
  }
};

export default OrchidAuth2;
