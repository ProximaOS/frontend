// Get necessary elements
const textarea = document.querySelector('.input');
const keys = document.querySelectorAll('.keys > li');
const backspaceButton = document.querySelector('.backspace-button');

// Attach click event listeners to number keys
keys.forEach((key) => {
  key.addEventListener('click', () => {
    const keyId = key.id;

    switch (keyId) {
      case 'keypad-number0-button':
        textarea.value += '0';
        break;

      case 'keypad-number1-button':
        textarea.value += '1';
        break;

      case 'keypad-number2-button':
        textarea.value += '2';
        break;

      case 'keypad-number3-button':
        textarea.value += '3';
        break;

      case 'keypad-number4-button':
        textarea.value += '4';
        break;

      case 'keypad-number5-button':
        textarea.value += '5';
        break;

      case 'keypad-number6-button':
        textarea.value += '6';
        break;

      case 'keypad-number7-button':
        textarea.value += '7';
        break;

      case 'keypad-number8-button':
        textarea.value += '8';
        break;

      case 'keypad-number9-button':
        textarea.value += '9';
        break;

      case 'keypad-hashtag-button':
        textarea.value += '#';
        break;

      case 'keypad-star-button':
        textarea.value += '*';
        break;

      default:
        break;
    }
  });
});

// Attach click event listener to backspace button
backspaceButton.addEventListener('click', () => {
  const currentValue = textarea.value;
  textarea.value = currentValue.slice(0, -1);
});
