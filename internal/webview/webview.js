!(function () {
  'use strict';

  function prepareWebview(node) {
    if (node.tagName === 'WEBVIEW') {
      // Set attributes for the newly added webview
      node.setAttribute('useragent', navigator.userAgent);
      if ('Environment' in window) {
        node.setAttribute('preload', `file://${Environment.dirName().replaceAll('\\', '/')}/preload.js`);
      }
      node.setAttribute('nodeintegration', true);
      node.setAttribute('nodeintegrationinsubframes', true);

      const loadCSS = (stylesheet) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', stylesheet, true);
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
            const cssContent = xhr.responseText;
            node.insertCSS(cssContent);
          } else if (xhr.readyState === 4) {
            console.error('Failed to fetch CSS:', xhr.status, xhr.statusText);
          }
        };
        xhr.send();
      };

      const loadJavascript = (script) => {
        const xhr1 = new XMLHttpRequest();
        xhr1.open('GET', script, true);
        xhr1.onreadystatechange = function () {
          if (xhr1.readyState === 4 && xhr1.status === 200) {
            const jsContent = xhr1.responseText;
            node.executeJavaScript(jsContent);
          } else if (xhr1.readyState === 4) {
            console.error('Failed to fetch JS:', xhr1.status, xhr1.statusText);
          }
        };
        xhr1.send();
      };

      node.addEventListener('dom-ready', () => {
        loadCSS('orchid://preloads/html.css');
        loadCSS('orchid://preloads/fontfamilies.css');
        loadCSS('orchid://preloads/pictureinpicture.css');
        loadCSS('orchid://preloads/videoplayer.css');

        loadJavascript('orchid://adblock/adblock.js');
        loadJavascript('orchid://preloads/override.js');

        if (/^http:\/\/.*\.localhost:8081\//.test(node.getURL())) {
          node.setAttribute('nodeintegration', true);
          node.setAttribute('nodeintegrationinsubframes', true);
        } else {
          node.setAttribute('nodeintegration', false);
          node.setAttribute('nodeintegrationinsubframes', false);
        }
      });
    } else if (node.tagName === 'IFRAME') {
      node.webPreferences = {
        nodeIntegrationInSubFrames: true
      };
    }
  }

  document.querySelectorAll('webview').forEach(prepareWebview);

  // Define a function to handle the mutation
  function handleMutation(mutations) {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach(prepareWebview);
    });
  }

  // Create a new instance of MutationObserver and set up the observer
  const observer = new MutationObserver(handleMutation);

  // Select the target node (body in this case)
  const targetNode = document.body;

  // Options for the observer (we're interested in childList mutations)
  const config = { childList: true, subtree: true };

  // Start observing the target node with the specified options
  observer.observe(targetNode, config);
})();
