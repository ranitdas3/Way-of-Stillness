import { useEffect, useRef } from 'react'

// CONCEPT: Śūnyatā (শূন্যতা) — Nothingness
// MOTION ARCHETYPE: emergence from zero — doubling, blooming, dissolving back
// GEOMETRY: radial expansion from a single central point
// ORIGIN: canvas center
//
// WHAT IT DOES:
// The canvas is black. Empty. Then one dot appears at the center — fades in slowly, almost
// hesitantly. Then a second appears nearby. Then four. Then eight. Each generation of dots
// fades in softly, spreads slightly outward from center, and holds. The doubling is slow —
// each generation takes 1.5–2 seconds to emerge. By the final generation the dots form a loose
// organic bloom, maybe 6–7 generations deep, filling perhaps 40% of the canvas. No symmetry —
// positions are seeded, so each dot lands in a natural but non-random place. Then, all at once,
// everything begins to fade — not instantly, but over 3–4 seconds, the entire bloom dissolves
// back to black. Silence. Then one dot again.
//
// MOUSE BEHAVIOR:
// Mouse X controls the rate of doubling — far left slows each generation down, the emergence
// feels ancient and reluctant. Far right speeds it up, the bloom feels urgent, almost anxious.
// The dissolution speed remains constant either way.
//
// RULES:
// — Color: rgba(255, 255, 255, x) on #0a0a0a only
// — Opacity carries all emotional weight — no dramatic scale or color shifts
// — 60% of canvas empty at any moment
// — No randomness unless seeded and invisible to the eye
// — No text, UI, or decoration inside canvas
// — Smooth, never jumpy — requestAnimationFrame only
// — Cleanup: return () => cancelAnimationFrame(raf)
// — *Śūnyatā-specific: the single first dot must feel like an event. The canvas must be empty
//   long enough before it appears that the viewer has accepted the nothingness. If the cycle
//   feels too fast, the emergence means nothing.*

function mulberry32(a) {
    return function() {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

export default function Sunyata() {
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

        // Seeded RNG to create natural organic positions for the bloom
        const rng = mulberry32(0x5e0b0d)

        // Define generation counts: [1, 2, 4, 8, 16, 32, 64] -> 7 generations total
        const genSizes = [1, 2, 4, 8, 16, 32, 64]
        
        // Generate pre-seeded offsets and radii for all potential dots in all generations
        // Each dot emerges radially outwards from the center.
        const dotsByGen = genSizes.map((count, genIdx) => {
            return Array.from({ length: count }, (_, dotIdx) => {
                const angle = rng() * Math.PI * 2
                // Radii grow outwards per generation (filling ~40% of the canvas max, radius <= 110px)
                // We add some organic variance
                const baseRadius = 15 + genIdx * 15
                const radius = baseRadius + (rng() * 10 - 5)
                
                return {
                    xOffset: Math.cos(angle) * radius,
                    yOffset: Math.sin(angle) * radius,
                    baseOpacity: 0.18 + rng() * 0.22,
                    size: 1.0 + rng() * 0.8
                }
            })
        })

        // Timing parameters (at 60fps)
        // Dissolution duration: 3.5 seconds = 210 frames
        const dissolveFrames = 210
        // Silence duration (empty canvas before first dot): 5 seconds = 300 frames
        const silenceFrames = 300

        // State variables
        let state = 'silence' // 'silence', 'blooming', 'dissolving'
        let silenceTimer = 0
        let currentGen = 0     // index of generation currently emerging
        let genTimer = 0       // frames elapsed in the current generation emergence
        let dissolveTimer = 0  // frames elapsed in the dissolution phase

        const draw = () => {
            // Draw background
            ctx.fillStyle = '#0a0a0a'
            ctx.fillRect(0, 0, W, H)

            // Smoothly interpolate mouseX
            mouseX += (targetMouseX - mouseX) * 0.05

            // Map mouseX to the doubling generation duration (in frames):
            // far left -> 120 frames (2 seconds per gen), reluctant/slow
            // far right -> 45 frames (0.75 seconds per gen), urgent/fast
            const genDuration = 120 - (mouseX / W) * 75

            if (state === 'silence') {
                silenceTimer++
                if (silenceTimer >= silenceFrames) {
                    state = 'blooming'
                    currentGen = 0
                    genTimer = 0
                }
            } else if (state === 'blooming') {
                genTimer++
                if (genTimer >= genDuration) {
                    genTimer = 0
                    currentGen++
                    if (currentGen >= genSizes.length) {
                        state = 'dissolving'
                        dissolveTimer = 0
                    }
                }
            } else if (state === 'dissolving') {
                dissolveTimer++
                if (dissolveTimer >= dissolveFrames) {
                    state = 'silence'
                    silenceTimer = 0
                }
            }

            // Draw phase rendering
            if (state === 'blooming') {
                // Draw fully loaded generations
                for (let g = 0; g < currentGen; g++) {
                    dotsByGen[g].forEach((dot) => {
                        ctx.beginPath()
                        ctx.arc(W / 2 + dot.xOffset, H / 2 + dot.yOffset, dot.size, 0, Math.PI * 2)
                        ctx.fillStyle = `rgba(255, 255, 255, ${dot.baseOpacity})`
                        ctx.fill()
                    })
                }

                // Fade in the current emerging generation
                if (currentGen < genSizes.length) {
                    const progress = genTimer / genDuration
                    dotsByGen[currentGen].forEach((dot) => {
                        const currentOpacity = dot.baseOpacity * progress
                        // Slightly translate outwards radially during emergence
                        const scale = 0.85 + 0.15 * progress
                        const dx = (W / 2) + dot.xOffset * scale
                        const dy = (H / 2) + dot.yOffset * scale

                        ctx.beginPath()
                        ctx.arc(dx, dy, dot.size, 0, Math.PI * 2)
                        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`
                        ctx.fill()
                    })
                }
            } else if (state === 'dissolving') {
                // Fade out everything collectively
                const progress = dissolveTimer / dissolveFrames
                const opacityMultiplier = 1.0 - progress

                dotsByGen.forEach((genDots) => {
                    genDots.forEach((dot) => {
                        ctx.beginPath()
                        ctx.arc(W / 2 + dot.xOffset, H / 2 + dot.yOffset, dot.size, 0, Math.PI * 2)
                        ctx.fillStyle = `rgba(255, 255, 255, ${dot.baseOpacity * opacityMultiplier})`
                        ctx.fill()
                    })
                })
            }

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