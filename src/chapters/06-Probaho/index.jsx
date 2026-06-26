import { useEffect, useRef } from 'react'

// CONCEPT: Probaho (প্রবাহ) — Flow
// MOTION ARCHETYPE: directed drift — concentrated laminar flow
// GEOMETRY: sinuous curved band — river path, like the Ganga
// ORIGIN: left edge, one or two entry threads
//
// WHAT IT DOES:
// Hundreds of tiny dots travel along a gently curving path — not scattered, but channelled
// into a concentrated band like a river. The band has a soft boundary: dots near the centre
// are brighter, dots at the edges fade toward invisible. Velocity is almost uniform — the
// river moves as one body, not as individuals. Occasional dots break free, drift off-axis,
// then dissolve. The overall form breathes slightly — the river widens and narrows over a
// slow 6–10 s cycle, inhaling and exhaling.
//
// MOUSE BEHAVIOR:
// Mouse X steers the river's course — far left pulls the band toward the top edge,
// far right pulls toward the bottom. The path adjusts fluidly; dots re-align without snapping.
//
// RULES:
// — Color: rgba(255, 255, 255, x) on #0a0a0a only
// — Opacity carries all emotional weight — no dramatic scale or color shifts
// — 60% of canvas empty at any moment
// — No randomness unless seeded and invisible to the eye
// — No text, UI, or decoration inside canvas
// — Smooth, never jumpy — requestAnimationFrame only
// — Cleanup: return () => cancelAnimationFrame(raf)
//
// Probaho-specific: the river must read as a single organism, not a collection of particles.
// If individual dots are visible as separate objects, reduce opacity or increase density.

function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

export default function Probaho() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const W = canvas.width = 550
        const H = canvas.height = 550

        let mouseX = W / 2
        let targetMouseX = W / 2
        let raf

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect()
            targetMouseX = e.clientX - rect.left
        }

        canvas.addEventListener('mousemove', handleMouseMove)

        // Seeded random number generator
        const rng = mulberry32(0x940b5a)

        // Configuration
        const particleCount = 450
        const speed = 1.2 // Uniform horizontal speed

        // Initialize particles
        const particles = Array.from({ length: particleCount }, () => {
            // Distribute along x-axis to fill canvas initially
            const x = rng() * W
            // Offsets from the center path (bell-curve style distribution for river density)
            const u1 = rng()
            const u2 = rng()
            const offsetFactor = Math.sqrt(-2.0 * Math.log(u1 || 0.0001)) * Math.cos(2.0 * Math.PI * u2) // Box-Muller transform
            
            // Randomly assign whether this particle has broken free (drift off-axis)
            const isEscaped = rng() < 0.08
            const escapeDriftSpeed = isEscaped ? (rng() * 0.4 - 0.2) : 0

            return {
                x,
                offsetFactor, // Distance factor from center of flow
                isEscaped,
                escapeDriftSpeed,
                baseOpacity: 0.15 + rng() * 0.15,
                yOffsetSeed: rng() * Math.PI * 2,
                size: 0.6 + rng() * 0.6
            }
        })

        // Draw and update loop
        let time = 0
        const draw = () => {
            // Clear canvas to dark backdrop
            ctx.fillStyle = '#0a0a0a'
            ctx.fillRect(0, 0, W, H)

            time += 0.015

            // Smoothly interpolate mouseX
            mouseX += (targetMouseX - mouseX) * 0.05

            // Determine steering factor from Mouse X:
            // far left (0) pulls path to top (H * 0.15)
            // far right (W) pulls path to bottom (H * 0.85)
            const steerWeight = mouseX / W
            const targetYOffset = H * 0.2 + steerWeight * (H * 0.6)

            // Dynamic width cycle of the river (breathes over 6–10 s cycle)
            // 0.015 rad/frame * 10 seconds is roughly 0.01 rad/sec. Let's use frequency for ~8 second cycle:
            // ~0.78 rad/sec -> time step is 0.015 -> 0.015 * 50fps = 0.75.
            const breathFreq = time * 0.8
            const riverWidth = 35 + Math.sin(breathFreq) * 12

            particles.forEach((p) => {
                // Move horizontal uniformly
                p.x += speed

                // Wrap-around to left edge with new randomized offset attributes to keep flow infinite
                if (p.x > W) {
                    p.x = 0
                    const u1 = rng()
                    const u2 = rng()
                    p.offsetFactor = Math.sqrt(-2.0 * Math.log(u1 || 0.0001)) * Math.cos(2.0 * Math.PI * u2)
                    p.isEscaped = rng() < 0.08
                    p.escapeDriftSpeed = p.isEscaped ? (rng() * 0.4 - 0.2) : 0
                    p.baseOpacity = 0.15 + rng() * 0.15
                    p.size = 0.6 + rng() * 0.6
                }

                // Compute center y coordinate of the river path at this specific x
                // We create a sinuous curve (like the Ganga) using math.sin with multiple frequencies
                const sinWave1 = Math.sin(p.x * 0.006 + time * 0.4) * 50
                const sinWave2 = Math.sin(p.x * 0.015 - time * 0.2) * 20
                
                // Incorporate the mouse steering: blend targetYOffset into the baseline y-center
                // The steering curves the overall river trajectory fluidly
                const baselineY = H * 0.5 + sinWave1 + sinWave2
                const centerY = baselineY + (targetYOffset - H * 0.5) * Math.sin((p.x / W) * Math.PI)

                // Particle Y position is center-path Y plus its Gaussian offset times current river width
                let y = centerY + p.offsetFactor * riverWidth

                // Manage particles that break free
                let opacityMultiplier = 1
                if (p.isEscaped) {
                    // Drift away from the axis over time/space
                    y += Math.sin(p.x * 0.01 + p.yOffsetSeed) * 15 + (p.x * p.escapeDriftSpeed) % 80
                    // Fade out as they get further from center or drift off-axis
                    const distFromCenter = Math.abs(y - centerY)
                    opacityMultiplier = Math.max(0, 1 - distFromCenter / 120)
                }

                // Calculate edge fading for main river flow to ensure soft boundaries
                const distRatio = Math.abs(p.offsetFactor) // offsetFactor is Standard Normal, typical range ~[-3, 3]
                let pathOpacity = Math.max(0, 1 - distRatio / 2.2)

                // Blend overall opacity
                const finalOpacity = p.baseOpacity * pathOpacity * opacityMultiplier

                if (finalOpacity > 0.01) {
                    ctx.beginPath()
                    ctx.arc(p.x, y, p.size, 0, Math.PI * 2)
                    ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`
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
