!(function (exports) {
  'use strict';

  const INTERNEL_INTENTS = [
    {
      pattern: /(search\w+|search\s+for|find)\s(.*)/i,
      reply: (match) => {
        return new Promise((resolve, reject) => {
          console.log(match);
          const query = match[2];
          chatbot.searchOnline(query).then((data) => {
            resolve(data);
          });
        });
      }
    }
  ];

  chatbot.addIntents(INTERNEL_INTENTS);
})(window);
