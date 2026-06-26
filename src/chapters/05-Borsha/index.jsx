import { useEffect, useRef } from 'react'

// CONCEPT: monsoon
// MOTION ARCHETYPE: accumulating then releasing
// GEOMETRY: vertical linear
// ORIGIN: top edge
//
// WHAT IT DOES:
// Thin vertical lines of particles fall from the top, accumulating as faint
// horizontal density near the bottom — like water collecting. After a threshold
// is reached, everything releases at once, fades to near-nothing, and the
// accumulation begins again from silence. The cycle is slow — one full cycle
// takes 8-12 seconds.
//
// MOUSE BEHAVIOR:
// Mouse Y controls the accumulation threshold — how much collects before release.
// High on canvas = releases quickly. Low = long accumulation, sudden release.
//
// RULES:
// - Color: rgba(255, 255, 255, x) on #0a0a0a only
// - Opacity carries all emotional weight — no dramatic scale or color shifts
// - 60% of canvas empty at any moment
// - No randomness unless seeded and invisible to the eye
// - No text, UI, or decoration inside canvas
// - Smooth, never jumpy — requestAnimationFrame only
// - Cleanup: return () => cancelAnimationFrame(raf)

function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

export default function Borsha() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const W = canvas.width = 550
        const H = canvas.height = 550

        const mouse = { x: W / 2, y: H - 80 } // Default threshold near bottom
        let raf
        let time = 0

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect()
            mouse.x = e.clientX - rect.left
            mouse.y = e.clientY - rect.top
        })

        // Seeded random number generator
        const rng = mulberry32(0x5001)

        // Generate static column positions (vertical linear structure)
        const columnCount = 18
        const columns = Array.from({ length: columnCount }, (_, i) => {
            return {
                x: 60 + (i / (columnCount - 1)) * (W - 120),
                flowSpeed: 1.8 + rng() * 1.4,
                density: 0.3 + rng() * 0.7
            }
        })

        // Active particles array
        let particles = []

        // Simulation parameters
        let cycleTimer = 0
        let isReleasing = false
        let releaseTimer = 0

        // Helper to spawn a new particle in a column
        const spawnParticle = (colIdx, seedVal) => {
            const col = columns[colIdx]
            const r = mulberry32(seedVal)
            return {
                x: col.x + (r() - 0.5) * 4, // slight spread
                y: -10 - r() * 40,
                vy: col.flowSpeed * (0.9 + r() * 0.2),
                targetY: H - 55 - r() * 35, // accumulate near the bottom
                state: 'falling', // 'falling' | 'accumulating' | 'releasing'
                baseOpacity: 0.15 + r() * 0.35,
                opacity: 0,
                xOffsetPhase: r() * Math.PI * 2, // for gentle horizontal sway at bottom
                size: 0.8 + r() * 0.8
            }
        }

        const draw = () => {
            ctx.fillStyle = '#0a0a0a'
            ctx.fillRect(0, 0, W, H)

            time++

            // Threshold calculation based on Mouse Y:
            // Mouse Y near top (0) -> low threshold (~150 frames)
            // Mouse Y near bottom (H) -> high threshold (~650 frames)
            const targetThreshold = 160 + (mouse.y / H) * 520
            
            if (!isReleasing) {
                cycleTimer++
                // Spawn particles periodically
                if (cycleTimer % 3 === 0) {
                    const colIdx = Math.floor(rng() * columnCount)
                    particles.push(spawnParticle(colIdx, time))
                }

                // Check if threshold is reached
                if (cycleTimer >= targetThreshold) {
                    isReleasing = true
                    releaseTimer = 0
                }
            } else {
                releaseTimer++
                // Hold briefly in release mode, then reset once everything has cleared/faded
                if (releaseTimer > 75) {
                    isReleasing = false
                    cycleTimer = 0
                    particles = []
                }
            }

            // Update and render particles
            particles.forEach((p) => {
                if (isReleasing && p.state !== 'releasing') {
                    p.state = 'releasing'
                    // Add a randomized release delay based on x position
                    p.releaseDelay = Math.floor((p.x % 15))
                }

                if (p.state === 'falling') {
                    p.y += p.vy
                    // Fade in as it falls
                    if (p.opacity < p.baseOpacity) {
                        p.opacity += 0.03
                    }
                    if (p.y >= p.targetY) {
                        p.y = p.targetY
                        p.state = 'accumulating'
                    }
                } else if (p.state === 'accumulating') {
                    // Faint horizontal density near the bottom — like water collecting
                    // Gently sway horizontally to look fluid
                    const sway = Math.sin(time * 0.02 + p.xOffsetPhase) * 0.25
                    p.x += sway
                    
                    // Slow accumulation glow (increase opacity slightly over time)
                    if (p.opacity < p.baseOpacity * 1.5) {
                        p.opacity += 0.003
                    }
                } else if (p.state === 'releasing') {
                    // Release: everything releases at once, falls downwards, and fades to near-nothing
                    const delay = p.releaseDelay || 0
                    if (releaseTimer > delay) {
                        p.vy += 0.25 // acceleration
                        p.y += p.vy
                        p.opacity *= 0.93 // rapid fade
                    }
                }

                // Draw particle
                if (p.opacity > 0.01 && p.y < H) {
                    ctx.beginPath()
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
                    ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`
                    ctx.fill()
                }
            })

            // Draw a very faint background line at the accumulation floor
            ctx.beginPath()
            ctx.moveTo(40, H - 75)
            ctx.lineTo(W - 40, H - 75)
            ctx.strokeStyle = `rgba(255, 255, 255, 0.015)`
            ctx.lineWidth = 0.5
            ctx.stroke()

            // Draw the threshold indicator (faint guideline showing where Mouse Y is)
            ctx.beginPath()
            ctx.setLineDash([2, 8])
            ctx.moveTo(40, mouse.y)
            ctx.lineTo(W - 40, mouse.y)
            ctx.strokeStyle = `rgba(255, 255, 255, 0.05)`
            ctx.lineWidth = 0.6
            ctx.stroke()
            ctx.setLineDash([]) // Reset line dash

            raf = requestAnimationFrame(draw)
        }

        draw()

        return () => {
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
