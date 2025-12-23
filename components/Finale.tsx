import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import gsap from 'gsap'

export default function Finale() {
    const pointsRef = useRef<THREE.Points>(null)

    // Create Explosion Particles
    const { positions, velocities, colors } = useMemo(() => {
        const count = 5000
        const positions = new Float32Array(count * 3)
        const velocities = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)

        for (let i = 0; i < count; i++) {
            // Start at center
            positions[i * 3] = (Math.random() - 0.5) * 1
            positions[i * 3 + 1] = (Math.random() - 0.5) * 1
            positions[i * 3 + 2] = (Math.random() - 0.5) * 1

            // Explosion velocity
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos((Math.random() * 2) - 1)
            const speed = 2 + Math.random() * 5

            velocities[i * 3] = speed * Math.sin(phi) * Math.cos(theta)
            velocities[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta)
            velocities[i * 3 + 2] = speed * Math.cos(phi)

            // Confetti colors
            const color = new THREE.Color().setHSL(Math.random(), 1, 0.5)
            colors[i * 3] = color.r
            colors[i * 3 + 1] = color.g
            colors[i * 3 + 2] = color.b
        }

        return { positions, velocities, colors }
    }, [])

    useFrame((state, delta) => {
        if (!pointsRef.current) return

        const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
        const positions = posAttr.array as Float32Array

        // Physics simulation
        // Since we can't easily modify buffer attributes in a loop in JS without perf hit, 
        // usually we use shaders. But for 5000 points it's okay-ish.
        // Or we just let them expand uniformly via scale.
        // Let's use scale for performance + simple shake.

        // pointsRef.current.scale.multiplyScalar(1.05)
        // Actually, let's just make them explode outward in shader or simple JS loop?
        // JS loop for 5000 is fine.

        for (let i = 0; i < 5000; i++) {
            // Drag
            velocities[i * 3] *= 0.95
            velocities[i * 3 + 1] *= 0.95
            velocities[i * 3 + 2] *= 0.95

            positions[i * 3] += velocities[i * 3] * delta
            positions[i * 3 + 1] += velocities[i * 3 + 1] * delta
            positions[i * 3 + 2] += velocities[i * 3 + 2] * delta
        }

        posAttr.needsUpdate = true
    })

    return (
        <group>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={5000}
                        array={positions}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={5000}
                        array={colors}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial vertexColors size={0.1} sizeAttenuation transparent opacity={0.8} blending={THREE.AdditiveBlending} />
            </points>

            {/* Giant Text */}
            <group position={[0, 0, -2]}>
                <Text
                    fontSize={2}
                    color="#ffff00"
                    textAlign="center"
                    anchorX="center"
                    anchorY="middle"
                    font="https://fonts.gstatic.com/s/sharetechmono/v15/J7aHnp1uDWRCCmbxrcUJ5ue95n5o.woff"
                >
                    HAPPY BIRTHDAY{'\n'}MOM
                    <meshBasicMaterial toneMapped={false} />
                </Text>
            </group>
        </group>
    )
}
