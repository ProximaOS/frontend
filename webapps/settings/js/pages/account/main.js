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

      if ('OrchidServices' in window) {
        if (await OrchidServices.isUserLoggedIn()) {
          OrchidServices.getWithUpdate(
            `profile/${await OrchidServices.userId()}`,
            (data) => {
              this.accountBanner.src = data.banner || data.profile_picture;
              this.accountAvatar.src = data.profile_picture;
              this.accountUsername.textContent = data.username;
              this.accountHandle.textContent = `@${data.handle_name}`;
              this.accountFollowers.dataset.l10nArgs = JSON.stringify({
                count: data.followers.length
              });
              this.accountFriends.dataset.l10nArgs = JSON.stringify({
                count: data.friends.length
              });
              this.accountStatus.textContent = data.status.text;
              this.accountEmail.textContent = data.email;
              this.accountPhoneNumber.textContent = data.phone_number;

              if (data.is_verified) {
                this.accountUsername.classList.add('verified');
              } else {
                this.accountUsername.classList.remove('verified');
              }
            }
          );
        }
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
          OrchidServices.set(`profile/${await OrchidServices.userId()}`, {
            profile_picture: finalImage
          });
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
          OrchidServices.set(`profile/${await OrchidServices.userId()}`, {
            banner: finalImage
          });
        });
      });
    }
  };

  window.addEventListener('orchidservicesload', () => {
    Account.init();
  });
})(window);
