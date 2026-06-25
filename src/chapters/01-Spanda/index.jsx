import { useEffect, useRef } from 'react'

// themes: spanda, primal tremor, vibration, origin, pulse
// visualization: A single point at center emits concentric rings that expand, fade and return — like breathing

export default function Spanda() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const W = canvas.width = 550
        const H = canvas.height = 550
        const cx = W / 2
        const cy = H / 2

        let mouse = { x: cx, y: cy }
        let raf

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect()
            mouse.x = e.clientX - rect.left
            mouse.y = e.clientY - rect.top
        })

        const rings = Array.from({ length: 8 }, (_, i) => ({
            r: (i / 8) * 200,
            speed: 0.4 + i * 0.05,
            opacity: 1 - i / 8,
        }))

        const draw = () => {
            ctx.fillStyle = '#0a0a0a'
            ctx.fillRect(0, 0, W, H)

            const dist = Math.hypot(mouse.x - cx, mouse.y - cy)
            const pulse = 1 + (dist / 300) * 1.5

            rings.forEach((ring) => {
                ring.r += ring.speed * pulse
                if (ring.r > 260) ring.r = 0

                ctx.beginPath()
                ctx.arc(cx, cy, ring.r, 0, Math.PI * 2)
                ctx.strokeStyle = `rgba(220, 200, 170, ${ring.opacity * (1 - ring.r / 260)})`
                ctx.lineWidth = 1
                ctx.stroke()
            })

            // center dot
            ctx.beginPath()
            ctx.arc(cx, cy, 2, 0, Math.PI * 2)
            ctx.fillStyle = 'rgba(220, 200, 170, 0.9)'
            ctx.fill()

            raf = requestAnimationFrame(draw)
        }

        draw()
        return () => cancelAnimationFrame(raf)
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{ display: 'block', borderRadius: '4px' }}
        />
    )
}