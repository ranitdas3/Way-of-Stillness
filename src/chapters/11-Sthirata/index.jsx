import { useEffect, useRef } from 'react'

// CONCEPT: Sthiratā (স্থিরতা) — Steadiness
// MOTION ARCHETYPE: perpetual inward pull — gravitational, inevitable, unending
// GEOMETRY: radial convergence — all edges toward center
// ORIGIN: all four edges, full perimeter
//
// WHAT IT DOES:
// Particles emerge continuously from all edges of the canvas — top, bottom, left, right,
// and every corner — and drift steadily inward toward the center. Not fast, not urgent.
// Inevitable. The movement is smooth and directional, each particle following a slightly
// curved path toward the central point, as if being pulled by quiet gravity. Near the center,
// particles don't collide or accumulate — they simply fade out as they arrive, dissolving
// at the threshold. The center itself is empty. What approaches it disappears. New particles
// are always emerging from the edges. The pull never stops, never speeds up, never slows down.
// It has always been this way. The steadiness is not stillness — it is endless, unhurried
// motion toward the same point, forever.
//
// The overall density is moderate — enough particles to feel the pull as a field, not as
// individuals. The perimeter is always slightly busier than the center.
//
// MOUSE BEHAVIOR:
// Mouse proximity to center affects the fade threshold — mouse near center pushes the
// dissolution point outward, so particles vanish earlier, making the center feel more
// void-like. Mouse far from center lets particles travel almost all the way in before fading.
//
// RULES:
// — Color: rgba(255, 255, 255, x) on #0a0a0a only
// — Opacity carries all emotional weight — no dramatic scale or color shifts
// — 60% of canvas empty at any moment
// — No randomness unless seeded and invisible to the eye
// — No text, UI, or decoration inside canvas
// — Smooth, never jumpy — requestAnimationFrame only
// — Cleanup: return () => cancelAnimationFrame(raf)
// — *Sthiratā-specific: the motion must never feel chaotic or turbulent. Every particle
//   moves with the same quiet certainty. If the field feels restless or uneven, the
//   steadiness is lost. Steadiness is not the absence of motion — it is motion that
//   never doubts itself.*

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

        const mouse = { x: cx, y: cy }
        let targetMouse = { x: cx, y: cy }
        let raf

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect()
            targetMouse.x = e.clientX - rect.left
            targetMouse.y = e.clientY - rect.top
        }

        canvas.addEventListener('mousemove', handleMouseMove)

        const rng = mulberry32(0x5781ca)

        // Configuration
        const particleCount = 180
        
        // Helper to spawn a particle on the perimeter edges
        const spawnParticle = (p, initialScatter = false) => {
            // Determine which edge: 0=top, 1=right, 2=bottom, 3=left
            const edge = Math.floor(rng() * 4)
            let startX = 0
            let startY = 0

            if (edge === 0) { // Top
                startX = rng() * W
                startY = 0
            } else if (edge === 1) { // Right
                startX = W
                startY = rng() * H
            } else if (edge === 2) { // Bottom
                startX = rng() * W
                startY = H
            } else { // Left
                startX = 0
                startY = rng() * H
            }

            // Calculate direct vector angle to center
            const dx = cx - startX
            const dy = cy - startY
            const distance = Math.hypot(dx, dy)

            // Curved path offset: each particle gets a slight spiral orbit factor
            // that curves its trajectory gently inward
            const curveFactor = (rng() * 0.28 - 0.14) // positive or negative spin

            p.x = startX
            p.y = startY
            p.speed = 0.45 + rng() * 0.4 // slow, steady speed
            p.curveFactor = curveFactor
            p.size = 0.6 + rng() * 0.8
            p.baseOpacity = 0.12 + rng() * 0.14

            if (initialScatter) {
                // For initial setup, randomly place particles along their trajectory lines
                const travelProgress = rng()
                const theta = Math.atan2(dy, dx)
                // Add curve offset to initial position
                const currentRadius = distance * (1 - travelProgress)
                p.x = cx - Math.cos(theta + curveFactor * travelProgress) * currentRadius
                p.y = cy - Math.sin(theta + curveFactor * travelProgress) * currentRadius
            }
        }

        // Initialize particles
        const particles = Array.from({ length: particleCount }, () => {
            const p = {}
            spawnParticle(p, true)
            return p
        })

        const draw = () => {
            // Background
            ctx.fillStyle = '#0a0a0a'
            ctx.fillRect(0, 0, W, H)

            // Smoothly interpolate mouse coordinate
            mouse.x += (targetMouse.x - mouse.x) * 0.05
            mouse.y += (targetMouse.y - mouse.y) * 0.05

            // Calculate distance of mouse from the canvas center
            const mouseDistFromCenter = Math.hypot(mouse.x - cx, mouse.y - cy)
            
            // Proximity threshold: mouse near center pushes threshold out (up to 75px void)
            // Mouse far away lets particles travel closer (down to 18px void)
            const maxVoidRadius = 75
            const minVoidRadius = 18
            
            // Map mouse distance: close to center (< 200px) translates to larger void
            const hoverInfluence = Math.max(0, 1 - mouseDistFromCenter / 200)
            const voidThreshold = minVoidRadius + (maxVoidRadius - minVoidRadius) * hoverInfluence

            particles.forEach((p) => {
                // Vector coordinates to center
                const dx = cx - p.x
                const dy = cy - p.y
                const currentDist = Math.hypot(dx, dy)

                // When reaching the center void threshold, respawn at the perimeter
                if (currentDist <= voidThreshold) {
                    spawnParticle(p, false)
                    return
                }

                // Smooth inward trajectory physics with slightly curved pathing
                const angleToCenter = Math.atan2(dy, dx)
                // Curve grows stronger closer to the center, simulating gravitational orbit deflection
                const spiralAngle = angleToCenter + p.curveFactor * (1 - currentDist / Math.max(W, H))

                p.x += Math.cos(spiralAngle) * p.speed
                p.y += Math.sin(spiralAngle) * p.speed

                // Calculate soft fading near the threshold
                let opacityFactor = 1.0
                const fadeMargin = 40 // distance interval where particle dissolves
                if (currentDist < voidThreshold + fadeMargin) {
                    opacityFactor = Math.max(0, (currentDist - voidThreshold) / fadeMargin)
                }

                // Draw particle
                const finalOpacity = p.baseOpacity * opacityFactor
                if (finalOpacity > 0.01) {
                    ctx.beginPath()
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
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
