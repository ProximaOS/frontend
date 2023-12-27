!(function (exports) {
  'use strict';

  const SMALL_TALK_INTENTS = [
    { pattern: /trash|suck|garbage/i, reply: 'YOU{|U|UU|UUU|UUUU|UUUUU|UUUUUU}!{|!|!!|!1|!!!|!!1|!!!1|!!11}' },
    { pattern: /uwu|owo/i, reply: 'Hehe{|, OwO|, UwU}!' }
  ];

  chatbot.addIntents(SMALL_TALK_INTENTS);
})(window);
