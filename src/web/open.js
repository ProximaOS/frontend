!(function() {
  'use strict';

  module.exports = function (url, options = '') {
    const optionsList = options.split(',');
    let formattedUrl;
    if (!url.startsWith('http:') || !url.startsWith('https:')) {
      if (url.startsWith('/')) {
        formattedUrl = location.origin + url;
      } else {
        formattedUrl = `${location.origin}/${url}`;
      }
    } else {
      formattedUrl = url;
    }

    ipcRenderer.send('message', {
      type: 'window',
      action: 'open',
      url: formattedUrl,
      options: optionsList
    });
  };
})();
