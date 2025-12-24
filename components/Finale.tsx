import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { ParticleShader } from './shaders/SingularityShaders'
import { CakeReactor } from './CakeReactor'


type AnimationPhase = 'IMPLOSION' | 'VOID' | 'CONSTRUCT'

const PHASE_DURATIONS = {
    IMPLOSION: 1.0,
    VOID: 0.5,
    CONSTRUCT: 3.0,
}

function SingularityParticles({ phase, progress, transition }: { phase: AnimationPhase, progress: number, transition: number }) {
    const materialRef = useRef<THREE.ShaderMaterial>(null)
    const { size } = useThree()
    const count = 5000; // Further reduced for performance

    const { positions, sizes, offsets } = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const sizes = new Float32Array(count)
        const offsets = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            // Random cloud distribution instead of sphere
            const r = Math.random() * 10 // Smaller radius (was 40)
            const theta = Math.random() * Math.PI * 2
            const height = (Math.random() - 0.5) * 10 // Smaller height range (was 40)

            positions[i * 3] = r * Math.cos(theta)
            positions[i * 3 + 1] = height
            positions[i * 3 + 2] = r * Math.sin(theta)

            sizes[i] = 0.05 + Math.random() * 0.1
            offsets[i] = Math.random() * Math.PI * 2
        }
        return { positions, sizes, offsets }
    }, [])

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
            materialRef.current.uniforms.uProgress.value = progress
            materialRef.current.uniforms.uTransition.value = transition
            // Always ambient phase now
            materialRef.current.uniforms.uPhase.value = 0
        }
    })

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                {/* Removed target attribute as it's no longer used */}
                <bufferAttribute attach="attributes-aSize" count={count} array={sizes} itemSize={1} />
                <bufferAttribute attach="attributes-aOffset" count={count} array={offsets} itemSize={1} />
            </bufferGeometry>
            <shaderMaterial
                ref={materialRef}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                vertexShader={ParticleShader.vertexShader}
                fragmentShader={ParticleShader.fragmentShader}
                uniforms={useMemo(() => ({
                    ...ParticleShader.uniforms,
                    uResolution: { value: new THREE.Vector2(size.width, size.height) }
                }), [size])}
            />
        </points>
    )
}

function FinaleOverlay() {
    return (
        <Html position={[0, 3.5, 0]} center transform sprite zIndexRange={[100, 0]}>
            <div className="flex flex-col items-center gap-4 pointer-events-none select-none">
                <div className="flex items-center gap-4">
                    <div className="w-1 h-3 bg-cyan-400 animate-pulse" />
                    <h1 className="text-4xl md:text-6xl font-mono text-cyan-200 tracking-wider"
                        style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.5)' }}>
                        [ SYSTEM UPTIME: 50 YEARS ]
                    </h1>
                    <div className="w-1 h-3 bg-cyan-400 animate-pulse" />
                </div>

                <div className="flex items-center gap-4 mt-2">
                    <span className="text-cyan-600 text-xl font-mono">{`>>`}</span>
                    <h2 className="text-3xl md:text-5xl font-mono text-white tracking-widest font-bold"
                        style={{ textShadow: '0 0 30px rgba(255, 255, 255, 0.8)' }}>
                        HAPPY BIRTHDAY, MOTHER
                    </h2>
                    <span className="text-cyan-600 text-xl font-mono">{`<<`}</span>
                </div>
            </div>
        </Html>
    )
}

export default function Finale() {
    const [phase, setPhase] = useState<AnimationPhase>('IMPLOSION')
    const [progress, setProgress] = useState(0)
    const [transition, setTransition] = useState(0)
    const startTimeRef = useRef<number>(0)
    const phaseStartTimeRef = useRef<number>(0)
    const { clock } = useThree()

    useEffect(() => {
        startTimeRef.current = clock.getElapsedTime()
        phaseStartTimeRef.current = startTimeRef.current
    }, [])

    useFrame((state) => {
        const now = state.clock.getElapsedTime()
        const phaseElapsed = now - phaseStartTimeRef.current

        if (phase === 'IMPLOSION') {
            const p = Math.min(1, phaseElapsed / PHASE_DURATIONS.IMPLOSION)
            setProgress(p)
            if (p >= 1) {
                setPhase('VOID')
                phaseStartTimeRef.current = now
            }
        } else if (phase === 'VOID') {
            setProgress(0)
            if (phaseElapsed >= PHASE_DURATIONS.VOID) {
                setPhase('CONSTRUCT')
                phaseStartTimeRef.current = now
            }
        } else if (phase === 'CONSTRUCT') {
            const p = Math.min(1, phaseElapsed / PHASE_DURATIONS.CONSTRUCT)
            setProgress(p)
            // Transition particles to form text as construct builds?
            // Or maybe after it builds. Let's make them form the text as the cake appears.
            setTransition(p)
        }
    })

    return (
        <group>
            <color attach="background" args={['#000000']} />

            <SingularityParticles phase={phase} progress={progress} transition={transition} />

            {(phase === 'CONSTRUCT') && (
                <>
                    <CakeReactor />
                    <FinaleOverlay />
                </>
            )}

            <ambientLight intensity={0.2} />
        </group>
    )
}
