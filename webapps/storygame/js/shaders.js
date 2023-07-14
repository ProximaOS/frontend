const Shaders = {
  uniforms: {
    outlineColor: { value: new THREE.Color(0x000000) }, // Set the desired outline color
    outlineWidth: { value: 0.02 } // Set the desired outline width
  },
  vertexShader: `
    varying vec3 vNormal;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    uniform vec3 outlineColor;
    uniform float outlineWidth;

    void main() {
      vec3 normal = normalize(vNormal);
      vec2 dxy = vec2(dFdx(gl_FragCoord.x), dFdy(gl_FragCoord.y));
      float edge = 1.0 - smoothstep(0.0, outlineWidth, length(dxy));

      if (edge > 0.5 && dot(normal, vec3(0.0, 0.0, 1.0)) > 0.8) {
        // Render the outline color
        gl_FragColor = vec4(outlineColor, 1.0);
      } else {
        // Render the object's original color
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      }
    }
  `
};

const shaderMaterial = new THREE.ShaderMaterial({
  uniforms: Shaders.uniforms,
  vertexShader: Shaders.vertexShader,
  fragmentShader: Shaders.fragmentShader,
});

Main.scene.traverse(function (object) {
  if (object instanceof THREE.Mesh) {
    object.material = shaderMaterial;
  }
});
