!(function (exports) {
  'use strict';

  const Posts = {
    homePanel: document.getElementById('home'),

    posts: document.getElementById('home-posts'),
    postPanel: document.getElementById('post'),
    backButton: document.getElementById('post-back-button'),

    postAvatar: document.getElementById('post-avatar'),
    postUsername: document.getElementById('post-username'),
    postDate: document.getElementById('post-date'),
    postViews: document.getElementById('post-views'),
    postText: document.getElementById('post-text'),

    init: function () {
      window.addEventListener('orchid-services-ready', this.handleServicesLoad.bind(this));
      this.backButton.addEventListener('click', this.handleBackButton.bind(this));
    },

    handleServicesLoad: function () {
      _os.articles.getRelavantPosts().then((array) => {
        this.posts.innerHTML = '';
        array.forEach(element => {
          this.populate(element);
        });
      });
      window.removeEventListener('orchid-services-ready', this.handleServicesLoad.bind(this));
    },

    populate: function (data) {
      const post = document.createElement('div');
      post.classList.add('post');
      post.addEventListener('click', () =>
        this.openPost(post, data)
      );
      this.posts.appendChild(post);

      const header = document.createElement('div');
      header.classList.add('header');
      post.appendChild(header);

      const iconHolder = document.createElement('div');
      iconHolder.classList.add('icon-holder');
      header.appendChild(iconHolder);

      const icon = document.createElement('img');
      icon.classList.add('icon');
      iconHolder.appendChild(icon);

      const textHolder = document.createElement('div');
      textHolder.classList.add('text-holder');
      header.appendChild(textHolder);

      const username = document.createElement('span');
      username.classList.add('username');
      textHolder.appendChild(username);

      const stats = document.createElement('span');
      stats.classList.add('stats');
      textHolder.appendChild(stats);

      const date = document.createElement('span');
      date.classList.add('date');
      date.textContent = new Date(parseInt(data.time_created)).toLocaleDateString(
        navigator.language,
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          hour12: true,
          minute: 'numeric'
        }
      );
      stats.appendChild(date);

      const statSeparator = document.createElement('div');
      statSeparator.classList.add('separator');
      stats.appendChild(statSeparator);

      const views = document.createElement('span');
      views.classList.add('views');
      if (data.views) {
        views.textContent = data.views.length;
      } else {
        views.textContent = 0;
      }
      stats.appendChild(views);

      _os.auth.getAvatar(data.publisher_id).then((data) => {
        icon.src = data;
      });
      _os.auth.getUsername(data.publisher_id).then((data) => {
        username.textContent = data;
      });

      const content = document.createElement('div');
      content.classList.add('content');
      post.appendChild(content);

      const text = document.createElement('div');
      text.classList.add('text');
      text.innerText = data.content;
      content.appendChild(text);

      const options = document.createElement('div');
      options.classList.add('options');
      post.appendChild(options);

      const likeButton = document.createElement('button');
      likeButton.classList.add('like-button');
      likeButton.dataset.icon = 'like';
      options.appendChild(likeButton);

      const dislikeButton = document.createElement('button');
      dislikeButton.classList.add('dislike-button');
      dislikeButton.dataset.icon = 'dislike';
      options.appendChild(dislikeButton);

      const repostButton = document.createElement('button');
      repostButton.classList.add('repost-button');
      repostButton.dataset.icon = 'repost';
      options.appendChild(repostButton);

      const shareButton = document.createElement('button');
      shareButton.classList.add('share-button');
      shareButton.dataset.icon = 'share';
      options.appendChild(shareButton);

      const optionsButton = document.createElement('button');
      optionsButton.classList.add('options-button');
      optionsButton.dataset.icon = 'options';
      options.appendChild(optionsButton);
    },

    openPost: function (element, data) {
      requestAnimationFrame(() => Transitions.scale(element, this.postPanel.querySelector('.post')));

      this.homePanel.classList.remove('visible');
      this.postPanel.classList.add('visible');
      this.posts.classList.add('hidden');
      this.selectedElement = element;
      this.selectedElement.classList.add('target');

      this.postDate.textContent = new Date(parseInt(data.time_created)).toLocaleDateString(
        navigator.language,
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          hour12: true,
          minute: 'numeric'
        }
      );
      this.postViews.innerText = data.views.length;

      _os.auth.getAvatar(data.publisher_id).then((data) => {
        this.postAvatar.src = data;
      });
      _os.auth.getUsername(data.publisher_id).then((data) => {
        this.postUsername.textContent = data;
      });

      this.postText.innerText = data.content;
    },

    handleBackButton: function (event) {
      Transitions.scale(this.postPanel.querySelector('.post'), this.selectedElement);
      this.homePanel.classList.add('visible');
      this.postPanel.classList.remove('visible');
      this.posts.classList.remove('hidden');

      this.selectedElement.classList.remove('target');
    }
  };

  Posts.init();
})(window);
