import { useMemo, useRef } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'
import * as random from 'maath/random'

// Custom Shader Material for Heart Particles
const HeartMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color(1.5, 0.1, 0.3), // Deep Red equivalent
        uMouse: new THREE.Vector3(0, 0, 0),
        uPixelRatio: 1, // Will be set on mount
    },
    // Vertex Shader
    `
    uniform float uTime;
    uniform vec3 uMouse;
    uniform float uPixelRatio;
    
    attribute float aRandom;
    
    varying float vAlpha;
    varying vec3 vPos;

    void main() {
      vec3 pos = position;
      
      // Heartbeat Pulse Animation
      // Beat structure: lub-dub .... lub-dub
      float beat = sin(uTime * 3.0) + sin(uTime * 3.0 + 3.1415 * 0.5) * 0.5;
      float pulse = smoothstep(0.0, 1.0, beat) * 0.1;
      
      // Expand/Contract
      pos *= 1.0 + pulse * 0.3;
      
      // Mouse Interaction (Repulsion/Attraction)
      // If mouse is close, particles reach out
      float dist = distance(pos, uMouse);
      if (dist < 3.0) {
        vec3 dir = normalize(pos - uMouse);
        // Magnetic pull/push
        pos += dir * (3.0 - dist) * 0.2; 
      }
      
      // Noise movement
      pos.x += sin(uTime * 2.0 + pos.y) * 0.02;
      pos.y += cos(uTime * 1.5 + pos.x) * 0.02;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size attenuation
      gl_PointSize = (40.0 * uPixelRatio) / -mvPosition.z;
      
      vAlpha = 0.6 + 0.4 * sin(uTime + aRandom * 10.0);
      vPos = pos;
    }
  `,
    // Fragment Shader
    `
    uniform vec3 uColor;
    varying float vAlpha;
    
    void main() {
      // Circular particle
      float r = distance(gl_PointCoord, vec2(0.5));
      if (r > 0.5) discard;
      
      // Soft glow
      float glow = 1.0 - (r * 2.0);
      glow = pow(glow, 1.5);
      
      gl_FragColor = vec4(uColor, vAlpha * glow);
    }
  `
)

extend({ HeartMaterial })

declare global {
    namespace JSX {
        interface IntrinsicElements {
            heartMaterial: any
        }
    }
}

// Function to generate Heart Points
function generateHeartPoints(count: number) {
    const positions = new Float32Array(count * 3)
    const randomness = new Float32Array(count)

    for (let i = 0; i < count; i++) {
        // Rejection sampling for a heart volume
        // Or parametric surface with noise
        // Using a known parametric heart formula adapted for 3D
        let x, y, z, len;

        // Attempt to fill volume
        let done = false;
        while (!done) {
            // Random point in box
            const u = Math.random() * Math.PI * 2;
            const v = Math.random() * Math.PI;

            // Parametric (approximate)
            // x = 16 sin^3(t) 
            // y = 13 cos(t) - ...
            // We need 3D. 
            // Let's use a noisy sphere that we squash into a heart?
            // Or rejection sampling from the implicit equation:
            // (x^2 + 9/4 y^2 + z^2 - 1)^3 - x^2 z^3 - 9/80 y^2 z^3 < 0

            const px = (Math.random() - 0.5) * 3;
            const py = (Math.random() - 0.5) * 3;
            const pz = (Math.random() - 0.5) * 3;

            const a = px * px + py * py + (9 / 4) * pz * pz - 1;
            // The implicit heart equation: (x^2 + y^2 + 9/4 z^2 - 1)^3 - x^2 y^3 - 9/80 z^2 y^3 < 0
            if (a * a * a - px * px * py * py * py - (9 / 80) * pz * pz * py * py * py < 0) {
                positions[i * 3] = px;
                positions[i * 3 + 1] = py;
                positions[i * 3 + 2] = pz;
                done = true;
            }
        }
        randomness[i] = Math.random();
    }

    return { positions, randomness }
}

export default function HeartCore() {
    const count = 10000
    const materialRef = useRef<any>(null)

    const { positions, randomness } = useMemo(() => generateHeartPoints(count), [])

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
            materialRef.current.uniforms.uPixelRatio.value = state.viewport.dpr

            // Mouse interaction update
            // We need to map 2D mouse to 3D position approx or just use a ray
            // For simplicity, just using raw pointer (normalized) mapped to scene scale?
            // Better: use Three's raycaster or just pass pointer and unproject in shader?
            // We'll just pass vec3(state.pointer.x * 5, state.pointer.y * 5, 0) for now
            materialRef.current.uniforms.uMouse.value.set(state.pointer.x * 3, state.pointer.y * 3, 2);
        }
    })

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aRandom"
                    count={randomness.length}
                    array={randomness}
                    itemSize={1}
                />
            </bufferGeometry>
            {/* @ts-ignore */}
            <heartMaterial ref={materialRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    )
}
