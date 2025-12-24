'use client'
import { useEffect, useRef } from 'react'
import { useStore } from '@/store/store'

export default function CustomCursor() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const trailRef = useRef<{ x: number, y: number, char: string, life: number }[]>([])
    const mouseRef = useRef({ x: 0, y: 0 })
    const hoverState = useStore((state) => state.hoverState)
    const hoverLabel = useStore((state) => state.hoverLabel)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        window.addEventListener('resize', resize)
        resize()

        const onMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }
            const chars = ['A', 'T', 'C', 'G']
            trailRef.current.push({
                x: e.clientX,
                y: e.clientY,
                char: chars[Math.floor(Math.random() * chars.length)],
                life: 1.0
            })
        }
        window.addEventListener('mousemove', onMouseMove)

        let animationFrame: number
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Update and draw trail
            for (let i = trailRef.current.length - 1; i >= 0; i--) {
                const p = trailRef.current[i]
                p.life -= 0.02
                p.y -= 0.5

                if (p.life <= 0) {
                    trailRef.current.splice(i, 1)
                    continue
                }

                ctx.font = '10px monospace'
                ctx.fillStyle = `rgba(0, 255, 255, ${p.life * 0.5})`
                ctx.fillText(p.char, p.x, p.y)
            }

            const { x, y } = mouseRef.current
            const isInteractable = hoverState === 'INTERACTABLE'

            // Draw holographic crosshair if interactable
            if (isInteractable) {
                ctx.strokeStyle = '#0ff'
                ctx.lineWidth = 1

                // Crosshair lines
                const size = 15
                const gap = 5

                ctx.beginPath()
                ctx.moveTo(x - size, y); ctx.lineTo(x - gap, y) // Left
                ctx.moveTo(x + gap, y); ctx.lineTo(x + size, y) // Right
                ctx.moveTo(x, y - size); ctx.lineTo(x, y - gap) // Top
                ctx.moveTo(x, y + gap); ctx.lineTo(x, y + size) // Bottom
                ctx.stroke()

                // Corner brackets
                const bSize = 4
                ctx.beginPath()
                ctx.moveTo(x - size, y - size + bSize); ctx.lineTo(x - size, y - size); ctx.lineTo(x - size + bSize, y - size)
                ctx.moveTo(x + size, y - size + bSize); ctx.lineTo(x + size, y - size); ctx.lineTo(x + size - bSize, y - size)
                ctx.moveTo(x - size, y + size - bSize); ctx.lineTo(x - size, y + size); ctx.lineTo(x - size + bSize, y + size)
                ctx.moveTo(x + size, y + size - bSize); ctx.lineTo(x + size, y + size); ctx.lineTo(x + size - bSize, y + size)
                ctx.stroke()

                // Label
                if (hoverLabel) {
                    ctx.font = '10px monospace'
                    ctx.fillStyle = '#0ff'
                    ctx.fillText(hoverLabel, x + size + 5, y + 5)
                }
            } else {
                // Default: glowing dot
                ctx.beginPath()
                ctx.arc(x, y, 3, 0, Math.PI * 2)
                ctx.fillStyle = '#0ff'
                ctx.fill()
            }

            animationFrame = requestAnimationFrame(render)
        }
        render()

        return () => {
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', onMouseMove)
            cancelAnimationFrame(animationFrame)
        }
    }, [hoverState, hoverLabel]) // Re-run effect when state change

    return (
        <canvas
            ref={canvasRef}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999, mixBlendMode: 'screen' }}
        />
    )
}
