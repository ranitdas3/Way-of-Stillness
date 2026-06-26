import { useEffect, useRef } from 'react'

// CONCEPT: Nirvāṇa (নির্বাণ) — Extinction / Release
// MOTION ARCHETYPE: contained chaos within slow order
// GEOMETRY: vertical flame column at center, loose orbital ring surrounding it
// ORIGIN: canvas center
//
// WHAT IT DOES:
// A flame made of dots burns at the center of the canvas — small, medium intensity, not large.
// Dots rise from a narrow base, accelerating upward, spreading slightly as they climb, then fading
// out before reaching the ring. The motion is fire-like — not random, but turbulent. The base is
// denser, brighter. The tips are sparse, dim, dissolving. The flame is alive but contained.
//
// Around it, at a comfortable distance, a ring of dots orbits slowly — one full rotation every
// 10–14 seconds. The dots are slightly unevenly spaced, as if gathered rather than placed. They
// are calm, dim, unhurried. The ring does not react to the fire. The fire does not react to the
// ring. They coexist — one restless, one still — sharing the same center.
//
// The whole composition sits mid-canvas, occupying roughly 30–35% of the canvas height. The rest is dark.
//
// MOUSE BEHAVIOR:
// Mouse Y controls the fire's intensity — high on canvas pulls the flame low and quiet, low on
// canvas lets it rise taller and denser. The ring's rotation speed remains constant regardless.
//
// RULES:
// — Color: rgba(255, 255, 255, x) on #0a0a0a only
// — Opacity carries all emotional weight — no dramatic scale or color shifts
// — 60% of canvas empty at any moment
// — No randomness unless seeded and invisible to the eye
// — No text, UI, or decoration inside canvas
// — Smooth, never jumpy — requestAnimationFrame only
// — Cleanup: return () => cancelAnimationFrame(raf)
// — *Nirvāṇa-specific: the fire and the ring must never feel like they belong to the same system.
//   The fire is what hasn't ended yet. The ring is what remains after. If they feel coordinated,
//   the tension is lost.*

function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

export default function Nirvana() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const W = canvas.width = 550
        const H = canvas.height = 550

        const cx = W / 2
        const cy = H / 2

        let mouseY = H / 2
        let targetMouseY = H / 2
        let raf

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect()
            targetMouseY = e.clientY - rect.top
        }

        canvas.addEventListener('mousemove', handleMouseMove)

        // Seeded random number generator
        const rng = mulberry32(0x10bfa)

        // 1. Orbital ring initialization (Three concentric rows for depth)
        // Radii: inner (60px), middle (65px), outer (70px)
        const ringRows = [
            { radius: 60, opacityMultiplier: 1.0, dotCount: 38 },  // brightest inner
            { radius: 66, opacityMultiplier: 0.65, dotCount: 44 }, // middle
            { radius: 72, opacityMultiplier: 0.38, dotCount: 48 }  // dimmest outer
        ]

        const orbitalDots = ringRows.map((row) => {
            return Array.from({ length: row.dotCount }, (_, i) => {
                const baseAngle = (i / row.dotCount) * Math.PI * 2
                const jitter = (rng() * 0.09 - 0.045)
                return {
                    radius: row.radius,
                    angleOffset: baseAngle + jitter,
                    opacity: (0.16 + rng() * 0.14) * row.opacityMultiplier,
                    size: (0.7 + rng() * 0.5)
                }
            })
        })

        // Fire base center: cy + 15. We'll use this vertical coordinate for the ring center as well
        const centerYBase = cy + 15

        // 2. Central turbulent flame initialization (130% wider and taller again)
        const flameParticleCount = 180
        const flameParticles = Array.from({ length: flameParticleCount }, () => {
            return {
                xOffset: (rng() * 34 - 17), // 130% bigger horizontal base
                yProgress: rng(),           // Random progress to scatter heights initially
                speedFactor: 0.007 + rng() * 0.008,
                lateralSeed: rng() * Math.PI * 2,
                size: 1.0 + rng() * 1.3,     // 130% larger sizes
                baseOpacity: 0.25 + rng() * 0.35
            }
        })

        // Configuration loops
        let time = 0
        const draw = () => {
            // Clear screen
            ctx.fillStyle = '#0a0a0a'
            ctx.fillRect(0, 0, W, H)

            time += 0.015

            // Interpolate Mouse Y
            mouseY += (targetMouseY - mouseY) * 0.05
            
            // Map Mouse Y: high on canvas (mouseY ~ 0) -> 0.2 (low/quiet), low (mouseY ~ H) -> 1.8 (taller/denser)
            const intensity = 0.2 + (1 - mouseY / H) * 1.6

            // Dynamic flame vertical travel length based on mouse intensity (130% scale of 91px -> 118px)
            const flameMaxHeight = 118 * intensity

            // --- A. Draw Concentric Orbital Rings (Upper Half Only, Center at Flame Base) ---
            // Rotation speed: complete cycle every ~12 seconds
            const ringAngle = time * 0.55 
            orbitalDots.forEach((rowDots) => {
                rowDots.forEach((dot) => {
                    const currentAngle = ringAngle + dot.angleOffset
                    const rx = cx + Math.cos(currentAngle) * dot.radius
                    const ry = centerYBase + Math.sin(currentAngle) * dot.radius // centered at base

                    // Only render if it sits on the top half relative to the base center (ry < centerYBase)
                    if (ry < centerYBase) {
                        ctx.beginPath()
                        ctx.arc(rx, ry, dot.size, 0, Math.PI * 2)
                        ctx.fillStyle = `rgba(255, 255, 255, ${dot.opacity})`
                        ctx.fill()
                    }
                })
            })

            // --- B. Draw Central Flame Column (130% Bigger) ---
            flameParticles.forEach((p) => {
                // Advance height progress
                p.yProgress += p.speedFactor * (0.8 + intensity * 0.4)
                if (p.yProgress > 1.0) {
                    p.yProgress = 0
                    p.xOffset = (rng() * 20 - 10) // reset to narrow base
                    p.lateralSeed = rng() * Math.PI * 2
                }

                // Accelerate upward: yOffset from base follows quadratic scaling
                const dy = p.yProgress * flameMaxHeight
                const py = centerYBase - dy // Center bottom offset at centerYBase

                // Turbulence / horizontal spreading as they climb (scaled up by 1.3)
                const lateralFrequency = 6 + p.yProgress * 10
                const lateralSwing = Math.sin(time * lateralFrequency + p.lateralSeed) * (5 + p.yProgress * 21)
                const px = cx + p.xOffset + lateralSwing

                // Opacity distribution: denser/brighter base, dissolving at the tip
                let opacity = p.baseOpacity
                if (p.yProgress < 0.25) {
                    // Ramp up quickly near the base
                    opacity *= (p.yProgress / 0.25)
                } else {
                    // Dissolve progressively as they reach the tip
                    opacity *= (1.0 - p.yProgress)
                }

                if (opacity > 0.01) {
                    ctx.beginPath()
                    ctx.arc(px, py, p.size, 0, Math.PI * 2)
                    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
                    ctx.fill()
                }
            })

            raf = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove)
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
