import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

// A single letter that reacts to mouse
function PhysicsLetter({ char, position, offset }: { char: string, position: [number, number, number], offset: number }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [isHovered, setIsHovered] = useState(false)

    // Physics state
    const originalPos = useMemo(() => new THREE.Vector3(...position), [position])
    const currentPos = useMemo(() => new THREE.Vector3(...position), [position])
    const velocity = useMemo(() => new THREE.Vector3(0, 0, 0), [])

    useFrame((state) => {
        if (!meshRef.current) return

        // Mouse interaction
        // Project mouse to world at z=0 (text plane)
        const vec = new THREE.Vector3(state.pointer.x, state.pointer.y, 0)
        vec.unproject(state.camera)
        const dir = vec.sub(state.camera.position).normalize()
        const distance = -state.camera.position.z / dir.z
        const mouseWorld = state.camera.position.clone().add(dir.multiplyScalar(distance))

        // 2D distance check (since text is roughly at z=-2, let's approximate or just use mouseWorld)
        // Adjust mouseWorld to match text plane approx z=-2
        // Actually, unproject logic above finds intersection with arbitrary depth? 
        // Let's simpler: Map normalized pointer (-1to1) to view bounds at depth -2
        // Viewport width at depth -2...

        // Simpler approach: Standard repulsion
        const dist = mouseWorld.distanceTo(currentPos)
        const repulsionRadius = 2.0
        const force = new THREE.Vector3(0, 0, 0)

        if (dist < repulsionRadius) {
            const pushDir = currentPos.clone().sub(mouseWorld).normalize()
            force.add(pushDir.multiplyScalar(0.5)) // Push strength
        }

        // Spring force (return home)
        const springK = 0.1
        const damping = 0.9
        const homeDir = originalPos.clone().sub(currentPos)
        force.add(homeDir.multiplyScalar(springK))

        // Update physics
        velocity.add(force)
        velocity.multiplyScalar(damping) // Drag
        currentPos.add(velocity)

        // Apply
        meshRef.current.position.copy(currentPos)

        // Simple rotation based on velocity for fun
        meshRef.current.rotation.z = -velocity.x * 0.5
        meshRef.current.rotation.y = velocity.x * 0.2
    })

    return (
        <Text
            ref={meshRef}
            position={position}
            fontSize={1.5}
            color="#ffff00"
            font="https://fonts.gstatic.com/s/sharetechmono/v15/J7aHnp1uDWRCCmbxrcUJ5ue95n5o.woff"
            anchorX="center"
            anchorY="middle"
        >
            {char}
            <meshBasicMaterial toneMapped={false} color={new THREE.Color(2, 2, 0)} />
        </Text>
    )
}

export default function Finale() {
    const pointsRef = useRef<THREE.Points>(null)

    useEffect(() => {
        console.log("FINALE COMPONENT MOUNTED")
    }, [])

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

    const message = "HAPPY BIRTHDAY MOM"
    // Calculate layout manually roughly
    // "HAPPY BIRTHDAY" on top
    // "MOM" below

    return (
        <group>
            {/* Confetti */}
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

            {/* Sanity Check Mesh - if text fails, this should be visible */}
            <mesh position={[0, -3, 0]}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshBasicMaterial color="red" wireframe />
            </mesh>

            {/* Giant Interactive Text */}
            <group position={[0, 0, -2]}>
                {/* HAPPY BIRTHDAY */}
                {/* Spacing approx 1.0 per char? */}
                {/* "HAPPY BIRTHDAY" is 14 chars. Start x = -7 */}
                {Array.from("HAPPY BIRTHDAY").map((char, i) => (
                    <PhysicsLetter
                        key={`line1-${i}`}
                        char={char}
                        position={[(i - 6.5) * 1.1, 1, 0]}
                        offset={i}
                    />
                ))}

                {/* MOM */}
                {/* "MOM" is 3 chars. Start x = -1.5 */}
                {Array.from("MOM").map((char, i) => (
                    <PhysicsLetter
                        key={`line2-${i}`}
                        char={char}
                        position={[(i - 1) * 1.5, -1.5, 0]}
                        offset={i + 20}
                    />
                ))}
            </group>
        </group>
    )
}
