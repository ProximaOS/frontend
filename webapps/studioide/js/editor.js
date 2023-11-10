(function (exports) {
  'use strict';

  const Editor = {
    editor: null,
    selectedFile: 'test.js',

    init: function () {
      this.editor = ace.edit('editor-container');
      this.editor.setTheme('ace/theme/twilight');
      this.editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
      });

      let mode = 'text';
      if (this.selectedFile.endsWith('.json') || this.selectedFile.endsWith('.webmanifest')) {
        mode = 'json';
      } else if (this.selectedFile.endsWith('.html')) {
        mode = 'html';
      } else if (this.selectedFile.endsWith('.js')) {
        mode = 'javascript';
      } else if (this.selectedFile.endsWith('.css')) {
        mode = 'css';
      } else if (this.selectedFile.endsWith('.svg')) {
        mode = 'svg';
      }

      this.editor.session.setMode(`ace/mode/${mode}`);
    }
  };

  Editor.init();
})(window);
