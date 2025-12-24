import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { ParticleShader, ShockwaveShader } from './shaders/SingularityShaders'
import { CakeReactor } from './CakeReactor'
import { PhotonBeam } from './PhotonBeam'

type AnimationPhase = 'IMPLOSION' | 'VOID' | 'CONSTRUCT' | 'IGNITION' | 'SINGULARITY' | 'MESSAGE'

const PHASE_DURATIONS = {
    IMPLOSION: 1.0,
    VOID: 0.5,
    CONSTRUCT: 3.0,
    IGNITION: 2.0,
    SINGULARITY: 2.0,
    MESSAGE: 12.0, // Extended for elegant snap
}

// Utility to sample points from text using an offscreen canvas
function sampleTextPoints(lines: string[], count: number) {
    if (typeof document === 'undefined') return [];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return [];

    canvas.width = 1000;
    canvas.height = 600;

    // Background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Style text
    const fontSize = 100;
    ctx.font = `bold ${fontSize}px "Share Tech Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';

    // Draw lines
    lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, canvas.height / 2 + (i - 1) * 120);
    });

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    const validPixels: { x: number, y: number, isEdge: boolean }[] = [];

    // Simple edge detection and pixel collection
    for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
            const i = (y * canvas.width + x) * 4;
            if (pixels[i] > 128) {
                // Check if it's an edge (check neighbors)
                const isEdge =
                    x === 0 || x === canvas.width - 1 || y === 0 || y === canvas.height - 1 ||
                    pixels[i - 4] < 128 || pixels[i + 4] < 128 ||
                    pixels[i - (canvas.width * 4)] < 128 || pixels[i + (canvas.width * 4)] < 128;

                validPixels.push({ x, y, isEdge });
            }
        }
    }

    const points: THREE.Vector3[] = [];
    const edgePixels = validPixels.filter(p => p.isEdge);
    const fillPixels = validPixels.filter(p => !p.isEdge);

    for (let i = 0; i < count; i++) {
        // 70% Edge Bias
        const useEdge = Math.random() < 0.7 && edgePixels.length > 0;
        const pool = useEdge ? edgePixels : (fillPixels.length > 0 ? fillPixels : edgePixels);
        const pixel = pool[Math.floor(Math.random() * pool.length)];

        if (pixel) {
            // Map 2D canvas coords to 3D space (-14 to 14 range roughly)
            points.push(new THREE.Vector3(
                (pixel.x / canvas.width - 0.5) * 28,
                (0.5 - pixel.y / canvas.height) * 16,
                (Math.random() - 0.5) * 0.5
            ));
        } else {
            points.push(new THREE.Vector3(0, 0, 0));
        }
    }

    return points;
}

function SingularityParticles({ phase, progress, transition, messagePoints }: { phase: AnimationPhase, progress: number, transition: number, messagePoints: THREE.Vector3[] }) {
    const materialRef = useRef<THREE.ShaderMaterial>(null)
    const { size } = useThree()
    const count = 120000;

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

    useEffect(() => {
        startTimeRef.current = clock.getElapsedTime()
        phaseStartTimeRef.current = startTimeRef.current

        // Sample text for particles
        const points = sampleTextPoints([
            "[ SYSTEM_UPTIME : 50 YEARS ]",
            "[ CORE_STABILITY : PERFECT ]",
            "[ HAPPY BIRTHDAY, MOTHER ]"
        ], 120000);
        setMessagePoints(points);
    }, [])

    const handleLaunch = () => {
        if (phase === 'CONSTRUCT' && !isOverclocked) {
            setIsOverclocked(true)
            dispatchAudio('ignition')
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
            <color attach="background" args={[phase === 'IMPLOSION' || phase === 'VOID' ? '#000000' : (transition > 0.5 ? '#000000' : '#00050a')]} />

            <SingularityParticles phase={phase} progress={progress} transition={transition} messagePoints={messagePoints} />

            {(phase === 'CONSTRUCT' || phase === 'IGNITION') && (
                <>
                    <CakeReactor />
                    <PhotonBeam isOverclocked={isOverclocked} onLaunch={handleLaunch} />
                </>
            )}

            {phase === 'SINGULARITY' && <SonicBoom progress={progress} />}

            {phase === 'MESSAGE' && (
                <group>
                    <pointLight position={[0, 10, -5]} intensity={15 * progress} color="#ffcc33" distance={30} />
                    <pointLight position={[0, -5, -5]} intensity={10 * progress} color="#ffaa00" distance={20} />
                </group>
            )}

            <ambientLight intensity={phase === 'MESSAGE' ? 0.3 : 0.1} />
        </group>
    )
}
