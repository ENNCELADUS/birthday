import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Text, Float } from '@react-three/drei'
import { getAssetPath } from '@/utils/paths'

type AnimationPhase = 'IMPLOSION' | 'SHOCKWAVE' | 'CRYSTALLIZATION' | 'SOLAR_SYSTEM'

const PHASE_DURATIONS = {
    IMPLOSION: 1.5,
    SHOCKWAVE: 0.5,
    CRYSTALLIZATION: 2.0,
}

function WireframeLogo({ phase, progress }: { phase: AnimationPhase, progress: number }) {
    const meshRef = useRef<THREE.Group>(null)
    const opacity = phase === 'CRYSTALLIZATION' ? progress * 0.5 : phase === 'SOLAR_SYSTEM' ? 0.5 : 0

    useFrame((state) => {
        if (!meshRef.current) return
        meshRef.current.rotation.z += 0.01
        meshRef.current.rotation.y += 0.005
    })

    if (phase === 'IMPLOSION' || phase === 'SHOCKWAVE') return null

    return (
        <group ref={meshRef} position={[0, 0, -5.5]}>
            {[1, 1.5, 2].map((s, i) => (
                <mesh key={i} scale={[s * 3, s * 3, s * 3]}>
                    <octahedronGeometry args={[1, 0]} />
                    <meshBasicMaterial
                        color="#ff00ff"
                        wireframe
                        transparent
                        opacity={opacity * (1 - i * 0.2)}
                        toneMapped={false}
                    />
                </mesh>
            ))}
        </group>
    )
}

const CHINESE_FONT = getAssetPath("/fonts/NotoSansSC.ttf");

function CrystallizedLetter({ char, position, phase, phaseProgress }: { char: string, position: [number, number, number], phase: AnimationPhase, phaseProgress: number }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [hovered, setHovered] = useState(false)

    // Crystallization effect: fly from a distance or scale up
    const opacity = phase === 'CRYSTALLIZATION' ? phaseProgress : phase === 'SOLAR_SYSTEM' ? 1 : 0
    const scale = phase === 'CRYSTALLIZATION' ? 0.8 + phaseProgress * 0.2 : phase === 'SOLAR_SYSTEM' ? 1 : 0

    // Mouse reaction in SOLAR_SYSTEM phase
    useFrame((state) => {
        if (phase !== 'SOLAR_SYSTEM' || !meshRef.current) return

        const mouseX = state.pointer.x
        const mouseY = state.pointer.y

        // Gentle rotation based on mouse
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, mouseX * 0.4, 0.05)
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -mouseY * 0.4, 0.05)

        // Slight bobbing
        meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 2 + position[0]) * 0.1
    })

    if (phase === 'IMPLOSION' || phase === 'SHOCKWAVE') return null

    return (
        <group>
            <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
                <Text
                    ref={meshRef}
                    position={position}
                    fontSize={0.9}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    scale={scale}
                    font={CHINESE_FONT}
                    onPointerOver={() => setHovered(true)}
                    onPointerOut={() => setHovered(false)}
                >
                    {char}
                    <meshStandardMaterial
                        emissive={hovered ? "#00ffff" : "#ffff00"}
                        emissiveIntensity={hovered ? 10 : 2}
                        toneMapped={false}
                        transparent
                        opacity={opacity}
                        depthTest={false}
                    />
                </Text>
            </Float>
        </group>
    )
}

