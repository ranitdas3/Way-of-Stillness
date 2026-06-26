import { useEffect, useRef } from 'react'

// CONCEPT: adda
// MOTION ARCHETYPE: attracting
// GEOMETRY: scattered nodes
// ORIGIN: distributed, 12-16 nodes
//
// WHAT IT DOES:
// 12-16 nodes drift slowly across the canvas. When two nodes come within a threshold
// distance, a faint line draws between them. Clusters form, hold briefly, then
// drift apart. No node ever stops moving. No connection is permanent.
//
// MOUSE BEHAVIOR:
// Mouse position acts as a temporary attractor — nodes drift toward it slowly,
// cluster near it, then resume their own paths when mouse leaves.
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

export default function Adda() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        const W = canvas.width = 550
        const H = canvas.height = 550

        const mouse = { x: W / 2, y: H / 2, active: false }
        let time = 0
        let raf

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect()
            mouse.x = e.clientX - rect.left
            mouse.y = e.clientY - rect.top
            mouse.active = true
        })

        canvas.addEventListener('mouseenter', () => {
            mouse.active = true
        })

        canvas.addEventListener('mouseleave', () => {
            mouse.active = false
        })

        // Seeded RNG to initialize positions and base parameters
        const rng = mulberry32(0xadda)
        const nodeCount = 14
        const nodes = Array.from({ length: nodeCount }, (_, i) => {
            const angle = rng() * Math.PI * 2
            const speed = 0.2 + rng() * 0.2
            return {
                x: 80 + rng() * (W - 160),
                y: 80 + rng() * (H - 160),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                baseOpacity: 0.3 + rng() * 0.45,
                radius: 1.6 + rng() * 0.8
            }
        })

        const draw = () => {
            // Draw background
            ctx.fillStyle = '#0a0a0a'
            ctx.fillRect(0, 0, W, H)

            time += 1

            // 1. Calculate clustering phase using a deterministic slow wave
            // Cycle: ~800 frames (approx 13 seconds)
            // Ramp-up attraction, hold, then drift apart
            const phase = (time % 800) / 800
            let clusterForce = 0
            if (phase < 0.35) {
                // Ramping up attraction
                clusterForce = (phase / 0.35) * 0.012
            } else if (phase < 0.55) {
                // Holding cluster
                clusterForce = 0.012
            } else if (phase < 0.85) {
                // Ramping down / drifting apart (slight repulsion force)
                clusterForce = 0.012 * (1 - (phase - 0.55) / 0.30) * -0.6
            } else {
                // Neutral drift phase
                clusterForce = 0
            }

            // 2. Update physics/positions
            nodes.forEach((node, i) => {
                // Keep moving: small wandering force to guarantee no node ever stops moving
                const wanderAngle = time * 0.008 + i * 42.42
                node.vx += Math.cos(wanderAngle) * 0.006
                node.vy += Math.sin(wanderAngle) * 0.006

                // Mouse Attractor
                if (mouse.active) {
                    const dx = mouse.x - node.x
                    const dy = mouse.y - node.y
                    const dist = Math.hypot(dx, dy)
                    if (dist > 10) {
                        node.vx += (dx / dist) * 0.014
                        node.vy += (dy / dist) * 0.014
                    }
                }

                // Interactions with other nodes
                nodes.forEach((other, j) => {
                    if (i === j) return
                    const dx = other.x - node.x
                    const dy = other.y - node.y
                    const dist = Math.hypot(dx, dy)

                    // Hard collision/repulsion limit to prevent overlapping nodes
                    if (dist < 28 && dist > 0) {
                        const push = (28 - dist) * 0.018
                        node.vx -= (dx / dist) * push
                        node.vy -= (dy / dist) * push
                    }

                    // Cluster force (attract or repel based on current cycle phase)
                    if (dist >= 28 && dist < 170) {
                        const strength = clusterForce * (1 - dist / 170)
                        node.vx += (dx / dist) * strength
                        node.vy += (dy / dist) * strength
                    }
                })

                // Boundary push back (soft walls to keep nodes fully in canvas smoothly)
                const margin = 50
                if (node.x < margin) node.vx += 0.018
                if (node.x > W - margin) node.vx -= 0.018
                if (node.y < margin) node.vy += 0.018
                if (node.y > H - margin) node.vy -= 0.018

                // Limit speed to preserve slow, meditative quality
                const speed = Math.hypot(node.vx, node.vy)
                const minSpeed = 0.16
                const maxSpeed = 0.50
                if (speed < minSpeed) {
                    node.vx = (node.vx / (speed || 1)) * minSpeed
                    node.vy = (node.vy / (speed || 1)) * minSpeed
                } else if (speed > maxSpeed) {
                    node.vx = (node.vx / speed) * maxSpeed
                    node.vy = (node.vy / speed) * maxSpeed
                }

                // Move node
                node.x += node.vx
                node.y += node.vy
            })

            // 3. Draw connections (lines) between nodes within proximity threshold
            const lineThreshold = 95
            for (let i = 0; i < nodeCount; i++) {
                for (let j = i + 1; j < nodeCount; j++) {
                    const n1 = nodes[i]
                    const n2 = nodes[j]
                    const dist = Math.hypot(n2.x - n1.x, n2.y - n1.y)
                    if (dist < lineThreshold) {
                        const proximityFactor = 1 - dist / lineThreshold
                        // Soft breath-like connection pulse
                        const breath = 0.85 + 0.15 * Math.sin(time * 0.035 + (i + j))
                        const lineOpacity = proximityFactor * 0.16 * breath

                        ctx.beginPath()
                        ctx.moveTo(n1.x, n1.y)
                        ctx.lineTo(n2.x, n2.y)
                        ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`
                        ctx.lineWidth = 0.65
                        ctx.stroke()
                    }
                }
            }

            // 4. Draw node bodies
            nodes.forEach((node, i) => {
                // Subtle opacity modulation
                const pulse = 0.88 + 0.12 * Math.sin(time * 0.022 + i)
                const opacity = node.baseOpacity * pulse

                ctx.beginPath()
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
                ctx.fill()
            })

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
