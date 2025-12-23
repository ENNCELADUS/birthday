'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { ScrollControls, useScroll } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useStore } from '@/store/store'
import IntroSequence from './IntroSequence'
import HeartCore from './HeartCore'
import Overlay from './Overlay'
import Finale from './Finale'
import * as THREE from 'three'

function MainStage() {
    const scroll = useScroll()
    const groupRef = useRef<THREE.Group>(null)

    useFrame((state, delta) => {
        // Scroll interaction: Rotate the heart group based on scroll offset
        // scroll.offset is 0..1
        const r = scroll.offset * Math.PI * 2
        if (groupRef.current) {
            groupRef.current.rotation.y = r
        }
    })

    return (
        <group ref={groupRef}>
            <HeartCore />
        </group>
    )
}

function SceneContent() {
    const stage = useStore((state) => state.stage)

    return (
        <>
            <color attach="background" args={['#000000']} />

            <EffectComposer>
                <Bloom
                    luminanceThreshold={0.2}
                    mipmapBlur
                    intensity={1.5}
                    radius={0.6}
                />
            </EffectComposer>

            {stage === 'INTRO' && <IntroSequence />}

            {stage === 'MAIN_STAGE' && (
                <ScrollControls pages={4} damping={0.2}>
                    {/* The 3D Scene */}
                    <MainStage />
                    {/* The HTML Overlay */}
                    <Overlay />
                </ScrollControls>
            )}

            {stage === 'FINALE' && <Finale />}
        </>
    )
}

export default function Experience() {
    return (
        <Canvas
            camera={{ position: [0, 0, 5], fov: 75 }}
            dpr={[1, 2]}
            gl={{ antialias: false, alpha: false }}
        >
            <Suspense fallback={null}>
                <SceneContent />
            </Suspense>
        </Canvas>
    )
}
