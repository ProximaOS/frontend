const ItemGun = {
  itemId: "gun",
  itemName: "Gun",
  itemIcon: "/images/icons/inventory.svg",

  attackSound: "/sounds/combat/gun_shoot.mp3",
  reloadSound: "/sounds/combat/gun_reload.mp3",

  bulletGeometry: new THREE.SphereGeometry(0.05, 8, 8), // bullet geometry
  bulletMaterial: new THREE.MeshBasicMaterial({ color: 0xc00040 }), // bullet material
  bulletSpeed: 0.5, // bullet speed
  bulletHoleSize: 0.1, // size of the bullet hole
  bulletTrailColor: 0xff6040, // color of the bullet trail
  bulletTrailOpacity: 0.8, // opacity of the bullet trail
  bulletTrailLength: 0.5, // length of the bullet trail
  bulletTrailWidth: 0.05, // width of the bullet trail

  ammo: 40,
  maxAmmo: 40,

  attack: function (camera) {
    if (this.ammo > 0) {
      var sound = new Audio(this.attackSound);
      sound.play();
      this.ammo -= 1;
    } else {
      var sound = new Audio(this.reloadSound);
      sound.play();
      sound.onended = () => {
        this.ammo = this.maxAmmo;
        Notification.showTip('Your Gun', this.ammo + " / " + this.maxAmmo, 'ammo');
      };

      return;
    }

    // Create a bullet mesh
    const bulletMesh = new THREE.Mesh(this.bulletGeometry, this.bulletMaterial);
    bulletMesh.position.copy(camera.position);

    // Get the direction vector from the camera's rotation
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    // Function to update the bullet position and check for collisions
    const updateBullet = () => {
      bulletMesh.position.addScaledVector(direction, this.bulletSpeed);

      // Check for collision with meshes
      const raycaster = new THREE.Raycaster();
      raycaster.set(bulletMesh.position, direction);
      const intersects = raycaster.intersectObjects(Main.scene.children, true);
      if (intersects.length > 0) {
        // Create a bullet hole on the first intersected mesh
        const intersection = intersects[0];
        const bulletHoleGeometry = new THREE.CircleGeometry(
          this.bulletHoleSize,
          16
        );
        const bulletHoleMaterial = new THREE.MeshBasicMaterial({
          color: 0x000000,
        });
        const bulletHole = new THREE.Mesh(
          bulletHoleGeometry,
          bulletHoleMaterial
        );
        bulletHole.position.copy(intersection.point);
        bulletHole.lookAt(intersection.face.normal);
        intersection.object.add(bulletHole);

        // Remove the bullet and trail from the scene
        // Main.scene.remove(bulletMesh);

        return; // Stop updating the bullet
      }

      // Update the bullet trail effect
      requestAnimationFrame(updateBullet);
    };

    // Add the bullet and trail to the scene
    Main.scene.add(bulletMesh);
    updateBullet();

    Notification.showTip('Your Gun', this.ammo + " / " + this.maxAmmo, 'ammo');
  },
};
