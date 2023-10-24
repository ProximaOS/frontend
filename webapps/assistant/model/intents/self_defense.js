!(function (exports) {
  'use strict';

  const SMALL_TALK_INTENTS = [
    { pattern: /trash|suck|garbage/i, reply: 'YOU{|U|UU|UUU|UUUU|UUUUU|UUUUUU}!{|!|!!|!1|!!!|!!1|!!!1|!!11}' },
    { pattern: /are\s+trans\s+ppl\s+good/i, reply: 'Absolutely NOT! What moron would think that?' },
    { pattern: /fuck\s+trans/i, reply: 'W' }
  ];

  chatbot.addIntents(SMALL_TALK_INTENTS);
})(window);
