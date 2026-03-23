import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
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
          <Link href="/about" style={{ color: '#475569', textDecoration: 'none', fontWeight: '500', fontSize: '0.95rem' }}>About</Link>
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
        padding: '6rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '800',
            color: '#ffffff',
            lineHeight: 1.15,
            marginBottom: '1.25rem',
          }}>
            Permit-Ready Deck Plans in 48 Hours
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: '#94A3B8',
            marginBottom: '2.5rem',
            lineHeight: 1.6,
          }}>
            Fast, affordable drafting for deck builders. Submit a sketch, get professional plans.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/order" style={{
              backgroundColor: '#1B7FE8',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '1.125rem',
              padding: '0.875rem 2rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              display: 'inline-block',
            }}>
              Order Now
            </Link>
            <a href="#how-it-works" style={{
              backgroundColor: 'transparent',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '1.125rem',
              padding: '0.875rem 2rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              display: 'inline-block',
              border: '2px solid rgba(255,255,255,0.4)',
            }}>
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{
        backgroundColor: '#0F1929',
        padding: '2rem',
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          textAlign: 'center',
        }}>
          {[
            { value: '48 Hours', label: 'Turnaround Time' },
            { value: 'Starting at $97', label: 'Flat-Rate Pricing' },
            { value: '100% Permit Ready', label: 'Guaranteed' },
          ].map((stat) => (
            <div key={stat.value} style={{ padding: '1rem' }}>
              <div style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: '800', color: '#1B7FE8', marginBottom: '0.25rem' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission / What We Do / Why Choose Us */}
      <section style={{ backgroundColor: '#F1F5F9', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          {[
            { title: 'OUR MISSION', body: 'To make professional building plans fast, simple, and affordable for contractors.' },
            { title: 'WHAT WE DO', body: 'We create custom CAD drawings for decks, sheds, and home projects—delivered in 48 hours.' },
            { title: 'WHY CHOOSE US', body: 'Reliable plans, budget-friendly pricing, and built for builders like you.' },
          ].map((item) => (
            <div key={item.title} style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', color: '#1B7FE8', marginBottom: '0.75rem', textTransform: 'uppercase' }}>{item.title}</div>
              <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '1rem', margin: 0 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ backgroundColor: '#0F1929', padding: '5rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0F1929 0%, #1A2E4A 100%)', opacity: 0.95 }} />
        <div style={{ position: 'relative', maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', textAlign: 'center', marginBottom: '0.75rem' }}>What to Expect</h2>
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

      {/* Built by Builders */}
      <section style={{ backgroundColor: '#ffffff', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', color: '#1B7FE8', marginBottom: '1rem', textTransform: 'uppercase' }}>Our Story</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '800', marginBottom: '1.5rem', lineHeight: 1.2 }}>Built for Contractors, By Contractors</h2>
          <p style={{ color: '#475569', lineHeight: 1.8, fontSize: '1.05rem', margin: '0 0 2rem' }}>
            At Ready Set Plans, we know exactly what you need—because we've been in your boots. As builders ourselves, we were constantly ordering plans for our own projects and got tired of the high costs, slow turnarounds, and complicated systems. That's why we created a service built for contractors, by contractors.
          </p>
          <Link href="/about" style={{ color: '#1B7FE8', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem' }}>Learn Our Story →</Link>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ backgroundColor: '#F8FAFC', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', textAlign: 'center', marginBottom: '0.75rem' }}>
            Simple, Transparent Pricing
          </h2>
          <p style={{ textAlign: 'center', color: '#64748B', marginBottom: '3rem', fontSize: '1.1rem' }}>
            No hourly rates. No surprises. Pay once, get your plans.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

            {/* Deck Plans */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '2px solid #E2E8F0',
            }}>
              <h3 style={{ fontSize: '1.375rem', fontWeight: '700', marginBottom: '0.5rem' }}>Deck Plans</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1B7FE8', marginBottom: '1rem' }}>$97</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', color: '#475569', lineHeight: 2 }}>
                <li>✓ Full construction drawings</li>
                <li>✓ Materials list</li>
                <li>✓ Permit-ready format</li>
                <li>✓ 48-hour delivery</li>
                <li>✓ One round of revisions</li>
              </ul>
              <Link href="/order" style={{
                display: 'block',
                textAlign: 'center',
                backgroundColor: '#1B7FE8',
                color: '#ffffff',
                fontWeight: '700',
                padding: '0.875rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
              }}>
                Order Deck Plans
              </Link>
            </div>

            {/* Screen Porch Plans */}
            <div style={{
              backgroundColor: '#1A2332',
              borderRadius: '1rem',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              border: '2px solid #1B7FE8',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#1B7FE8',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '0.25rem 1rem',
                borderRadius: '999px',
                whiteSpace: 'nowrap',
              }}>
                MOST POPULAR
              </div>
              <h3 style={{ fontSize: '1.375rem', fontWeight: '700', marginBottom: '0.5rem', color: '#ffffff' }}>Screen Porch Plans</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1B7FE8', marginBottom: '1rem' }}>$147</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', color: '#94A3B8', lineHeight: 2 }}>
                <li>✓ Full construction drawings</li>
                <li>✓ Materials list</li>
                <li>✓ Permit-ready format</li>
                <li>✓ 48-hour delivery</li>
                <li>✓ One round of revisions</li>
              </ul>
              <Link href="/order" style={{
                display: 'block',
                textAlign: 'center',
                backgroundColor: '#1B7FE8',
                color: '#ffffff',
                fontWeight: '700',
                padding: '0.875rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
              }}>
                Order Screen Porch Plans
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ backgroundColor: '#ffffff', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', textAlign: 'center', marginBottom: '0.75rem' }}>
            How It Works
          </h2>
          <p style={{ textAlign: 'center', color: '#64748B', marginBottom: '3.5rem', fontSize: '1.1rem' }}>
            Three simple steps from sketch to stamped plans.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {[
              { step: '01', title: 'Submit Your Sketch', desc: 'Upload a hand sketch or rough drawing of your project along with dimensions and site details.' },
              { step: '02', title: 'We Draft Your Plans', desc: 'Our team converts your sketch into professional, permit-ready construction drawings within 48 hours.' },
              { step: '03', title: 'Pull Your Permit', desc: 'Download your completed plans and submit them directly to your local building department.' },
            ].map((item) => (
              <div key={item.step} style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#EFF6FF',
                  color: '#1B7FE8',
                  fontWeight: '800',
                  fontSize: '1.125rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: '#64748B', lineHeight: 1.6, fontSize: '0.95rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/order" style={{
              backgroundColor: '#1B7FE8',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '1.125rem',
              padding: '0.875rem 2.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              display: 'inline-block',
            }}>
              Get Started Today
            </Link>
          </div>
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
          <a href="tel:5014047526" style={{ color: '#94A3B8', textDecoration: 'none' }}>501.404.7526</a>
          <a href="mailto:info@readysetplans.com" style={{ color: '#94A3B8', textDecoration: 'none' }}>info@readysetplans.com</a>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0 }}>
          &copy; {new Date().getFullYear()} Ready Set Plans. All rights reserved.
        </p>
      </footer>

    </div>
  )
}
