import { useState, useEffect, useRef } from 'react'
import Spanda from './chapters/01-Spanda/index.jsx'
import Sunyata from './chapters/02-Sunyata/index.jsx'
import Bishad from './chapters/03-Bishad/index.jsx'
import Adda from './chapters/04-Adda/index.jsx'
import Borsha from './chapters/05-Borsha/index.jsx'
import Probaho from './chapters/06-Probaho/index.jsx'
import Nishobdhota from './chapters/07- Nishobdhotā/index.jsx'
import Nirjonota from './chapters/08-Nirjonota/index.jsx'
import Opekha from './chapters/09-Opekha/index.jsx'
import Nirvana from './chapters/10- Nirvana/index.jsx'
import Sthirata from './chapters/11-Sthirata/index.jsx'

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [visibleIndex, setVisibleIndex] = useState(0)
  const isAnimating = useRef(false)
  const touchStartY = useRef(0)

  const totalSections = 11

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
          transition: opacity 1400ms cubic-bezier(0.76, 0, 0.24, 1);
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 1fr 1fr;
          padding: 4rem;
          align-items: center;
          gap: 4rem;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
        }

        .slow-tide-section.active-concept {
          opacity: 1;
          pointer-events: auto;
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

        /* Side Navigation Index styling */
        .side-navigation-index {
          position: absolute;
          right: 3rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          z-index: 100;
          font-family: 'Major Mono Display', monospace;
          font-size: 12px;
          user-select: none;
        }

        .index-item {
          display: flex;
          align-items: center;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.22);
          transition: color 300ms ease;
          position: relative;
        }

        .index-item:hover {
          color: rgba(255, 255, 255, 0.55);
        }

        .index-item.active {
          color: rgba(255, 255, 255, 0.95);
          cursor: default;
        }

        .active-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.95);
          margin-right: 8px;
          display: inline-block;
          /* Vertical alignment matching cap height of font size 12px */
          vertical-align: middle;
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

          .side-navigation-index {
            right: 1.2rem;
            font-size: 10px;
          }
        }
      `}</style>

      {/* Section 01 - Spanda */}
      <section
        className={`slow-tide-section ${activeIndex === 0 ? 'active-concept' : ''} ${visibleIndex === 0 ? 'is-visible' : ''}`}
        style={{ zIndex: 1 }}
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

      {/* Section 02 - Śūnyatā */}
      <section
        className={`slow-tide-section ${activeIndex === 1 ? 'active-concept' : ''} ${visibleIndex === 1 ? 'is-visible' : ''}`}
        style={{ zIndex: 2 }}
      >
        <Sunyata />
        <div className="reveal-content">
          <p className="chapter-number">02</p>
          <h2 className="chapter-heading">
            Śūnyatā
          </h2>
          <p className="chapter-paragraph">
            The canvas begins in complete dark.<br />
            A single point emerges, slowly doubling to bloom.<br />
            Fading back into absolute release —<br />
            nothingness is not empty, but full of beginnings.
          </p>
        </div>
      </section>

      {/* Section 03 - Bishad */}
      <section
        className={`slow-tide-section ${activeIndex === 2 ? 'active-concept' : ''} ${visibleIndex === 2 ? 'is-visible' : ''}`}
        style={{ zIndex: 3 }}
      >
        <Bishad />
        <div className="reveal-content">
          <p className="chapter-number">03</p>
          <h2 className="chapter-heading">
            Bishad
          </h2>
          <p className="chapter-paragraph">
            A scattered field, suspended in the descent.<br />
            Falling without beginning, landing without end.<br />
            To seek the bottom is to find the top —<br />
            grief is not a weight, but an endless path.
          </p>
        </div>
      </section>

      {/* Section 04 - Adda */}
      <section
        className={`slow-tide-section ${activeIndex === 3 ? 'active-concept' : ''} ${visibleIndex === 3 ? 'is-visible' : ''}`}
        style={{ zIndex: 4 }}
      >
        <Adda />
        <div className="reveal-content">
          <p className="chapter-number">04</p>
          <h2 className="chapter-heading">
            Adda
          </h2>
          <p className="chapter-paragraph">
            A gathering of points, drawn by an invisible thread.<br />
            Holding briefly, only to remember the distance.<br />
            We meet not to stay, but to drift —<br />
            every connection is a temporary home.
          </p>
        </div>
      </section>

      {/* Section 05 - Borsha */}
      <section
        className={`slow-tide-section ${activeIndex === 4 ? 'active-concept' : ''} ${visibleIndex === 4 ? 'is-visible' : ''}`}
        style={{ zIndex: 5 }}
      >
        <Borsha />
        <div className="reveal-content">
          <p className="chapter-number">05</p>
          <h2 className="chapter-heading">
            Borsha
          </h2>
          <p className="chapter-paragraph">
            A steady descent, pooling in the quiet depths.<br />
            Weight grows heavy, holding the collective sky.<br />
            Until the line breaks, letting go of all it carried —<br />
            to begin again from the clean, empty air.
          </p>
        </div>
      </section>

      {/* Section 06 - Probaho */}
      <section
        className={`slow-tide-section ${activeIndex === 5 ? 'active-concept' : ''} ${visibleIndex === 5 ? 'is-visible' : ''}`}
        style={{ zIndex: 6 }}
      >
        <Probaho />
        <div className="reveal-content">
          <p className="chapter-number">06</p>
          <h2 className="chapter-heading">
            Probaho
          </h2>
          <p className="chapter-paragraph">
            Hundreds of tiny dots, channeled into a concentrated band.<br />
            Flowing as a single body, breathing in and out.<br />
            An occasional point breaks free to dissolve —<br />
            the river path moves together, aligned as one.
          </p>
        </div>
      </section>

      {/* Section 07 - Nishobdhotā */}
      <section
        className={`slow-tide-section ${activeIndex === 6 ? 'active-concept' : ''} ${visibleIndex === 6 ? 'is-visible' : ''}`}
        style={{ zIndex: 7 }}
      >
        <Nishobdhota />
        <div className="reveal-content">
          <p className="chapter-number">07</p>
          <h2 className="chapter-heading">
            Nishobdhotā
          </h2>
          <p className="chapter-paragraph">
            A single dot enters, traverses, and pauses.<br />
            No flicker, no ease, no declaration.<br />
            It is not the presence that commands the canvas —<br />
            it is the silence that remains when it leaves.
          </p>
        </div>
      </section>

      {/* Section 08 - Nirjonotā */}
      <section
        className={`slow-tide-section ${activeIndex === 7 ? 'active-concept' : ''} ${visibleIndex === 7 ? 'is-visible' : ''}`}
        style={{ zIndex: 8 }}
      >
        <Nirjonota />
        <div className="reveal-content">
          <p className="chapter-number">08</p>
          <h2 className="chapter-heading">
            Nirjonotā
          </h2>
          <p className="chapter-paragraph">
            Three solitary lights in the vast dark.<br />
            Pulsing slowly, each to its own rhythm.<br />
            Approach, and they hold their breath in stillness —<br />
            separate embers that never meet.
          </p>
        </div>
      </section>

      {/* Section 09 - Opekha */}
      <section
        className={`slow-tide-section ${activeIndex === 8 ? 'active-concept' : ''} ${visibleIndex === 8 ? 'is-visible' : ''}`}
        style={{ zIndex: 9 }}
      >
        <Opekha />
        <div className="reveal-content">
          <p className="chapter-number">09</p>
          <h2 className="chapter-heading">
            Opekha
          </h2>
          <p className="chapter-paragraph">
            A single point, anchored in the center of the current.<br />
            Unmoved by the endless upward drift.<br />
            Time rises and dissolves like smoke —<br />
            stillness remains when everything else passes.
          </p>
        </div>
      </section>

      {/* Section 10 - Nirvāṇa */}
      <section
        className={`slow-tide-section ${activeIndex === 9 ? 'active-concept' : ''} ${visibleIndex === 9 ? 'is-visible' : ''}`}
        style={{ zIndex: 10 }}
      >
        <Nirvana />
        <div className="reveal-content">
          <p className="chapter-number">10</p>
          <h2 className="chapter-heading">
            Nirvāṇa
          </h2>
          <p className="chapter-paragraph">
            A turbulent flame burning at the center.<br />
            Calmly surrounded by a silent orbital ring.<br />
            One restless, one still, sharing the same origin —<br />
            extinction and release coexisting in the dark.
          </p>
        </div>
      </section>

      {/* Section 11 - Sthiratā */}
      <section
        className={`slow-tide-section ${activeIndex === 10 ? 'active-concept' : ''} ${visibleIndex === 10 ? 'is-visible' : ''}`}
        style={{ zIndex: 11 }}
      >
        <Sthirata />
        <div className="reveal-content">
          <p className="chapter-number">11</p>
          <h2 className="chapter-heading">
            Sthiratā
          </h2>
          <p className="chapter-paragraph">
            A constant, quiet pull from all edges toward the center.<br />
            Movement without doubt, fading upon arrival.<br />
            Steadiness is not the absence of motion —<br />
            it is motion that never doubts its path.
          </p>
        </div>
      </section>

      {/* Vertical Navigation Index */}
      <div className="side-navigation-index">
        {Array.from({ length: totalSections }).map((_, idx) => {
          const isActive = activeIndex === idx
          const numString = String(idx + 1).padStart(2, '0')
          return (
            <div
              key={idx}
              className={`index-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (isAnimating.current) return
                isAnimating.current = true
                setActiveIndex(idx)
                setTimeout(() => {
                  isAnimating.current = false
                }, 1400)
              }}
            >
              {isActive && <span className="active-dot" />}
              {numString}
            </div>
          )
        })}
      </div>

    </div>
  )
}