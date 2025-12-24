'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { ScrollControls, useScroll } from '@react-three/drei'
import { Suspense, useRef, useEffect } from 'react'
import { EffectComposer, Bloom, Glitch, Noise } from '@react-three/postprocessing'
import { GlitchMode } from 'postprocessing'
import { useStore } from '@/store/store'
import IntroSequence from './IntroSequence'
import HeartCore from './HeartCore'
import Overlay from './Overlay'
import Finale from './Finale'
import NeuralBackground from './NeuralBackground'
import DataNodes from './DataNodes'
import SoundManager from './SoundManager'
import * as THREE from 'three'
import HUDScrollIndicator from './HUDScrollIndicator'

function MainStage() {
    const scroll = useScroll()
    const groupRef = useRef<THREE.Group>(null)

    const setStage = useStore((state) => state.setStage)

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
            <DataNodes />
        </group>
    )
}
function SceneContent() {
    const stage = useStore((state) => state.stage)
    const isGlitching = useStore((state) => state.isGlitching)

    return (
        <>
            <color attach="background" args={['#000000']} />

            <EffectComposer>
                <Bloom
                    luminanceThreshold={0.5}
                    mipmapBlur
                    intensity={0.8}
                    radius={0.4}
                />
                <Glitch
                    delay={new THREE.Vector2(0.1, 0.3)}
                    duration={new THREE.Vector2(0.1, 0.2)}
                    strength={new THREE.Vector2(0.2, 0.4)}
                    mode={GlitchMode.SPORADIC}
                    active={isGlitching}
                    ratio={0.85}
                />
                <Noise opacity={0.05} />
            </EffectComposer>

            <Suspense fallback={null}>
                {stage === 'INTRO' && <IntroSequence />}
            </Suspense>

            {stage === 'MAIN_STAGE' && (
                <ScrollControls pages={5} damping={0.2}>
                    <Suspense fallback={null}>
                        <NeuralBackground />
                        <MainStage />
                        <Overlay />
                    </Suspense>
                </ScrollControls>
            )}

            <Suspense fallback={null}>
                {stage === 'FINALE' && <Finale />}
            </Suspense>

            <SoundManager />
        </>
    )
}


export default function Experience() {
    const stage = useStore((state) => state.stage)

    return (
        <div className="w-full h-full relative">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 75 }}
                dpr={[1, 2]}
                gl={{ antialias: false, alpha: false }}
            >
                <SceneContent />
            </Canvas>

            {stage === 'MAIN_STAGE' && <HUDScrollIndicator />}
        </div>
    )
}
