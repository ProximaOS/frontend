const NotificationToaster = {
  notificationElement: document.getElementById('notification-toaster'),
  titleElement: document.getElementById('notification-title'),
  detailElement: document.getElementById('notification-detail'),
  progressElement: document.getElementById('notification-progress'),
  badgeElement: document.getElementById('notification-badge'),
  sourceNameElement: document.getElementById('notification-source-name'),
  iconElement: document.getElementById('notification-icon'),
  mediaElement: document.getElementById('notification-media'),
  actionsElement: document.getElementById('notification-actions'),

  showNotification: function (title, options) {
    const { detail, progress, badgeSrc, sourceName, iconSrc, mediaSrcs, actionButtons } = options;

    this.titleElement.innerText = title;
    this.detailElement.innerText = detail;
    this.progressElement.style.width = progress + '%';

    if (badgeSrc) {
      this.badgeElement.src = badgeSrc;
      this.badgeElement.style.display = 'block';
    } else {
      this.badgeElement.style.display = 'none';
    }

    this.sourceNameElement.innerText = sourceName;

    if (iconSrc) {
      this.iconElement.src = iconSrc;
      this.iconElement.style.display = 'block';
    } else {
      this.iconElement.style.display = 'none';
    }

    if (mediaSrcs && mediaSrcs.length > 0) {
      this.mediaElement.innerHTML = '';
      mediaSrcs.forEach(function (src) {
        const imgElement = document.createElement('img');
        imgElement.src = src;
        this.mediaElement.appendChild(imgElement);
      }, this);
      this.mediaElement.style.display = 'block';
    } else {
      this.mediaElement.style.display = 'none';
    }

    if (actionButtons && actionButtons.length > 0) {
      this.actionsElement.innerHTML = '';
      actionButtons.forEach(function (button) {
        const buttonElement = document.createElement('button');
        buttonElement.textContent = button.label;
        buttonElement.addEventListener('click', button.onclick);
        if (button.recommend) {
          buttonElement.classList.add('recommend');
        }
        this.actionsElement.appendChild(buttonElement);
      }, this);
      this.actionsElement.style.display = 'block';
    } else {
      this.actionsElement.style.display = 'none';
    }

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
