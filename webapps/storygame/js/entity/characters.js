var Characters = {
  characters: [
    {
      name: 'John',
      model: 'models/characters/generic/scene.gltf',
      height: 1.8,
      speed: 2,
      strength: 50,
      inventory: [
        ItemGun
      ],
      health: 100,
      stamina: 100,
      relationships: {
        'Mary': 80,
        'Tom': 40,
        'Lisa': 60
      }
    },
    {
      name: 'Mary',
      model: 'models/characters/generic/scene.gltf',
      height: 1.7,
      speed: 2.5,
      strength: 30,
      inventory: [],
      health: 100,
      stamina: 100,
      relationships: {
        'John': 80,
        'Tom': 50,
        'Lisa': 70
      }
    },
    {
      name: 'Tom',
      model: 'models/characters/generic/scene.gltf',
      height: 1.9,
      speed: 1.5,
      strength: 70,
      inventory: [],
      health: 100,
      stamina: 100,
      relationships: {
        'John': 40,
        'Mary': 50,
        'Lisa': 90
      }
    },
    {
      name: 'Lisa',
      model: 'models/characters/generic/scene.gltf',
      height: 1.6,
      speed: 2.5,
      strength: 40,
      inventory: [],
      health: 100,
      stamina: 100,
      relationships: {
        'John': 60,
        'Mary': 70,
        'Tom': 90
      }
    }
  ],
  currentCharacterIndex: 0, // the index of the character currently being played as

  // Character screen
  characterScreenName: document.getElementById("character-screen-name"),
  characterScreenHealth: document.getElementById("character-screen-healthbar"),
  characterScreenStamina: document.getElementById("character-screen-stamina"),
  characterRelationships: document.getElementById("character-screen-relationships"),
  inventoryList: document.getElementById("character-screen-inventory"),

  init: function() {
    Main.loadingScreen.classList.add("visible");

    // Load characters
    this.characters.forEach((character, index) => {
      const loader = new THREE.GLTFLoader();
      loader.load(
        character.model,
        (gltf) => {
          Characters.characters[index].model_mesh = gltf.scene;
          Main.scene.add(gltf.scene);
          Main.loadingScreen.classList.remove("visible");
          gltf.scene.scale.set(0.25, 0.25, 0.25);
          gltf.scene.position.y -= 5;
          gltf.scene.addEventListener('click', () => {
            Interaction.highlightObject(gltf.scene);
          });
          gltf.scene.addEventListener('mouseleave', () => {
            Interaction.unhighlightObject();
          });
          gltf.scene.traverse((child) => {
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
    });

    this.switchCharacter(0);
  },

  switchCharacter: function(index) {
    // check if the index is valid
    if (index >= 0 && index < this.characters.length) {
      this.currentCharacterIndex = index;
    }

    // Prepare traits
    var currentCharacter = this.characters[this.currentCharacterIndex];
    this.characterScreenName.textContent = currentCharacter.name;
    this.characterScreenHealth.style.setProperty('--progress', currentCharacter.health / 100);
    this.characterScreenStamina.style.setProperty('--progress', currentCharacter.stamina / 100);

    currentCharacter.inventory.forEach((item) => {
      var element = document.createElement('li');
      this.inventoryList.appendChild(element);

      var icon = document.createElement('img');
      icon.src = item.itemIcon;
      element.appendChild(icon);

      var label = document.createElement('label');
      label.textContent = item.itemName;
      element.appendChild(label);
    });

    this.characters.forEach((character) => {
      if (character.name == currentCharacter.name) {
        return;
      }

      var element = document.createElement('li');
      this.characterRelationships.appendChild(element);

      var name = document.createElement('label');
      name.textContent = character.name;
      element.appendChild(name);

      var progress = document.createElement('div');
      progress.style.setProperty('--progress', currentCharacter.relationships[character.name] / 100);
      element.appendChild(progress);
    });
  }
};

Characters.init();
