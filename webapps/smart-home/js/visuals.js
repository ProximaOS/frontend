!(function (exports) {
  'use strict';

  const SmartHomeVisuals = {
    backgroundCanvas: document.getElementById('background'),
    foregroundCanvas: document.getElementById('foreground'),
    backgroundCtx: null,
    foregroundCtx: null,
    backgroundParticles: [],
    foregroundParticles: [],

    init: function () {
      this.backgroundCtx = this.backgroundCanvas.getContext('2d');
      this.foregroundCtx = this.foregroundCanvas.getContext('2d');

      this.backgroundCanvas.width = window.innerWidth;
      this.backgroundCanvas.height = window.innerHeight;

      this.foregroundCanvas.width = window.innerWidth;
      this.foregroundCanvas.height = window.innerHeight;

      window.addEventListener('resize', this.handleResize.bind(this));

      this.createParticles(this.backgroundParticles);
      this.createParticles(this.foregroundParticles);
      this.animate();
    },

    Particle: function (x, y) {
      this.x = x;
      this.y = y;
      this.radius = Math.random() * 2 + 1;
      this.vx = Math.random() * 1 - (Math.random() * 20);
      this.vy = Math.random() * 1 - (Math.random() * 20);
      this.opacity = Math.random() * 0.5 + 0.3;
    },

    createParticles: function (particlesArray) {
      for (let i = 0; i < 16; i++) {
        const x = Math.random() * this.backgroundCanvas.width;
        const y = Math.random() * this.backgroundCanvas.height;
        particlesArray.push(new this.Particle(x, y));
      }
    },

    animate: function () {
      this.backgroundCtx.clearRect(
        0,
        0,
        this.backgroundCanvas.width,
        this.backgroundCanvas.height
      );

      this.foregroundCtx.clearRect(
        0,
        0,
        this.foregroundCanvas.width,
        this.foregroundCanvas.height
      );

      this.backgroundParticles.forEach((particle) => {
        this.drawParticle(this.backgroundCtx, particle);

        particle.x += particle.vx;
        particle.y += particle.vy;

        particle.radius -= 0.01;
        particle.opacity -= 0.005;

        if (particle.radius < 0) {
          particle.radius = Math.random() * 5 + 1;
          particle.x = Math.random() * this.backgroundCanvas.width;
          particle.y = Math.random() * this.backgroundCanvas.height;
          particle.opacity = Math.random() * 0.5 + 0.3;
        }
      });

      this.foregroundParticles.forEach((particle) => {
        this.drawParticle(this.foregroundCtx, particle);

        particle.x += particle.vx;
        particle.y += particle.vy;

        particle.radius -= 0.01;
        particle.opacity -= 0.005;

        if (particle.radius < 0) {
          particle.radius = Math.random() * (window.innerWidth / 10) + 1;
          particle.x = Math.random() * this.foregroundCanvas.width;
          particle.y = Math.random() * this.foregroundCanvas.height;
          particle.opacity = Math.random() * 0.1 + 0.05;
        }
      });

      requestAnimationFrame(this.animate.bind(this));
    },

    drawParticle: function (ctx, particle) {
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();
    },

    handleResize: function () {
      this.backgroundCanvas.width = window.innerWidth;
      this.backgroundCanvas.height = window.innerHeight;
      this.foregroundCanvas.width = window.innerWidth;
      this.foregroundCanvas.height = window.innerHeight;

      this.backgroundParticles.length = 0; // Clear existing particles
      this.foregroundParticles.length = 0; // Clear existing particles

      this.createParticles(this.backgroundParticles);
      this.createParticles(this.foregroundParticles);
    },
  };

  SmartHomeVisuals.init();
})(window);
