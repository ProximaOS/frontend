const Utils = {
  flyTo: function(from, to, rotation, duration) {
    const tween = new TWEEN.Tween(from)
      .to(to, duration)
      .onUpdate(() => {
        Main.camera.position.copy(from.position);
        Main.camera.rotation.copy(rotation);
      })
      .start();
  },
  
  cubicBezier: function(t, p0, p1, p2, p3) {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;
    
    const p = p0.clone().multiplyScalar(uuu);
    p.add(p1.clone().multiplyScalar(3 * uu * t));
    p.add(p2.clone().multiplyScalar(3 * u * tt));
    p.add(p3.clone().multiplyScalar(ttt));
    
    return p;
  },
  
  startBleed: function(target, duration) {
    const bloodTexture = new THREE.TextureLoader().load('blood.png');
    bloodTexture.wrapS = THREE.RepeatWrapping;
    bloodTexture.wrapT = THREE.RepeatWrapping;
    bloodTexture.repeat.set(5, 5);
    
    const bloodGeometry = new THREE.PlaneGeometry(10, 10);
    const bloodMaterial = new THREE.MeshBasicMaterial({
      map: bloodTexture,
      transparent: true,
      depthWrite: false
    });
    
    const blood = new THREE.Mesh(bloodGeometry, bloodMaterial);
    blood.position.copy(target.position);
    blood.position.y += 0.5;
    blood.rotation.set(-Math.PI / 2, 0, 0);
    Main.scene.add(blood);
    
    const bloodTween = new TWEEN.Tween(blood.material)
      .to({ opacity: 1 }, duration / 2)
      .easing(TWEEN.Easing.Quadratic.In)
      .onComplete(() => {
        bloodTweenBack.start();
      });
      
    const bloodTweenBack = new TWEEN.Tween(blood.material)
      .to({ opacity: 0 }, duration / 2)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onComplete(() => {
        Main.scene.remove(blood);
      });
      
    bloodTween.start();
  },
  
  stopBleed: function() {
    const blood = Main.scene.getObjectByName('blood');
    if (blood) {
      Main.scene.remove(blood);
    }
  }
};
