var Notification = {
  notifications: {},
  indexes: {
    relationship: 0,
    notice: 0
  },

  showNotification: function(type, icon, message, detail, tag) {
    const existingNotification = this.findNotificationByTag(tag);

    if (existingNotification) {
      // Update existing notification
      existingNotification.messageElement.textContent = message;
      if (existingNotification.detailElement && detail) {
        existingNotification.detailElement.textContent = detail;
      }
      return;
    }

    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    setTimeout(() => {
      notification.classList.add('show');
    }, 50 * this.indexes[type]);

    if (type !== 'relationship') {
      const iconElement = document.createElement('div');
      iconElement.classList.add('icon', icon);
      iconElement.style.backgroundImage = `url('../images/icons/${icon}.svg')`;
      notification.appendChild(iconElement);
    }

    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    try {
      showGibberish(message, messageElement);
    } catch(err) {
      messageElement.textContent = message;
    }
    notification.appendChild(messageElement);

    if (type == 'relationship') {
      const iconElement = document.createElement('div');
      iconElement.classList.add('icon', icon);
      iconElement.style.backgroundImage = `url('../images/icons/${icon}.svg')`;
      notification.appendChild(iconElement);
    }

    var detailElement;
    if (detail) {
      detailElement = document.createElement('div');
      detailElement.classList.add('detail');
      try {
        showGibberish(detail, detailElement);
      } catch(err) {
        detailElement.textContent = detail;
      }
      notification.appendChild(detailElement);
    }

    document.body.appendChild(notification);

    // Save reference to the notification
    if (detail) {
      this.notifications[tag] = {
        element: notification,
        messageElement: messageElement,
        detailElement: detailElement
      };
    } else {
      this.notifications[tag] = {
        element: notification,
        messageElement: messageElement
      };
    }

    // Remove notification after a few seconds
    clearTimeout(this.notifications[tag].timer);
    this.notifications[tag].timer = setTimeout(() => {
      notification.classList.remove('show');
      notification.classList.add('hide');
      notification.onanimationend = () => {
        notification.classList.remove('hide');
        notification.remove();
        delete this.notifications[tag];
        this.indexes[type]--;
      };
    }, 2000 + (50 * this.indexes[type]));

    notification.style.top = `calc(20px + ((${notification.offsetHeight}px + 20px) * ${this.indexes[type]}))`;

    this.indexes[type]++;
  },

  findNotificationByTag: function(tag) {
    for (const key in this.notifications) {
      if (key === tag) {
        return this.notifications[key];
      }
    }
    return null;
  },

  showRelationshipChange: function(characterName, relationshipType, relationshipLevel, tag) {
    const icon = `stat_${relationshipLevel}`; // Assuming there's an icon for this
    const message = characterName;
    this.showNotification('relationship', icon, message, relationshipType, tag);
  },

  showTip: function(tip, detail, tag) {
    const icon = 'info'; // Assuming there's an icon for this
    this.showNotification('notice', icon, tip, detail, tag);
  }
};
