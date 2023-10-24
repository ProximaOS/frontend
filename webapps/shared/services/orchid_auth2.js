'use strict';

import OrchidServices from './orchid_services.js';
import generateUUID from './generate_uuid.js';
import MD5 from './md5_encoder.js';

const OrchidAuth2 = {
  login: async function (username, password) {
    const user = await OrchidServices.get('profile');
    const matchingUser = user.find((user) => {
      return (
        user.username === username ||
        user.email === username ||
        user.phoneNumber === username
      );
    });

    if (
      matchingUser &&
      matchingUser.password === MD5(password, password)
    ) {
      OrchidServices.auth.loginWithToken(matchingUser.token);
    } else {
      if (OrchidServices.DEBUG)
        console.error(`[${matchingUser.token}] Authentication failed.`);
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

  signUp: async function ({
    username,
    email,
    phoneNumber,
    password,
    birthDate
  }) {
    const token = generateUUID();
    await OrchidServices.set(`profile/${token}`, {
      // System
      token,
      reports: [],
      isTimedOut: false,
      timeoutExpiryDate: '',
      isBanned: false,
      banExpiryDate: '',
      warnStage: 0,
      // Account
      username,
      email: email || '',
      password: MD5(password, password),
      profilePicture: '',
      banner: '',
      phoneNumber: phoneNumber || '',
      birthDate: birthDate || '',
      timeCreated: Date.now(),
      orchidPoints: 0,
      // Sync
      notifications: [],
      browserBookmarks: [],
      devices: [],
      achievements: [],
      installedApps: [],
      ownedPurchases: [],
      walletCards: [],
      // Social
      description: '',
      lastActive: Date.now(),
      state: 'online',
      followers: [],
      friends: [],
      customBadges: [],
      isVerified: false,
      isModerator: false,
      isDeveloper: false,
      status: { icon: '', text: '' },
      activities: []
    });
    this.loginWithToken(token);
    if (OrchidServices.DEBUG) console.log('Added document with ID: ', token);
  }
};

export default OrchidAuth2;
