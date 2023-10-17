!(function (exports) {
  'use strict';

  async function importJavascript(url) {
    try {
      const response = await fetch(url);
      const jsCode = await response.text();

      // Using Function (safer than eval)
      const func = new Function(jsCode);
      func();
    } catch (error) {
      console.error('Error fetching or executing JS:', error);
    }
  }
  importJavascript('openorchid://preloads/override.js');
  importJavascript('openorchid://preloads/webview.js');
})(window);
