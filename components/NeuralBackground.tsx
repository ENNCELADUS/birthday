'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Instance, Instances } from '@react-three/drei'

export default function NeuralBackground() {
    const count = 100
    const connectionDistance = 4

    // Generate random positions
    const particles = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 30
            const y = (Math.random() - 0.5) * 30
            const z = (Math.random() - 0.5) * 10 - 5 // Mostly behind
            temp.push({ position: [x, y, z], velocity: [(Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, 0] })
        }
        return temp
    }, [])

    const linesGeometry = useMemo(() => {
        return new THREE.BufferGeometry()
    }, [])

    const linesRef = useRef<THREE.LineSegments>(null)
    const pointsRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (!pointsRef.current || !linesRef.current) return

        // Update positions
        // Since we are using Instances, we'd normally update the InstancedMesh matrix.
        // But for <Instances> declarative, let's try a simpler approach or just use Points if performance is key.
        // Actually, for lines connecting points, we need direct access to coordinates every frame.
        // Let's manually update geometry buffers.

        const positions = linesRef.current.geometry.attributes.position?.array as Float32Array || new Float32Array(count * count * 3) // max potential
        let lineIndex = 0

        // Helper to get current positions from our JS state, simulation
        particles.forEach((p, i) => {
            p.position[0] += p.velocity[0]
            p.position[1] += p.velocity[1]

            // Bounce off imagined walls
            if (Math.abs(p.position[0]) > 15) p.velocity[0] *= -1
            if (Math.abs(p.position[1]) > 15) p.velocity[1] *= -1
        })

        // N^2 loop for connections (fine for 100 points)
        const connectedPositions = []
        for (let i = 0; i < count; i++) {
            for (let j = i + 1; j < count; j++) {
                const p1 = particles[i]
                const p2 = particles[j]
                const dx = p1.position[0] - p2.position[0]
                const dy = p1.position[1] - p2.position[1]
                const dz = p1.position[2] - p2.position[2]
                const distSq = dx * dx + dy * dy + dz * dz

                if (distSq < connectionDistance * connectionDistance) {
                    connectedPositions.push(p1.position[0], p1.position[1], p1.position[2])
                    connectedPositions.push(p2.position[0], p2.position[1], p2.position[2])
                }
            }
        }

        // Update Line Geometry
        linesRef.current.geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(connectedPositions, 3)
        )
        // linesRef.current.geometry.attributes.position.needsUpdate = true // setAttribute handles this

    })

    // Dot geometry
    const dotGeo = useMemo(() => new THREE.SphereGeometry(0.05, 8, 8), [])

    return (
        <group>
            {/* The Particles */}
            {/* We'll just render them as individual meshes for simplicity or InstancedMesh */}
            <Instances range={count} geometry={dotGeo}>
                <meshBasicMaterial color="#004444" transparent opacity={0.6} />
                {particles.map((data, i) => (
                    <Particle key={i} data={data} />
                ))}
            </Instances>

            {/* The Connections */}
            <lineSegments ref={linesRef}>
                <bufferGeometry />
                <lineBasicMaterial color="#008888" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
            </lineSegments>
        </group>
    )
}

function Particle({ data }: { data: any }) {
    const ref = useRef<any>(null)
    useFrame(() => {
        if (ref.current) {
            ref.current.position.set(data.position[0], data.position[1], data.position[2])
        }
    })
    return <Instance ref={ref} />
}
