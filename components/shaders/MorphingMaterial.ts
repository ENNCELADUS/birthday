import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'

export const MorphingMaterial = shaderMaterial(
    {
        uTime: 0,
        uMorph: 0,
        uSpeed: 1.0,
        uTexture: null,
        uColorRain: new THREE.Color(0.1, 1.0, 0.4),
        uColorHelix1: new THREE.Color(0.0, 1.0, 1.0), // Cyan
        uColorHelix2: new THREE.Color(1.0, 0.0, 1.0), // Magenta
        uOpacity: 1.0,
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    varying float vColorMix;
    varying float vStagger;
    
    attribute vec3 aPosHelix;
    attribute float aHelixColor;
    attribute float aOffset; // random offset per particle
    
    uniform float uTime;
    uniform float uMorph;
    uniform float uSpeed;

    void main() {
        vUv = uv;
        vColorMix = aHelixColor;
        vStagger = aOffset;

        // Rain behavior: falling Y based on time and offset
        vec3 rainPos = position;
        float fall = mod(uTime * uSpeed + aOffset * 10.0, 10.0);
        rainPos.y = position.y - fall + 5.0; // Wrap around -5 to 5

        // Calculate transition progress with stagger
        // Particles closer to center move first (implosion effect)
        float dist = length(position.xz);
        float transitionStart = dist * 0.1; 
        float tProgress = clamp((uMorph - transitionStart) / (1.0 - transitionStart), 0.0, 1.0);
        
        // Use a power function for a more "snappy" feel
        float easeProgress = pow(tProgress, 3.0);
        
        // Mix positions
        vec3 finalPos = mix(rainPos, aPosHelix, easeProgress);

        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
        
        // Point size based on distance and morph
        gl_PointSize = (mix(15.0, 30.0, easeProgress)) * (1.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
    `,
    // Fragment Shader
    `
    varying vec2 vUv;
    varying float vColorMix;
    varying float vStagger;
    
    uniform float uTime;
    uniform float uMorph;
    uniform sampler2D uTexture;
    uniform vec3 uColorRain;
    uniform vec3 uColorHelix1;
    uniform vec3 uColorHelix2;
    uniform float uOpacity;

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
        // Point coordination within the particle
        vec2 charCoords = gl_PointCoord;
        
        // Character sampling (6 chars in atlas)
        float charIndex = floor(random(vec2(vStagger, floor(uTime * 5.0))) * 6.0);
        vec2 charUv = vec2((charCoords.x + charIndex) / 6.0, charCoords.y);
        
        float charShape = texture2D(uTexture, charUv).r;
        if (charShape < 0.1) discard;

        // Color interpolation
        vec3 helixColor = mix(uColorHelix1, uColorHelix2, vColorMix);
        vec3 finalColor = mix(uColorRain, helixColor, uMorph);
        
        // Add brightness to the head of clusters if needed, or based on pulse
        float pulse = sin(uTime * 3.0 + vStagger * 10.0) * 0.5 + 0.5;
        finalColor += helixColor * uMorph * pulse * 0.5;

        gl_FragColor = vec4(finalColor, uOpacity);
    }
    `
)

extend({ MorphingMaterial })

declare global {
    namespace JSX {
        interface IntrinsicElements {
            morphingMaterial: any
        }
    }
}
