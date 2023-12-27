!(function (exports) {
  'use strict';

  const NotificationToaster = {
    _index: 0,

    notificationsContainer: document.getElementById('notifications-container'),

    notificationElement: document.getElementById('notification-toaster'),
    titleElement: document.getElementById('notification-title'),
    detailElement: document.getElementById('notification-detail'),
    progressElement: document.getElementById('notification-progress'),
    badgeElement: document.getElementById('notification-badge'),
    sourceNameElement: document.getElementById('notification-source-name'),
    iconElement: document.getElementById('notification-icon'),
    mediaElement: document.getElementById('notification-media'),
    actionsElement: document.getElementById('notification-actions'),

    lockscreenNotifications: document.getElementById('lockscreen-notifications'),
    lockscreenNotificationBadge: document.getElementById('lockscreen-notification-badge'),

    isDragging: false,
    startX: 0,
    currentX: 0,
    threshold: 0.5,

    SOUND_NOTIFIER: new Audio('http://shared.localhost:8081/resources/notifications/notifier_orchid2.wav'),

    showNotification: function (title, options) {
      const { body, progress, badge, source, icon, media, actions, tag } = options;

      const fragment = document.createDocumentFragment();

      const dom = `
        <div class="titlebar">
          <img src="" class="badge">
          <div class="source-name"></div>
        </div>
        <div class="content">
          <img src="" class="icon">
          <div class="text-holder">
            <div class="title"></div>
            <div class="detail"></div>
            <div class="progress"></div>
          </div>
        </div>
        <div class="media"></div>
        <div class="actions"></div>
      `;

      let notification;
      const taggedNotification = document.querySelector(`[data-tag="${tag}"]`);
      if (taggedNotification) {
        taggedNotification.innerHTML = dom;
        notification = taggedNotification;
      } else {
        this._index++;
        this.lockscreenNotificationBadge.textContent = this._index;

        notification = document.createElement('li');
        notification.classList.add('notification');
        notification.style.transitionDelay = this._index * 50 + 'ms';
        if (tag) {
          notification.dataset.tag = tag;
        }
        notification.innerHTML = dom;
        fragment.appendChild(notification);

        notification.addEventListener('pointerdown', (event) => this.onPointerDown(event, notification));
        notification.addEventListener('pointermove', (event) => this.onPointerMove(event, notification));
        notification.addEventListener('pointerup', (event) => this.onPointerUp(event, notification));
      }

      setTimeout(() => {
        const titleElement = notification.querySelector('.title');
        titleElement.innerText = title;
        this.titleElement.innerText = title;

        const detailElement = notification.querySelector('.detail');
        detailElement.innerText = body;
        this.detailElement.innerText = body;

        const progressElement = notification.querySelector('.progress');
        if (progress || progress === 0) {
          progressElement.style.setProperty('--progress', Math.min(100, progress) / 100);
          this.progressElement.style.setProperty('--progress', Math.min(100, progress) / 100);
          progressElement.style.display = 'block';
          this.progressElement.style.display = 'block';
        } else {
          progressElement.style.display = 'none';
          this.progressElement.style.display = 'none';
        }

        const badgeElement = notification.querySelector('.badge');
        if (badge) {
          badgeElement.src = badge;
          badgeElement.style.display = 'block';
          this.badgeElement.src = badge;
          this.badgeElement.style.display = 'block';
        } else {
          badgeElement.style.display = 'none';
          this.badgeElement.style.display = 'none';
        }

        const sourceNameElement = notification.querySelector('.source-name');
        sourceNameElement.innerText = source;
        this.sourceNameElement.innerText = source;

        const iconElement = notification.querySelector('.icon');
        if (icon) {
          iconElement.src = icon;
          iconElement.style.display = 'block';
          this.iconElement.src = icon;
          this.iconElement.style.display = 'block';
        } else {
          iconElement.style.display = 'none';
          this.iconElement.style.display = 'none';
        }
        iconElement.onerror = () => {
          iconElement.style.display = 'none';
        };
        this.iconElement.onerror = () => {
          this.iconElement.style.display = 'none';
        };

        const mediaElement = notification.querySelector('.media');
        if (media && media.length > 0) {
          mediaElement.innerHTML = '';
          this.mediaElement.innerHTML = '';
          for (let index = 0, length = media.length; index < length; index++) {
            const src = media[index];

            const persistentImgElement = document.createElement('img');
            persistentImgElement.src = src;
            mediaElement.appendChild(persistentImgElement);

            const imgElement = document.createElement('img');
            imgElement.src = src;
            this.mediaElement.appendChild(imgElement);
          }
          mediaElement.style.display = 'block';
          this.mediaElement.style.display = 'block';
        } else {
          mediaElement.style.display = 'none';
          this.mediaElement.style.display = 'none';
        }

        const actionsElement = notification.querySelector('.actions');
        if (actions && actions.length > 0) {
          actionsElement.innerHTML = '';
          this.actionsElement.innerHTML = '';
          for (let index = 0, length = actions.length; index < length; index++) {
            const button = actions[index];

            const persistentButtonElement = document.createElement('button');
            persistentButtonElement.textContent = button.label;
            persistentButtonElement.addEventListener('click', button.onclick);
            if (button.recommend) {
              persistentButtonElement.classList.add('recommend');
            }
            actionsElement.appendChild(persistentButtonElement);

            const buttonElement = document.createElement('button');
            buttonElement.textContent = button.label;
            buttonElement.addEventListener('click', button.onclick);
            if (button.recommend) {
              buttonElement.classList.add('recommend');
            }
            this.actionsElement.appendChild(buttonElement);
          }
          actionsElement.style.display = 'block';
          this.actionsElement.style.display = 'block';
        } else {
          actionsElement.style.display = 'none';
          this.actionsElement.style.display = 'none';
        }
      });

      if (!taggedNotification) {
        this.SOUND_NOTIFIER.currentTime = 0;
        this.SOUND_NOTIFIER.play();
      }

      this.notificationElement.classList.add('visible');
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.notificationElement.classList.remove('visible');
      }, 3000);

      requestAnimationFrame(() => {
        this.lockscreenNotifications.appendChild(fragment.cloneNode(true));
      });
      this.notificationsContainer.appendChild(fragment);
    },

    hideNotification: function () {
      this.notificationElement.classList.remove('visible');
    },

    onPointerDown: function (event, notification) {
      this.startX = event.clientX;
      this.currentX = this.startX;
      this.isDragging = true;
      notification.classList.remove('transitioning');
    },

    onPointerMove: function (event, notification) {
      if (!this.isDragging) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.currentX = event.clientX;

      const distanceX = this.currentX - this.startX;
      notification.style.translate = `${distanceX}px 0`;
    },

    onPointerUp: function (event, notification) {
      if (!this.isDragging) {
        return;
      }
      const distanceX = this.currentX - this.startX;
      const thresholdX = this.threshold * notification.offsetWidth;

      if (distanceX >= thresholdX) {
        // Swipe right
        notification.style.translate = '100%';
        notification.classList.add('transitioning');
        notification.addEventListener('transitionend', () => {
          notification.classList.remove('transitioning');
          notification.remove();

          this._index--;
          this.lockscreenNotificationBadge.textContent = this._index;
        });
      } else if (distanceX <= -thresholdX) {
        // Swipe left
        notification.style.translate = '-100%';
        notification.classList.add('transitioning');
        notification.addEventListener('transitionend', () => {
          notification.classList.remove('transitioning');
          notification.remove();

          this._index--;
          this.lockscreenNotificationBadge.textContent = this._index;
        });
      } else {
        // Reset position
        notification.style.translate = '0';
        notification.classList.add('transitioning');
        notification.addEventListener('transitionend', function () {
          notification.classList.remove('transitioning');
        });
      }
      this.isDragging = false;
    }
  };

  exports.NotificationToaster = NotificationToaster;
})(window);
