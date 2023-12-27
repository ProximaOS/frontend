!(function (exports) {
  'use strict';

  const LazyLoader = {
    load: function (assets, callback = null) {
      const promises = [];

      if (typeof assets === 'object') {
        assets.forEach((asset) => {
          const extension = asset.split('.').pop().toLowerCase();
          const promise = new Promise((resolve) => {
            if (extension === 'css') {
              const stylesLink = document.createElement('link');
              stylesLink.rel = 'stylesheet';
              stylesLink.href = asset;
              document.head.appendChild(stylesLink);
              stylesLink.onload = resolve;
            } else if (extension === 'js') {
              const script = document.createElement('script');
              script.src = asset;
              script.async = true;
              document.body.appendChild(script);
              script.onload = resolve;
            }
          });
          promises.push(promise);
        });
      } else {
        const extension = assets.split('.').pop().toLowerCase();
        const promise = new Promise((resolve) => {
          if (extension === 'css') {
            const stylesLink = document.createElement('link');
            stylesLink.rel = 'stylesheet';
            stylesLink.href = assets;
            document.head.appendChild(stylesLink);
            stylesLink.onload = resolve;
          } else if (extension === 'js') {
            const script = document.createElement('script');
            script.src = assets;
            script.async = true;
            document.body.appendChild(script);
            script.onload = resolve;
          }
        });
        promises.push(promise);
      }

      Promise.all(promises).then(() => {
        if (callback && typeof callback === 'function') {
          callback();
        }
      });
    }
  };

  exports.LazyLoader = LazyLoader;
})(window);
