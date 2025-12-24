import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import './shaders/HologramMaterials'

function PulseLine({ start, end, color }: { start: [number, number, number], end: [number, number, number], color: string }) {
    const matRef = useRef<any>(null)

    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry()
        const positions = new Float32Array([...start, ...end])
        const progress = new Float32Array([0, 1]) // 0 at start, 1 at end
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geo.setAttribute('lineProgress', new THREE.BufferAttribute(progress, 1))
        return geo
    }, [start, end])

    useFrame((state) => {
        if (matRef.current) {
            matRef.current.uTime = state.clock.elapsedTime
        }
    })

    return (
        <line
            //@ts-ignore
            geometry={geometry}
        >
            <pulseLineMaterial
                ref={matRef}
                uColor={new THREE.Color(color)}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </line >
    )
}

function NodeMesh({ position, color = "#00ffff", delay = 0 }: { position: [number, number, number], color?: string, delay?: number }) {
    const groupRef = useRef<THREE.Group>(null)
    const ringRef = useRef<any>(null)
    const flareRef = useRef<any>(null)

    useFrame((state) => {
        if (!groupRef.current) return
        const t = state.clock.elapsedTime + delay

        // Slow orbit/float
        groupRef.current.position.x = position[0] + Math.sin(t * 0.5) * 0.3
        groupRef.current.position.y = position[1] + Math.cos(t * 0.7) * 0.3
        groupRef.current.position.z = position[2] + Math.sin(t * 0.3) * 0.3

        // Billboarding effect: face the camera
        groupRef.current.quaternion.copy(state.camera.quaternion)

        if (ringRef.current) ringRef.current.uTime = t
    })

    return (
        <group ref={groupRef}>
            {/* Connection back to center (Heart) */}
            <PulseLine start={[0, 0, 0]} end={[-position[0], -position[1], -position[2]]} color={color} />

            {/* Inner Glow Flare */}
            <mesh scale={[1.2, 1.2, 1.2]}>
                <planeGeometry args={[1, 1]} />
                <glowMaterial
                    ref={flareRef}
                    uColor={new THREE.Color(color)}
                    transparent
                    opacity={0.4}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Outer Holographic Ring */}
            <mesh scale={[1.5, 1.5, 1.5]}>
                <planeGeometry args={[1, 1]} />
                <hologramRingMaterial
                    ref={ringRef}
                    uColor={new THREE.Color(color)}
                    transparent
                    opacity={0.8}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>

            {/* Tiny Core Dot */}
            <mesh>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshBasicMaterial color={color} />
            </mesh>
        </group>
    )
}

export default function DataNodes() {
    const radius = 4.5

    const getPos = (deg: number, y: number): [number, number, number] => {
        const rad = deg * Math.PI / 180
        return [Math.sin(rad) * radius, y, Math.cos(rad) * radius]
    }

    // Positions for 4 nodes
    const nodes = useMemo(() => [
        { pos: getPos(0, 1.5), color: "#00ffff", delay: 0 },
        { pos: getPos(90, -1.5), color: "#ff00ff", delay: 2 },
        { pos: getPos(180, 2), color: "#00ff00", delay: 4 },
        { pos: getPos(270, -1), color: "#ffff00", delay: 6 },
    ], [])

    return (
        <group>
            {nodes.map((node, i) => (
                <NodeMesh key={i} position={node.pos} color={node.color} delay={node.delay} />
            ))}
        </group>
    )
}

