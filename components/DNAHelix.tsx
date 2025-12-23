import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'

export default function DNAHelix({ opacity = 1 }: { opacity?: number }) {
    const meshRef = useRef<THREE.InstancedMesh>(null)

    // Generate DNA structure
    const { positions, colors } = useMemo(() => {
        const count = 100 // Nucleotide pairs
        const positions = []
        const colors = []
        const colorA = new THREE.Color('#00ffff') // Cyan
        const colorB = new THREE.Color('#ff00ff') // Magenta

        for (let i = 0; i < count; i++) {
            const t = i / count
            const angle = t * Math.PI * 10
            const radius = 1
            const y = (t - 0.5) * 10 // Height

            // Strand 1
            const x1 = Math.cos(angle) * radius
            const z1 = Math.sin(angle) * radius

            // Strand 2 (Offset by PI)
            const x2 = Math.cos(angle + Math.PI) * radius
            const z2 = Math.sin(angle + Math.PI) * radius

            positions.push(x1, y, z1)
            positions.push(x2, y, z2)

            // Bridge
            // We could add points between them, but for now just the strands

            colors.push(colorA.r, colorA.g, colorA.b)
            colors.push(colorB.r, colorB.g, colorB.b)
        }

        return {
            positions: new Float32Array(positions),
            colors: new Float32Array(colors)
        }
    }, [])

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.5

            // Update individual instances if needed (for wave effect)
            // For now, static geometry simply rotating
        }
    })

    // Set instance matrices
    useMemo(() => {
        if (!meshRef.current) return
        const tempObject = new THREE.Object3D()
        for (let i = 0; i < positions.length / 3; i++) {
            tempObject.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
            tempObject.scale.setScalar(0.1)
            tempObject.updateMatrix()
            meshRef.current.setMatrixAt(i, tempObject.matrix)
            meshRef.current.setColorAt(i, new THREE.Color(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]))
        }
        meshRef.current.instanceMatrix.needsUpdate = true
    }, [positions, colors]) // Warning: meshRef.current might be null on first render, need simpler approach

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length / 3]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial transparent opacity={opacity} toneMapped={false} />
        </instancedMesh>
    )
}
