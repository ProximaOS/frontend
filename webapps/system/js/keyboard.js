const Keyboard = {
  screen: document.getElementById("screen"),
  keyboard: document.getElementById("keyboard"),
  keyboardSuggestions: document.getElementById("keyboard-auto-correct"),
  keyboardContent: document.getElementById("keyboard-content"),
  keyboardLanguages: document.getElementById("keyboard-languages"),
  keyboardLanguagesButton: document.getElementById("keyboard-languages-button"),
  toggleButton: document.getElementById("software-keyboard-button"),
  data: {
    letters: '',
    shift: '',
    symbols: '',
  },
  language: 'en-US',
  inputText: '',

  keySound: new Audio('/resources/sounds/key.wav'),
  keySpecialSound: new Audio('/resources/sounds/key_special.wav'),

  init: async function () {
    await fetch(`/keyboard_layouts/${this.language}/letters.txt`)
      .then(response => response.text())
      .then(function (data) {
        Keyboard.data.letters = data;
      });
    await fetch(`/keyboard_layouts/${this.language}/shift.txt`)
      .then(response => response.text())
      .then(function (data) {
        Keyboard.data.shift = data;
      });
    await fetch(`/keyboard_layouts/${this.language}/symbols.txt`)
      .then(response => response.text())
      .then(function (data) {
        Keyboard.data.symbols = data;
      });

    this.useLayout(Keyboard.data.letters);

    // Event listeners for input focus and blur
    this.toggleButton.addEventListener('click', this.toggle.bind(this));
  },

  useLayout: function (data) {
    this.keyboardContent.innerHTML = '';

    var lines = data.split(process.platform == 'win32' ? '\r\n' : '\n');
    lines.forEach(line => {
      if (!line) {
        return;
      }

      var row = document.createElement('div');
      row.classList.add('row');
      this.keyboardContent.appendChild(row);

      var keys = line.split(' ');
      keys.forEach(key => {
        if (!key) {
          return;
        }

        var button = document.createElement('button');
        button.classList.add('key');
        button.addEventListener('click', () => {
          if (document.activeElement) {
            if (document.activeElement.nodeName === 'INPUT' || document.activeElement.nodeName === 'TEXTAREA') {
              document.activeElement.focus();
            } else {
              var webview = AppWindow.focusedWindow.querySelector('.browser');
              webview.focus();
            }
          }
        });
        row.appendChild(button);

        var letter = document.createElement('span');
        letter.classList.add('letter');
        button.appendChild(letter);

        var popout = document.createElement('div');
        popout.classList.add('popout');
        button.appendChild(popout);

        if (key === '{backspace}') {
          button.classList.add("backspace");
          button.dataset.icon = 'dialer-delete';
          button.addEventListener('click', () => {
            this.keySpecialSound.play();
            this.backspace();
          });
        } else if (key === '{shift}') {
          button.classList.add("shift");
          button.dataset.icon = 'collapse-chevron';
          button.addEventListener('click', () => {
            this.keySound.play();
            this.useLayout(Keyboard.data.shift);
          });
        } else if (key === '{unshift}') {
          button.classList.add("shift");
          button.classList.add("active");
          button.dataset.icon = 'expand-chevron';
          button.addEventListener('click', () => {
            this.keySound.play();
            this.useLayout(Keyboard.data.letters);
          });
        } else if (/\{symbols\:(.*)\}/.test(key)) {
          button.classList.add("symbols");
          var keyString = key.replace('{', '').replace('}', '').split(':')[1];
          letter.textContent = keyString;
          button.addEventListener('click', () => {
            this.keySpecialSound.play();
            this.useLayout(Keyboard.data.symbols);
          });
        } else if (/\{letters\:(.*)\}/.test(key)) {
          button.classList.add("letters");
          var keyString = key.replace('{', '').replace('}', '').split(':')[1];
          letter.textContent = keyString;
          button.addEventListener('click', () => {
            this.keySpecialSound.play();
            this.useLayout(Keyboard.data.letters);
          });
        } else if (/\{space\:(.*)\}/.test(key)) {
          button.classList.add("space");
          var keyString = key.replace('{', '').replace('}', '').split(':')[1];
          letter.textContent = keyString;
          button.addEventListener('click', () => {
            this.keySpecialSound.play();
            this.input(' ');
          });
        } else if (/\{return\:(.*)\}/.test(key)) {
          button.classList.add("return");
          var keyString = key.replace('{', '').replace('}', '').split(':')[1];
          letter.textContent = keyString;
          button.addEventListener('click', () => {
            this.keySpecialSound.play();
            this.hide();
          });
        } else {
          button.classList.add("has-popout");
          letter.textContent = key;
          popout.textContent = key;
          button.addEventListener('click', () => {
            this.keySound.play();
            this.input(key);
          });
        }
      });
    });
  },

  input: function (char) {
    this.inputText += char;
    // this.suggestWords();
    if (document.activeElement) {
      if (document.activeElement.nodeName === 'INPUT' || document.activeElement.nodeName === 'TEXTAREA') {
        document.activeElement.value += char;
      } else {
        var webview = AppWindow.focusedWindow.querySelector('.browser');
        webview.insertText(char);
      }
    }
  },

  backspace: function () {
    this.inputText = this.inputText.slice(0, -1);
    // this.suggestWords();
    if (document.activeElement) {
      if (document.activeElement.nodeName === 'INPUT' || document.activeElement.nodeName === 'TEXTAREA') {
        document.activeElement.value = document.activeElement.value.slice(0, -1);
      } else {
        var webview = AppWindow.focusedWindow.querySelector('.browser');
        webview.executeJavaScript(`
          if (document.activeElement) {
            // Append the key to the value of the focused element
            document.activeElement.value = document.activeElement.value.slice(0, -1);
          }
        `);
      }
    }
  },

  show: function () {
    this.screen.classList.add('keyboard-visible');
    this.keyboard.classList.add('visible');
  },

  hide: function () {
    this.screen.classList.remove('keyboard-visible');
    this.keyboard.classList.remove('visible');
  },

  toggle: function () {
    this.screen.classList.toggle('keyboard-visible');
    this.keyboard.classList.toggle('visible');
  },

  suggestWords: function () {
    var words = this.inputText.slice(' ');
    var lastWord = words[words.length - 1];

    const inputElement = document.createElement('input');
    inputElement.setAttribute('type', 'text');
    inputElement.setAttribute('spellcheck', 'true');
    inputElement.value = lastWord;
    document.body.appendChild(inputElement);

    // Trigger the browser's spellcheck
    inputElement.focus();
    inputElement.select();

    // Get the suggestions provided by the browser dictionary
    const suggestions = document.queryCommandValue('suggestions') || [];

    // Remove the temporary input element
    document.body.removeChild(inputElement);

    // Return the suggestions as similar words
    this.suggestions = suggestions.slice(0, 3);
    this.suggestions.forEach(suggestion => {
      var option = document.createElement('div');
      option.classList.add('suggestion');
      option.innerText = suggestion;
      this.keyboardContent.appendChild(option);
    });
  }
}

Keyboard.init();
