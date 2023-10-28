!(function (exports) {
  'use strict';

  !(function (exports) {
    const LazyLoader = {
      load: function (assets) {
        return new Promise((resolve, reject) => {
          if (typeof assets === 'object') {
            assets.forEach((asset) => {
              const extension = asset.split('.').pop().toLowerCase();
              if (extension === 'css') {
                const stylesLink = document.createElement('link');
                stylesLink.rel = 'stylesheet';
                stylesLink.href = asset;
                document.head.appendChild(stylesLink);
                resolve();
              } else if (extension === 'js') {
                const script = document.createElement('script');
                script.src = asset;
                script.async = true;
                document.body.appendChild(script);
                resolve();
              }
            });
          } else {
            const extension = assets.split('.').pop().toLowerCase();
            if (extension === 'css') {
              const stylesLink = document.createElement('link');
              stylesLink.rel = 'stylesheet';
              stylesLink.href = assets;
              document.head.appendChild(stylesLink);
              resolve();
            } else if (extension === 'js') {
              const script = document.createElement('script');
              script.src = assets;
              script.async = true;
              document.body.appendChild(script);
              resolve();
            }
          }
        });
      }
    };

    exports.LazyLoader = LazyLoader;
  })(window);
})(window);
