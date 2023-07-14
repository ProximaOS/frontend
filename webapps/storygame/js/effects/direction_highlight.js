const MeshDirectionIndicator = {
  meshes: [], // list of meshes to indicate direction for
  triangleSize: 100, // size of each triangle
  blurRadius: 10, // radius of the blur effect
  color: 0xffffff, // color of the triangles

  // update the position and visibility of the triangles
  update: function(camera) {
    // calculate the position and direction of each mesh relative to the camera
    const meshDirections = this.meshes.map(mesh => {
      const vector = mesh.position.clone().sub(camera.position);
      const distance = vector.length();
      vector.normalize();
      return { mesh, direction: vector, distance };
    });

    // sort the mesh directions by distance from the camera
    meshDirections.sort((a, b) => b.distance - a.distance);

    // calculate the positions of the triangles based on the directions of the meshes
    const trianglePositions = meshDirections.map(({ mesh, direction }) => {
      const vector = direction.clone().multiplyScalar(this.triangleSize);
      const screenPos = toScreenPosition(mesh, camera);
      return screenPos.add(vector);
    });

    // create or update the triangles
    trianglePositions.forEach((pos, index) => {
      const triangle = getTriangleAtIndex(index);
      triangle.position.copy(pos);
      triangle.visible = true;
    });

    // hide any remaining triangles
    for (let i = meshDirections.length; i < 3; i++) {
      const triangle = getTriangleAtIndex(i);
      triangle.visible = false;
    }

    // get or create a triangle at the specified index
    function getTriangleAtIndex(index) {
      let triangle = scene.getObjectByName(`triangle${index}`);
      if (!triangle) {
        const geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, 0, 0));
        geometry.vertices.push(new THREE.Vector3(1, 0, 0));
        geometry.vertices.push(new THREE.Vector3(0.5, 1, 0));
        geometry.faces.push(new THREE.Face3(0, 1, 2));
        geometry.computeFaceNormals();
        const material = new THREE.MeshBasicMaterial({
          color: this.color,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
        });
        material.side = THREE.DoubleSide;
        triangle = new THREE.Mesh(geometry, material);
        triangle.name = `triangle${index}`;
        scene.add(triangle);
      }
      return triangle;
    }

    // calculate the screen position of a point in 3D space
    function toScreenPosition(obj, camera) {
      const vector = new THREE.Vector3();
      const widthHalf = 0.5 * renderer.getContext().canvas.width;
      const heightHalf = 0.5 * renderer.getContext().canvas.height;
      obj.updateMatrixWorld();
      vector.setFromMatrixPosition(obj.matrixWorld);
      vector.project(camera);
      vector.x = (vector.x * widthHalf) + widthHalf;
      vector.y = -(vector.y * heightHalf) + heightHalf;
      return vector;
    }
  },

  // set the list of meshes to indicate direction for
  setMeshes: function(meshes) {
    this.meshes = meshes;
  }
};