export default function Finale() {
    const pointsRef = useRef<THREE.Points>(null)
    const [phase, setPhase] = useState<AnimationPhase>('IMPLOSION')
    const startTimeRef = useRef<number>(0)
    const { clock } = useThree()

    useEffect(() => {
        startTimeRef.current = clock.getElapsedTime()
    }, [])

    const PARTICLE_COUNT = 10000
    const { positions, colors, initialPositions, particleMetadata } = useMemo(() => {
        const positions = new Float32Array(PARTICLE_COUNT * 3)
        const colors = new Float32Array(PARTICLE_COUNT * 3)
        const initialPositions = new Float32Array(PARTICLE_COUNT * 3)
        const particleMetadata = new Float32Array(PARTICLE_COUNT * 3) // [armOffset, spiralTightness, distanceAlongArm]

        const palette = [
            new THREE.Color("#ff00ff"), // Magenta
            new THREE.Color("#00ffff"), // Cyan
            new THREE.Color("#ffff00"), // Yellow
            new THREE.Color("#ffffff"), // White
            new THREE.Color("#ff69b4"), // Hot Pink
            new THREE.Color("#00ff7f"), // Spring Green
            new THREE.Color("#ffa500"), // Orange
        ]

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            // Initial chaotic distribution
            const r = 10 + Math.random() * 20
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos((Math.random() * 2) - 1)

            const x = r * Math.sin(phi) * Math.cos(theta)
            const y = r * Math.sin(phi) * Math.sin(theta)
            const z = r * Math.cos(phi)

            positions[i * 3] = x
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = z

            initialPositions[i * 3] = x
            initialPositions[i * 3 + 1] = y
            initialPositions[i * 3 + 2] = z

            const color = palette[Math.floor(Math.random() * palette.length)]
            colors[i * 3] = color.r
            colors[i * 3 + 1] = color.g
            colors[i * 3 + 2] = color.b

            // Refined spiral metadata: 4 distinct arms
            particleMetadata[i * 3] = (Math.floor(Math.random() * 4) * (Math.PI / 2)) // Arm base angle
            particleMetadata[i * 3 + 1] = 0.4 + Math.random() * 0.1 // Spiral tightness variance
            particleMetadata[i * 3 + 2] = Math.random() // Distance along arm (0 to 1)
        }

        return { positions, colors, initialPositions, particleMetadata }
    }, [])

    useFrame((state) => {
        if (!pointsRef.current) return
        const elapsed = state.clock.getElapsedTime() - startTimeRef.current

        let currentPhase: AnimationPhase = 'IMPLOSION'
        let progress = 0

        if (elapsed < PHASE_DURATIONS.IMPLOSION) {
            currentPhase = 'IMPLOSION'
            progress = elapsed / PHASE_DURATIONS.IMPLOSION
        } else if (elapsed < PHASE_DURATIONS.IMPLOSION + PHASE_DURATIONS.SHOCKWAVE) {
            currentPhase = 'SHOCKWAVE'
            progress = (elapsed - PHASE_DURATIONS.IMPLOSION) / PHASE_DURATIONS.SHOCKWAVE
        } else if (elapsed < PHASE_DURATIONS.IMPLOSION + PHASE_DURATIONS.SHOCKWAVE + PHASE_DURATIONS.CRYSTALLIZATION) {
            currentPhase = 'CRYSTALLIZATION'
            progress = (elapsed - PHASE_DURATIONS.IMPLOSION - PHASE_DURATIONS.SHOCKWAVE) / PHASE_DURATIONS.CRYSTALLIZATION
        } else {
            currentPhase = 'SOLAR_SYSTEM'
            progress = 1
        }

        if (currentPhase !== phase) setPhase(currentPhase)

        const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
        const posArray = posAttr.array as Float32Array
        const time = state.clock.getElapsedTime()

        // Opacity control for points: dim them if in SOLAR_SYSTEM
        const pointsMat = pointsRef.current.material as THREE.PointsMaterial
        if (currentPhase === 'SOLAR_SYSTEM') {
            pointsMat.opacity = THREE.MathUtils.lerp(pointsMat.opacity, 0.3, 0.05)
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3
            let x, y, z

            if (currentPhase === 'IMPLOSION') {
                // Sucking inward
                const factor = 1 - Math.pow(progress, 2)
                x = initialPositions[i3] * factor
                y = initialPositions[i3 + 1] * factor
                z = initialPositions[i3 + 2] * factor
            } else if (currentPhase === 'SHOCKWAVE') {
                // Exploding outward
                const force = progress * 25
                const dirX = initialPositions[i3], dirY = initialPositions[i3 + 1], dirZ = initialPositions[i3 + 2]
                const mag = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ) || 1
                x = (dirX / mag) * force; y = (dirY / mag) * force; z = (dirZ / mag) * force
            } else {
                // Logarithmic Spiral Galaxy math
                const armBaseAngle = particleMetadata[i3]
                const tightness = particleMetadata[i3 + 1]
                const t = particleMetadata[i3 + 2] // 0 to 1 along arm

                const radius = 2 + t * 18
                const angle = armBaseAngle + (radius * tightness) + (time * 0.15)

                // Add some thickness and scatter
                const scatter = (Math.sin(i * 0.1) * 0.5) * (1 - t * 0.5)
                const targetX = Math.cos(angle) * (radius + scatter)
                const targetY = (Math.sin(i * 0.5) * 1.5) * (1 - t * 0.8) // thinner at center
                const targetZ = Math.sin(angle) * (radius + scatter)

                if (currentPhase === 'CRYSTALLIZATION') {
                    // Transition from shockwave edge to spiral
                    const mag = Math.sqrt(initialPositions[i3] ** 2 + initialPositions[i3 + 1] ** 2 + initialPositions[i3 + 2] ** 2) || 1
                    const startX = (initialPositions[i3] / mag) * 25
                    const startY = (initialPositions[i3 + 1] / mag) * 25
                    const startZ = (initialPositions[i3 + 2] / mag) * 25

                    x = THREE.MathUtils.lerp(startX, targetX, progress)
                    y = THREE.MathUtils.lerp(startY, targetY, progress)
                    z = THREE.MathUtils.lerp(startZ, targetZ, progress)
                } else {
                    x = targetX; y = targetY; z = targetZ
                }
            }
            posArray[i3] = x; posArray[i3 + 1] = y; posArray[i3 + 2] = z
        }
        posAttr.needsUpdate = true
    })

    const line1 = "[ 运行时长：50 年 ]"
    const line2 = "[ 感谢你的无限算力 ]"
    const line3 = "[ 生日快乐，我的根目录 ]"

    // Calculate progress for crystallization phase
    const elapsed = clock.getElapsedTime() - startTimeRef.current
    const crystallizationStart = PHASE_DURATIONS.IMPLOSION + PHASE_DURATIONS.SHOCKWAVE
    const phaseProgress = Math.max(0, Math.min(1, (elapsed - crystallizationStart) / PHASE_DURATIONS.CRYSTALLIZATION))

    return (
        <group>
            <color attach="background" args={['#000308']} />

            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={PARTICLE_COUNT}
                        array={positions}
                        itemSize={3}
                    />
                    <bufferAttribute attach="attributes-color" count={PARTICLE_COUNT} array={colors} itemSize={3} />
                </bufferGeometry>
                <pointsMaterial
                    vertexColors
                    size={0.12}
                    sizeAttenuation
                    transparent
                    opacity={0.9}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </points>

            <WireframeLogo phase={phase} progress={phaseProgress} />

            <group position={[0, 1.8, 0]}>
                {line1.split("").map((char, i) => (
                    <CrystallizedLetter
                        key={`l1-${i}`}
                        char={char}
                        position={[(i - (line1.length - 1) / 2) * 0.9, 1.5, 0]}
                        phase={phase}
                        phaseProgress={phaseProgress}
                    />
                ))}
                {line2.split("").map((char, i) => (
                    <CrystallizedLetter
                        key={`l2-${i}`}
                        char={char}
                        position={[(i - (line2.length - 1) / 2) * 0.9, 0, 0]}
                        phase={phase}
                        phaseProgress={phaseProgress}
                    />
                ))}
                {line3.split("").map((char, i) => (
                    <CrystallizedLetter
                        key={`l3-${i}`}
                        char={char}
                        position={[(i - (line3.length - 1) / 2) * 0.9, -1.5, 0]}
                        phase={phase}
                        phaseProgress={phaseProgress}
                    />
                ))}
            </group>

            <ambientLight intensity={1} />
        </group>
    )
}
