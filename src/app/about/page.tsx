import Link from 'next/link'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1A2332' }}>

      {/* Navigation */}
      <nav style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #E5E7EB',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '80px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <Link href="/">
          <Image src="/logo.png" alt="Ready Set Plans" height={60} width={180} style={{ objectFit: 'contain' }} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/about" style={{ color: '#1B7FE8', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem' }}>About</Link>
          <Link href="/contact" style={{ color: '#475569', textDecoration: 'none', fontWeight: '500', fontSize: '0.95rem' }}>Contact</Link>
          <Link href="/order" style={{
            backgroundColor: '#1B7FE8',
            color: '#ffffff',
            fontWeight: '600',
            fontSize: '1rem',
            padding: '0.625rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
          }}>
            Order Now
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        backgroundColor: '#1A2332',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(27,127,232,0.08) 39px, rgba(27,127,232,0.08) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(27,127,232,0.08) 39px, rgba(27,127,232,0.08) 40px)',
        padding: '5rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', color: '#1B7FE8', marginBottom: '1rem', textTransform: 'uppercase' }}>Our Story</div>
          <h1 style={{
            fontSize: 'clamp(1.75rem, 4vw, 3rem)',
            fontWeight: '800',
            color: '#ffffff',
            lineHeight: 1.15,
            marginBottom: '1.25rem',
          }}>
            Built for Contractors, By Contractors
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#94A3B8', lineHeight: 1.7, margin: 0 }}>
            We know exactly what you need—because we've been in your boots.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section style={{ backgroundColor: '#ffffff', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem' }}>How It All Started</h2>
          <p style={{ color: '#475569', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '1.25rem' }}>
            At Ready Set Plans, we know exactly what you need—because we've been in your boots. As builders ourselves, we were constantly ordering plans for our own projects and got tired of the high costs, slow turnarounds, and complicated systems.
          </p>
          <p style={{ color: '#475569', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '1.25rem' }}>
            Every time we needed a set of deck or shed plans, we faced the same frustrations: weeks of waiting, confusing back-and-forth with drafters who didn't understand field realities, and prices that felt completely out of touch with what a working contractor could afford.
          </p>
          <p style={{ color: '#475569', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '1.25rem' }}>
            So we built something better. Ready Set Plans was created specifically for contractors who need professional, permit-ready drawings—fast, affordable, and without the headache. We bring builder-to-builder understanding to every set of plans we produce.
          </p>
          <p style={{ color: '#475569', lineHeight: 1.8, fontSize: '1.05rem' }}>
            Today, we serve contractors across the country, delivering CAD drawings in 48 hours or less at a flat rate that makes sense for your budget.
          </p>
        </div>
      </section>

      {/* Mission / What We Do / Why Choose Us */}
      <section style={{ backgroundColor: '#F1F5F9', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', textAlign: 'center', marginBottom: '3rem' }}>Who We Are</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            {[
              { title: 'OUR MISSION', body: 'To make professional building plans fast, simple, and affordable for contractors.' },
              { title: 'WHAT WE DO', body: 'We create custom CAD drawings for decks, sheds, and home projects—delivered in 48 hours.' },
              { title: 'WHY CHOOSE US', body: 'Reliable plans, budget-friendly pricing, and built for builders like you.' },
            ].map((item) => (
              <div key={item.title} style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.1em', color: '#1B7FE8', marginBottom: '0.75rem', textTransform: 'uppercase' }}>{item.title}</div>
                <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '1rem', margin: 0 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section style={{ backgroundColor: '#0F1929', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', textAlign: 'center', marginBottom: '0.75rem' }}>What to Expect</h2>
          <p style={{ textAlign: 'center', color: '#94A3B8', marginBottom: '3.5rem', fontSize: '1.05rem' }}>We hold ourselves to the highest standard—every time.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {[
              { title: 'High Expectations', body: 'With us, you can expect incredibly high quality. Whatever you have in mind, we strive to exceed your highest expectations.' },
              { title: 'Quality Control', body: "We take what you need seriously. You'll get professional plans that exceed your expectations." },
              { title: 'Ongoing Feedback', body: 'Stay connected and receive ongoing updates about your plans throughout the entire process.' },
              { title: 'Save on Costs', body: 'We keep our prices low so you can keep more of your money.' },
            ].map((item) => (
              <div key={item.title} style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', padding: '1.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: '40px', height: '3px', backgroundColor: '#1B7FE8', borderRadius: '2px', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: '#94A3B8', lineHeight: 1.65, fontSize: '0.95rem', margin: 0 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section style={{ backgroundColor: '#ffffff', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1rem' }}>Get in Touch</h2>
          <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '2.5rem', fontSize: '1.05rem' }}>
            Have questions? We'd love to hear from you.
          </p>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <a href="tel:5014047526" style={{ color: '#1B7FE8', textDecoration: 'none', fontWeight: '600' }}>501-404-7526</a>
            <a href="mailto:info@readysetplans.com" style={{ color: '#1B7FE8', textDecoration: 'none', fontWeight: '600' }}>info@readysetplans.com</a>
            <span style={{ color: '#475569' }}>Charlottesville, VA</span>
          </div>
          <Link href="/contact" style={{
            backgroundColor: '#1B7FE8',
            color: '#ffffff',
            fontWeight: '700',
            padding: '0.875rem 2rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            display: 'inline-block',
            marginRight: '1rem',
          }}>Contact Us</Link>
          <Link href="/order" style={{
            backgroundColor: 'transparent',
            color: '#1B7FE8',
            fontWeight: '700',
            padding: '0.875rem 2rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            display: 'inline-block',
            border: '2px solid #1B7FE8',
          }}>Order Plans</Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#1A2332',
        color: '#94A3B8',
        padding: '3rem 2rem',
        textAlign: 'center',
      }}>
        <Image src="/logo.png" alt="Ready Set Plans" height={50} width={150} style={{ objectFit: 'contain', marginBottom: '1.5rem' }} />
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          <a href="tel:5014047526" style={{ color: '#94A3B8', textDecoration: 'none' }}>501-404-7526</a>
          <a href="mailto:info@readysetplans.com" style={{ color: '#94A3B8', textDecoration: 'none' }}>info@readysetplans.com</a>
          <span>Charlottesville, VA</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0 }}>
          &copy; {new Date().getFullYear()} Ready Set Plans. All rights reserved.
        </p>
      </footer>

    </div>
  )
}
