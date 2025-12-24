import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '@/store/store'
import { Text } from '@react-three/drei'
import gsap from 'gsap'
import { getAssetPath } from '@/utils/paths'
import MorphingParticles, { MorphingParticlesRef } from './MorphingParticles'

export default function IntroSequence() {
    const morphRef = useRef<MorphingParticlesRef>(null)
    const groupRef = useRef<THREE.Group>(null)
    const setStage = useStore((state) => state.setStage)
    const setIsGlitching = useStore((state) => state.setIsGlitching)
    const { camera } = useThree()

    const [logs, setLogs] = useState<string[]>(["> 正在初始化母体协议..."])
    const [isMorphed, setIsMorphed] = useState(false)

    // Generate Character Texture Atlas for the rain (A, T, C, G, 0, 1)
    const charTexture = useMemo(() => {
        if (typeof document === 'undefined') return null
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
        if (!morphRef.current?.material) return
        const mat = morphRef.current.material

        // Sequence Timeline
        const tl = gsap.timeline({
            onComplete: () => {
                // Final Transition to MAIN_STAGE
                if (groupRef.current) {
                    gsap.to(groupRef.current.scale, { x: 5, y: 5, z: 5, duration: 1.5, ease: "power2.in" })
                    gsap.to(groupRef.current.position, { z: 15, duration: 1.5, ease: "power2.in", onComplete: () => setStage('MAIN_STAGE') })
                }
            }
        })

        // 1. Initial Rain (3s)
        tl.to({}, { duration: 3 })

        // 2. The "Crystallization" Moment
        tl.add(() => {
            setLogs(prev => [...prev, "> 检测到生物识别信号...", "> 正在重新编码粒子矩阵..."])
        })

        // Slow down rain and start morph
        tl.to(mat.uniforms.uSpeed, { value: 0.05, duration: 1.5, ease: "power2.out" })

        // Morph animation with Elastic ease for "biological bounce"
        tl.to(mat.uniforms.uMorph, {
            value: 1.0,
            duration: 3,
            ease: "elastic.out(1, 0.75)",
            onStart: () => {
                setIsMorphed(true)
                setIsGlitching(true)
                setTimeout(() => setIsGlitching(false), 500)
            }
        }, "-=0.5")

        // Camera Work: Pull back and rotate to reveal 3D depth
        tl.to(camera.position, { z: 8, duration: 4, ease: "power2.inOut" }, "-=3")
        tl.to(groupRef.current!.rotation, { y: Math.PI * 0.5, duration: 4, ease: "power2.inOut" }, "-=4")

        tl.add(() => {
            setLogs(prev => [...prev, "> 正在挂载线粒体引擎...", "> 正在同步心跳协议...", "> 矩阵初始化完成。"])
        }, "-=1")

        // 3. Final Pause
        tl.to({}, { duration: 2 })

        return () => {
            tl.kill()
        }
    }, [setStage, camera])

    return (
        <group ref={groupRef}>
            {/* Unified Morphing Particle System */}
            {charTexture && <MorphingParticles ref={morphRef} texture={charTexture} />}

            {/* Terminal Logs */}
            <group position={[0, 2.5, -2]}>
                {logs.map((text, i) => (
                    <Text
                        key={i}
                        position={[0, -i * 0.25, 0]}
                        fontSize={0.15}
                        color="#00ff00"
                        anchorX="center"
                        anchorY="middle"
                        font={getAssetPath("/fonts/NotoSansSC.ttf")}
                    >
                        {text}
                    </Text>
                ))}
            </group>
        </group>
    )
}
