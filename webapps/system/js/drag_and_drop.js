!(function (exports) {
  'use strict';

  const DragAndDrop = {
    screen: document.getElementById('screen'),
    element: document.getElementById('drag-and-drop'),

    init: function () {
      // window.addEventListener('webdrag', this.handleDrag.bind(this));
      // window.addEventListener('webdrop', this.handleDrop.bind(this));
      // document.addEventListener('mousemove', this.handleDragMove.bind(this));
      // document.addEventListener('touchmove', this.handleDragMove.bind(this));
    },

    handleDrag: function (event) {
      event.preventDefault();

      const detail = event.detail;
      const webview = document.querySelector(
        '.appframe.active .browser-container .browser.active'
      );
      const webviewBox = webview.getBoundingClientRect();

      this.screen.classList.add('drag-and-drop-active');
      this.element.classList.add('visible');
      this.element.style.left = webviewBox.left + detail.left + 'px';
      this.element.style.top = webviewBox.top + detail.top + 'px';
      this.element.style.width = `${detail.width}px`;
      this.element.style.height = `${detail.height}px`;
      this.offsetX = detail.left;
      this.offsetY = detail.top;

      DisplayManager.screenshot(webview.getWebContentsId()).then((data) => {
        this.element.style.backgroundImage = `url(${data})`;
        this.element.style.backgroundPosition = `-${detail.left}px -${detail.top}px`;
      });
    },

    handleDragMove: function (event) {
      event.preventDefault();

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

        document.removeEventListener('mousemove', dragWindow);
        document.removeEventListener('touchmove', dragWindow);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);

        that.handleDrop(event);
      }
    },

    handleDrop: function (event) {
      const detail = event.detail;

      this.screen.classList.remove('drag-and-drop-active');
      this.element.classList.remove('visible');
      this.element.style.transform = `translate(${detail.left}px, ${detail.top}px)`;
      this.element.style.width = `${detail.width}px`;
      this.element.style.height = `${detail.height}px`;
    }
  };

  DragAndDrop.init();
})(window);
