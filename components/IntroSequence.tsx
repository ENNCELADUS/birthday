import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import * as THREE from 'three'
import { MatrixRainMaterial } from './shaders/MatrixRainMaterial'
import DNAHelix from './DNAHelix'
import { useStore } from '@/store/store'
import { Text } from '@react-three/drei'
import gsap from 'gsap'
import { getAssetPath } from '@/utils/paths'

extend({ MatrixRainMaterial })

export default function IntroSequence() {
    const rainRef = useRef<any>(null)
    const groupRef = useRef<THREE.Group>(null)
    const setStage = useStore((state) => state.setStage)

    const [showDNA, setShowDNA] = useState(false)
    const [opacity, setOpacity] = useState(1)

    // Generate Character Texture Atlas for the rain (A, T, C, G, 0, 1)
    const charTexture = useMemo(() => {
        const canvas = document.createElement('canvas')
        const size = 128
        canvas.width = size * 6
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (ctx) {
            ctx.fillStyle = 'black'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = 'white'
            ctx.font = `bold ${size * 0.8}px monospace`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            const chars = ['A', 'T', 'C', 'G', '0', '1']
            chars.forEach((char, i) => {
                ctx.fillText(char, size * i + size / 2, size / 2)
            })
        }
        const tex = new THREE.CanvasTexture(canvas)
        tex.minFilter = THREE.LinearFilter
        return tex
    }, [])

    useEffect(() => {
        if (rainRef.current && charTexture) {
            rainRef.current.uniforms.uTexture.value = charTexture
        }
    }, [charTexture])

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
            <group position={[0, 2.8, -2]}>
                <Text
                    position={[0, 0, 0]}
                    fontSize={0.2}
                    color="#00ff00"
                    anchorX="center"
                    anchorY="middle"
                    font={getAssetPath("/fonts/NotoSansSC.ttf")}
                >
                    {"> 正在初始化母体协议..."}
                </Text>
                <Text
                    position={[0, -0.3, 0]}
                    fontSize={0.2}
                    color="#00ff00"
                    anchorX="center"
                    anchorY="middle"
                    font={getAssetPath("/fonts/NotoSansSC.ttf")}
                >
                    {showDNA ? "> 正在挂载线粒体引擎..." : ""}
                </Text>
                <Text
                    position={[0, -0.6, 0]}
                    fontSize={0.2}
                    color="#00ff00"
                    anchorX="center"
                    anchorY="middle"
                    font={getAssetPath("/fonts/NotoSansSC.ttf")}
                >
                    {showDNA ? "> 正在同步心跳协议..." : ""}
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
