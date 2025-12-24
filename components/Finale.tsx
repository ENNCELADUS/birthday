import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Text, Float, Center } from '@react-three/drei'
import { getAssetPath } from '@/utils/paths'
import { ParticleShader, ShockwaveShader, NeonTubeShader } from './shaders/SingularityShaders'
import { CakeReactor } from './CakeReactor'
import { PhotonBeam } from './PhotonBeam'

type AnimationPhase = 'IMPLOSION' | 'VOID' | 'CONSTRUCT' | 'IGNITION' | 'SINGULARITY' | 'MESSAGE'

const PHASE_DURATIONS = {
    IMPLOSION: 1.0,
    VOID: 0.5,
    CONSTRUCT: 3.0, // Minimum construct time
    IGNITION: 2.0,
    SINGULARITY: 2.0,
    MESSAGE: 10.0,
}

const CHINESE_FONT = getAssetPath("/fonts/NotoSansSC.ttf");

function SingularityParticles({ phase, progress, transition, messagePoints }: { phase: AnimationPhase, progress: number, transition: number, messagePoints: THREE.Vector3[] }) {
    const materialRef = useRef<THREE.ShaderMaterial>(null)
    const { size } = useThree()
    const count = 35000;

    const { positions, targets, sizes, offsets } = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const targets = new Float32Array(count * 3)
        const sizes = new Float32Array(count)
        const offsets = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            const r = 15 + Math.random() * 25
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos((Math.random() * 2) - 1)
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            positions[i * 3 + 2] = r * Math.cos(phi)

            if (messagePoints.length > 0) {
                const target = messagePoints[i % messagePoints.length]
                targets[i * 3] = target.x
                targets[i * 3 + 1] = target.y
                targets[i * 3 + 2] = target.z
            }

            sizes[i] = 0.04 + Math.random() * 0.12
            offsets[i] = Math.random() * Math.PI * 2
        }
        return { positions, targets, sizes, offsets }
    }, [messagePoints])

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
            materialRef.current.uniforms.uProgress.value = progress
            materialRef.current.uniforms.uTransition.value = transition
            materialRef.current.uniforms.uPhase.value = phase === 'SINGULARITY' ? 1 : (phase === 'MESSAGE' ? 2 : 0)
        }
    })

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-aTarget" count={count} array={targets} itemSize={3} />
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

function SonicBoom({ progress }: { progress: number }) {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 8, 0]}>
            <planeGeometry args={[120, 120]} />
            <shaderMaterial
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                vertexShader={ShockwaveShader.vertexShader}
                fragmentShader={ShockwaveShader.fragmentShader}
                uniforms={{
                    uTime: { value: 0 },
                    uProgress: { value: progress },
                    uColor: { value: new THREE.Color('#ffcc33') }
                }}
            />
        </mesh>
    )
}

