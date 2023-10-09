!(function (exports) {
  'use strict';

  const Account = {
    accountBanner: document.getElementById('account-banner'),
    accountAvatar: document.getElementById('account-avatar'),
    accountUsername: document.getElementById('account-username'),
    accountEmail: document.getElementById('account-email'),
    accountPhoneNumber: document.getElementById('account-phone-number'),

    avatarEditButton: document.getElementById('accountListItem-avatar'),
    bannerEditButton: document.getElementById('accountListItem-banner'),

    init: async function () {
      this.avatarEditButton.addEventListener('click', this.handleAvatarEditButton.bind(this));
      this.bannerEditButton.addEventListener('click', this.handleBannerEditButton.bind(this));

      if ('OrchidServices' in window) {
        if (await OrchidServices.isUserLoggedIn()) {
          OrchidServices.getWithUpdate(
            `profile/${await OrchidServices.userId()}`,
            (data) => {
              this.accountBanner.src = data.banner_image || data.profile_picture;
              this.accountAvatar.src = data.profile_picture;
              this.accountUsername.textContent = data.username;
              this.accountEmail.textContent = data.email;
              this.accountPhoneNumber.textContent = data.phone_number;
            }
          );
        }
      }
    },

    handleAvatarEditButton: function () {
      FilePicker(['.png', '.jpg', '.jpeg', '.webp'], (data) => {
        compressImage(data, 150, async (finalImage) => {
          OrchidServices.set(`profile/${await OrchidServices.userId()}`, {
            profile_picture: finalImage
          });
          console.log(finalImage);
        });
      });
    },

    handleBannerEditButton: function () {
      FilePicker(['.png', '.jpg', '.jpeg', '.webp'], (data) => {
        compressImage(data, 150, async (finalImage) => {
          OrchidServices.set(`profile/${await OrchidServices.userId()}`, {
            banner_image: finalImage
          });
          console.log(finalImage);
        });
      });
    }
  };

  window.addEventListener('load', () => {
    setTimeout(() => {
      Account.init();
    }, 1000);
  });
})(window);
