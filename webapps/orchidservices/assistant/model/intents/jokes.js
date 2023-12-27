!(function (exports) {
  'use strict';

  const JOKES_INTENTS = [
    {
      pattern: /(tell\s+me\s+a\s+joke|joke)/i,
      reply: [
        'Sure! Why did the scarecrow win an award? Because he was outstanding in his field!',
        'Alright. What do you call fake spaghetti? An impasta!',
        "Why don't scientists trust atoms? Because they make up everything!",
        'Parallel lines have so much in common... It’s a shame they’ll never meet.',
        'I told my wife she was drawing her eyebrows too high. She looked surprised.',
        "I'm reading a book on anti-gravity. It's impossible to put down!",
        'I used to play piano by ear, but now I use my hands.'
      ]
    },
    {
      pattern: /(another\s+joke|one\s+more\s+joke)/i,
      reply: [
        "Alright, here's another one: What do you get when you cross a snowman and a vampire? Frostbite!",
        'Sure thing! What did one ocean say to the other ocean? Nothing, they just waved!',
        "Here's another: I used to play piano by ear, but now I use my hands!",
        "Why don't oysters donate to charity? Because they are shellfish.",
        "I'm reading a book on anti-gravity. It's impossible to put down!",
        "Alright. Why don't skeletons fight each other? They don't have the guts!",
        "Here's another: Why don't oysters donate to charity? Because they are shellfish.",
        'Want to hear a construction joke? Sorry, I’m still working on it!',
        "I'm on a seafood diet. I see food and I eat it!"
      ]
    },
    {
      pattern: /(got\s+any\s+more\s+jokes|more\s+jokes)/i,
      reply: [
        "Of course! Why don't scientists trust atoms? Because they make up everything!",
        "Here's another: I used to play piano by ear, but now I use my hands!",
        'Parallel lines have so much in common... It’s a shame they’ll never meet.',
        "Why don't oysters donate to charity? Because they are shellfish.",
        "I'm reading a book on anti-gravity. It's impossible to put down!",
        "Why don't skeletons fight each other? They don't have the guts!",
        'Of course! How do you organize a space party? You planet!',
        "Here's another: I used to be a baker, but I couldn't make enough dough.",
        "Why don't scientists trust atoms? Because they make up everything!",
        "I'm reading a book on anti-gravity. It's impossible to put down!",
        'I used to play piano by ear, but now I use my hands.'
      ]
    },
    {
      pattern: /(stop\s+joking|enough\s+jokes)/i,
      reply: [
        "Alright, no more jokes! Let me know if there's anything else I can assist you with.",
        'Got it! Feel free to ask if you need anything else.',
        'If you ever need a laugh, just let me know!',
        'Remember, laughter is the best medicine!'
      ]
    }
  ];

  chatbot.addIntents(JOKES_INTENTS);
})(window);
