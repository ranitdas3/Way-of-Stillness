import { useEffect, useRef } from 'react'

// CONCEPT: Nirjonotā (নির্জনতা) — Solitude
// MOTION ARCHETYPE: slow autonomous pulse — isolated presence
// GEOMETRY: scattered fixed points
// ORIGIN: three fixed positions across the canvas, loosely spread — no symmetry, no grid
//
// WHAT IT DOES:
// Three dots sit in stillness across the canvas. Each blinks slowly — not a flash, but a gentle
// swell of opacity rising and falling, like a firefly breathing light. Each dot has its own
// rhythm, slightly out of phase with the others — they never sync, never fully align. One is
// always dimmer while another is brighter. The cycle is slow, 3–5 seconds per pulse. Between
// peaks, each dot doesn't fully disappear — it fades to a very low opacity, barely there,
// like an ember. The canvas is mostly dark. The three lights are far apart. They do not communicate.
//
// MOUSE BEHAVIOR:
// Mouse proximity to any dot slows that dot's pulse rhythm — as if it becomes aware of
// being watched and holds its breath. It resumes its natural rhythm slowly after the mouse
// moves away.
//
// RULES:
// — Color: rgba(255, 255, 255, x) on #0a0a0a only
// — Opacity carries all emotional weight — no dramatic scale or color shifts
// — 60% of canvas empty at any moment
// — No randomness unless seeded and invisible to the eye
// — No text, UI, or decoration inside canvas
// — Smooth, never jumpy — requestAnimationFrame only
// — Cleanup: return () => cancelAnimationFrame(raf)
// — *Nirjonotā-specific: the three dots must never feel like a group. Spacing, phase offset,
//   and rhythm variation should make each one feel alone in its own dark. If they feel
//   like a pattern, the solitude is lost.*

export default function Nirjonota() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const W = canvas.width = 550
        const H = canvas.height = 550

        const mouse = { x: -1000, y: -1000 }
        let raf

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect()
            mouse.x = e.clientX - rect.left
            mouse.y = e.clientY - rect.top
        }

        const handleMouseLeave = () => {
            mouse.x = -1000
            mouse.y = -1000
        }

        canvas.addEventListener('mousemove', handleMouseMove)
        canvas.addEventListener('mouseleave', handleMouseLeave)

        // Seeded values to establish completely isolated, non-patterned behaviors
        // Locations: 3 scattered fixed coordinates (loosely spread, no grid, no symmetry)
        const dots = [
            {
                x: W * 0.24,
                y: H * 0.32,
                baseFreq: 0.024,      // cycle of ~4.3 seconds
                phase: 0.0,
                dotRadius: 3.0,
                auraRadius: 13.0
            },
            {
                x: W * 0.76,
                y: H * 0.22,
                baseFreq: 0.016,      // cycle of ~6.5 seconds
                phase: 2.14,          // phase shift
                dotRadius: 2.8,
                auraRadius: 12.0
            },
            {
                x: W * 0.42,
                y: H * 0.78,
                baseFreq: 0.020,      // cycle of ~5.2 seconds
                phase: 4.57,          // phase shift
                dotRadius: 3.2,
                auraRadius: 14.0
            }
        ]

        // Proximity configuration
        const detectionRadius = 130

        // Keep track of dynamic time/angle accumulator for each dot to change speed smoothly
        // instead of simply multiplying overall absolute frame count (which causes speed snaps)
        const dotStates = dots.map((dot) => ({
            ...dot,
            t: dot.phase,
            currentFreq: dot.baseFreq
        }))

        const draw = () => {
            // Background
            ctx.fillStyle = '#0a0a0a'
            ctx.fillRect(0, 0, W, H)

            dotStates.forEach((dot) => {
                // Calculate distance from mouse pointer
                const dx = mouse.x - dot.x
                const dy = mouse.y - dot.y
                const dist = Math.hypot(dx, dy)

                // Awareness factor: slows rhythm up to 75% when mouse is perfectly aligned
                let targetFreq = dot.baseFreq
                if (dist < detectionRadius) {
                    const proximityFactor = 1 - (dist / detectionRadius) // 0 to 1
                    targetFreq = dot.baseFreq * (1 - proximityFactor * 0.75)
                }

                // Interpolate current frequency smoothly to simulate slow awareness adjustment
                dot.currentFreq += (targetFreq - dot.currentFreq) * 0.03

                // Increment state angle by the smooth, dynamic frequency
                dot.t += dot.currentFreq

                // Pulse calculation: standard sine wave value (-1 to 1)
                const sinVal = Math.sin(dot.t)

                // Calculate opacities based on formula:
                // Dot opacity: 0.15 + 0.75 * sin(t) (clamped for safety, though math bounds it to [0.15-0.9] which is safe)
                const dotOpacity = Math.max(0, Math.min(1, 0.15 + 0.75 * sinVal))
                
                // Aura inner opacity: 0.04 + 0.12 * sin(t) (clamped)
                const auraInnerOpacity = Math.max(0, Math.min(1, 0.04 + 0.12 * sinVal))

                // 1. Draw Aura (radial gradient from white to transparent)
                const auraRadius = dot.auraRadius
                const grad = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, auraRadius)
                grad.addColorStop(0, `rgba(255, 255, 255, ${auraInnerOpacity})`)
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)')

                ctx.beginPath()
                ctx.arc(dot.x, dot.y, auraRadius, 0, Math.PI * 2)
                ctx.fillStyle = grad
                ctx.fill()

                // 2. Draw Dot (solid small circle) on top
                ctx.beginPath()
                ctx.arc(dot.x, dot.y, dot.dotRadius, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 255, 255, ${dotOpacity})`
                ctx.fill()
            })

            raf = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove)
            canvas.removeEventListener('mouseleave', handleMouseLeave)
            cancelAnimationFrame(raf)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{ display: 'block', borderRadius: '4px', background: '#0a0a0a' }}
        />
    )
}
