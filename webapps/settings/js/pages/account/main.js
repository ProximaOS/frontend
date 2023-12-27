!(function (exports) {
  'use strict';

  const Account = {
    accountBanner: document.getElementById('account-banner'),
    accountAvatar: document.getElementById('account-avatar'),
    accountUsername: document.getElementById('account-username'),
    accountHandle: document.getElementById('account-handle'),
    accountFollowers: document.getElementById('account-followers'),
    accountFriends: document.getElementById('account-friends'),
    accountStatus: document.getElementById('account-status'),
    accountEmail: document.getElementById('account-email'),
    accountPhoneNumber: document.getElementById('account-phone-number'),

    avatarEditButton: document.getElementById('accountListItem-avatar'),
    bannerEditButton: document.getElementById('accountListItem-banner'),

    KB_SIZE_LIMIT: 300,

    init: async function () {
      this.avatarEditButton.addEventListener('click', this.handleAvatarEditButton.bind(this));
      this.bannerEditButton.addEventListener('click', this.handleBannerEditButton.bind(this));

      if (await _os.isLoggedIn()) {
        _os.auth.getLiveBanner(null, (data) => {
          this.accountBanner.src = data;
        });
        _os.auth.getLiveAvatar(null, (data) => {
          this.accountAvatar.src = data;
        });
        _os.auth.getUsername().then((data) => {
          this.accountUsername.textContent = data;
        });
        _os.auth.getHandleName().then((data) => {
          this.accountHandle.textContent = `@${data}`;
        });
        _os.auth.getFollowers().then((data) => {
          this.accountFollowers.dataset.l10nArgs = JSON.stringify({
            count: data.length
          });
        });
        _os.auth.getFriends().then((data) => {
          this.accountFriends.dataset.l10nArgs = JSON.stringify({
            count: data.length
          });
        });
        _os.auth.getStatus().then((data) => {
          this.accountStatus.textContent = data.text;
        });
        _os.auth.getEmail().then((data) => {
          this.accountEmail.textContent = data;
        });
        _os.auth.getPhoneNumber().then((data) => {
          this.accountPhoneNumber.textContent = data;
        });
        _os.auth.getVerificationState().then((data) => {
          if (data) {
            this.accountUsername.classList.add('verified');
          } else {
            this.accountUsername.classList.remove('verified');
          }
        });
      }
    },

    handleAvatarEditButton: function () {
      FilePicker(['.png', '.jpg', '.jpeg', '.webp'], (data, mime) => {
        let binaryString = '';
        for (let i = 0; i < data.length; i++) {
          binaryString += String.fromCharCode(data[i]);
        }
        const base64String = btoa(binaryString);
        const dataUrl = `data:${mime};base64,${base64String}`;

        compressImage(dataUrl, this.KB_SIZE_LIMIT, async (finalImage) => {
          _os.auth.setAvatar(finalImage);
        });
      });
    },

    handleBannerEditButton: function () {
      FilePicker(['.png', '.jpg', '.jpeg', '.webp'], (data, mime) => {
        let binaryString = '';
        for (let i = 0; i < data.length; i++) {
          binaryString += String.fromCharCode(data[i]);
        }
        const base64String = btoa(binaryString);
        const dataUrl = `data:${mime};base64,${base64String}`;

        compressImage(dataUrl, this.KB_SIZE_LIMIT, async (finalImage) => {
          _os.auth.setBanner(finalImage);
        });
      });
    }
  };

  window.addEventListener('orchid-services-ready', () => {
    Account.init();
  });
})(window);
