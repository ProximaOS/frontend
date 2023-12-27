!(function (exports) {
  'use strict';

  const EmojiConverter = {
    emojiRegistry: {
      angry: 'http://shared.localhost:8081/resources/emojis/angry.svg',
      building: 'http://shared.localhost:8081/resources/emojis/building.svg',
      cry: 'http://shared.localhost:8081/resources/emojis/cry.svg',
      disguise: 'http://shared.localhost:8081/resources/emojis/disguise.svg',
      frown: 'http://shared.localhost:8081/resources/emojis/frown.svg',
      grinning: 'http://shared.localhost:8081/resources/emojis/grinning.svg',
      gun: 'http://shared.localhost:8081/resources/emojis/gun.svg',
      high: 'http://shared.localhost:8081/resources/emojis/high.svg',
      joy: 'http://shared.localhost:8081/resources/emojis/joy.svg',
      monocle: 'http://shared.localhost:8081/resources/emojis/monocle.svg',
      'mort-visor-angry': 'http://shared.localhost:8081/resources/emojis/mort-visor-angry.svg',
      'mort-visor-blep': 'http://shared.localhost:8081/resources/emojis/mort-visor-blep.svg',
      'mort-visor-chill': 'http://shared.localhost:8081/resources/emojis/mort-visor-chill.svg',
      'mort-visorless-angry': 'http://shared.localhost:8081/resources/emojis/mort-visorless-angry.svg',
      'mort-visorless-blep': 'http://shared.localhost:8081/resources/emojis/mort-visorless-blep.svg',
      'mort-visorless-chill': 'http://shared.localhost:8081/resources/emojis/mort-visorless-chill.svg',
      nerd: 'http://shared.localhost:8081/resources/emojis/nerd.svg',
      'no-mouth': 'http://shared.localhost:8081/resources/emojis/no-mouth.svg',
      'oh-no': 'http://shared.localhost:8081/resources/emojis/oh-no.svg',
      rage: 'http://shared.localhost:8081/resources/emojis/rage.svg',
      'skull-with-crossbones': 'http://shared.localhost:8081/resources/emojis/skull-with-crossbones.svg',
      skull: 'http://shared.localhost:8081/resources/emojis/skull.svg',
      smile: 'http://shared.localhost:8081/resources/emojis/smile.svg',
      sob: 'http://shared.localhost:8081/resources/emojis/sob.svg',
      sunglasses: 'http://shared.localhost:8081/resources/emojis/sunglasses.svg',
      'thumbs-up': 'http://shared.localhost:8081/resources/emojis/thumbs-up.svg',
      'thumbs-down': 'http://shared.localhost:8081/resources/emojis/thumbs-down.svg',
      'upside-down': 'http://shared.localhost:8081/resources/emojis/upside-down.svg',
      verified: 'http://shared.localhost:8081/resources/emojis/verified.svg',
      watergun: 'http://shared.localhost:8081/resources/emojis/watergun.svg',
      wink: 'http://shared.localhost:8081/resources/emojis/wink.svg',
      worried: 'http://shared.localhost:8081/resources/emojis/worried.svg'
    },

    convertToEmoji: function (text) {
      const regex = /:(\w+):/g;
      return text.replace(regex, (match, key) => {
        if (this.emojiRegistry[key]) {
          return `<img src="${this.emojiRegistry[key]}" alt=":${key}:" class="bb-emoji" />`;
        } else {
          return match; // Return the original string if no match is found in the registry
        }
      });
    }
  };

  exports.EmojiConverter = EmojiConverter;
})(window);
