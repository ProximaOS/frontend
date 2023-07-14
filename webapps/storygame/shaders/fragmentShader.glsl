varying vec2 vUv;
uniform vec3 edgeColor;
uniform float edgeThickness;
uniform vec3 lightColor;
uniform vec3 shadowColor;
uniform float shadowSoftness;
uniform float shadowHardness;
void main() {
  vec3 shadow = mix(shadowColor, lightColor, step(shadowSoftness, vUv.y));
  shadow = mix(shadow, lightColor, step(vUv.x, shadowHardness));
  float edge = length(vec2(dFdx(vUv.x), dFdy(vUv.y))) * edgeThickness;
  gl_FragColor.rgb = mix(shadow, edgeColor, 1.0 - step(edge, 0.5));
  gl_FragColor.a = 1.0;
}
