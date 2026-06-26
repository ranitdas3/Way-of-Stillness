import { useEffect, useRef } from 'react'

// themes: bishad, slow filling, surrender, radial cloud, no arrival, uneven release
// visualization: 1000 tiny particles drift inward from the edges to accumulate at the center.
// They hold as a soft cloud, then dissolve unevenly (lose opacity one by one).

function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

export default function Bishad() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const W = canvas.width = 550
        const H = canvas.height = 550
        const cx = W / 2
        const cy = H / 2

        let mouse = { x: W / 2, y: H / 2 }
        let currentDt = 0.001
        let currentLuminosity = 0.5
        let cycleCount = 0
        let t = 0.0 // cycle parameter [0, 1]
        let raf

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect()
            mouse.x = e.clientX - rect.left
            mouse.y = e.clientY - rect.top
        })

        let particles = []

        // Function to initialize/regenerate particles with a specific cycle seed
        const initParticles = (seed) => {
            const random = mulberry32(seed)
            particles = Array.from({ length: 1000 }, () => {
                const angle = random() * Math.PI * 2
                // Start distributed far out near the edges
                const r0 = 160 + random() * 220
                // Target radius near center (forming a diffuse cloud instead of a sharp dot)
                const targetR = random() * 50
                return {
                    angle,
                    r0,
                    r: r0,
                    targetR,
                    easeSpeed: 0.008 + random() * 0.025,
                    baseOpacity: 0.15 + random() * 0.65,
                    size: 0.6 + random() * 0.7,
                    // Unique fade onset during the dissolution phase
                    dissolveThreshold: 0.70 + random() * 0.12,
                    dissolveSpeed: 10 + random() * 15
                }
            })
        }

        // Initialize first cycle
        initParticles(42 + cycleCount)

        const draw = () => {
            ctx.fillStyle = '#0a0a0a'
            ctx.fillRect(0, 0, W, H)

            // Mouse X controls accumulation speed
            const targetDt = 0.0003 + (mouse.x / W) * 0.0027
            currentDt += (targetDt - currentDt) * 0.1

            // Mouse Y controls peak luminosity
            const targetLuminosity = 0.12 + (mouse.y / H) * 0.88
            currentLuminosity += (targetLuminosity - currentLuminosity) * 0.1

            // Progress the cycle
            if (t < 0.65) {
                t += currentDt
            } else {
                // Fixed comfortable speed for dissolution/silence so it's not rushed by Mouse X
                t += 0.0022
            }

            // Reset and trigger next asymmetric cycle
            if (t >= 1.0) {
                t = 0.0
                cycleCount++
                initParticles(42 + cycleCount)
            }

            particles.forEach((p) => {
                // Update radius towards the center
                if (t < 0.70) {
                    p.r = p.r0 - (p.r0 - p.targetR) * Math.min(1.0, (t / 0.65))
                }

                // Compute particle coordinate
                const x = cx + Math.cos(p.angle) * p.r
                const y = cy + Math.sin(p.angle) * p.r

                // Compute opacity based on cycle phase
                let opacity = p.baseOpacity * currentLuminosity

                // Fade-in at start of cycle
                if (t < 0.10) {
                    opacity *= (t / 0.10)
                }

                // Dissolution phase
                if (t >= p.dissolveThreshold) {
                    const fadeProgress = (t - p.dissolveThreshold) * p.dissolveSpeed
                    opacity *= Math.max(0, 1 - fadeProgress)
                }

                // Silence phase
                if (t >= 0.90) {
                    opacity = 0
                }

                // Draw tiny particle
                if (opacity > 0) {
                    ctx.beginPath()
                    ctx.arc(x, y, p.size, 0, Math.PI * 2)
                    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
                    ctx.fill()
                }
            })

            raf = requestAnimationFrame(draw)
        }

        draw()
        return () => cancelAnimationFrame(raf)
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{ display: 'block', borderRadius: '4px', background: '#0a0a0a' }}
        />
    )
}
