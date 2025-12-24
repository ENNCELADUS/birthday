import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import './shaders/MorphingMaterial'

export interface MorphingParticlesRef {
    material: THREE.ShaderMaterial | null
}

const MorphingParticles = forwardRef<MorphingParticlesRef, { texture: THREE.Texture }>((props, ref) => {
    const materialRef = useRef<THREE.ShaderMaterial>(null)
    const count = 10000

    useImperativeHandle(ref, () => ({
        material: materialRef.current
    }))

    const { rainPos, helixPos, colors, offsets } = useMemo(() => {
        const rainPosArray = new Float32Array(count * 3)
        const helixPosArray = new Float32Array(count * 3)
        const colorArray = new Float32Array(count)
        const offsetArray = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            // Rain Positions: Plane distribution
            const rx = (Math.random() - 0.5) * 15
            const ry = (Math.random() - 0.5) * 10
            const rz = (Math.random() - 0.5) * 5 - 2
            rainPosArray[i * 3] = rx
            rainPosArray[i * 3 + 1] = ry
            rainPosArray[i * 3 + 2] = rz

            // Helix Positions
            const t = i / count
            const angle = t * Math.PI * 16 // 8 wraps
            const radius = 1.2
            const hy = (t - 0.5) * 10

            // Double helix logic
            const strand = Math.random() > 0.5 ? 0 : Math.PI
            const hx = Math.cos(angle + strand) * radius
            const hz = Math.sin(angle + strand) * radius

            helixPosArray[i * 3] = hx
            helixPosArray[i * 3 + 1] = hy
            helixPosArray[i * 3 + 2] = hz

            colorArray[i] = strand === 0 ? 0 : 1 // Cyan vs Magenta
            offsetArray[i] = Math.random()
        }

        return {
            rainPos: rainPosArray,
            helixPos: helixPosArray,
            colors: colorArray,
            offsets: offsetArray
        }
    }, [])

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value += delta
        }
    })

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={rainPos}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aPosHelix"
                    count={count}
                    array={helixPos}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aHelixColor"
                    count={count}
                    array={colors}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-aOffset"
                    count={count}
                    array={offsets}
                    itemSize={1}
                />
            </bufferGeometry>
            <morphingMaterial
                ref={materialRef}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                uTexture={props.texture}
            />
        </points>
    )
})

MorphingParticles.displayName = 'MorphingParticles'
export default MorphingParticles
