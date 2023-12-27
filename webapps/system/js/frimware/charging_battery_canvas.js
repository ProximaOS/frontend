(function (exports) {
  'use strict';

  const ChargingBatteryCanvas = {
    canvas: document.getElementById('charging-battery-canvas'),
    ctx: null,
    bubbles: [],

    init: function () {
      this.ctx = this.canvas.getContext('2d');
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.animate();
    },

    createBubble: function () {
      const x = this.canvas.width / 2; // Set x position to center
      const y = this.canvas.height + Math.random() * 200; // Adjust starting Y position
      const radius = Math.random() * (30 - 10) + 10; // Specify the size range here (between 10 and 30)
      const speedX = (Math.random() - 0.5) * 15; // Randomize horizontal speed
      const speedY = Math.random() * (30 - 1) + 1; // Specify the vertical speed range here (between 1 and 2)

      const bubble = {
        x,
        y,
        radius,
        speedX,
        speedY,
        acceleration: 1,
        justCreated: true // Track if the bubble has just been created
      };

      this.bubbles.push(bubble);
    },

    drawBubble: function (bubble, opacity) {
      const gradient = this.ctx.createLinearGradient(
        bubble.x - bubble.radius,
        bubble.y - bubble.radius,
        bubble.x + bubble.radius,
        bubble.y + bubble.radius
      );
      gradient.addColorStop(0, `rgba(96, 255, 128, ${opacity})`);
      gradient.addColorStop(1, `rgba(64, 160, 96, ${opacity})`);

      this.ctx.beginPath();
      this.ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = gradient;
      this.ctx.fill();
      this.ctx.closePath();
    },

    updateBubble: function (bubble) {
      if (bubble.acceleration > 0.75) {
        bubble.acceleration -= 0.01;
      }
      bubble.x += bubble.speedX;
      bubble.y -= bubble.speedY * bubble.acceleration; // Move bubbles upwards

      if (bubble.y < -bubble.radius) {
        const index = this.bubbles.indexOf(bubble);
        if (index > -1) {
          this.bubbles.splice(index, 1); // Remove bubble if it's past the top of the screen
        }
      }
      const maxDistance = this.canvas.height;
      const currentDistance = bubble.y + bubble.radius;

      const opacity = 1 - (currentDistance / maxDistance);
      this.drawBubble(bubble, opacity);
    },

    mergeBubbles: function (bubble1, bubble2) {
      // Merge two bubbles if they're not just created and 25% above the bottom
      if (!bubble1.justCreated && !bubble2.justCreated) {
        const newRadius = bubble1.radius + bubble2.radius * 0.5;
        let animationFrames = 30; // Number of frames for the merge animation

        const originalRadius1 = bubble1.radius;
        const originalRadius2 = bubble2.radius;

        // Animate the merging process by changing the radius and simulating a bounce
        function mergeAnimation () {
          const progress = 1 - animationFrames / 30;

          // Simulate bounce by adjusting the radius using a sine function
          bubble1.radius = newRadius + Math.sin(progress * Math.PI) * newRadius;
          bubble2.radius = originalRadius1 + originalRadius2 - bubble1.radius;

          if (--animationFrames === 0) {
            this.bubbles.splice(this.bubbles.indexOf(bubble2), 1); // Remove the second bubble after merge
          } else {
            requestAnimationFrame(mergeAnimation);
          }
        };
        mergeAnimation();
      }
    },

    checkBubbleCollision: function () {
      for (let i = 0; i < this.bubbles.length; i++) {
        for (let j = i + 1; j < this.bubbles.length; j++) {
          const bubble1 = this.bubbles[i];
          const bubble2 = this.bubbles[j];

          const dx = bubble2.x - bubble1.x;
          const dy = bubble2.y - bubble1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < bubble1.radius + bubble2.radius) {
            this.mergeBubbles(bubble1, bubble2);
          }
        }
      }
    },

    animate: function () {
      requestAnimationFrame(() => this.animate());
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      if (this.bubbles.length < 45) {
        // Limit the number of bubbles on the screen
        this.createBubble();
      }

      this.checkBubbleCollision();

      this.bubbles.forEach((bubble) => {
        this.updateBubble(bubble);
      });
    }
  };

  ChargingBatteryCanvas.init();
})(window);
