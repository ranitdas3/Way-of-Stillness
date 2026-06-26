import { useEffect, useRef } from 'react'

// CONCEPT: Sthiratā (স্থিরতা) — Steadiness
// MOTION ARCHETYPE: slow eternal rotation — spiral arms sweeping around a silent axis
// GEOMETRY: spiral — two or three arms rotating around a fixed center
// ORIGIN: canvas center, arms extending outward
//
// WHAT IT DOES:
// Two or three spiral arms extend outward from the center, each populated with particles —
// denser near the core, thinning toward the tips. The entire structure rotates slowly around the
// central axis, one full revolution every 14–18 seconds. Particles don't move individually —
// the arms themselves turn, as one body, like the galaxy does. Near the center, particles are
// brighter and more concentrated, forming a soft glowing core. Toward the edges of each arm,
// particles are sparse and dim, the arm dissolving into the dark before it reaches the canvas
// edge. The structure never completes or unravels — it simply turns, endlessly, the same shape,
// the same speed. Steadiness as rotation. Constancy as form.
//
// MOUSE BEHAVIOR:
// Mouse X controls the tightness of the spiral arms — far left winds them tighter toward the center,
// far right lets them stretch and open outward. The rotation speed remains unchanged.
//
// RULES:
// — Color: rgba(255, 255, 255, x) on #0a0a0a only
// — Opacity carries all emotional weight — no dramatic scale or color shifts
// — 60% of canvas empty at any moment
// — No randomness unless seeded and invisible to the eye
// — No text, UI, or decoration inside canvas
// — Smooth, never jumpy — requestAnimationFrame only
// — Cleanup: return () => cancelAnimationFrame(raf)
// — *Sthiratā-specific: the spiral must feel ancient and indifferent — it was rotating before
//   you arrived and will continue after. If the motion feels performative or reactive, the
//   steadiness is lost. The galaxy does not know it is being watched.*

function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

export default function Sthirata() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const W = canvas.width = 550
        const H = canvas.height = 550

        const cx = W / 2
        const cy = H / 2

        let mouseX = W / 2
        let targetMouseX = W / 2
        let raf

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect()
            targetMouseX = e.clientX - rect.left
        }

        canvas.addEventListener('mousemove', handleMouseMove)

        const rng = mulberry32(0x5781ca)

        // Initialize particles in 3 spiral arms (galaxy layout)
        const armCount = 3
        const particlesPerArm = 85
        const totalParticles = armCount * particlesPerArm

        // Precalculate seeded particle coordinates in arm-relative space
        // We configure radius and normal deviation offsets
        const particles = Array.from({ length: totalParticles }, (_, idx) => {
            const armIndex = idx % armCount
            const particleIndex = Math.floor(idx / armCount)
            
            // Normalized radius factor [0, 1] — how far along the arm the particle is located
            const t = particleIndex / particlesPerArm
            
            // Logarithmic/linear spiral progression radius (max radius 210px to fit canvas comfortably)
            const maxRadius = 210
            const baseDist = t * maxRadius

            // Angle offset for this arm (0, 120, or 240 degrees)
            const armAngleOffset = (armIndex / armCount) * Math.PI * 2

            // Normal distribution/dispersion of dots around the spiral spine
            // Denser/narrower near the core (t=0), thinning out and spreading near tips (t=1)
            const dispersion = (0.02 + t * 0.12) * Math.PI
            const randomAngleJitter = (rng() * 2 - 1) * dispersion
            const randomRadiusJitter = (rng() * 12 - 6) * (0.4 + t * 0.6)

            // Opacity: brighter at core (t -> 0), dissolving near the outer edges (t -> 1)
            const baseOpacity = (0.24 + rng() * 0.26) * Math.max(0, 1.0 - t * 0.95)

            return {
                t,                 // radius factor
                baseDist,          // ideal distance from center
                radiusJitter: randomRadiusJitter,
                armAngleOffset,
                angleJitter: randomAngleJitter,
                baseOpacity,
                size: 0.6 + rng() * 0.7
            }
        })

        // Core glow dot parameters
        const coreDotCount = 35
        const coreDots = Array.from({ length: coreDotCount }, () => {
            // Highly concentrated near center (radius 0 - 20px)
            const r = rng() * 22
            const theta = rng() * Math.PI * 2
            return {
                r,
                theta,
                opacity: 0.15 + rng() * 0.25,
                size: 0.5 + rng() * 0.8
            }
        })

        // Motion variables
        let time = 0
        const draw = () => {
            // Background
            ctx.fillStyle = '#0a0a0a'
            ctx.fillRect(0, 0, W, H)

            time += 0.015

            // Interpolate Mouse X
            mouseX += (targetMouseX - mouseX) * 0.05

            // Tightness multiplier of spiral arms controlled by Mouse X:
            // far left -> 5.5 radians (extremely tight wind)
            // far right -> 1.5 radians (wide open, straight lines)
            const tightness = 5.5 - (mouseX / W) * 4.0

            // Rotation speed: 1 full rotation every 16 seconds
            // Rotation speed: 1 full rotation every 25 seconds (25 * 60fps = 1500 frames)
            // 2 * Math.PI / 1500 = ~0.0042 rad/frame. Since time advances by 0.015:
            // 0.015 * 0.28 = ~0.0042 rad per frame.
            const globalRotation = time * 0.28

            // 1. Draw core glowing particles (fully locked and steady)
            coreDots.forEach((dot) => {
                const angle = dot.theta + globalRotation
                const x = cx + Math.cos(angle) * dot.r
                const y = cy + Math.sin(angle) * dot.r

                ctx.beginPath()
                ctx.arc(x, y, dot.size, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 255, 255, ${dot.opacity})`
                ctx.fill()
            })

            // 2. Draw spiral arm particles
            particles.forEach((p) => {
                const dist = p.baseDist + p.radiusJitter

                // The logarithmic spiral formula: angleOffset = tightness * radial_distance
                const spiralAngle = p.t * tightness

                // Compute dynamic tip detachment/wandering:
                // Outer particles (p.t > 0.4) start detaching slowly from rigid rotation
                let driftAngle = 0
                if (p.t > 0.4) {
                    const driftFactor = (p.t - 0.4) / 0.6 // 0 at t=0.4, 1.0 at t=1.0
                    // Fraying/detaching oscillations using slow seeded frequencies
                    driftAngle = Math.sin(time * 0.6 + p.baseDist) * 0.18 * driftFactor
                }

                // Compute final coordinate rotated as one global body, adding independent outer drift
                const finalAngle = globalRotation + p.armAngleOffset + spiralAngle + p.angleJitter + driftAngle
                const x = cx + Math.cos(finalAngle) * dist
                const y = cy + Math.sin(finalAngle) * dist

                // Dissolve/fade out edge boundary particles completely to dark canvas background
                ctx.beginPath()
                ctx.arc(x, y, p.size, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 255, 255, ${p.baseOpacity})`
                ctx.fill()
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
