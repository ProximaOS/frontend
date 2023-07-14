const Controls = {
  // Three.js variables
  camera: null,
  scene: null,

  // Control variables
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
  moveJump: false,
  mouseLook: true,
  gamepad: null,
  gamepadAxes: {},
  pitch: 0,
  yaw: 0,
  running: false,

  // Touch variables
  touchIdentifier: null,
  touchStartPos: { x: 0, y: 0 },

  // Constants
  axesThreshold: 0.25,
  moveSpeed: this.running ? 2.84 : 1.42,
  rotationSpeed: 0.01,

  // Gravity
  gravity: false,
  gravityPower: 3.6,
  jumpPower: 4,
  jumpTimer: 0,

  // View bobbing
  viewBobbing: true,
  walkViewBobbing: true,

  // Character screen
  characterScreen: document.getElementById("character-screen"),

  init: function (camera, scene) {
    // Set Three.js camera and scene
    this.camera = camera;
    this.scene = scene;

    // Add event listeners for controls
    document.addEventListener("keydown", this.onKeyDown.bind(this));
    document.addEventListener("keyup", this.onKeyUp.bind(this));
    Main.viewportElement.addEventListener(
      "mousedown",
      this.onMouseDown.bind(this)
    );
    Main.viewportElement.addEventListener(
      "mousemove",
      this.onMouseMove.bind(this)
    );
    Main.viewportElement.addEventListener(
      "touchstart",
      this.onTouchStart.bind(this)
    );
    Main.viewportElement.addEventListener(
      "touchend",
      this.onTouchEnd.bind(this)
    );
    Main.viewportElement.addEventListener(
      "touchmove",
      this.onTouchMove.bind(this)
    );
    window.addEventListener(
      "gamepadconnected",
      this.onGamepadConnected.bind(this)
    );
    window.addEventListener(
      "gamepaddisconnected",
      this.onGamepadDisconnected.bind(this)
    );

    this.update();
  },

  onKeyDown: function (event) {
    this.running = event.shiftKey;

    switch (event.code) {
      case "KeyW":
        this.moveForward = true;
        break;
      case "KeyS":
        this.moveBackward = true;
        break;
      case "KeyA":
        this.moveLeft = true;
        break;
      case "KeyD":
        this.moveRight = true;
        break;
      case "Space":
        this.moveJump = true;
        break;
    }
  },

  onKeyUp: function (event) {
    this.running = event.shiftKey;

    switch (event.code) {
      case "KeyW":
        this.moveForward = false;
        break;
      case "KeyS":
        this.moveBackward = false;
        break;
      case "KeyA":
        this.moveLeft = false;
        break;
      case "KeyD":
        this.moveRight = false;
        break;
      case "Space":
        this.moveJump = false;
        break;
      case "KeyE":
        this.characterScreen.classList.toggle("visible");
        break;
    }
  },

  onMouseDown: function () {
    Main.viewportElement.requestPointerLock();

    var currentCharacter =
      Characters.characters[Characters.currentCharacterIndex];
    currentCharacter.inventory[0].attack(this.camera);
  },

  onMouseMove: function (event) {
    if (this.mouseLook) {
      if (document.pointerLockElement === Main.viewportElement) {
        // Update the mouse position
        this.yaw -= event.movementX * this.rotationSpeed;
        this.pitch -= event.movementY * this.rotationSpeed;
        this.pitch = Math.min(Math.max(this.pitch, -Math.PI / 2), Math.PI / 2);
      }
    }
  },

  onTouchStart: function (event) {
    if (event.touches.length === 1) {
      this.touchIdentifier = event.touches[0].identifier;
      this.touchStartPos.x = event.touches[0].clientX;
      this.touchStartPos.y = event.touches[0].clientY;
    }
  },

  onTouchEnd: function (event) {
    if (
      event.changedTouches.length === 1 &&
      event.changedTouches[0].identifier === this.touchIdentifier
    ) {
      this.touchIdentifier = null;
    }
  },

  onTouchMove: function (event) {
    if (this.touchIdentifier !== null) {
      for (let i = 0; i < event.changedTouches.length; i++) {
        if (event.changedTouches[i].identifier === this.touchIdentifier) {
          const touchDeltaX =
            event.changedTouches[i].clientX - this.touchStartPos.x;
          const touchDeltaY =
            event.changedTouches[i].clientY - this.touchStartPos.y;
          this.rotateCamera({ x: touchDeltaX, y: touchDeltaY });
          break;
        }
      }
    }
  },

  onGamepadConnected: function (event) {
    this.gamepad = event.gamepad;
    console.log(this.gamepad);
  },

  onGamepadDisconnected: function (event) {
    this.gamepad = null;
  },

  rotateCamera: function (mouseDelta) {
    this.camera.rotation.y -= mouseDelta.x * this.rotationSpeed;
    this.camera.rotation.x -= mouseDelta.y * this.rotationSpeed;
    this.camera.rotation.x = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, this.camera.rotation.x)
    );
  },

  update: function () {
    requestAnimationFrame(() => this.update());

    var clock = new THREE.Clock();
    var delta = clock.getDelta();
    var currentCharacter =
      Characters.characters[Characters.currentCharacterIndex];

    const moveDirection = new THREE.Vector3(0, 0, 0);
    if (this.moveForward) {
      moveDirection.z -= 1;
      currentCharacter.stamina -= 0.1;
    }
    if (this.moveBackward) {
      moveDirection.z += 1;
      currentCharacter.stamina -= 0.1;
    }
    if (this.moveLeft) {
      moveDirection.x -= 1;
      currentCharacter.stamina -= 0.1;
    }
    if (this.moveRight) {
      moveDirection.x += 1;
      currentCharacter.stamina -= 0.1;
    }

    if (
      this.moveForward ||
      this.moveBackward ||
      this.moveLeft ||
      this.moveRight
    ) {
      currentCharacter.model_mesh.rotation.set(
        this.camera.rotation.x,
        this.camera.rotation.y,
        this.camera.rotation.z
      );
    } else {
      currentCharacter.stamina += 0.05;
    }
    if (currentCharacter.stamina <= 0) {
      currentCharacter.stamina = 0;
    }
    if (currentCharacter.stamina >= 100) {
      currentCharacter.stamina = 100;
    }

    Characters.characterScreenStamina.style.setProperty(
      "--progress",
      currentCharacter.stamina / 100
    );

    var currentY;
    try {
      currentY = currentCharacter.model_mesh.position.y; // Store the current Y position
    } catch (error) {
      currentY = this.camera.position.y; // Store the current Y position
    }

    moveDirection.normalize();
    moveDirection.applyQuaternion(this.camera.quaternion);
    moveDirection.multiplyScalar(this.moveSpeed);

    // Update the player position based on the current movement (excluding the Y axis)
    try {
      currentCharacter.model_mesh.position.add(
        moveDirection.set(moveDirection.x, 0, moveDirection.z)
      );

      // Restore the Y position
      currentCharacter.model_mesh.position.setY(currentY);

      this.camera.position.set(
        currentCharacter.model_mesh.position.x,
        currentCharacter.model_mesh.position.y + (2 + currentCharacter.height),
        currentCharacter.model_mesh.position.z
      );
      this.camera.translateX(2.5);
      this.camera.translateZ(5);
    } catch (error) {
      this.camera.position.add(
        moveDirection.set(moveDirection.x, 0, moveDirection.z)
      );
    }

    if (this.moveJump) {
      // Apply jumping force
      const jumpHeight = this.jumpPower; // Maximum jump height
      const jumpTime = 0.5; // Time it takes to reach the peak of the jump
      const gravity = (-2 * jumpHeight) / (jumpTime * jumpTime);
      const initialVelocity = Math.abs(gravity) * jumpTime;

      if (this.jumpTimer <= jumpTime) {
        // Player is still ascending
        moveDirection.y = initialVelocity + gravity * this.jumpTimer;
        this.jumpTimer += 1 / 60; // Assuming 60 frames per second
      } else {
        // Player has reached the peak of the jump, start descending
        moveDirection.y -= this.gravityPower;
      }
    } else if (this.gravity) {
      moveDirection.y -= this.gravityPower;
    }

    // Store the previous position for collision handling
    var previousPosition;
    try {
      previousPosition = currentCharacter.model_mesh.position.clone();
    } catch (error) {
      previousPosition = this.camera.position.clone();
    }

    // Update the player position based on the current movement
    try {
      currentCharacter.model_mesh.position.add(moveDirection);
    } catch (error) {
      this.camera.position.add(moveDirection);
    }

    // Viewbobbing variables
    const viewBobbingSpeed = 2; // Speed of the viewbobbing motion
    const viewBobbingAmount = 0.02; // Amount of viewbobbing motion

    if (this.viewBobbing) {
      // Calculate viewbobbing offset based on player movement
      const t = Date.now() / 1000;
      const bobOffset = Math.sin(t * viewBobbingSpeed) * viewBobbingAmount;
      moveDirection.x += bobOffset;
      moveDirection.y += bobOffset;
    }

    // Perform raycasting for collision detection
    const raycaster = new THREE.Raycaster();
    try {
      raycaster.set(currentCharacter.model_mesh.position, moveDirection);
    } catch (error) {
      raycaster.set(this.camera.position, moveDirection);
    }
    const maxDistance = 10;
    raycaster.far = maxDistance;
    const intersects = raycaster.intersectObjects(this.scene.children);

    if (intersects.length > 0) {
      // Handle collision
      // Example: Reset player position to the previous position
      currentCharacter.model_mesh.position.copy(previousPosition);
    }

    // Walk view bobbing
    const walkBobbingSpeed = 15; // Speed of the walk view bobbing motion
    const walkBobbingAmount = 0.25; // Amount of walk view bobbing motion

    if (
      this.viewBobbing &&
      (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight)
    ) {
      // Calculate walk view bobbing offset based on player movement
      const t = Date.now() / 1000;
      const walkBobOffset = Math.sin(t * walkBobbingSpeed) * walkBobbingAmount;
      moveDirection.y += walkBobOffset;
    }

    // Update the player rotation
    this.camera.quaternion.setFromEuler(
      new THREE.Euler(this.pitch, this.yaw, 0, "YXZ")
    );
  },
};

Controls.init(Main.camera, Main.scene);
