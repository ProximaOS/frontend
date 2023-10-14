(function (exports) {
  'use strict';

  const Editor = {
    init: function () {
      const editorArea = document.getElementById('editor-area');
      const lineNumbersDiv = document.getElementById('line-numbers');

      editorArea.addEventListener('input', (event) => {
        if (event.altKey || event.ctrlKey) {
          return;
        }

        const code = event.target.innerText;
        const highlightedCode = this.syntaxHighlight(code);
        event.target.innerHTML = highlightedCode;

        this.updateLineNumbers(lineNumbersDiv, editorArea);
      });

      editorArea.addEventListener('mouseup', (event) => {
      //   const highlightedCode = event.target.innerHTML;
      //   const selectedWord = window.getSelection().toString();
      //   event.target.innerHTML = this.highlightSimilarWords(highlightedCode, selectedWord);

        const lineNumber = this.getLineNumber(event.clientY);
        event.target.innerHTML = this.highlightCurrentLine(highlightedCode, lineNumber);
      });
    },

    syntaxHighlight: function (code) {
      code = code
        .replaceAll(/&/g, '&amp;')
        .replaceAll(/</g, '&lt;')
        .replaceAll(/>/g, '&gt;');
      code = code.replaceAll(/("[^"]*")/g, '<span class="string">$1</span>');
      code = code.replace(/('([^']*)')/g, '<span class="string">$1</span>');
      code = code.replace(/(`([^`]*)`)/g, '<span class="string">$1</span>');
      code = code.replace(
        /\/([^\/\n]*)\/(g|i|m|u|y)?/g,
        '<span class="regex">/$1/$2</span>'
      );
      code = code.replaceAll(/(\b\d+\b)/g, '<span class="number">$1</span>');
      code = code.replaceAll(
        /(\/\/[^\n]*)/g,
        '<span class="comment">$1</span>'
      );
      code = code.replaceAll(
        /(\/\*[\s\S]*?\*\/)/g,
        '<span class="comment">$1</span>'
      );
      code = code.replaceAll(
        /\b(var|let|const|function)\b/g,
        '<span class="keyword">$1</span>'
      );
      code = code.replaceAll(
        /(\.([^-]*)\{)/g,
        '<span class="keyword">$1</span>'
      );
      code = code.replace(
        /(\b\w+\b)(?=\()/g,
        '<span class="function">$1</span>'
      );
      return code;
    },

    updateLineNumbers: function (lineNumbersDiv, editorArea) {
      const lines = editorArea.innerText.split('\n');
      const lineNumbersHTML = lines
        .map((_, index) => `<div>${index + 1}</div>`)
        .join('');

      lineNumbersDiv.innerHTML = lineNumbersHTML;
      editorArea.style.paddingLeft =
        lineNumbersDiv.getBoundingClientRect().width + 10 + 'px';
    },

    getLineNumber: function (y) {
      const lineHeight = 20; // Adjust this based on your font size
      return Math.floor(y / lineHeight);
    },

    highlightCurrentLine: function (code, lineNumber) {
      const lines = code.split('\n');
      const highlightedLines = lines.map((line, index) => {
        if (index === lineNumber) {
          return `<div class="current-line">${line}</div>`;
        } else {
          return `<div>${line}</div>`;
        }
      });
      return highlightedLines.join('');
    },

    highlightSimilarWords: function (code, word) {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      return code.replace(regex, '<span class="similar-word">$&</span>');
    },
  };

  Editor.init();
})(window);
