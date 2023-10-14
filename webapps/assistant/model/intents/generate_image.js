!(function (exports) {
  'use strict';

  function generateImage() {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = 800;
      canvas.height = 600;

      const gridSize = 10;
      const fieldWidth = Math.floor(canvas.width / gridSize);
      const fieldHeight = Math.floor(canvas.height / gridSize);

      const flowField = new Array(fieldWidth).fill(null).map(() => new Array(fieldHeight).fill(null));

      for (let i = 0; i < fieldWidth; i++) {
        for (let j = 0; j < fieldHeight; j++) {
          const angle = Math.random() * 2 * Math.PI;
          flowField[i][j] = { x: Math.cos(angle), y: Math.sin(angle) };
        }
      }

      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          const i = Math.floor(x / gridSize);
          const j = Math.floor(y / gridSize);
          const flow = flowField[i][j];
          const distance = Math.sqrt((x - canvas.width / 2) ** 2 + (y - canvas.height / 2) ** 2);
          const intensity = Math.sin(distance / 20);

          const r = Math.floor(127 + 127 * (flow ? flow.x : 0) * intensity);
          const g = Math.floor(127 + 127 * (flow ? flow.y : 0) * intensity);
          const b = Math.floor(127 - 127 * Math.abs(Math.sin(distance / 10)));

          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, y, gridSize, gridSize);
        }
      }

      resolve(canvas.toDataURL());
    });
  }

  const IMAGE_GENERATION_INTENT = {
    pattern: /(generate|draw|paint)\s+image\s+of\s(.+)/i,
    reply: "Sure! Here's your generated image",
    images: [generateImage]
  };

  chatbot.addIntents([IMAGE_GENERATION_INTENT]);
})(window);
