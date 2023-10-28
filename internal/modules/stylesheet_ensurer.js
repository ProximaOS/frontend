!(function (exports) {
  'use strict';

  const path = require('path');
  const url = require('url');

  const StylesheetEnsurer = {
    init: function () {
      console.log(url.pathToFileURL(path.join(__dirname, '..', 'preload', 'html.css')).href);
      this.loadCSS(url.pathToFileURL(path.join(__dirname, '..', 'preload', 'html.css')).href);
      this.loadCSS(url.pathToFileURL(path.join(__dirname, '..', 'preload', 'fontfamilies.css')).href);
      this.loadCSS(url.pathToFileURL(path.join(__dirname, '..', 'preload', 'pictureinpicture.css')).href);
      this.loadCSS(url.pathToFileURL(path.join(__dirname, '..', 'preload', 'videoplayer.css')).href);
    },

    injectCSSIntoIframe: function (iframe, cssCode) {
      const styleElement = document.createElement('style');
      styleElement.type = 'text/css';
      styleElement.appendChild(document.createTextNode(cssCode));
      document.head.appendChild(styleElement);
    },

    loadCSS: function (stylesheet) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', stylesheet, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          const cssContent = xhr.responseText;
          injectCSSIntoIframe(node, cssContent);
        } else if (xhr.readyState === 4) {
          console.error('Failed to fetch CSS:', xhr.status, xhr.statusText);
        }
      };
      xhr.send();
    }
  };

  StylesheetEnsurer.init();
})(window);
