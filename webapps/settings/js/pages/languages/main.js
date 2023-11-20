!(function (exports) {
  'use strict';

  const Languages = {
    languagesList: document.getElementById('languages-list'),

    init: function () {
      fetch(`http://shared.localhost:8081/resources/languages.json`)
        .then(response => response.json())
        .then((data) => {
          data.forEach(item => {
            const language = document.createElement('li');
            language.addEventListener('click', () => this.changeLanguage(item.lang_code));
            this.languagesList.appendChild(language);

            const label = document.createElement('p');
            label.textContent = item.name;
            language.appendChild(label);
          });
        });
    },

    changeLanguage: function (langCode) {
      window.Settings.setValue('general.lang.code', langCode);
    }
  };

  Languages.init();
})(window);
