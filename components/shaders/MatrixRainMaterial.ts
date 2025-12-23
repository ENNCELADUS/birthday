import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'

export const MatrixRainMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color(0.0, 1.0, 0.5), // Electric Green/Cyan
        uSpeed: 1.0,
        uOpacity: 1.0,
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader
    `
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uSpeed;
    uniform float uOpacity;

    // Pseudo-random function
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
        // Grid for characters
        vec2 grid = vec2(50.0, 20.0);
        vec2 ipos = floor(vUv * grid);
        vec2 fpos = fract(vUv * grid);

        // Falling columns
        float columnSpeed = random(vec2(ipos.x, 0.0)) * 0.5 + 0.5;
        float y = mod(uTime * uSpeed * columnSpeed + ipos.y, grid.y);
        
        // Trail effect
        float trail = 1.0 - (y / grid.y);
        trail = step(0.0, trail) * trail; // Clamp
        
        // Blink effect
        float blink = step(0.9, random(vec2(ipos.x, floor(uTime * 10.0))));
        
        // Character shape (placeholder blocky look)
        float charShape = step(0.2, fpos.x) * step(0.2, fpos.y) * step(fpos.x, 0.8) * step(fpos.y, 0.8);
        
        float alpha = trail * charShape * uOpacity;
        
        // Bright head
        if (y < 1.0) alpha += 1.0;

        vec3 color = uColor * alpha;
        
        gl_FragColor = vec4(color, alpha);
    }
  `
)

extend({ MatrixRainMaterial })

declare global {
    namespace JSX {
        interface IntrinsicElements {
            matrixRainMaterial: any
        }
    }
}
