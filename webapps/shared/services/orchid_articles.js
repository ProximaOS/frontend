'use strict';

import OrchidServices from './orchid_services.js';
import generateUUID from './generate_uuid.js';

const OrchidArticles = {
  post: async function (audience, textContent) {
    const token = generateUUID();
    await OrchidServices.set(`posts/${token}`, {
      // System
      token,
      moderation: {
        reports: [],
        warnings: []
      },
      // Post
      timeCreated: Date.now(),
      publisherId: await OrchidServices.userId(),
      audience,
      textContent,
      // User
      views: [],
      likes: [],
      dislikes: [],
      commentReplies: []
    });
    if (OrchidServices.DEBUG) console.log('Added document with ID: ', token);
  },

  report: async function (post, reason) {
    const userId = await OrchidServices.userId();
    const report = { reporter: userId, reason };
    const postData = await OrchidServices.get(`posts/${post}`);
    if (!postData.reports.includes(report)) {
      await OrchidServices.set(`posts/${post}`, {
        moderation: { reports: [...postData.reports, report] }
      });
    }
  },

  warn: async function (post, reason) {
    const userId = await OrchidServices.userId();
    const warning = { warningFrom: userId, reason };
    const storeApp = await OrchidServices.get(`posts/${post}`);
    if (!storeApp.warnings.includes(warning)) {
      await OrchidServices.set(`posts/${post}`, {
        moderation: { warnings: [...user.warnings, warning] }
      });
    }
  }
};

export default OrchidArticles;
