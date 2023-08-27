!(function (exports) {
  'use strict';

  const PictureInPicture = {
    element: document.getElementById('picture-in-picture'),
    video: document.getElementById('picture-in-picture-video'),
    closeButton: document.getElementById('picture-in-picture-close-button'),
    playButton: document.getElementById('picture-in-picture-play-button'),
    skipBackButton: document.getElementById('picture-in-picture-skip-back-button'),
    skipForwardButton: document.getElementById('picture-in-picture-skip-forward-button'),

    init: function () {
      this.element.addEventListener('mousedown', this.startDrag.bind(this));
      this.element.addEventListener('touchstart', this.startDrag.bind(this));

      this.closeButton.addEventListener('click', this.hide.bind(this));
      this.playButton.addEventListener('click', this.handlePlayButton.bind(this));
      this.skipBackButton.addEventListener('click', this.handleSkipBackButton.bind(this));
      this.skipForwardButton.addEventListener('click', this.handleSkipForwardButton.bind(this));
    },

    show: function (videoUrl, timestamp) {
      this.element.classList.add('visible');

      this.isPlaying = true;

      this.video.src = videoUrl;
      this.video.currentTime = timestamp;
      this.video.play();
    },

    hide: function () {
      this.element.classList.remove('visible');
    },

    handlePlayButton: function () {
      if (this.isPlaying) {
        this.video.pause();
      } else {
        this.video.play();
      }
      this.isPlaying = !this.isPlaying;
    },

    handleSkipBackButton: function () {
      this.element.classList.remove('visible');
    },

    handleSkipForwardButton: function () {
      this.element.classList.remove('visible');
    },

    // Attach event listeners for mouse/touch events to handle dragging
    startDrag: function (event) {
      event.preventDefault();
      AppWindow.containerElement.classList.add('dragging');

      this.element.classList.add('transitioning-bouncy');
      this.element.addEventListener('transitionend', () =>
        this.element.classList.remove('transitioning-bouncy')
      );
      this.element.classList.add('dragging');

      // Get initial position
      const initialX = event.pageX || event.touches[0].pageX;
      const initialY = event.pageY || event.touches[0].pageY;

      // Get initial window position
      const initialWindowX = this.element.offsetLeft;
      const initialWindowY = this.element.offsetTop;

      // Calculate the offset between the initial position and the window position
      const offsetX = initialX - initialWindowX;
      const offsetY = initialY - initialWindowY;

      // Attach event listeners for dragging
      document.addEventListener('mousemove', dragWindow);
      document.addEventListener('touchmove', dragWindow);
      document.addEventListener('mouseup', stopDrag);
      document.addEventListener('touchend', stopDrag);

      const that = this;

      // Function to handle dragging
      function dragWindow(event) {
        event.preventDefault();
        const x = event.pageX || event.touches[0].pageX;
        const y = event.pageY || event.touches[0].pageY;

        // Calculate the new position of the window
        const newWindowX = x - offsetX;
        const newWindowY = y - offsetY;

        // Set the new position of the window
        that.element.style.left = newWindowX + 'px';
        that.element.style.top = newWindowY + 'px';
      }

      // Function to stop dragging
      function stopDrag(event) {
        event.preventDefault();
        AppWindow.containerElement.classList.remove('dragging');

        that.element.classList.add('transitioning-bouncy');
        that.element.addEventListener('transitionend', () =>
          that.element.classList.remove('transitioning-bouncy')
        );
        that.element.classList.remove('dragging');

        document.removeEventListener('mousemove', dragWindow);
        document.removeEventListener('touchmove', dragWindow);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
      }
    }
  };

  PictureInPicture.init();

  exports.PictureInPicture = PictureInPicture;
})(window);
