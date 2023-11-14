'use strict';

import OrchidServices from './orchid_services.js';
import generateUUID from './generate_uuid.js';

const OrchidMessages = {
  createChannel: async function ({ name = '', token = generateUUID() }) {
    OrchidServices.set(`messages/${token}`, {
      // System
      token,
      moderation: {
        reports: [],
        warnings: []
      },
      // Channel
      time_created: Date.now(),
      publisher_id: await OrchidServices.userId(),
      messages: [],
      channel_icon: '',
      channel_banner: '',
      channel_name: name
    });
    if (OrchidServices.DEBUG) console.log('Added document with ID: ', token);
  },

  sendMessage: async function (channelId, content, media) {
    const newMessage = {
      content,
      publisher_id: await OrchidServices.userId(),
      time_created: Date.now(),
      time_modified: Date.now(),
      is_edited: false,
      media
    }
    const channelData = await OrchidServices.get(`messages/${channelId}`);
    OrchidServices.set(`messages/${channelId}`, {
      messages: [...channelData.messages, newMessage]
    });
  },

  addFriend: async function (friendId) {
    const token = generateUUID();
    this.createChannel({ token });
    const userId = await OrchidServices.userId();
    const userData = await OrchidServices.get(`profile/${userId}`);
    const newFriend = { friend_id: friendId, token };
    if (!userData.friends.includes(newFriend)) {
      OrchidServices.set(`profile/${userId}`, {
        friends: [...userData.friends, newFriend]
      });
    }
    const friendData = await OrchidServices.get(`profile/${friendId}`);
    const newUser = { friend_id: userId, token };
    if (!friendData.friends.includes(newUser)) {
      OrchidServices.set(`profile/${friendId}`, {
        friends: [...friendData.friends, newUser]
      });
    }
  },

  report: async function (channel, reason) {
    const userId = await OrchidServices.userId();
    const report = { reporter: userId, reason };
    const channelData = await OrchidServices.get(`messages/${channel}`);
    if (!channelData.reports.includes(report)) {
      await OrchidServices.set(`messages/${channel}`, {
        moderation: { reports: [...channelData.reports, report] }
      });
    }
  },

  warn: async function (channel, reason) {
    const userId = await OrchidServices.userId();
    const channelData = await OrchidServices.get(`messages/${channel}`);
    const warning = { warning_from: userId, reason };
    if (!channelData.warnings.includes(warning)) {
      await OrchidServices.set(`messages/${channel}`, {
        moderation: { warnings: [...channelData.warnings, warning] }
      });
    }
  }
};

export default OrchidMessages;
