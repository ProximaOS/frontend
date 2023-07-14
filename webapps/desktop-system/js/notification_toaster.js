const NotificationToaster = {
  startX: 0,
  currentX: 0,
  threshold: 0.5,

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

  notifierSound: new Audio('http://shared.localhost:8081/resources/notifications/notifier_orchid.wav'),

  showNotification: function (title, options) {
    const { body, progress, badge, source, icon, media, actions } = options;

    var notification = document.createElement('li');
    notification.classList.add('notification');
    notification.innerHTML = `
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
    this.notificationsContainer.appendChild(notification);

    notification.addEventListener('pointerdown', function(event) {
      this.startX = event.clientX;
      this.currentX = this.startX;
    });

    notification.addEventListener('pointermove', function(event) {
      event.preventDefault();
      this.currentX = event.clientX;

      var distanceX = this.currentX - this.startX;
      notification.style.transform = `translateX(${distanceX})`;
    });

    notification.addEventListener('pointerup', function(event) {
      var distanceX = this.currentX - this.startX;
      var thresholdX = this.threshold * notification.offsetWidth;

      if (distanceX >= thresholdX) {
        // Swipe right
        notification.style.transform = 'translateX(100%)';
        setTimeout(function() {
          notification.remove();
        }, 300);
      } else if (distanceX <= -thresholdX) {
        // Swipe left
        notification.style.transform = 'translateX(-100%)';
        setTimeout(function() {
          notification.remove();
        }, 300);
      } else {
        // Reset position
        notification.style.transform = 'translateX(0)';
      }
    });

    var titleElement = notification.querySelector('.title');
    titleElement.innerText = title;
    this.titleElement.innerText = title;

    var detailElement = notification.querySelector('.detail');
    detailElement.innerText = body;
    this.detailElement.innerText = body;

    var progressElement = notification.querySelector('.progress');
    if (progress) {
      progressElement.style.setProperty('--progress', progress / 100);
      this.progressElement.style.setProperty('--progress', progress / 100);
    } else {
      progressElement.style.display = 'none';
      this.progressElement.style.display = 'none';
    }

    var badgeElement = notification.querySelector('.badge');
    if (badge) {
      badgeElement.src = badge;
      badgeElement.style.display = 'block';
      this.badgeElement.src = badge;
      this.badgeElement.style.display = 'block';
    } else {
      badgeElement.style.display = 'none';
      this.badgeElement.style.display = 'none';
    }

    var sourceNameElement = notification.querySelector('.source-name');
    sourceNameElement.innerText = source;
    this.sourceNameElement.innerText = source;

    var iconElement = notification.querySelector('.icon');
    if (icon) {
      iconElement.src = icon;
      iconElement.style.display = 'block';
      this.iconElement.src = icon;
      this.iconElement.style.display = 'block';
    } else {
      iconElement.style.display = 'none';
      this.iconElement.style.display = 'none';
    }

    var mediaElement = notification.querySelector('.media');
    if (media && media.length > 0) {
      mediaElement.innerHTML = '';
      this.mediaElement.innerHTML = '';
      media.forEach(function (src) {
        const persistentImgElement = document.createElement('img');
        persistentImgElement.src = src;
        mediaElement.appendChild(persistentImgElement);

        const imgElement = document.createElement('img');
        imgElement.src = src;
        this.mediaElement.appendChild(imgElement);
      }, this);
      mediaElement.style.display = 'block';
      this.mediaElement.style.display = 'block';
    } else {
      mediaElement.style.display = 'none';
      this.mediaElement.style.display = 'none';
    }

    var actionsElement = notification.querySelector('.actions');
    if (actions && actions.length > 0) {
      actionsElement.innerHTML = '';
      this.actionsElement.innerHTML = '';
      actions.forEach(function (button) {
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
      }, this);
      actionsElement.style.display = 'block';
      this.actionsElement.style.display = 'block';
    } else {
      actionsElement.style.display = 'none';
      this.actionsElement.style.display = 'none';
    }

    this.notifierSound.currentTime = 0;
    this.notifierSound.play();
    this.notificationElement.classList.add('visible');
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.notificationElement.classList.remove('visible');
    }, 3000);
  },

  hideNotification: function () {
    this.notificationElement.classList.remove('visible');
  }
};
