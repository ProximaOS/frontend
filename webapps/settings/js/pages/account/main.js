!(function (exports) {
  'use strict';

  const Account = {
    accountBanner: document.getElementById('account-banner'),
    accountAvatar: document.getElementById('account-avatar'),
    accountUsername: document.getElementById('account-username'),
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
              this.accountFollowers.dataset.l10nArgs = JSON.stringify({
                followers: data.followers.length
              });
              this.accountFriends.dataset.l10nArgs = JSON.stringify({
                friends: data.friends.length
              });
              this.accountStatus.textContent = data.status.text;
              this.accountEmail.textContent = data.email;
              this.accountPhoneNumber.textContent = data.phone_number;
            }
          );
        }
      }
    },

    handleAvatarEditButton: function () {
      FilePicker(['.png', '.jpg', '.jpeg', '.webp'], (data) => {
        compressImage(data, this.KB_SIZE_LIMIT, async (finalImage) => {
          OrchidServices.set(`profile/${await OrchidServices.userId()}`, {
            profile_picture: finalImage
          });
          console.log(finalImage);
        });
      });
    },

    handleBannerEditButton: function () {
      FilePicker(['.png', '.jpg', '.jpeg', '.webp'], (data) => {
        compressImage(data, this.KB_SIZE_LIMIT, async (finalImage) => {
          OrchidServices.set(`profile/${await OrchidServices.userId()}`, {
            banner: finalImage
          });
          console.log(finalImage);
        });
      });
    }
  };

  window.addEventListener('orchidservicesload', () => {
    Account.init();
  });
})(window);
