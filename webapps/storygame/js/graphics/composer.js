const GraphicsComposer = {
  renderer: null,
  effects: [],

  // Set the renderer for the GraphicsComposer
  setRenderer: function(renderer) {
    this.renderer = renderer;
  },

  // Add a render effect to the composer
  addEffect: function(effect) {
    this.effects.push(effect);
    this.updateComposer();
  },

  // Remove a render effect from the composer
  removeEffect: function(effect) {
    const index = this.effects.indexOf(effect);
    if (index !== -1) {
      this.effects.splice(index, 1);
      this.updateComposer();
    }
  },

  // Get the current composer for rendering
  getComposer: function() {
    const composer = new THREE.EffectComposer(this.renderer);

    // Add render passes for each effect
    for (const effect of this.effects) {
      composer.addPass(effect);
    }

    return composer;
  },

  // Update the composer with the current effects
  updateComposer: function() {
    if (this.renderer) {
      const composer = this.getComposer();
      this.renderer.autoClear = false;
      composer.renderToScreen = true;
      composer.setSize(this.renderer.getSize().width, this.renderer.getSize().height);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.domElement.parentElement.replaceChild(composer.domElement, this.renderer.domElement);
      this.renderer = composer;
    }
  }
};
