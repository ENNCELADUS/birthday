import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'

export const MatrixRainMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color(0.1, 1.0, 0.4),
        uSpeed: 1.5,
        uOpacity: 1.0,
        uTexture: null,
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
    uniform sampler2D uTexture;

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
        // High-density grid for finer rain
        vec2 grid = vec2(60.0, 30.0);
        vec2 ipos = floor(vUv * grid);
        vec2 fpos = fract(vUv * grid);

        // Falling columns with varying speeds
        float columnOffset = random(vec2(ipos.x, 0.0)) * 100.0;
        float columnSpeed = random(vec2(ipos.x, 1.0)) * 0.4 + 0.6;
        float y = mod(uTime * uSpeed * columnSpeed + columnOffset - ipos.y, grid.y);
        
        // Trail effect: long, smooth comet tail
        float trail = 1.0 - (y / grid.y);
        trail = pow(max(0.0, trail), 3.0); // Sharper falloff at the head
        
        // Character sampling logic: 
        // We assume uTexture is an atlas of 6 characters: A, T, C, G, 0, 1
        // ipos.y + floor(uTime * 10.0) picks a random character that changes over time
        float charIndex = floor(random(vec2(ipos.x, ipos.y + floor(uTime * 5.0))) * 6.0);
        vec2 charUv = vec2((fpos.x + charIndex) / 6.0, fpos.y);
        
        float charShape = texture2D(uTexture, charUv).r;
        
        float alpha = trail * charShape * uOpacity;
        
        // Glow effect for the "head" of the drop
        float headGlow = smoothstep(0.1, 0.0, y) * 2.0;
        
        vec3 finalColor = uColor * (alpha + headGlow * charShape);
        
        gl_FragColor = vec4(finalColor, alpha + headGlow * charShape);
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
