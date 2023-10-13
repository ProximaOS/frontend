document.addEventListener('DOMContentLoaded', function () {
  const chatMessages = document.getElementById('chat-messages');
  const form = document.getElementById('chat-form');
  const userInput = document.getElementById('chat-form-input');

  StickyScroll.init(chatMessages);

  form.onsubmit = (evt) => {
    evt.preventDefault();
    sendMessage();
  };

  async function addMessage (message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender);
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    messageElement.appendChild(avatar);
    if (sender === 'user') {
      OrchidServices.get(`profile/${await OrchidServices.userId()}`).then((data) => {
        if (!data) {
          return;
        }
        avatar.style.backgroundImage = `url(${data.profile_picture})`;
      });
    }

    const textHolder = document.createElement('div');
    textHolder.classList.add('text-holder');
    messageElement.appendChild(textHolder);

    const messageText = document.createElement('div');
    messageText.classList.add('message-text');
    const md = window.markdownit();
    const result = md.render(message.reply);
    messageText.innerHTML = result;
    textHolder.appendChild(messageText);

    const images = document.createElement('div');
    images.classList.add('images');
    textHolder.appendChild(images);

    if (message.images) {
      message.images.forEach((data) => {
        const image = document.createElement('img');
        image.classList.add('image');
        image.src = data;
        images.appendChild(image);
      });
    }

    return messageText;
  }

  function sendMessage () {
    const userMessage = userInput.value;
    if (userMessage.trim() !== '') {
      addMessage({
        reply: userMessage
      }, 'user');
      chatbot.matchIntent(userMessage, chatbot.corpus).then(botReply => {
        const botMessage = addMessage(botReply, 'bot');
        if (botReply) {
          chatbot.reply(botReply.reply, (message) => {
            botMessage.innerText = message;
          });
        } else {
          chatbot.reply("I'm sorry, I didn't understand that.", (message) => {
            botMessage.innerText = message;
          });
        }
        userInput.value = '';
      });
    }
  }

  window.sendMessage = sendMessage;
});
