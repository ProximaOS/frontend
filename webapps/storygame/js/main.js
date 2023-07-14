const Main = {
  // Three.js variables
  scene: null,
  camera: null,
  renderer: null,

  // Map variables
  map: null,
  mapName: null,

  // Game variable
  gameSpeed: 1.0,

  // Day-night cycle variables
  sun: null,
  light: null,
  clock: new THREE.Clock(),
  dayDuration: 1200, // 20 minutes in seconds
  currentTime: 0,
  dayNightRatio: 1.0,

  // Elements
  viewportElement: document.getElementById("viewport"),

  // Loading screen
  loadingScreen: document.getElementById("loading-screen"),
  loadingBar: document.getElementById("loading-progress"),

  init: function () {
    // Initialize Three.js variables
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.viewportElement,
      antialias: true,
      pixelRatio: window.devicePixelRatio,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Create a bloom effect composer
    this.composer = new THREE.EffectComposer(this.renderer);

    // Create a render pass
    const renderPass = new THREE.RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Create a bloom pass and adjust its parameters
    const bloomPass = new THREE.UnrealBloomPass({
      strength: 3,
    });
    this.composer.addPass(bloomPass);

    // Create an outline pass and adjust its parameters
    this.outlinePass = new THREE.OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.scene,
      this.camera
    );

    this.outlinePass.visibleEdgeColor.set(0x000000); // Set the outline color to black
    this.outlinePass.hiddenEdgeColor.set(0x000000); // Set the outline color to black

    this.outlinePass.edgeGlow = 0; // Disable glow effect
    this.outlinePass.edgeThickness = 1; // Set thickness to create sharp lines

    this.composer.addPass(this.outlinePass);

    // Set the composer's renderer output to the canvas element
    this.composer.setSize(window.innerWidth, window.innerHeight);

    window.addEventListener("resize", this.resizeWindow.bind(this));

    var planeGeometry = new THREE.PlaneGeometry(100, 100, 100);
    var planeMaterial = new THREE.MeshBasicMaterial();
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.scene.add(plane);
    plane.position.set(0, -10, 0);

    // Load initial map
    this.loadMap("skin_changer", "/sounds/ambient/day.wav");

    // Initialize day-night cycle
    this.initDayNightCycle();

    // Add fog to the scene
    const fogColor = 0x212121; // Color of the fog
    const fogNear = 150; // Distance from the camera where the fog starts
    const fogFar = 200; // Distance from the camera where the fog is fully opaque

    this.scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
  },

  loadMap: function (name, music) {
    // Remove previous map from the scene
    if (this.map) {
      this.scene.remove(this.map);
    }
    this.loadingScreen.classList.add("visible");

    // Load new map
    const loader = new THREE.GLTFLoader();
    loader.load(
      `models/maps/${name}/scene.gltf`,
      (gltf) => {
        this.map = gltf.scene;
        this.mapName = name;
        this.scene.add(this.map);
        this.loadingScreen.classList.remove("visible");
        if (Controls) {
          Controls.gravity = false;
        }
        if (music) {
          Music.loadMusic(music);
          Music.playMusic(true);
        }
        this.map.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      },
      function (xhr) {
        // onProgress callback
        const percentLoaded = xhr.loaded / xhr.total;
        console.log("Loaded " + percentLoaded * 100 + "%");
        Main.loadingBar.style.setProperty("--progress", percentLoaded);
      },
      (error) => {
        console.error(error);
      }
    );
  },

  initDayNightCycle: function () {
    // Create sun
    this.sun = new THREE.DirectionalLight(0xffffff, 1.0);
    this.sun.position.set(0, 1, 0);
    this.sun.castShadow = true;
    this.sun.receiveShadow = true;
    this.scene.add(this.sun);

    // Create light
    this.light = new THREE.AmbientLight(0xffffff, 0.5);
    this.light.castShadow = true;
    this.light.receiveShadow = true;
    this.scene.add(this.light);
  },

  render: function () {
    // Animate objects in the scene
    requestAnimationFrame(() => this.render());
    if (this.map) {
      this.map.position.y = -10;
    }

    // Update day-night cycle
    this.updateDayNightCycle();

    // Update the outline pass with the current scene and camera
    this.outlinePass.scene = this.scene;
    this.outlinePass.camera = this.camera;

    this.renderer.render(this.scene, this.camera);

    // Render the scene using the bloom effect composer
    // this.composer.render(this.clock.getDelta());
  },

  updateDayNightCycle: function () {
    const delta = this.clock.getDelta();
    this.currentTime += delta * this.gameSpeed;

    // Calculate day-night ratio based on current time
    this.dayNightRatio =
      Math.cos((this.currentTime / this.dayDuration) * Math.PI * 2) * 0.5 + 0.5;

    // Update sunlight intensity and color based on day-night ratio
    this.sun.intensity = this.dayNightRatio;
    this.sun.color.setHSL(0.1, 0.8, this.dayNightRatio);

    // Update ambient light intensity based on day-night ratio
    this.light.intensity = this.dayNightRatio;

    // Update the scene's background color based on day-night ratio
    const backgroundColor = new THREE.Color();
    backgroundColor.setHSL(0.1, 0.8, this.dayNightRatio);
    this.renderer.setClearColor(backgroundColor);
  },

  setGameSpeed: function (speed) {
    this.gameSpeed = speed;
  },

  resizeWindow: function () {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  },
};

// Initialize the game
Main.init();
// Start rendering the game
Main.render();
