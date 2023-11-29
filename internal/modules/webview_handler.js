!(function (exports) {
  'use strict';

  const WebviewHandler = {
    mutationConfig: { childList: true, subtree: true },

    VALID_ERRORS: [
      'ERR_CONNECTION_RESET',
      'ERR_CONNECTION_REFUSED',
      'ERR_CONNECTION_TIMED_OUT',
      'ERR_EMPTY_RESPONSE',
      'ERR_ADDRESS_UNREACHABLE',
      'ERR_INTERNET_DISCONNECTED',
      'ERR_SSL_PROTOCOL_ERROR',
      'ERR_NAME_NOT_RESOLVED',
      'ERR_TOO_MANY_REDIRECTS',
      'ERR_CONNECTION_CLOSED',
      'ERR_CERT_AUTHORITY_INVALID',
      'DNS_PROBE_FINISHED_NO_INTERNET'
    ],

    init: function () {
      // Create a new instance of MutationObserver and set up the observer
      const observer = new MutationObserver(this.handleMutations.bind(this));

      // Select the target node (body in this case)
      const targetNode = document.body;

      // Start observing the target node with the specified options
      observer.observe(targetNode, this.mutationConfig);
    },

    handleMutations: function (mutations) {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'WEBVIEW') {
            // Set attributes for the newly added webview
            node.preload = `file://${__dirname.replaceAll('\\', '/')}/preload.js`;

            node.addEventListener('dom-ready', () => {
              node.addEventListener('did-fail-load', () => {
                node.src = `orchid://net_error/?url=${node.getURL()}`;
              });
            });
          }
        });
      });
    }
  };

  WebviewHandler.init();
})(window);
