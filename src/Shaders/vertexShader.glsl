varying vec2 vUv;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;
varying vec3 WorldPos;
varying vec3 Normal;
varying vec4 v_normal;

void main() {
  vUv = uv;
  vUv1 = uv1;
  vUv2 = uv2;
  vUv3 = uv3;
  WorldPos = vec3(modelMatrix * vec4(position, 1.0));
  Normal = normalMatrix * normal;
  v_normal = modelViewMatrix * vec4(normal, 0.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

} 

 