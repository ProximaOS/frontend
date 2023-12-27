!(function (exports) {
  'use strict';

  const HapticUi = {
    init: async function () {
      document.addEventListener('mousedown', this.onPointerDown.bind(this));
    },

    populateFriends: function (friends) {
      this.friendsList.innerHTML = '';
      for (let index = 0; index < friends.length; index++) {
        const friend = friends[index];

        const element = document.createElement('li');
        element.classList.add('hbox');
        element.dataset.pageId = 'chat';
        element.addEventListener('click', () => this.handleFriendClick(friend));
        this.friendsList.appendChild(element);
        PageController.init();

        const avatar = document.createElement('img');
        element.appendChild(avatar);

        const textHolder = document.createElement('div');
        textHolder.classList.add('vbox');
        element.appendChild(textHolder);

        const username = document.createElement('p');
        textHolder.appendChild(username);

        const status = document.createElement('p');
        textHolder.appendChild(status);

        OrchidServices.getWithUpdate(`profile/${friend.friend_id}`, (data) => {
          avatar.src = data.profile_picture;
          username.textContent = data.username;

          if (!data.status && !data.status.text) {
            status.style.display = 'none';
            return;
          }
          status.textContent = data.status.text;
          status.style.display = 'block';
        });
      }
    },

    populateSkeletonPolymer: function () {
      this.friendsList.innerHTML = '';
      for (let index = 0; index < 16; index++) {
        const element = document.createElement('li');
        element.classList.add('noclick');
        element.dataset.pageId = 'chat';
        element.addEventListener('click', () => this.handleFriendClick(friend));
        this.friendsList.appendChild(element);

        const textHolder = document.createElement('div');
        textHolder.classList.add('vbox');
        element.appendChild(textHolder);

        const username = document.createElement('p');
        username.textContent = `Username ${Math.random() * 32767}`;
        username.classList.add('pack-skeleton');
        textHolder.appendChild(username);
      }
    },

    handleFriendClick: function (friend) {
      OrchidServices.get(`profile/${friend.friend_id}`).then((data) => {
        this.chatName.textContent = data.username;
        this.chatAvatar.src = data.profile_picture;
        Chat.initializeChannel(friend.token);
      });
    }
  };

  HapticUi.init();
})(window);
