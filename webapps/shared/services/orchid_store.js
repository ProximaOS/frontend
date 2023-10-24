'use strict';

import OrchidServices from './orchid_services.js';
import generateUUID from './generate_uuid.js';

const OrchidStore = {
  publish: async function (orchidApp, callback) {
    const token = generateUUID();
    await OrchidServices.set(`webapps/${token}`, {
      // System
      token,
      moderation: {
        reports: [],
        warnings: [],
        isTimedOut: false,
        timeoutExpiryDate: '',
        isBanned: false,
        banExpiryDate: '',
        warnStage: 0
      },
      // Webapp
      timeCreated: Date.now(),
      publisherId: await OrchidServices.userId(),
      banner: orchidApp.banner || '',
      name: orchidApp.name,
      description: orchidApp.description || '',
      developers: orchidApp.developers,
      download: { url: orchidApp.downloadUrl, version: orchidApp.version },
      gitRepo: orchidApp.gitRepo || '',
      icon: orchidApp.icon,
      includesAds: orchidApp.includesAds || false,
      includesTracking: orchidApp.includesTracking || false,
      license: orchidApp.license || 'GPL-2.0',
      patchLogs: orchidApp.patchLogs || '',
      ageRating: orchidApp.ageRating || 'unset',
      price: orchidApp.price || 0,
      screenshots: orchidApp.screenshots || [],
      categories: orchidApp.categories || [],
      // User
      achievements: [],
      downloads: [],
      platforms: orchidApp.platforms || ['openorchid'],
      commentRatings: []
    });
    if (OrchidServices.DEBUG) console.log('Added document with ID: ', token);
  },

  report: async function (webapp, reason) {
    const userId = await OrchidServices.userId();
    const report = { reporter: userId, reason };
    const storeApp = await OrchidServices.get(`webapps/${webapp}`);
    if (!storeApp.reports.includes(report)) {
      await OrchidServices.set(`webapps/${webapp}`, {
        moderation: { reports: [...user.reports, report] }
      });
    }
  },

  warn: async function (webapp, reason) {
    const userId = await OrchidServices.userId();
    const warning = { warningFrom: userId, reason };
    const storeApp = await OrchidServices.get(`webapps/${webapp}`);
    if (!storeApp.warnings.includes(warning)) {
      await OrchidServices.set(`webapps/${webapp}`, {
        moderation: { warnings: [...user.warnings, warning] }
      });
    }
  }
};

export default OrchidStore;
