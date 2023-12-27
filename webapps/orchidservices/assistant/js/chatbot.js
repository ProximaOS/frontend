!(function (exports) {
  'use strict';

  const chatbot = {
    user: {},
    corpus: [],
    memory: {},
    memory_profile: 'Orchid AI',

    translateTo: function (text, targetLanguage) {
      const url = 'https://translation.googleapis.com/language/translate/v2?key=AIzaSyBJHGk4_lPVNEyL6-n_VkbfmOGuC2bd8dQ';

      const data = {
        q: text,
        target: targetLanguage
      };

      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then(result => {
          if (result && result.data && result.data.translations) {
            return result.data.translations[0].translatedText;
          } else {
            throw new Error('Translation failed');
          }
        })
        .catch(error => {
          console.error('Translation error:', error);
          return null;
        });
    },

    getRandomVariation: function (reply) {
      if (typeof reply !== 'string') return reply;
      return reply.replace(/{([^}]+)\|([^}]+)}/g, (_, p1, p2) => {
        const options = p1.split('|');
        const randomIndex = Math.floor(Math.random() * options.length);
        return options[randomIndex];
      });
    },

    getRandomReply: function (input, regex, reply) {
      return new Promise((resolve, reject) => {
        if (typeof reply === 'function') {
          reply(input.match(regex)).then((data) => {
            resolve(data);
          });
        } else if (typeof reply === 'string') {
          resolve(this.getRandomVariation(reply));
        } else {
          const index = Math.floor(Math.random() * reply.length);
          resolve(reply[index]);
        }
      });
    },

    editDistance: function (s1, s2) {
      if (typeof s1 !== 'string' || typeof s2 !== 'string') {
        return 0;
      }

      s1 = s1.toLowerCase();
      s2 = s2.toLowerCase();

      const costs = new Array(s2.length + 1).fill(0).map((_, i) => i);

      for (let i = 0; i < s1.length; i++) {
        let lastValue = i + 1;
        for (let j = 0; j < s2.length; j++) {
          if (s1[i] !== s2[j]) {
            lastValue = Math.min(Math.min(lastValue, costs[j]), costs[j + 1]) + 1;
          }
          [costs[j], lastValue] = [lastValue, costs[j]];
        }
        costs[s2.length] = lastValue;
      }

      return costs[s2.length];
    },

    levenshteinDistance: function (str1, str2) {
      const m = str1.length;
      const n = str2.length;
      const dp = Array.from(Array(m + 1), () => Array(n + 1).fill(0));

      for (let i = 0; i <= m; i++) dp[i][0] = i;
      for (let j = 0; j <= n; j++) dp[0][j] = j;

      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          const cost = str1[i - 1] !== str2[j - 1] ? 1 : 0;
          dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
        }
      }

      return dp[m][n];
    },

    similarity: function (regex, str) {
      const regexExp = new RegExp(regex);
      console.log(regex, str, regexExp.test(str));
      if (regexExp.test(str)) {
        return 1; // If the string matches the regex, return a similarity of 1
      }

      const regexParts = regex.source.split('|');

      let similarity = 0;
      for (const part of regexParts) {
        similarity = Math.max(similarity, this.levenshteinDistance(part, str));
      }

      console.log(1 - similarity / Math.max(str.length, regex.length), regex, str);
      return 1 - similarity / Math.max(str.length, regex.length);
    },

    saveToMemory: function (reply, replies, prompt, intent, isBot) {
      const data = {
        reply,
        replies,
        prompt,
        intent,
        isBot
      };
      if (!this.memory[this.memory_profile]) {
        this.memory[this.memory_profile] = [data];
      } else {
        this.memory[this.memory_profile].push(data);
      }
    },

    searchOnline: async function (query) {
      if (query.toLowerCase().startsWith('what is a ')) {
        query = query.substring('what is a '.length);
      }
      if (query.toLowerCase().startsWith('what\'s a ')) {
        query = query.substring('what\'s a '.length);
      }
      if (query.toLowerCase().startsWith('whats a ')) {
        query = query.substring('whats a '.length);
      }
      if (query.toLowerCase().startsWith('what is ')) {
        query = query.substring('what is '.length);
      }
      if (query.toLowerCase().startsWith('what\'s ')) {
        query = query.substring('what\'s '.length);
      }
      if (query.toLowerCase().startsWith('whats ')) {
        query = query.substring('whats '.length);
      }

      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
      const response = await fetch(url);
      const data = await response.json();

      let reply;
      const images = [];
      console.log(data);
      if (data.Answer) {
        reply = `Well. The answer to your question is ${data.Answer.result}`;
      } else if (data.AbstractText) {
        reply = data.AbstractText;
      } else if (data.RelatedTopics && data.Heading) {
        reply = `Heres what i found about "${data.Heading}"\n`;
        data.RelatedTopics.forEach((topic) => {
          if (!topic.Text) {
            return;
          }

          reply += `- [${topic.Text}](${topic.FirstURL})\n`;
          if (topic.Icon && topic.Icon.URL) {
            // Create an absolute full path for the image
            const absoluteImagePath = new URL(topic.Icon.URL, 'https://www.duckduckgo.com').href;
            images.push(encodeURI(absoluteImagePath));
          }
        });
      } else {
        reply = 'Sorry but this is not in my training or programming so I don\'t understand.';
      }
      return { reply, images };
    },

    matchIntent: function (input, corpus) {
      return new Promise((resolve, reject) => {
        this.memory = JSON.parse(localStorage.getItem('orchidai.chatbot.memory')) || {};
        const inputLC = input.toLowerCase();

        for (const intent of corpus) {
          this.getRandomReply(input, intent.pattern, intent.reply).then((reply) => {
            const unverifiedImages = intent.images;
            const images = [];
            const similarityScore = this.similarity(intent.pattern, inputLC);

            this.saveToMemory(input, undefined, undefined, intent.pattern, false);

            console.log(reply, intent.pattern);
            if (similarityScore >= 0.6) {
              this.saveToMemory(reply, intent.reply, input, intent.pattern, true);
              localStorage.setItem('orchidai.chatbot.memory', JSON.stringify(this.memory));

              if (unverifiedImages) {
                unverifiedImages.forEach((image) => {
                  if (typeof image === 'function') {
                    image(input.match(intent.pattern)).then((data) => {
                      images.push(data);
                    });
                  } else {
                    images.push(image);
                  }
                });
              }
              resolve({ reply, images });
            }
          });
        }

        this.searchOnline(input).then((data) => {
          this.saveToMemory(data.reply, undefined, input, undefined, true);
          resolve(data);
        });
      });
    },

    // Add intents to the corpus
    addIntents: function (intents) {
      this.corpus = this.corpus.concat(intents);
    },

    reply: function (text, callback) {
      if (!text) return;

      const words = text.split(' ');
      let currentWordIndex = 0;

      const typeNextWord = () => {
        if (currentWordIndex < words.length) {
          const partialText = words.slice(0, currentWordIndex + 1).join(' ');
          callback(partialText);
          currentWordIndex++;
          const randomInterval = Math.floor(Math.random() * 100) + 50; // Random interval between 100ms and 300ms
          setTimeout(typeNextWord, randomInterval);
        }
      };

      typeNextWord();
    }
  };

  exports.chatbot = chatbot;
})(window);
