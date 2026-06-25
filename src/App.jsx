import Spanda from './chapters/01-spanda/index.jsx'
import Delta from './chapters/02-delta/index.jsx'

export default function App() {
  return (
    <div style={{
      background: 'radial-gradient(circle, rgba(0, 121, 244, 0.2) 0%, rgba(223, 207, 182, 0.2) 100%), linear-gradient(to bottom, #0060fa 0%, #beadcb 100%)',
      height: '100vh',
      width: '100vw',
      overflowY: 'scroll',
      scrollSnapType: 'y mandatory',
      scrollPadding: '10vh',
      scrollBehavior: 'smooth',
      margin: 0,
      padding: 0
    }}>

      <section style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        height: '100vh',
        width: '100vw',
        padding: '4rem',
        alignItems: 'center',
        gap: '4rem',
        scrollSnapAlign: 'start',
        boxSizing: 'border-box',
        marginBottom: '10vh'
      }}>
        <div style={{ color: '#dcc8aa', fontFamily: 'Georgia, serif' }}>
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

      <section style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        height: '100vh',
        width: '100vw',
        padding: '4rem',
        alignItems: 'center',
        gap: '4rem',
        scrollSnapAlign: 'start',
        boxSizing: 'border-box',
        marginBottom: '10vh'
      }}>
        <div style={{ color: '#dcc8aa', fontFamily: 'Georgia, serif' }}>
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