!(function (exports) {
  'use strict';

  const WebviewHandler = {
    mutationConfig: { childList: true, subtree: true },

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
          if (node.tagName === 'IMG') {
            node.addEventListener('load', () => {
              node.classList.add('loaded');
            });
          }
        });
      });
    }
  };

  WebviewHandler.init();
})(window);
