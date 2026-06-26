import { useEffect, useRef } from 'react'

// CONCEPT: Nishobdhotā (নিশব্দতা) — Absolute Silence
// MOTION ARCHETYPE: interrupted traversal — presence, pause, absence
// GEOMETRY: horizontal linear
// ORIGIN: left edge
//
// WHAT IT DOES:
// A single dot enters from the left edge and moves toward the right — slowly, taking 6–8
// seconds to cross the full canvas. Halfway across, it stops. Holds for 2–3 seconds. No pulse,
// no flicker, no acknowledgement of the pause — it simply is still. Then it continues at
// the exact same speed, exits the right edge, and the canvas returns to complete emptiness
// for 4–5 seconds. Then the dot enters again. Identical. The dot is not the subject. The
// pause and the silence after are.
//
// MOUSE BEHAVIOR:
// Mouse X controls the position of the pause — where along the journey the dot stops and
// holds. Left side of canvas = pause happens early, long silence before exit. Right side =
// pause happens late, barely before disappearing.
//
// RULES:
// — Color: rgba(255, 255, 255, x) on #0a0a0a only
// — Opacity carries all emotional weight — no dramatic scale or color shifts
// — 60% of canvas empty at any moment
// — No randomness unless seeded and invisible to the eye
// — No text, UI, or decoration inside canvas
// — Smooth, never jumpy — requestAnimationFrame only
// — Cleanup: return () => cancelAnimationFrame(raf)
// — *Nishobdhotā-specific: the dot must never draw attention to itself — no easing in, no
//   easing out, no size change. Constant velocity, constant opacity. If the dot feels
//   like an event, the piece has failed.*

export default function Nishobdhota() {
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

        // Physics parameters (using a target frame rate of ~60fps)
        // Journey distance: from x = -10 (offscreen left) to x = W + 10 (offscreen right)
        const startX = -10
        const endX = W + 10

        // Cruising speed (takes ~6-8 seconds to cross canvas without pauses, or we coordinate speeds)
        const cruisingSpeed = 1.3 // px per frame
        const minSpeed = 0.08 // almost imperceptible movement (not zero)

        // Duration of deceleration (1.5s = 90 frames at 60fps)
        const transitionFrames = 90
        // Duration of hold at minimum speed (2.5s = 150 frames)
        const holdFrames = 150
        // Silence duration after exit: ~4.5 seconds (at 60fps, 270 frames)
        const silenceFrames = 270

        // State variables
        let x = startX
        let state = 'traveling_1' // 'traveling_1', 'decelerating', 'holding', 'accelerating', 'traveling_2', 'silence'
        let transitionTimer = 0
        let holdTimer = 0
        let silenceTimer = 0
        let pauseXThreshold = W / 2 // Dynamic threshold determined by mouse position

        // Ease-in-out quadratic function
        const easeInOutQuad = (t) => {
            return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
        }

        const draw = () => {
            // Background
            ctx.fillStyle = '#0a0a0a'
            ctx.fillRect(0, 0, W, H)

            // Smoothly interpolate mouseX to set pause threshold position fluidly
            mouseX += (targetMouseX - mouseX) * 0.05
            // Bound mouse-controlled pause threshold between 15% and 85% of W
            // to allow clear deceleration room on the left, and acceleration room on the right.
            const proposedPauseX = Math.max(W * 0.15, Math.min(W * 0.85, mouseX))

            // State Machine
            if (state === 'traveling_1') {
                // Set the target coordinate where the deceleration phase finishes
                pauseXThreshold = proposedPauseX

                // Distance needed for deceleration phase (average speed during ease * transitionFrames)
                // Average speed is roughly (cruisingSpeed + minSpeed) / 2
                const decelDistance = ((cruisingSpeed + minSpeed) / 2) * transitionFrames
                const triggerDecelX = pauseXThreshold - decelDistance

                x += cruisingSpeed

                if (x >= triggerDecelX) {
                    state = 'decelerating'
                    transitionTimer = 0
                }
            } else if (state === 'decelerating') {
                transitionTimer++
                const progress = transitionTimer / transitionFrames
                // Ease in-out from cruisingSpeed to minSpeed
                const currentSpeed = cruisingSpeed - (cruisingSpeed - minSpeed) * easeInOutQuad(progress)
                x += currentSpeed

                if (transitionTimer >= transitionFrames) {
                    state = 'holding'
                    holdTimer = 0
                }
            } else if (state === 'holding') {
                holdTimer++
                x += minSpeed // nearly still, imperceptible movement

                if (holdTimer >= holdFrames) {
                    state = 'accelerating'
                    transitionTimer = 0
                }
            } else if (state === 'accelerating') {
                transitionTimer++
                const progress = transitionTimer / transitionFrames
                // Ease in-out from minSpeed to cruisingSpeed
                const currentSpeed = minSpeed + (cruisingSpeed - minSpeed) * easeInOutQuad(progress)
                x += currentSpeed

                if (transitionTimer >= transitionFrames) {
                    state = 'traveling_2'
                }
            } else if (state === 'traveling_2') {
                x += cruisingSpeed
                if (x >= endX) {
                    state = 'silence'
                    silenceTimer = 0
                }
            } else if (state === 'silence') {
                silenceTimer++
                if (silenceTimer >= silenceFrames) {
                    x = startX
                    state = 'traveling_1'
                }
            }

            // Render the single dot (only if not in silence state)
            if (state !== 'silence') {
                ctx.beginPath()
                // Linear traversal across vertical center
                ctx.arc(x, H / 2, 2.2, 0, Math.PI * 2)
                ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
                ctx.fill()
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
