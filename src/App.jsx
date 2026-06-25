import { useState, useEffect, useRef } from 'react'
import Spanda from './chapters/01-Spanda/index.jsx'
import Delta from './chapters/02-Delta/index.jsx'

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [visibleIndex, setVisibleIndex] = useState(0)
  const isAnimating = useRef(false)
  const touchStartY = useRef(0)

  const totalSections = 2

  useEffect(() => {
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
        if (activeIndex < totalSections - 1) {
          isAnimating.current = true
          setActiveIndex((prev) => prev + 1)
          setTimeout(() => {
            isAnimating.current = false
          }, 1400)
        }
      } else if (e.deltaY < -10) {
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
          if (activeIndex < totalSections - 1) {
            isAnimating.current = true
            setActiveIndex((prev) => prev + 1)
            setTimeout(() => {
              isAnimating.current = false
            }, 1400)
          }
        } else {
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

    const handleKeyDown = (e) => {
      if (isAnimating.current) return

      if (e.key === 'ArrowDown') {
        if (activeIndex < totalSections - 1) {
          isAnimating.current = true
          setActiveIndex((prev) => prev + 1)
          setTimeout(() => {
            isAnimating.current = false
          }, 1400)
        }
      } else if (e.key === 'ArrowUp') {
        if (activeIndex > 0) {
          isAnimating.current = true
          setActiveIndex((prev) => prev - 1)
          setTimeout(() => {
            isAnimating.current = false
          }, 1400)
        }
      }
    }

    const container = document.getElementById('app-container')
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      container.addEventListener('touchstart', handleTouchStart, { passive: true })
      container.addEventListener('touchmove', handleTouchMove, { passive: false })
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel)
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchmove', handleTouchMove)
      }
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeIndex])

  return (
    <div
      id="app-container"
      style={{
        background: 'black',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative',
        margin: 0,
        padding: 0
      }}
    >
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          background: black;
        }

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
          width: 85% !important;
          height: auto !important;
          aspect-ratio: 0.85 / 1.20 !important;
          max-height: 75vh;
          display: block;
          border-radius: 4px;
          justify-self: end; /* pushes the visual block to the right */
        }

        /* Stage 3: Text block container layout */
        .reveal-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          padding-left: 9rem; /* pushes the text block further to the right */
        }

        /* Visible states triggered by .is-visible class */
        .slow-tide-section.is-visible canvas {
          opacity: 1;
          transform: translateY(0);
        }

        /* Typography Styles & Animations */
        .chapter-number, .chapter-heading, .chapter-paragraph {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 1000ms ease, transform 1000ms cubic-bezier(0.25, 1, 0.5, 1);
        }

        .slow-tide-section.is-visible .chapter-number {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 500ms;
        }

        .slow-tide-section.is-visible .chapter-heading {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 900ms;
        }

        .slow-tide-section.is-visible .chapter-paragraph {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 1300ms;
        }

        .chapter-number {
          font-family: 'Major Mono Display', monospace;
          font-size: 36px;
          text-transform: uppercase;
          letter-spacing: -0.18em;
          line-height: 1;
          margin: 0 0 1.5rem 0;
          color: rgba(255, 255, 255, 0.4);
        }

        .chapter-heading {
          font-family: 'Hedvig Letters Sans', sans-serif;
          font-weight: 400;
          font-size: 64px;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin: 0 0 2rem 0;
          color: rgba(255, 255, 255, 0.9);
        }

        .chapter-paragraph {
          font-family: 'Hedvig Letters Sans', sans-serif;
          font-size: 16px;
          line-height: 1.4;
          letter-spacing: 0;
          margin: 0;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Responsive Mobile Layout (< 768px) */
        @media (max-width: 767px) {
          .slow-tide-section {
            grid-template-columns: 1fr;
            padding: 2rem;
            gap: 2rem;
            align-content: center;
          }

          .chapter-heading {
            font-size: 48px;
          }
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
        <Spanda />
        <div className="reveal-content">
          <p className="chapter-number">01</p>
          <h2 className="chapter-heading">
            Spanda
          </h2>
          <p className="chapter-paragraph">
            Before the first form, there was a tremor.<br />
            Not sound. Not light.<br />
            The universe did not begin with a bang —<br />
            it began with a shiver.
          </p>
        </div>
      </section>

      {/* Section 02 - Delta */}
      <section
        className={`slow-tide-section ${visibleIndex === 1 ? 'is-visible' : ''}`}
        style={{
          transform: activeIndex >= 1 ? 'translateY(0)' : 'translateY(100vh)',
          zIndex: 2
        }}
      >
        <Delta />
        <div className="reveal-content">
          <p className="chapter-number">02</p>
          <h2 className="chapter-heading">
            Delta
          </h2>
          <p className="chapter-paragraph">
            The river does not choose to split.<br />
            It simply finds what the land allows.<br />
            Every branch believes it is the main current.<br />
            None of them are wrong.
          </p>
        </div>
      </section>

    </div>
  )
}