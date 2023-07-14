const Interaction = {
  highlightedObject: null,
  blurFilter: null,
  highlightMaterial: null,
  blurStrength: 4, // Increase this value to increase the blur effect

  // Call this function to highlight an object and blur everything else
  highlightObject: function(object) {
    // Unhighlight the previous object, if there was one
    if (this.highlightedObject !== null) {
      this.unhighlightObject();
    }

    console.log(1);

    // Save a reference to the highlighted object
    this.highlightedObject = object;

    // Create a white outline material for the highlighted object
    this.highlightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.BackSide,
    });

    // Create a mesh with the same geometry as the highlighted object
    const outlineMesh = new THREE.Mesh(object.geometry, this.highlightMaterial);
    outlineMesh.position.copy(object.position);
    outlineMesh.rotation.copy(object.rotation);
    outlineMesh.scale.multiplyScalar(1.05);

    // Add the outline mesh to the scene
    object.parent.add(outlineMesh);

    // Create a blur filter for the scene
    const blurPass = new THREE.ShaderPass(THREE.VerticalBlurShader);
    blurPass.uniforms['v'].value = this.blurStrength / window.innerHeight;
    blurPass.renderToScreen = true;

    this.blurFilter = new THREE.EffectComposer(renderer);
    this.blurFilter.addPass(new THREE.RenderPass(scene, camera));
    this.blurFilter.addPass(blurPass);

    // Set the scene to use the blur filter
    scene = new THREE.Scene();
    scene.add(outlineMesh);
    composer = this.blurFilter;
  },

  // Call this function to remove the highlight and blur effects
  unhighlightObject: function() {
    // Remove the white outline material from the highlighted object
    this.highlightedObject.material = this.highlightedObject.originalMaterial;
    this.highlightMaterial.dispose();

    // Remove the outline mesh from the scene
    this.highlightedObject.parent.remove(this.highlightedObject);

    // Remove the blur filter from the scene
    scene = new THREE.Scene();
    scene.add(this.highlightedObject);
    composer = null;

    // Clear the highlighted object reference
    this.highlightedObject = null;
  }
};
