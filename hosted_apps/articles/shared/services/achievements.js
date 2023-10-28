'use strict';

import OrchidServices from './orchid_services.js';

const Achievements = {
  grant: async function (webapp, id) {
    const achievement = { webappId: webapp, achievementId: id };
    const userId = await OrchidServices.userId();
    const user = await OrchidServices.get(`profile/${userId}`);
    if (!user.achievements.includes(achievement)) {
      await OrchidServices.set(`profile/${userId}`, {
        achievements: [...user.achievements, achievement]
      });
    }
  },

  revoke: async function (webapp, id) {
    const achievement = { webappId: webapp, achievementId: id };
    const userId = await OrchidServices.userId();
    const user = await OrchidServices.get(`profile/${userId}`);
    if (user.achievements.includes(achievement)) {
      await OrchidServices.set(`profile/${userId}`, {
        achievements: user.achievements.filter((a) => a !== achievement)
      });
    }
  }
};

export default Achievements;