export default function Finale() {
    const [phase, setPhase] = useState<AnimationPhase>('IMPLOSION')
    const [progress, setProgress] = useState(0)
    const [transition, setTransition] = useState(0)
    const [isOverclocked, setIsOverclocked] = useState(false)
    const startTimeRef = useRef<number>(0)
    const phaseStartTimeRef = useRef<number>(0)
    const { clock } = useThree()
    const [messagePoints, setMessagePoints] = useState<THREE.Vector3[]>([])

    const lines = [
        `[ 运行时长: 50 年 ]`, // AGE can be refined
        "[ 生日快乐, 我的根目录 ]"
    ]

    useEffect(() => {
        startTimeRef.current = clock.getElapsedTime()
        phaseStartTimeRef.current = startTimeRef.current

        // Generate cluster targets for text
        const points: THREE.Vector3[] = []
        for (let l = 0; l < lines.length; l++) {
            const y = 1 - l * 2.5
            for (let i = 0; i < 8000; i++) {
                points.push(new THREE.Vector3(
                    (Math.random() - 0.5) * 12,
                    y + (Math.random() - 0.5) * 1.5,
                    (Math.random() - 0.5) * 2
                ))
            }
        }
        setMessagePoints(points)
    }, [])

    const handleLaunch = () => {
        if (phase === 'CONSTRUCT' && !isOverclocked) {
            setIsOverclocked(true)
            dispatchAudio('ignition')
            // Delay slightly before switching to IGNITION phase to let intensity build
            setTimeout(() => {
                setPhase('IGNITION')
                phaseStartTimeRef.current = clock.getElapsedTime()
            }, 500)
        }
    }

    const dispatchAudio = (type: string) => {
        window.dispatchEvent(new CustomEvent(`audio-${type}`))
    }

    useFrame((state) => {
        const now = state.clock.getElapsedTime()
        const totalElapsed = now - startTimeRef.current
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
            // Stays here until handleLaunch is called
        } else if (phase === 'IGNITION') {
            const p = Math.min(1, phaseElapsed / PHASE_DURATIONS.IGNITION)
            setProgress(p)
            if (p >= 1) {
                setPhase('SINGULARITY')
                phaseStartTimeRef.current = now
                dispatchAudio('singularity')
            }
        } else if (phase === 'SINGULARITY') {
            const p = Math.min(1, phaseElapsed / PHASE_DURATIONS.SINGULARITY)
            setProgress(p)
            setTransition(Math.min(1, p * 2))
            if (p >= 1) {
                setPhase('MESSAGE')
                phaseStartTimeRef.current = now
                dispatchAudio('message')
            }
        } else if (phase === 'MESSAGE') {
            const p = Math.min(1, phaseElapsed / PHASE_DURATIONS.MESSAGE)
            setProgress(p)
            setTransition(1)
        }
    })

    return (
        <group>
            <color attach="background" args={[phase === 'IMPLOSION' || phase === 'VOID' ? '#000000' : (transition > 0.5 ? '#0a0500' : '#00050a')]} />

            <SingularityParticles phase={phase} progress={progress} transition={transition} messagePoints={messagePoints} />

            {(phase === 'CONSTRUCT' || phase === 'IGNITION') && (
                <>
                    <CakeReactor />
                    <PhotonBeam isOverclocked={isOverclocked} onLaunch={handleLaunch} />
                </>
            )}

            {phase === 'SINGULARITY' && <SonicBoom progress={progress} />}

            {phase === 'MESSAGE' && (
                <group position={[0, -0.5, 0]}>
                    <Center top position={[0, 1.8, 0]}>
                        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
                            <Text font={CHINESE_FONT} fontSize={0.9} color="#ffcc33">
                                {lines[0]}
                                <shaderMaterial
                                    attach="material"
                                    transparent
                                    vertexShader={NeonTubeShader.vertexShader}
                                    fragmentShader={NeonTubeShader.fragmentShader}
                                    uniforms={{
                                        uTime: { value: 0 },
                                        uOpacity: { value: Math.max(0, (progress - 0.1) * 2) },
                                        uColor: { value: new THREE.Color('#ffcc33') }
                                    }}
                                />
                            </Text>
                        </Float>
                    </Center>
                    <Center bottom position={[0, -0.8, 0]}>
                        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
                            <Text font={CHINESE_FONT} fontSize={1.1} color="#ffcc33">
                                {lines[1]}
                                <shaderMaterial
                                    attach="material"
                                    transparent
                                    vertexShader={NeonTubeShader.vertexShader}
                                    fragmentShader={NeonTubeShader.fragmentShader}
                                    uniforms={{
                                        uTime: { value: 0 },
                                        uOpacity: { value: Math.max(0, (progress - 0.3) * 2) },
                                        uColor: { value: new THREE.Color('#ffcc33') }
                                    }}
                                />
                            </Text>
                        </Float>
                    </Center>

                    {/* Volumetric atmosphere (God Rays simulated via point lights) */}
                    <pointLight position={[0, 10, -5]} intensity={15 * progress} color="#ffcc33" distance={30} />
                    <pointLight position={[0, -5, -5]} intensity={10 * progress} color="#ffaa00" distance={20} />
                </group>
            )}

            <ambientLight intensity={phase === 'MESSAGE' ? 0.3 : 0.1} />
        </group>
    )
}
