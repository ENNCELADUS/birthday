import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * DNAHelix Component
 * Overhauled to meet "High-End" biotech aesthetics:
 * - Particle-based strands for a "data/ghostly" look
 * - Wireframe base pairs
 * - Pulsing heartbeat animation
 */
export default function DNAHelix({ opacity = 1 }: { opacity?: number }) {
    const pointsRef = useRef<THREE.Points>(null)
    const backboneRef = useRef<THREE.Group>(null)

    // Generate DNA Data
    const { points, colors, pairs } = useMemo(() => {
        const count = 400
        const pointsArray = []
        const colorsArray = []
        const pairsArray = []

        const color1 = new THREE.Color('#00ffff') // Cyan
        const color2 = new THREE.Color('#ff00ff') // Magenta

        for (let i = 0; i < count; i++) {
            const t = i / count
            const angle = t * Math.PI * 12 // More twists for complexity
            const radius = 1.2
            const y = (t - 0.5) * 8

            // Two strands
            const x1 = Math.cos(angle) * radius
            const z1 = Math.sin(angle) * radius
            const x2 = Math.cos(angle + Math.PI) * radius
            const z2 = Math.sin(angle + Math.PI) * radius

            // Points for both strands
            pointsArray.push(x1, y, z1)
            colorsArray.push(color1.r, color1.g, color1.b)

            pointsArray.push(x2, y, z2)
            colorsArray.push(color2.r, color2.g, color2.b)

            // Add base pairs periodically
            if (i % 10 === 0) {
                pairsArray.push([
                    new THREE.Vector3(x1, y, z1),
                    new THREE.Vector3(x2, y, z2)
                ])
            }
        }

        return {
            points: new Float32Array(pointsArray),
            colors: new Float32Array(colorsArray),
            pairs: pairsArray
        }
    }, [])

    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime()

        // Rotate the entire assembly
        if (pointsRef.current) {
            pointsRef.current.rotation.y += delta * 0.4

            // Pulse Heartbeat Effect
            // Uses a smooth sin wave but makes it feel like a pulse (fast in, slow out)
            const pulse = Math.pow((Math.sin(time * 2.5) * 0.5 + 0.5), 2.0)
            const baseOpacity = 0.4
            if (pointsRef.current.material instanceof THREE.PointsMaterial) {
                pointsRef.current.material.opacity = opacity * (baseOpacity + pulse * 0.6)
            }
        }

        if (backboneRef.current) {
            backboneRef.current.rotation.y += delta * 0.4
        }
    })

    return (
        <group>
            {/* Particle Strands */}
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={points.length / 3}
                        array={points}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={colors.length / 3}
                        array={colors}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.06}
                    vertexColors
                    transparent
                    opacity={opacity}
                    sizeAttenuation
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </points>

            {/* Wireframe Base Pairs */}
            <group ref={backboneRef}>
                {pairs.map((pair, i) => (
                    <line key={i}>
                        <bufferGeometry>
                            <bufferAttribute
                                attach="attributes-position"
                                count={2}
                                array={new Float32Array([
                                    pair[0].x, pair[0].y, pair[0].z,
                                    pair[1].x, pair[1].y, pair[1].z
                                ])}
                                itemSize={3}
                            />
                        </bufferGeometry>
                        <lineBasicMaterial
                            color="#ffffff"
                            transparent
                            opacity={opacity * 0.2}
                            blending={THREE.AdditiveBlending}
                            depthWrite={false}
                        />
                    </line>
                ))}
            </group>
        </group>
    )
}
