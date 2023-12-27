!(function (exports) {
  'use strict';

  const MATH_INTENTS = [
    {
      pattern: /calculate\s+(\d+)\s*\+\s*(\d+)/i,
      reply: (match) => {
        return new Promise((resolve, reject) => {
          const num1 = parseInt(match[1]);
          const num2 = parseInt(match[2]);
          resolve(`The sum of ${num1} and ${num2} is ${num1 + num2}.`);
        });
      }
    },
    {
      pattern: /calculate\s+(\d+)\s*-\s*(\d+)/i,
      reply: (match) => {
        return new Promise((resolve, reject) => {
          const num1 = parseInt(match[1]);
          const num2 = parseInt(match[2]);
          resolve(`The difference between ${num1} and ${num2} is ${num1 - num2}.`);
        });
      }
    },
    {
      pattern: /calculate\s+(\d+)\s*\*\s*(\d+)/i,
      reply: (match) => {
        return new Promise((resolve, reject) => {
          const num1 = parseInt(match[1]);
          const num2 = parseInt(match[2]);
          resolve(`The product of ${num1} and ${num2} is ${num1 * num2}.`);
        });
      }
    },
    {
      pattern: /calculate\s+(\d+)\s*\/\s*(\d+)/i,
      reply: (match) => {
        return new Promise((resolve, reject) => {
          const num1 = parseInt(match[1]);
          const num2 = parseInt(match[2]);
          if (num2 !== 0) {
            resolve(`The result of dividing ${num1} by ${num2} is ${num1 / num2}.`);
          } else {
            resolve("Sorry, I can't divide by zero.");
          }
        });
      }
    }
  ];

  chatbot.addIntents(MATH_INTENTS);
})(window);
