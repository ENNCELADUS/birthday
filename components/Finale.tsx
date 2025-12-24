import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Text, Float, useFont, Center } from '@react-three/drei'
import { getAssetPath } from '@/utils/paths'
import { ParticleShader, ShockwaveShader } from './shaders/SingularityShaders'
import { useStore } from '@/store/store'

type AnimationPhase = 'SYSTEM_HALT' | 'IMPLOSION' | 'SHOCKWAVE' | 'CONSTELLATION'

const PHASE_DURATIONS = {
    SYSTEM_HALT: 2.0,
    IMPLOSION: 1.5,
    SHOCKWAVE: 1.0,
    CONSTELLATION: 5.0,
}

const CHINESE_FONT = getAssetPath("/fonts/NotoSansSC.ttf");

function SingularityParticles({ phase, progress, messagePoints }: { phase: AnimationPhase, progress: number, messagePoints: THREE.Vector3[] }) {
    const pointsRef = useRef<THREE.Points>(null)
    const materialRef = useRef<THREE.ShaderMaterial>(null)
    const { size } = useThree()

    const count = 20000;

    const { positions, targets, sizes, offsets } = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const targets = new Float32Array(count * 3)
        const sizes = new Float32Array(count)
        const offsets = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            // Initial positions (scattered in sphere)
            const r = 5 + Math.random() * 15
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos((Math.random() * 2) - 1)

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            positions[i * 3 + 2] = r * Math.cos(phi)

            // Targets from messagePoints
            if (messagePoints.length > 0) {
                const target = messagePoints[i % messagePoints.length]
                targets[i * 3] = target.x
                targets[i * 3 + 1] = target.y
                targets[i * 3 + 2] = target.z
            } else {
                targets[i * 3] = positions[i * 3]
                targets[i * 3 + 1] = positions[i * 3 + 1]
                targets[i * 3 + 2] = positions[i * 3 + 2]
            }

            sizes[i] = 0.05 + Math.random() * 0.15
            offsets[i] = Math.random() * Math.PI * 2
        }

        return { positions, targets, sizes, offsets }
    }, [messagePoints])

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime()
            materialRef.current.uniforms.uProgress.value = progress
            materialRef.current.uniforms.uPhase.value =
                phase === 'SYSTEM_HALT' ? 0 :
                    phase === 'IMPLOSION' ? 0 :
                        phase === 'SHOCKWAVE' ? 1 : 2
        }
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aTarget"
                    count={count}
                    array={targets}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aSize"
                    count={count}
                    array={sizes}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-aOffset"
                    count={count}
                    array={offsets}
                    itemSize={1}
                />
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

function Shockwave({ progress }: { progress: number }) {
    const meshRef = useRef<THREE.Mesh>(null)

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[50, 50]} />
            <shaderMaterial
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                vertexShader={ShockwaveShader.vertexShader}
                fragmentShader={ShockwaveShader.fragmentShader}
                uniforms={useMemo(() => ({
                    uTime: { value: 0 },
                    uProgress: { value: progress }
                }), [progress])}
            />
        </mesh>
    )
}

export default function Finale() {
    const [phase, setPhase] = useState<AnimationPhase>('SYSTEM_HALT')
    const [progress, setProgress] = useState(0)
    const startTimeRef = useRef<number>(0)
    const { clock, scene } = useThree()
    const [messagePoints, setMessagePoints] = useState<THREE.Vector3[]>([])

    const setStage = useStore(state => state.setStage)

    // Sample points from text for constellation
    const lines = [
        "[ 运行时长: 50 年 ]",
        "[ 感谢你的无限算力 ]",
        "[ 生日快乐, 我的根目录 ]"
    ]

    useEffect(() => {
        startTimeRef.current = clock.getElapsedTime()

        // Logic to generate points from invisible text
        // This is a simplified way to get targets for particles
        const points: THREE.Vector3[] = []
        const tempPoints: THREE.Vector3[] = []

        // We use a small hack: create a temporary text geometry to sample from
        // But since we are in R3F, we'll wait for the font to load and then maybe just use pre-calculated layout or use <Text> properties
    }, [])

    useFrame((state) => {
        const elapsed = state.clock.getElapsedTime() - startTimeRef.current

        if (elapsed < PHASE_DURATIONS.SYSTEM_HALT) {
            setPhase('SYSTEM_HALT')
            setProgress(elapsed / PHASE_DURATIONS.SYSTEM_HALT)
        } else if (elapsed < PHASE_DURATIONS.SYSTEM_HALT + PHASE_DURATIONS.IMPLOSION) {
            setPhase('IMPLOSION')
            setProgress((elapsed - PHASE_DURATIONS.SYSTEM_HALT) / PHASE_DURATIONS.IMPLOSION)
        } else if (elapsed < PHASE_DURATIONS.SYSTEM_HALT + PHASE_DURATIONS.IMPLOSION + PHASE_DURATIONS.SHOCKWAVE) {
            setPhase('SHOCKWAVE')
            setProgress((elapsed - PHASE_DURATIONS.SYSTEM_HALT - PHASE_DURATIONS.IMPLOSION) / PHASE_DURATIONS.SHOCKWAVE)
        } else {
            setPhase('CONSTELLATION')
            const constellationElapsed = elapsed - PHASE_DURATIONS.SYSTEM_HALT - PHASE_DURATIONS.IMPLOSION - PHASE_DURATIONS.SHOCKWAVE
            setProgress(Math.min(1, constellationElapsed / PHASE_DURATIONS.CONSTELLATION))
        }
    })

    // Hidden text for layout calculation (could use it to sample points)
    return (
        <group>
            <color attach="background" args={['#00050a']} />

            <SingularityParticles phase={phase} progress={progress} messagePoints={messagePoints} />

            {phase === 'SHOCKWAVE' && <Shockwave progress={progress} />}

            {/* Hidden Text for reference or to sample from if we had a sampler logic */}
            {/* For now, we manually define target areas in the shader for simplified "constellation" clustering */}

            <group position={[0, 0, 0]}>
                {phase === 'CONSTELLATION' && progress > 0.8 && (
                    <Center top position={[0, 1.5, 0]}>
                        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                            <Text font={CHINESE_FONT} fontSize={0.8} color="#ffcc33">
                                {lines[0]}
                                <meshStandardMaterial emissive="#ffcc33" emissiveIntensity={2} toneMapped={false} transparent opacity={(progress - 0.8) * 5} />
                            </Text>
                        </Float>
                    </Center>
                )}
                {phase === 'CONSTELLATION' && progress > 0.85 && (
                    <Center position={[0, 0, 0]}>
                        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                            <Text font={CHINESE_FONT} fontSize={0.8} color="#ffcc33">
                                {lines[1]}
                                <meshStandardMaterial emissive="#ffcc33" emissiveIntensity={2} toneMapped={false} transparent opacity={(progress - 0.85) * 5} />
                            </Text>
                        </Float>
                    </Center>
                )}
                {phase === 'CONSTELLATION' && progress > 0.9 && (
                    <Center bottom position={[0, -1.5, 0]}>
                        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                            <Text font={CHINESE_FONT} fontSize={0.8} color="#ffcc33">
                                {lines[2]}
                                <meshStandardMaterial emissive="#ffcc33" emissiveIntensity={2} toneMapped={false} transparent opacity={(progress - 0.9) * 5} />
                            </Text>
                        </Float>
                    </Center>
                )}
            </group>

            <ambientLight intensity={0.2} />
            <pointLight position={[0, 0, 5]} intensity={2} color="#ffcc33" />
        </group>
    )
}
