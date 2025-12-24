import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BeamShader } from './shaders/SingularityShaders'
import { useStore } from '@/store/store'

export function PhotonBeam() {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.ShaderMaterial
            material.uniforms.uTime.value = state.clock.getElapsedTime()

            // Constant intensity
            material.uniforms.uIntensity.value = 0.15
        }
    })

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

            {/* Base Glow */}
            <pointLight position={[0, -2, 0]} intensity={2} color="#ffffff" distance={10} />
        </group>
    )
}
