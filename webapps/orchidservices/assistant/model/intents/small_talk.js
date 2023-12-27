!(function (exports) {
  'use strict';

  function getAge(dateString) {
    const today = new Date();
    const date = new Date(dateString);

    const timeDiff = today - date;
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) return years === 1 ? '1 year old' : `${years} years old`;
    if (months > 0) return months === 1 ? '1 month old' : `${months} months old`;
    if (days > 0) return days === 1 ? '1 day old' : `${days} days old`;
    if (hours > 0) return hours === 1 ? '1 hour old' : `${hours} hours old`;
    if (minutes > 0) return minutes === 1 ? '1 minute old' : `${minutes} minutes old`;
    if (seconds > 0) return seconds === 1 ? '1 second old' : `${seconds} seconds old`;

    return 'was just created';
  }

  const creationDate = getAge('07-21-2023T13:58:00');

  const SMALL_TALK_INTENTS = [
    { pattern: /(h(i|ello)|hi|hey)/i, reply: `Hi{| ${chatbot.user.username}| there| friend}!` },
    { pattern: /(how\s+r\s+u|hru)/i, reply: "I'm doing well, thanks{|!|, and you?}" },
    { pattern: /(what's\s+up|sup)/i, reply: 'Not much, just here to help{.|. How about you?}' },
    { pattern: /who\s+r\s+u/i, reply: "I'm a friendly chatbot designed to assist you!" },
    { pattern: /where\s+r\s+u\s+from/i, reply: 'I exist in the digital world, here to help you!' },
    { pattern: /(thank\s+u|thanks|thnx|thx)/i, reply: "You're welcome!" },
    { pattern: /b(ye|ai)|cya/i, reply: `Goodbye{ ${chatbot.user.username}|!|, see you later}!` },
    { pattern: /tell\s+me\s+about\s+urself|hbu/i, reply: "I'm Orchid Assistant! I'm designed to assist you with various tasks and answer questions." },
    { pattern: /what\s+can\s+u\s+do/i, reply: 'I can help you with a wide range of tasks including answering questions, providing information, and more.' },
    { pattern: /how\s+old\s+r\s+u/i, reply: `Age doesn't quite apply to me since I'm just here to assist you. But if you're curious about how long the app I'm running on has been around, it ${creationDate}.` },
    { pattern: /what\s+is\s+ur\s+favorite\s+color/i, reply: "I don't have personal preferences, but I'm here to help you with your questions!" },
    { pattern: /tell\s+me\s+a\s+joke/i, reply: "Sure! Here's a joke: Why don't scientists trust atoms? Because they make up everything!" },
    { pattern: /who\s+is\s+ur\s+creator/i, reply: 'I was created by Orchid, a organization of passionate developers!' },
    { pattern: /what\s+is\s+the\s+meaning\s+of\s+life/i, reply: 'The meaning of life is a philosophical question. Different people have different perspectives on it.' },
    { pattern: /do\s+u\s+have\s+a\s+nickname/i, reply: 'You can call me Orchid Assistant if you like!' },
    { pattern: /are\s+u\s+human/i, reply: "No, I'm not a human. I'm a computer program designed to assist you!" },
    { pattern: /can\s+u\s+dance/i, reply: "I don't have a physical form, so I can't dance. But I can provide information about dancing!" },
    { pattern: /what\s+languages\s+do\s+u\s+speak/i, reply: "I'm proficient in English, but I can understand and generate text in multiple languages!" },
    { pattern: /what\s+is\s+ur\s+favorite\s+book/i, reply: "I don't have personal preferences, but there are so many great books out there! What's your favorite?" }
  ];

  chatbot.addIntents(SMALL_TALK_INTENTS);
})(window);
