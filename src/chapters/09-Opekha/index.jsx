import { useEffect, useRef } from 'react'

// CONCEPT: Opekha (অপেক্ষা) — Waiting
// MOTION ARCHETYPE: stillness against drift — one fixed presence, world in motion
// GEOMETRY: single fixed point against a field of upward drift
// ORIGIN: dot — canvas center, slightly left of center. particles — bottom edge, distributed across full width
//
// WHAT IT DOES:
// A single dot sits near the center of the canvas, pulsing slowly with an aura — same as Nirjonotā,
// same slow breath, same radial glow. It does not move. Around it, hundreds of very faint
// particles rise continuously from the bottom edge — slow, unhurried, each at a slightly different
// speed. They pass the dot, continue upward, and dissolve near the top. The particles are
// barely visible — low opacity, small, no individual character. Together they create the
// impression that the entire canvas is drifting upward, like smoke, or time passing. The dot remains.
// It has been there. It will stay.
//
// MOUSE BEHAVIOR:
// Mouse Y controls the speed of the rising particles — high on canvas slows everything almost to
// stillness, low on canvas lets them drift faster. The dot is unaffected either way.
//
// RULES:
// — Color: rgba(255, 255, 255, x) on #0a0a0a only
// — Opacity carries all emotional weight — no dramatic scale or color shifts
// — 60% of canvas empty at any moment
// — No randomness unless seeded and invisible to the eye
// — No text, UI, or decoration inside canvas
// — Smooth, never jumpy — requestAnimationFrame only
// — Cleanup: return () => cancelAnimationFrame(raf)
// — *Opekha-specific: the dot must feel anchored, not floating. The particles must feel like
//   the world moving, not decoration. If the dot seems to drift even slightly, the waiting is lost.*

function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

export default function Opekha() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const W = canvas.width = 550
        const H = canvas.height = 550

        let mouseY = H / 2
        let targetMouseY = H / 2
        let raf

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect()
            targetMouseY = e.clientY - rect.top
        }

        canvas.addEventListener('mousemove', handleMouseMove)

        // Anchored dot: slightly left of center
        const dotX = W * 0.44
        const dotY = H * 0.50
        const dotRadius = 3.0
        const auraRadius = 13.0
        const pulseSpeed = 0.020 // slow breath cycle
        let pulseAngle = 0

        // Seeded random number generator
        const rng = mulberry32(0x0e5e0a)

        // Faint upward drifting particles configuration
        const particleCount = 200
        const particles = Array.from({ length: particleCount }, () => {
            const x = rng() * W
            const y = rng() * H // Start scattered to fill screen initially
            const speedFactor = 0.2 + rng() * 0.45
            const baseOpacity = 0.05 + rng() * 0.08
            const size = 0.5 + rng() * 0.8

            return {
                x,
                y,
                speedFactor,
                baseOpacity,
                size
            }
        })

        const draw = () => {
            // Background
            ctx.fillStyle = '#0a0a0a'
            ctx.fillRect(0, 0, W, H)

            // Smoothly interpolate mouseY
            mouseY += (targetMouseY - mouseY) * 0.05
            
            // Map Mouse Y position to flow speed modifier
            // High on canvas (mouseY ~ 0) -> slow speed modifier (~0.05)
            // Low on canvas (mouseY ~ H) -> faster speed modifier (~1.6)
            const speedModifier = 0.05 + (1 - mouseY / H) * 1.55

            // 1. Update and draw drifting background particles
            particles.forEach((p) => {
                // Rise upward based on speed factor & mouse-driven multiplier
                p.y -= p.speedFactor * speedModifier

                // Recycle particle at bottom once it drifts off the top
                if (p.y < -10) {
                    p.y = H + 10
                    p.x = rng() * W
                }

                // Dissolve/fade out near the top edge
                let fadeMultiplier = 1
                if (p.y < 120) {
                    fadeMultiplier = Math.max(0, p.y / 120)
                }

                const finalOpacity = p.baseOpacity * fadeMultiplier

                if (finalOpacity > 0.01) {
                    ctx.beginPath()
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                    ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`
                    ctx.fill()
                }
            })

            // 2. Pulse and draw the anchored waiting dot
            pulseAngle += pulseSpeed
            const sinVal = Math.sin(pulseAngle)

            // Dot opacity: 0.15 + 0.75 * sin(t)
            const dotOpacity = Math.max(0, Math.min(1, 0.15 + 0.75 * sinVal))
            // Aura inner opacity: 0.04 + 0.12 * sin(t)
            const auraInnerOpacity = Math.max(0, Math.min(1, 0.04 + 0.12 * sinVal))

            // Draw Aura first
            const grad = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, auraRadius)
            grad.addColorStop(0, `rgba(255, 255, 255, ${auraInnerOpacity})`)
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)')

            ctx.beginPath()
            ctx.arc(dotX, dotY, auraRadius, 0, Math.PI * 2)
            ctx.fillStyle = grad
            ctx.fill()

            // Draw solid Dot on top (perfectly anchored, no drift)
            ctx.beginPath()
            ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255, 255, 255, ${dotOpacity})`
            ctx.fill()

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
