import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: '#1A2332', margin: 0, padding: 0 }}>

      {/* ── Navbar ── */}
      <nav style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
        position: 'sticky',
        top: 0,
        zIndex: 200,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <Image src="/logo.png" alt="Ready Set Plans" height={52} width={160} style={{ objectFit: 'contain' }} priority />
        <Link href="/order" style={{
          backgroundColor: '#1B7FE8',
          color: '#ffffff',
          fontWeight: '700',
          fontSize: '0.9375rem',
          padding: '0.6rem 1.5rem',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          letterSpacing: '0.01em',
          boxShadow: '0 2px 8px rgba(27,127,232,0.3)',
          transition: 'background 0.15s',
        }}>
          Order Now →
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        backgroundColor: '#1A2332',
        position: 'relative',
        overflow: 'hidden',
        padding: '5rem 2rem 4rem',
      }}>
        {/* Blueprint SVG grid background */}
        <svg
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="smallGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1B7FE8" strokeWidth="0.5" />
            </pattern>
            <pattern id="grid" width="200" height="200" patternUnits="userSpaceOnUse">
              <rect width="200" height="200" fill="url(#smallGrid)" />
              <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#1B7FE8" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Radial glow */}
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(27,127,232,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: '1120px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Left copy */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(27,127,232,0.15)',
              border: '1px solid rgba(27,127,232,0.4)',
              color: '#60A5FA',
              fontSize: '0.8125rem',
              fontWeight: '600',
              padding: '0.35rem 0.875rem',
              borderRadius: '999px',
              marginBottom: '1.5rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1B7FE8', display: 'inline-block' }} />
              Trusted by 100+ Deck Builders
            </div>
            <h1 style={{
              fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
              fontWeight: '800',
              color: '#ffffff',
              lineHeight: 1.12,
              marginBottom: '1.375rem',
              letterSpacing: '-0.02em',
            }}>
              Permit-Ready<br />
              <span style={{ color: '#1B7FE8' }}>Deck Plans</span><br />
              in 48 Hours
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: '#94A3B8',
              marginBottom: '2.5rem',
              lineHeight: 1.7,
              maxWidth: '480px',
            }}>
              Submit a sketch, get professional construction drawings your inspector will approve. Fast, flat-rate, guaranteed.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/order" style={{
                backgroundColor: '#1B7FE8',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '1.0625rem',
                padding: '0.875rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 16px rgba(27,127,232,0.4)',
              }}>
                Order Plans Now
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <a href="#how-it-works" style={{
                backgroundColor: 'transparent',
                color: '#CBD5E1',
                fontWeight: '600',
                fontSize: '1.0625rem',
                padding: '0.875rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: '1.5px solid rgba(255,255,255,0.2)',
              }}>
                See How It Works
              </a>
            </div>
          </div>

          {/* Right: architectural SVG graphic */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg
              viewBox="0 0 420 360"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '100%', maxWidth: '440px', filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.4))' }}
            >
              {/* Blueprint card background */}
              <rect x="20" y="20" width="380" height="320" rx="12" fill="#0F1929" stroke="#1B7FE8" strokeWidth="1.5" />
              {/* Interior grid lines */}
              {[60,100,140,180,220,260,300].map(y => (
                <line key={y} x1="40" y1={y} x2="380" y2={y} stroke="#1B7FE8" strokeWidth="0.4" strokeOpacity="0.35" />
              ))}
              {[70,110,150,190,230,270,310,350].map(x => (
                <line key={x} x1={x} y1="40" x2={x} y2="320" stroke="#1B7FE8" strokeWidth="0.4" strokeOpacity="0.35" />
              ))}

              {/* Floor plan outline */}
              <rect x="70" y="70" width="200" height="150" rx="2" stroke="#1B7FE8" strokeWidth="2" fill="none" />
              {/* Interior walls */}
              <line x1="160" y1="70" x2="160" y2="180" stroke="#1B7FE8" strokeWidth="1.5" />
              <line x1="70" y1="150" x2="160" y2="150" stroke="#1B7FE8" strokeWidth="1.5" />
              {/* Door arc */}
              <path d="M 160 180 Q 185 180 185 155" stroke="#1B7FE8" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
              {/* Window markers */}
              <line x1="90" y1="70" x2="120" y2="70" stroke="#60A5FA" strokeWidth="3" />
              <line x1="200" y1="70" x2="230" y2="70" stroke="#60A5FA" strokeWidth="3" />
              <line x1="270" y1="90" x2="270" y2="130" stroke="#60A5FA" strokeWidth="3" />

              {/* Deck extension */}
              <rect x="270" y="100" width="80" height="80" rx="2" stroke="#1B7FE8" strokeWidth="2" strokeDasharray="8 4" fill="rgba(27,127,232,0.08)" />
              <text x="296" y="145" fontSize="10" fill="#1B7FE8" fontFamily="monospace" fontWeight="700">DECK</text>

              {/* Dimension lines */}
              <line x1="70" y1="245" x2="270" y2="245" stroke="#94A3B8" strokeWidth="1" markerEnd="url(#arrow)" />
              <line x1="70" y1="241" x2="70" y2="249" stroke="#94A3B8" strokeWidth="1" />
              <line x1="270" y1="241" x2="270" y2="249" stroke="#94A3B8" strokeWidth="1" />
              <text x="155" y="260" fontSize="9" fill="#94A3B8" fontFamily="monospace" textAnchor="middle">20&apos;-0&quot;</text>

              <line x1="305" y1="70" x2="305" y2="220" stroke="#94A3B8" strokeWidth="1" />
              <line x1="301" y1="70" x2="309" y2="70" stroke="#94A3B8" strokeWidth="1" />
              <line x1="301" y1="220" x2="309" y2="220" stroke="#94A3B8" strokeWidth="1" />
              <text x="322" y="150" fontSize="9" fill="#94A3B8" fontFamily="monospace" textAnchor="middle" transform="rotate(90,322,150)">15&apos;-0&quot;</text>

              {/* Title block */}
              <rect x="40" y="278" width="340" height="44" rx="4" fill="rgba(27,127,232,0.1)" stroke="#1B7FE8" strokeWidth="1" />
              <text x="210" y="296" fontSize="9" fill="#94A3B8" fontFamily="monospace" textAnchor="middle">READY SET PLANS</text>
              <text x="210" y="312" fontSize="11" fill="#60A5FA" fontFamily="monospace" textAnchor="middle" fontWeight="700">PERMIT SET — DECK CONSTRUCTION</text>

              {/* Compass rose */}
              <g transform="translate(355, 75)">
                <circle cx="0" cy="0" r="18" stroke="#1B7FE8" strokeWidth="1" fill="rgba(27,127,232,0.1)" />
                <text x="0" y="-6" fontSize="9" fill="#60A5FA" fontFamily="monospace" textAnchor="middle" fontWeight="700">N</text>
                <line x1="0" y1="-4" x2="0" y2="4" stroke="#60A5FA" strokeWidth="1.5" />
                <polygon points="0,-14 -3,-4 3,-4" fill="#1B7FE8" />
                <polygon points="0,14 -3,4 3,4" fill="#94A3B8" />
              </g>

              {/* Ruler left edge */}
              {[0,1,2,3,4,5,6,7,8].map(i => (
                <line key={i} x1="30" y1={50 + i * 30} x2={i % 2 === 0 ? 40 : 36} y2={50 + i * 30} stroke="#1B7FE8" strokeWidth="0.8" strokeOpacity="0.6" />
              ))}
            </svg>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{
        backgroundColor: '#0F1929',
        padding: '0',
        borderTop: '1px solid rgba(27,127,232,0.2)',
        borderBottom: '1px solid rgba(27,127,232,0.2)',
      }}>
        <div style={{
          maxWidth: '1120px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          padding: '0',
        }}>
          {[
            { icon: '⏱', value: '48 Hours', label: 'Turnaround' },
            { icon: '$', value: '$97', label: 'Starting Price' },
            { icon: '✓', value: '100%', label: 'Permit-Ready Guaranteed' },
            { icon: '🏗', value: '100+', label: 'Builders Served' },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              padding: '2rem 1.5rem',
              textAlign: 'center',
              borderRight: i < 3 ? '1px solid rgba(27,127,232,0.15)' : 'none',
            }}>
              <div style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1B7FE8', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: '600' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ backgroundColor: '#ffffff', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p style={{ color: '#1B7FE8', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
              Simple Process
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: '800', color: '#1A2332', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
              From Sketch to Stamped Plans
            </h2>
            <p style={{ color: '#64748B', fontSize: '1.0625rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
              Three simple steps — no back-and-forth, no surprises.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', position: 'relative' }}>
            {/* Connector line */}
            <div style={{
              position: 'absolute',
              top: '52px',
              left: 'calc(16.67% + 28px)',
              width: 'calc(66.66% - 56px)',
              height: '2px',
              background: 'linear-gradient(90deg, #1B7FE8, #1B7FE8)',
              backgroundSize: '8px 2px',
              backgroundRepeat: 'repeat-x',
              opacity: 0.25,
            }} />

            {[
              {
                step: '01',
                title: 'Submit Your Sketch',
                desc: 'Upload a hand sketch or rough drawing with dimensions and site details. Photos of your yard work too.',
                icon: (
                  <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '56px', height: '56px' }}>
                    <rect width="56" height="56" rx="16" fill="#EFF6FF" />
                    {/* Pencil */}
                    <g transform="translate(12,10)">
                      <rect x="13" y="2" width="7" height="22" rx="1" transform="rotate(30 16 13)" fill="#1B7FE8" opacity="0.8" />
                      <polygon points="16,30 13,35 19,35" fill="#1B7FE8" />
                      <rect x="12" y="3" width="8" height="4" rx="1" transform="rotate(30 16 13)" fill="#60A5FA" />
                      {/* Sketch lines */}
                      <path d="M2 28 Q8 22 14 28 Q20 34 26 28" stroke="#94A3B8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                      <path d="M2 32 Q8 26 14 32" stroke="#CBD5E1" strokeWidth="1" fill="none" strokeLinecap="round" />
                    </g>
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'We Draft Your Plans',
                desc: 'Our team converts your sketch into professional, permit-ready construction drawings within 48 hours.',
                icon: (
                  <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '56px', height: '56px' }}>
                    <rect width="56" height="56" rx="16" fill="#EFF6FF" />
                    {/* Drafting compass */}
                    <g transform="translate(8,6)">
                      <line x1="20" y1="6" x2="10" y2="32" stroke="#1B7FE8" strokeWidth="2" strokeLinecap="round" />
                      <line x1="20" y1="6" x2="30" y2="32" stroke="#1B7FE8" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="20" cy="6" r="3" fill="#1B7FE8" />
                      {/* Hinge crossbar */}
                      <line x1="13" y1="18" x2="27" y2="18" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
                      {/* Points */}
                      <polygon points="10,32 8,38 12,36" fill="#1B7FE8" />
                      <circle cx="30" cy="34" r="2.5" fill="#60A5FA" />
                      {/* Arc */}
                      <path d="M10 32 Q20 38 30 32" stroke="#94A3B8" strokeWidth="1" fill="none" strokeDasharray="3 2" />
                    </g>
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Pull Your Permit',
                desc: 'Download your completed plans and submit directly to your local building department. Done.',
                icon: (
                  <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '56px', height: '56px' }}>
                    <rect width="56" height="56" rx="16" fill="#EFF6FF" />
                    {/* House / building */}
                    <g transform="translate(10,8)">
                      {/* Roof */}
                      <polygon points="18,4 2,18 34,18" fill="#1B7FE8" />
                      {/* Wall */}
                      <rect x="4" y="18" width="28" height="18" fill="#60A5FA" opacity="0.7" rx="1" />
                      {/* Door */}
                      <rect x="13" y="26" width="8" height="10" rx="1" fill="#1A2332" />
                      {/* Windows */}
                      <rect x="5" y="20" width="7" height="6" rx="1" fill="#EFF6FF" />
                      <rect x="24" y="20" width="7" height="6" rx="1" fill="#EFF6FF" />
                      {/* Deck */}
                      <rect x="0" y="34" width="36" height="3" rx="1" fill="#1B7FE8" opacity="0.5" />
                      {/* Check stamp */}
                      <circle cx="28" cy="10" r="8" fill="#1A2332" />
                      <path d="M24 10 L27 13 L32 7" stroke="#1B7FE8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={item.step} style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '1.25rem',
                padding: '2.5rem 2rem',
                textAlign: 'center',
                border: '1px solid #E2E8F0',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '1.25rem',
                  right: '1.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  color: '#CBD5E1',
                  letterSpacing: '0.05em',
                }}>
                  {item.step}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1A2332', marginBottom: '0.75rem' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#64748B', lineHeight: 1.65, fontSize: '0.9375rem' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <Link href="/order" style={{
              backgroundColor: '#1B7FE8',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '1.0625rem',
              padding: '0.9375rem 2.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 16px rgba(27,127,232,0.35)',
            }}>
              Start Your Order
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ backgroundColor: '#F1F5F9', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <p style={{ color: '#1B7FE8', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
              Pricing
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: '800', color: '#1A2332', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
              Simple, Flat-Rate Pricing
            </h2>
            <p style={{ color: '#64748B', fontSize: '1.0625rem', lineHeight: 1.7 }}>
              No hourly rates. No hidden fees. Pay once, get your plans.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem', alignItems: 'start' }}>

            {/* Deck Plans */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '1.25rem',
              padding: '2.5rem',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: '1.5px solid #E2E8F0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: '22px', height: '22px' }}>
                    <rect x="3" y="10" width="18" height="11" rx="1" stroke="#1B7FE8" strokeWidth="1.75" />
                    <path d="M2 10l10-7 10 7" stroke="#1B7FE8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="3" y1="21" x2="21" y2="21" stroke="#1B7FE8" strokeWidth="1.75" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1A2332' }}>Deck Plans</h3>
              </div>
              <div style={{ marginBottom: '1.75rem' }}>
                <span style={{ fontSize: '3rem', fontWeight: '800', color: '#1A2332', letterSpacing: '-0.03em' }}>$97</span>
                <span style={{ color: '#94A3B8', fontSize: '0.9375rem', marginLeft: '0.375rem' }}>flat rate</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem' }}>
                {[
                  'Full construction drawings',
                  'Materials list included',
                  'Permit-ready format',
                  '48-hour delivery',
                  'One round of revisions',
                ].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid #F1F5F9', color: '#334155', fontSize: '0.9375rem' }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="9" fill="#EFF6FF" />
                      <path d="M5.5 9l2.5 2.5L12.5 6" stroke="#1B7FE8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/order" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: '#F8FAFC',
                color: '#1B7FE8',
                fontWeight: '700',
                padding: '0.875rem',
                borderRadius: '0.625rem',
                textDecoration: 'none',
                border: '2px solid #1B7FE8',
                fontSize: '1rem',
              }}>
                Order Deck Plans
              </Link>
            </div>

            {/* Screen Porch — featured */}
            <div style={{
              backgroundColor: '#1A2332',
              borderRadius: '1.25rem',
              padding: '2.5rem',
              boxShadow: '0 8px 32px rgba(27,127,232,0.2)',
              border: '1.5px solid #1B7FE8',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '-14px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#1B7FE8',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: '800',
                padding: '0.3rem 1.25rem',
                borderRadius: '999px',
                whiteSpace: 'nowrap',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
              }}>
                Most Popular
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(27,127,232,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" style={{ width: '22px', height: '22px' }}>
                    <rect x="2" y="8" width="20" height="14" rx="1" stroke="#60A5FA" strokeWidth="1.75" />
                    <path d="M1 8l11-6 11 6" stroke="#60A5FA" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 22V15h6v7" stroke="#60A5FA" strokeWidth="1.75" strokeLinecap="round" />
                    {/* Screen lines */}
                    <line x1="4" y1="11" x2="4" y2="20" stroke="#60A5FA" strokeWidth="1" strokeOpacity="0.5" />
                    <line x1="7" y1="11" x2="7" y2="14" stroke="#60A5FA" strokeWidth="1" strokeOpacity="0.5" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff' }}>Screen Porch Plans</h3>
              </div>
              <div style={{ marginBottom: '1.75rem' }}>
                <span style={{ fontSize: '3rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.03em' }}>$147</span>
                <span style={{ color: '#60A5FA', fontSize: '0.9375rem', marginLeft: '0.375rem' }}>flat rate</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem' }}>
                {[
                  'Full construction drawings',
                  'Materials list included',
                  'Permit-ready format',
                  '48-hour delivery',
                  'One round of revisions',
                  'Screening & framing details',
                ].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.07)', color: '#CBD5E1', fontSize: '0.9375rem' }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="9" fill="rgba(27,127,232,0.2)" />
                      <path d="M5.5 9l2.5 2.5L12.5 6" stroke="#60A5FA" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/order" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                backgroundColor: '#1B7FE8',
                color: '#ffffff',
                fontWeight: '700',
                padding: '0.875rem',
                borderRadius: '0.625rem',
                textDecoration: 'none',
                fontSize: '1rem',
                boxShadow: '0 4px 16px rgba(27,127,232,0.4)',
              }}>
                Order Screen Porch Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust / Built For section ── */}
      <section style={{ backgroundColor: '#1A2332', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#1B7FE8', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
            Built for the Pros
          </p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
            Built for Trex Contractors<br />and Deck Builders
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1.0625rem', lineHeight: 1.75, maxWidth: '580px', margin: '0 auto 4rem' }}>
            We speak your language. Our drafters understand deck construction, local permit requirements, and what inspectors actually want to see — so you can get back to building.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', textAlign: 'left' }}>
            {[
              {
                title: 'Inspector-Approved Format',
                body: 'Plans drawn to IBC/IRC standards with all required details, sections, and notes your building department expects.',
                icon: (
                  <svg viewBox="0 0 32 32" fill="none" style={{ width: '32px', height: '32px' }}>
                    <rect width="32" height="32" rx="8" fill="rgba(27,127,232,0.15)" />
                    <path d="M8 16l5 5 11-10" stroke="#1B7FE8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                title: 'Any State, Any County',
                body: 'We work with deck builders across the country and adapt to your local jurisdiction\'s specific requirements.',
                icon: (
                  <svg viewBox="0 0 32 32" fill="none" style={{ width: '32px', height: '32px' }}>
                    <rect width="32" height="32" rx="8" fill="rgba(27,127,232,0.15)" />
                    <circle cx="16" cy="16" r="8" stroke="#1B7FE8" strokeWidth="2" />
                    <path d="M8 16h16M16 8c-2 2-3 5-3 8s1 6 3 8M16 8c2 2 3 5 3 8s-1 6-3 8" stroke="#1B7FE8" strokeWidth="1.5" />
                  </svg>
                ),
              },
              {
                title: 'Flat Rate, No Surprises',
                body: 'Quote upfront, pay once. No hourly billing, no revision fees, no scope creep. You always know what you\'re paying.',
                icon: (
                  <svg viewBox="0 0 32 32" fill="none" style={{ width: '32px', height: '32px' }}>
                    <rect width="32" height="32" rx="8" fill="rgba(27,127,232,0.15)" />
                    <circle cx="16" cy="16" r="8" stroke="#1B7FE8" strokeWidth="2" />
                    <path d="M16 10v2M16 20v2M12 14h4.5a1.5 1.5 0 0 1 0 3H13a1.5 1.5 0 0 0 0 3H20" stroke="#1B7FE8" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ),
              },
            ].map(card => (
              <div key={card.title} style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '1rem',
                padding: '2rem',
              }}>
                <div style={{ marginBottom: '1rem' }}>{card.icon}</div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.625rem' }}>{card.title}</h3>
                <p style={{ color: '#94A3B8', fontSize: '0.9375rem', lineHeight: 1.65, margin: 0 }}>{card.body}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '4rem' }}>
            <Link href="/order" style={{
              backgroundColor: '#1B7FE8',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '1.125rem',
              padding: '1rem 2.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 20px rgba(27,127,232,0.4)',
            }}>
              Get Your Plans Today
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        backgroundColor: '#0F1929',
        borderTop: '1px solid rgba(27,127,232,0.15)',
        padding: '3.5rem 2rem 2rem',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem' }}>
            <div>
              <Image src="/logo.png" alt="Ready Set Plans" height={50} width={155} style={{ objectFit: 'contain', marginBottom: '1rem', display: 'block' }} />
              <p style={{ color: '#64748B', fontSize: '0.9rem', maxWidth: '260px', lineHeight: 1.65, margin: 0 }}>
                Fast, permit-ready deck plans for professional builders.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ color: '#94A3B8', fontSize: '0.8125rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.25rem' }}>Contact</p>
              <a href="tel:5014047526" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h3l1.5 3.5-1.5 1a7 7 0 003.5 3.5l1-1.5L13 10v3a1 1 0 01-1 1A11 11 0 011 3a1 1 0 011-1z" stroke="#64748B" strokeWidth="1.2" /></svg>
                501.404.7526
              </a>
              <a href="mailto:info@readysetplans.com" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8" rx="1" stroke="#64748B" strokeWidth="1.2" /><path d="M1 4l6 4 6-4" stroke="#64748B" strokeWidth="1.2" /></svg>
                info@readysetplans.com
              </a>
              <a href="https://readysetplans.com" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#64748B" strokeWidth="1.2" /><path d="M1 7h12M7 1c-1.5 1.5-2 3.5-2 6s.5 4.5 2 6M7 1c1.5 1.5 2 3.5 2 6s-.5 4.5-2 6" stroke="#64748B" strokeWidth="1.2" /></svg>
                readysetplans.com
              </a>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0 }}>
              &copy; {new Date().getFullYear()} Ready Set Plans. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
