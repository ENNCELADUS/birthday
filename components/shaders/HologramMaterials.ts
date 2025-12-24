import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'

// 1. Holographic Ring Material
export const HologramRingMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color("#00ffff"),
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
    uniform float uOpacity;

    void main() {
        vec2 uv = vUv - 0.5;
        float dist = length(uv);
        
        // Main Ring
        float thickness = 0.01;
        float radius = 0.4;
        float ring = smoothstep(thickness, 0.0, abs(dist - radius));
        
        // Inner segmented ring
        float radius2 = 0.35;
        float angle = atan(uv.y, uv.x);
        float segments = step(0.5, sin(angle * 8.0 + uTime * 2.0));
        float ring2 = smoothstep(thickness * 0.5, 0.0, abs(dist - radius2)) * segments;
        
        // Outer faint ring
        float radius3 = 0.45;
        float ring3 = smoothstep(0.05, 0.0, abs(dist - radius3)) * 0.2;

        float alpha = (ring + ring2 + ring3) * uOpacity;
        if(alpha < 0.01) discard;

        gl_FragColor = vec4(uColor, alpha);
    }
    `
)

// 2. Glow Flare Material
export const GlowMaterial = shaderMaterial(
    {
        uColor: new THREE.Color("#00ffff"),
        uOpacity: 1.0,
    },
    `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    `
    varying vec2 vUv;
    uniform vec3 uColor;
    uniform float uOpacity;

    void main() {
        float dist = length(vUv - 0.5);
        float alpha = smoothstep(0.5, 0.0, dist) * uOpacity;
        gl_FragColor = vec4(uColor, alpha);
    }
    `
)

// 3. Pulse Line Material
export const PulseLineMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color("#00ffff"),
        uOpacity: 1.0,
    },
    `
    varying float vLineProgress;
    attribute float lineProgress; // Custom attribute 0 to 1
    void main() {
        vLineProgress = lineProgress;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    `
    varying float vLineProgress;
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;

    void main() {
        // Traveling pulse
        float pulseSpeed = 2.0;
        float pulseWidth = 0.2;
        float pulsePos = mod(uTime * pulseSpeed, 1.2) - 0.1; // 0 to 1.1 range
        
        float pulse = smoothstep(pulseWidth, 0.0, abs(vLineProgress - pulsePos));
        
        // Base faint line
        float baseAlpha = 0.1;
        float finalAlpha = (baseAlpha + pulse * 0.8) * uOpacity;
        
        gl_FragColor = vec4(uColor, finalAlpha);
    }
    `
)

extend({ HologramRingMaterial, GlowMaterial, PulseLineMaterial })

declare global {
    namespace JSX {
        interface IntrinsicElements {
            hologramRingMaterial: any
            glowMaterial: any
            pulseLineMaterial: any
        }
    }
}
