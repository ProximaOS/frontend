!(function (exports) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    // Get the calculator buttons
    const buttons = document.getElementsByClassName('button');

    // Attach onclick event handler to each button
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', buttonClickHandler);
    }
  });

  function buttonClickHandler (event) {
    const value = event.target.innerHTML;

    switch (value) {
      case 'C':
        clearResult();
        break;
      case '←':
        deleteLast();
        break;
      case '=':
        calculate();
        break;
      default:
        appendToResult(value);
        break;
    }
  }

  function appendToResult (value) {
    document.getElementById('result').value += value;
  }

  function clearResult () {
    document.getElementById('result').value = '';
  }

  function deleteLast () {
    const result = document.getElementById('result').value;
    document.getElementById('result').value = result.slice(0, -1);
  }

  function calculate () {
    const result = document.getElementById('result').value;
    const answer = result.replace('÷', '/');
    document.getElementById('result').value = answer.toLocaleString(
      L10n.currentLanguage
    );
  }
})(window);
