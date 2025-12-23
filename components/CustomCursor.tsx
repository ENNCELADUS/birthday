'use client'
import { useEffect, useRef } from 'react'

export default function CustomCursor() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const trailRef = useRef<{ x: number, y: number, char: string, life: number }[]>([])
    const mouseRef = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Resize
        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        window.addEventListener('resize', resize)
        resize()

        // Mouse Move
        const onMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }
            // Add particle
            const chars = ['A', 'T', 'C', 'G']
            trailRef.current.push({
                x: e.clientX,
                y: e.clientY,
                char: chars[Math.floor(Math.random() * chars.length)],
                life: 1.0
            })
        }
        window.addEventListener('mousemove', onMouseMove)

        // Loop
        let animationFrame: number
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Update and draw trail
            for (let i = trailRef.current.length - 1; i >= 0; i--) {
                const p = trailRef.current[i]
                p.life -= 0.02
                p.y -= 0.5 // Float up slightly

                if (p.life <= 0) {
                    trailRef.current.splice(i, 1)
                    continue
                }

                ctx.font = '12px monospace'
                ctx.fillStyle = `rgba(0, 255, 255, ${p.life})`
                ctx.fillText(p.char, p.x, p.y)
            }

            // Draw main cursor (glowing dot)
            // Actually CSS can handle the main cursor, we just do the trail?
            // Vision: "A glowing point of light."
            ctx.beginPath()
            ctx.arc(mouseRef.current.x, mouseRef.current.y, 4, 0, Math.PI * 2)
            ctx.fillStyle = '#0ff'
            ctx.fill()
            ctx.shadowBlur = 10
            ctx.shadowColor = '#0ff'

            animationFrame = requestAnimationFrame(render)
        }
        render()

        return () => {
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', onMouseMove)
            cancelAnimationFrame(animationFrame)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 mix-blend-screen"
        />
    )
}
