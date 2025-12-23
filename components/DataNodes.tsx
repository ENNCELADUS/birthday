import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

function NodeMesh({ position, label, isActive }: { position: [number, number, number], label: string, isActive: boolean }) {
    const meshRef = useRef<THREE.Group>(null)

    // Rotate the node to always face center? Or face camera?
    // If it's in the rotating group, it will rotate with it.
    // Let's make it look interesting.

    useFrame((state) => {
        if (!meshRef.current) return
        // Floating animation
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2

        // Spin the mesh itself slightly
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
        meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.3) * 0.2
    })

    return (
        <group ref={meshRef} position={new THREE.Vector3(...position)}>
            {/* Connection Line to Center */}
            {isActive && (
                <line>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={2}
                            array={new Float32Array([0, 0, 0, -position[0], -position[1], -position[2]])} // Local 0,0,0 to "Center" (which is relative to this group)
                            // Actually, 0,0,0 is the node. Center is -position.
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color="#00ffff" transparent opacity={0.2} />
                </line>
            )}

            {/* The Node Shape */}
            <mesh>
                <icosahedronGeometry args={[0.5, 0]} />
                <meshBasicMaterial
                    color={isActive ? "#00ffff" : "#004444"}
                    wireframe
                    transparent
                    opacity={isActive ? 0.8 : 0.3}
                />
            </mesh>

            {/* Inner Glow */}
            {isActive && (
                <mesh scale={[0.8, 0.8, 0.8]}>
                    <icosahedronGeometry args={[0.4, 0]} />
                    <meshBasicMaterial color="#00ffff" transparent opacity={0.5} />
                </mesh>
            )}

            {/* Label (Optional 3D floating text, or just rely on HTML overlay) */}
            {/* Let's keep it purely abstract for now, maybe small tech text */}
        </group>
    )
}

function BrainScan({ position, isActive }: { position: [number, number, number], isActive: boolean }) {
    // Special node for the "Neural Net" conclusion
    // A wireframe brain or just a more complex shape
    return (
        <group position={new THREE.Vector3(...position)}>
            <mesh visible={isActive}>
                <sphereGeometry args={[0.6, 16, 16]} />
                <meshBasicMaterial color="#00ff00" wireframe transparent opacity={0.3} />
            </mesh>
            {/* Scan line effect could be shader, but keeping simple */}
        </group>
    )
}

export default function DataNodes() {
    // We need to know where the scroll is to activate
    // But since we are inside the rotating group, the "Active" node is the one closest to camera Z?
    // Actually, we can just pass props or calculate based on rotation logic if we had access.
    // However, Experience.tsx handles rotation. 
    // Let's just render them all and maybe make them reactive if we can access store or scroll?
    // For now, let's just put them in the scene. 

    // Angles: 
    // Camera is at +Z. 
    // Overlay Section 1 (System Alert): Starts immediately.
    // Overlay Section 2 (Energy Law): Scroll ~0.33
    // Overlay Section 3 (Neural Net): Scroll ~0.66

    // Rotation is y = scroll * 2PI.
    // So 0.33 * 2PI = 120 deg. 
    // If we want Node 2 to appear at 120 deg, we should place it such that after 120 deg rotation, it is in front.
    // If we rotate the WORLD by 120 deg (positive/negative?), the object at -120 deg comes to front?
    // Let's place them at:
    // Node 1: 0 deg (Front)
    // Node 2: 120 deg 
    // Node 3: 240 deg

    const radius = 3.5

    // Positions helper
    const getPos = (deg: number, y: number): [number, number, number] => {
        const rad = deg * Math.PI / 180
        return [Math.sin(rad) * radius, y, Math.cos(rad) * radius]
    }

    return (
        <group>
            {/* Node 1: Front (0 deg) - System Update */}
            <NodeMesh position={getPos(0, 1.5)} label="SYSTEM" isActive={true} />

            {/* Node 2: 120 deg - Energy Law */}
            <NodeMesh position={getPos(120, -1)} label="ENERGY" isActive={true} />

            {/* Node 3: 240 deg - Neural Net */}
            <BrainScan position={getPos(240, 1)} isActive={true} />
        </group>
    )
}
