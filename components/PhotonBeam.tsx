import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BeamShader } from './shaders/SingularityShaders'
import { useStore } from '@/store/store'

export function PhotonBeam({ isOverclocked, onLaunch }: { isOverclocked: boolean, onLaunch?: () => void }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [isHovered, setIsHovered] = useState(false)
    const setHoverState = useStore((state) => state.setHoverState)
    const setHoverLabel = useStore((state) => state.setHoverLabel)

    useFrame((state) => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.ShaderMaterial
            material.uniforms.uTime.value = state.clock.getElapsedTime()

            // Smoothly interpolate intensity - REDUCED
            const targetIntensity = isOverclocked ? 1.0 : (isHovered ? 0.4 : 0.15)
            material.uniforms.uIntensity.value = THREE.MathUtils.lerp(
                material.uniforms.uIntensity.value,
                targetIntensity,
                0.1
            )
        }
    })

    const handlePointerOver = () => {
        if (!isOverclocked) {
            setIsHovered(true)
            setHoverState('INTERACTABLE')
            setHoverLabel('// OVERCLOCK_SYSTEM')
        }
    }

    const handlePointerOut = () => {
        setIsHovered(false)
        setHoverState('DEFAULT')
        setHoverLabel(null)
    }

    return (
        <group>
            <mesh
                ref={meshRef}
                position={[0, 10, 0]}
            >
                <cylinderGeometry args={[0.05, 0.05, 30, 8, 1, true]} />
                <shaderMaterial
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    vertexShader={BeamShader.vertexShader}
                    fragmentShader={BeamShader.fragmentShader}
                    uniforms={{
                        uTime: { value: 0 },
                        uIntensity: { value: 0.2 },
                        uColor: { value: new THREE.Color('#ffffff') }
                    }}
                />
            </mesh>

            {/* Clickable Area */}
            {!isOverclocked && (
                <mesh
                    position={[0, 0, 0]}
                    onPointerOver={handlePointerOver}
                    onPointerOut={handlePointerOut}
                    onClick={() => onLaunch && onLaunch()}
                >
                    <cylinderGeometry args={[0.5, 0.5, 4, 16]} />
                    <meshBasicMaterial transparent opacity={0} />
                </mesh>
            )}

            {/* Base Glow */}
            <pointLight position={[0, -2, 0]} intensity={isOverclocked ? 10 : 2} color="#ffffff" distance={10} />
        </group>
    )
}
