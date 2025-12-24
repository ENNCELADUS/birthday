import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HologramMaterialShader } from './shaders/SingularityShaders'

export function CakeReactor() {
    const groupRef = useRef<THREE.Group>(null)
    const liquidParticlesRef = useRef<THREE.Points>(null)

    // Three tiers of the cake
    const tiers = [
        { radius: 1.5, height: 0.5, color: '#00ffff', speed: 0.5, y: -0.5 },
        { radius: 1.0, height: 0.4, color: '#ff00ff', speed: -0.7, y: 0 },
        { radius: 0.6, height: 0.3, color: '#00ffff', speed: 0.9, y: 0.4 },
    ]

    // Reduced particle count
    const particleCount = 100
    const [positions, offsets] = useMemo(() => {
        const pos = new Float32Array(particleCount * 3)
        const off = new Float32Array(particleCount)
        for (let i = 0; i < particleCount; i++) {
            const tier = tiers[Math.floor(Math.random() * tiers.length)]
            const angle = Math.random() * Math.PI * 2
            pos[i * 3] = Math.cos(angle) * tier.radius
            pos[i * 3 + 1] = tier.y + (Math.random() * 0.5)
            pos[i * 3 + 2] = Math.sin(angle) * tier.radius
            off[i] = Math.random() * 10
        }
        return [pos, off]
    }, [])

    useFrame((state) => {
        const time = state.clock.getElapsedTime()

        if (groupRef.current) {
            groupRef.current.children.forEach((child, i) => {
                if (tiers[i]) {
                    child.rotation.y = time * tiers[i].speed
                }
            })
        }

        if (liquidParticlesRef.current) {
            const posArray = liquidParticlesRef.current.geometry.attributes.position.array as Float32Array
            for (let i = 0; i < particleCount; i++) {
                posArray[i * 3 + 1] += 0.015
                if (posArray[i * 3 + 1] > 2) {
                    posArray[i * 3 + 1] = -0.5
                }
            }
            liquidParticlesRef.current.geometry.attributes.position.needsUpdate = true
        }
    })

    return (
        <group position={[0, -2, 0]}>
            <group ref={groupRef}>
                {tiers.map((tier, i) => (
                    <mesh key={i} position={[0, tier.y, 0]}>
                        <cylinderGeometry args={[tier.radius, tier.radius, tier.height, 16, 1, true]} />
                        <shaderMaterial
                            transparent
                            depthWrite={false}
                            blending={THREE.AdditiveBlending}
                            vertexShader={HologramMaterialShader.vertexShader}
                            fragmentShader={HologramMaterialShader.fragmentShader}
                            uniforms={useMemo(() => ({
                                uTime: { value: 0 },
                                uColor: { value: new THREE.Color(tier.color) },
                                uOpacity: { value: 0.4 } // Reduced opacity
                            }), [tier.color])}
                            key={i}
                        />
                        <mesh position={[0, 0, 0]}>
                            <cylinderGeometry args={[tier.radius, tier.radius, tier.height, 16, 1, true]} />
                            <meshBasicMaterial color={tier.color} wireframe transparent opacity={0.2} />
                        </mesh>
                    </mesh>
                ))}
            </group>

            <points ref={liquidParticlesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particleCount}
                        array={positions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.02}
                    color="#ffffff"
                    transparent
                    opacity={0.6}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            <pointLight intensity={1} color="#00ffff" distance={4} />
        </group>
    )
}
