import { useEffect, useRef } from 'react'

// themes: delta, branching, river, divergence, no return
// visualization: A single flow splits into branches that keep splitting, never rejoining

export default function Delta() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const W = canvas.width = 550
        const H = canvas.height = 550

        let mouse = { x: W / 2, y: H / 2 }
        let raf

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect()
            mouse.x = e.clientX - rect.left
            mouse.y = e.clientY - rect.top
        })

        const drawBranch = (x, y, angle, length, depth) => {
            if (depth === 0 || length < 2) return

            const ex = x + Math.cos(angle) * length
            const ey = y + Math.sin(angle) * length

            const opacity = (depth / 10) * 0.8
            const weight = depth * 0.4

            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(ex, ey)
            ctx.strokeStyle = `rgba(180, 155, 110, ${opacity})`
            ctx.lineWidth = weight
            ctx.stroke()

            const spread = (mouse.x / W) * 0.6 + 0.3
            const leftAngle = angle - spread * (0.4 + Math.random() * 0.2)
            const rightAngle = angle + spread * (0.4 + Math.random() * 0.2)
            const decay = 0.68 + (mouse.y / H) * 0.1

            drawBranch(ex, ey, leftAngle, length * decay, depth - 1)
            drawBranch(ex, ey, rightAngle, length * decay, depth - 1)
        }

        const draw = () => {
            ctx.fillStyle = 'rgba(10, 10, 10, 0.25)'
            ctx.fillRect(0, 0, W, H)

            drawBranch(W / 2, 60, Math.PI / 2, 110, 9)

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