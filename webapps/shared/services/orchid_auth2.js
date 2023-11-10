'use strict';

import OrchidServices from './orchid_services.js';
import generateUUID from './generate_uuid.js';

const OrchidAuth2 = {
  SALT_ROUNDS: 10,

  login: async function (username, password) {
    const user = await OrchidServices.get('profile');
    const matchingUser = user.find((user) => {
      return user.username === username || user.email === username || user.phoneNumber === username;
    });

    if (matchingUser) {
      bcrypt.compare(password, matchingUser.password, (error, result) => {
        if (error) {
          console.error(error);
          const loadEvent = new CustomEvent('orchidservices-login-fail', {
            bubbles: true,
            cancelable: true
          });
          window.dispatchEvent(loadEvent);
        }

        if (result) {
          OrchidServices.auth.loginWithToken(matchingUser.token);
        } else {
          console.log('Password is incorrect');
          const loadEvent = new CustomEvent('orchidservices-password-fail', {
            bubbles: true,
            cancelable: true
          });
          window.dispatchEvent(loadEvent);
        }
      });
    } else {
      if (OrchidServices.DEBUG) console.error(`[${matchingUser.token}] Authentication failed.`);
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
    bcrypt.genSalt(this.SALT_ROUNDS, (error, salt) => {
      if (error) {
        console.error(error);
        const loadEvent = new CustomEvent('orchidservices-signup-fail', {
          bubbles: true,
          cancelable: true
        });
        window.dispatchEvent(loadEvent);
      }

      bcrypt.hash(password, salt, async (error, hashedPassword) => {
        if (error) {
          console.error(error);
          const loadEvent = new CustomEvent('orchidservices-signup-encrypt-fail', {
            bubbles: true,
            cancelable: true
          });
          window.dispatchEvent(loadEvent);
        }

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
          password: hashedPassword,
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
        const loadEvent = new CustomEvent('orchidservices-signedup', {
          bubbles: true,
          cancelable: true
        });
        window.dispatchEvent(loadEvent);
      });
    });
  }
};

export default OrchidAuth2;
