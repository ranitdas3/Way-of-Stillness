import { useState, useEffect, useRef } from 'react'
import Spanda from './chapters/01-spanda/index.jsx'
import Delta from './chapters/02-delta/index.jsx'

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [visibleIndex, setVisibleIndex] = useState(0)
  const isAnimating = useRef(false)
  const touchStartY = useRef(0)

  const totalSections = 2

  useEffect(() => {
    // Hide active elements immediately on transition start, then reveal after 1400ms
    if (activeIndex !== visibleIndex) {
      setVisibleIndex(-1)
    }

    const timer = setTimeout(() => {
      setVisibleIndex(activeIndex)
    }, 1400)

    return () => clearTimeout(timer)
  }, [activeIndex])

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault()
      if (isAnimating.current) return

      if (e.deltaY > 10) {
        // scroll down
        if (activeIndex < totalSections - 1) {
          isAnimating.current = true
          setActiveIndex((prev) => prev + 1)
          setTimeout(() => {
            isAnimating.current = false
          }, 1400)
        }
      } else if (e.deltaY < -10) {
        // scroll up
        if (activeIndex > 0) {
          isAnimating.current = true
          setActiveIndex((prev) => prev - 1)
          setTimeout(() => {
            isAnimating.current = false
          }, 1400)
        }
      }
    }

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY
    }

    const handleTouchMove = (e) => {
      if (isAnimating.current) {
        e.preventDefault()
        return
      }

      const diffY = touchStartY.current - e.touches[0].clientY
      if (Math.abs(diffY) > 50) {
        if (diffY > 0) {
          // Swipe up -> scroll down
          if (activeIndex < totalSections - 1) {
            isAnimating.current = true
            setActiveIndex((prev) => prev + 1)
            setTimeout(() => {
              isAnimating.current = false
            }, 1400)
          }
        } else {
          // Swipe down -> scroll up
          if (activeIndex > 0) {
            isAnimating.current = true
            setActiveIndex((prev) => prev - 1)
            setTimeout(() => {
              isAnimating.current = false
            }, 1400)
          }
        }
        touchStartY.current = e.touches[0].clientY
      }
      e.preventDefault()
    }

    const container = document.getElementById('app-container')
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      container.addEventListener('touchstart', handleTouchStart, { passive: true })
      container.addEventListener('touchmove', handleTouchMove, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel)
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchmove', handleTouchMove)
      }
    }
  }, [activeIndex])

  return (
    <div
      id="app-container"
      style={{
        background: 'radial-gradient(circle, rgba(0, 121, 244, 0.2) 0%, rgba(223, 207, 182, 0.2) 100%), linear-gradient(to bottom, #0060fa 0%, #beadcb 100%)',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative',
        margin: 0,
        padding: 0
      }}
    >
      <style>{`
        .slow-tide-section {
          position: absolute;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          transition: transform 1400ms cubic-bezier(0.76, 0, 0.24, 1);
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding: 4rem;
          align-items: center;
          gap: 4rem;
          overflow: hidden;
        }

        /* Stage 1 & 2: Canvas starts at opacity 0, translateY 30px */
        .slow-tide-section canvas {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 1000ms ease 0ms, transform 1200ms cubic-bezier(0.25, 1, 0.5, 1) 400ms;
        }

        /* Stage 3: Text block starts at opacity 0, translateY 20px */
        .reveal-content {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 1000ms ease 700ms, transform 1000ms cubic-bezier(0.25, 1, 0.5, 1) 700ms;
        }

        /* Visible states triggered by .is-visible class */
        .slow-tide-section.is-visible canvas {
          opacity: 1;
          transform: translateY(0);
        }

        .slow-tide-section.is-visible .reveal-content {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* Section 01 - Spanda */}
      <section
        className={`slow-tide-section ${visibleIndex === 0 ? 'is-visible' : ''}`}
        style={{
          transform: activeIndex >= 0 ? 'translateY(0)' : 'translateY(100vh)',
          zIndex: 1
        }}
      >
        <div
          className="reveal-content"
          style={{ color: '#dcc8aa', fontFamily: 'Georgia, serif' }}
        >
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', opacity: 0.5, marginBottom: '2rem' }}>01</p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 400, lineHeight: 1.4, marginBottom: '1.5rem' }}>
            স্পন্দ — Spanda
          </h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, opacity: 0.75 }}>
            Before the first form, there was a tremor.<br />
            Not sound. Not light.<br />
            The universe did not begin with a bang —<br />
            it began with a shiver.
          </p>
        </div>
        <Spanda />
      </section>

      {/* Section 02 - Delta */}
      <section
        className={`slow-tide-section ${visibleIndex === 1 ? 'is-visible' : ''}`}
        style={{
          transform: activeIndex >= 1 ? 'translateY(0)' : 'translateY(100vh)',
          zIndex: 2
        }}
      >
        <div
          className="reveal-content"
          style={{ color: '#dcc8aa', fontFamily: 'Georgia, serif' }}
        >
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', opacity: 0.5, marginBottom: '2rem' }}>02</p>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 400, lineHeight: 1.4, marginBottom: '1.5rem' }}>
            ব-দ্বীপ — Delta
          </h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.8, opacity: 0.75 }}>
            The river does not choose to split.<br />
            It simply finds what the land allows.<br />
            Every branch believes it is the main current.<br />
            None of them are wrong.
          </p>
        </div>
        <Delta />
      </section>

    </div>
  )
}