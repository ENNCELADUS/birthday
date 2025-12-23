import { useRef, useEffect, useState } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import * as THREE from 'three'
import { MatrixRainMaterial } from './shaders/MatrixRainMaterial'
import DNAHelix from './DNAHelix'
import { useStore } from '@/store/store'
import { Text } from '@react-three/drei'
import gsap from 'gsap'

extend({ MatrixRainMaterial })

export default function IntroSequence() {
    const rainRef = useRef<any>(null)
    const groupRef = useRef<THREE.Group>(null)
    const setStage = useStore((state) => state.setStage)

    const [showDNA, setShowDNA] = useState(false)
    const [opacity, setOpacity] = useState(1)

    useEffect(() => {
        // Sequence Timeline
        const tl = gsap.timeline({
            onComplete: () => {
                // Transition to MAIN_STAGE
                // Fade out everything
                if (groupRef.current) {
                    gsap.to(groupRef.current.scale, { x: 5, y: 5, z: 5, duration: 1, ease: "power2.in" })
                    gsap.to(groupRef.current.position, { z: 10, duration: 1, ease: "power2.in", onComplete: () => setStage('MAIN_STAGE') })
                }
            }
        })

        // 1. Rain falls for 3 seconds
        tl.to({}, { duration: 3 })

        // 2. Rain coalesces/fades out, DNA appears
        tl.add(() => setShowDNA(true))
        if (rainRef.current) {
            tl.to(rainRef.current.uniforms.uOpacity, { value: 0, duration: 2 }, "<")
        }

        // 3. DNA spins and messages appear (simulated by wait)
        tl.to({}, { duration: 4 })

        return () => {
            tl.kill()
        }
    }, [setStage])

    useFrame((state, delta) => {
        if (rainRef.current) {
            rainRef.current.uniforms.uTime.value += delta
        }
    })

    return (
        <group ref={groupRef}>
            {/* Matrix Rain Plane */}
            <mesh position={[0, 0, -5]}>
                <planeGeometry args={[20, 10]} />
                <matrixRainMaterial ref={rainRef} transparent />
            </mesh>

            {/* Text Logs - simple HUD overlay in 3D */}
            {/* Text Logs - simple HUD overlay in 3D */}
            <group position={[0, 2, -2]}>
                <Text
                    position={[0, 0, 0]}
                    fontSize={0.2}
                    color="#00ff00"
                    anchorX="center"
                    anchorY="middle"
                >
                    {"> INITIALIZING MATERNAL PROTOCOLS..."}
                </Text>
                <Text
                    position={[0, -0.3, 0]}
                    fontSize={0.2}
                    color="#00ff00"
                    anchorX="center"
                    anchorY="middle"
                >
                    {showDNA ? "> MOUNTING MITOCHONDRIAL ENGINE..." : ""}
                </Text>
                <Text
                    position={[0, -0.6, 0]}
                    fontSize={0.2}
                    color="#00ff00"
                    anchorX="center"
                    anchorY="middle"
                >
                    {showDNA ? "> SYNCING HEARTBEAT PROTOCOLS..." : ""}
                </Text>
            </group>

            {showDNA && (
                <group position={[0, -1, 0]}>
                    <DNAHelix opacity={1} />
                </group>
            )}
        </group>
    )
}
