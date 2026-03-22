import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(to bottom right, #1A56DB, #1E40AF)',
        color: '#ffffff',
        padding: '6rem 0'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '3.75rem',
              fontWeight: '800',
              marginBottom: '2rem',
              lineHeight: '1.1'
            }}>
              Permit-Ready Deck Plans
              <span style={{
                display: 'block',
                color: '#93C5FD',
                fontSize: '3rem',
                fontWeight: 'normal',
                marginTop: '1rem'
              }}>
                in 48 Hours
              </span>
            </h1>
            <p style={{
              fontSize: '1.5rem',
              color: '#BFDBFE',
              marginBottom: '3rem',
              maxWidth: '1024px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: '1.6'
            }}>
              Fast, affordable drafting for deck builders. Submit a sketch, get professional plans that meet local building codes.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <Link
                href="/order"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '1rem 2rem',
                  backgroundColor: '#ffffff',
                  color: '#1A56DB',
                  fontWeight: 'bold',
                  fontSize: '1.125rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  transition: 'background-color 0.2s'
                }}
              >
                Get Started Today
                <svg style={{ marginLeft: '0.5rem', width: '1.25rem', height: '1.25rem' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <div style={{ color: '#BFDBFE', fontSize: '0.875rem' }}>
                ✓ No hidden fees • ✓ 48-hour turnaround • ✓ Permit-ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '6rem 0', backgroundColor: '#F9FAFB' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1rem'
            }}>
              Choose Your Plan
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#6B7280',
              maxWidth: '768px',
              margin: '0 auto'
            }}>
              Professional drafting services for deck builders and contractors
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem',
            maxWidth: '1024px',
            margin: '0 auto'
          }}>
            {/* Deck Plans Card */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              padding: '2rem',
              border: '2px solid #E5E7EB'
            }}>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{
                  fontSize: '1.875rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '0.5rem'
                }}>Deck Plans</h3>
                <p style={{ color: '#6B7280', marginBottom: '2rem' }}>Perfect for residential decks</p>
                <div style={{
                  fontSize: '3.75rem',
                  fontWeight: '800',
                  color: '#1A56DB',
                  marginBottom: '2rem'
                }}>$97</div>
                <ul style={{ textAlign: 'left', marginBottom: '2rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#10B981', marginRight: '0.75rem' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Permit-ready drawings
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#10B981', marginRight: '0.75rem' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Foundation plan included
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#10B981', marginRight: '0.75rem' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Framing details
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#10B981', marginRight: '0.75rem' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    48-hour turnaround
                  </li>
                </ul>
                <Link
                  href="/order"
                  style={{
                    display: 'block',
                    width: '100%',
                    backgroundColor: '#1A56DB',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    padding: '1rem 2rem',
                    borderRadius: '0.5rem',
                    textAlign: 'center',
                    textDecoration: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Order Now
                </Link>
              </div>
            </div>

            {/* Screen Porch Plans Card - Most Popular */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '2rem',
              border: '2px solid #1A56DB',
              position: 'relative',
              transform: 'scale(1.05)'
            }}>
              <div style={{
                position: 'absolute',
                top: '-1rem',
                left: '50%',
                transform: 'translateX(-50%)'
              }}>
                <span style={{
                  backgroundColor: '#1A56DB',
                  color: '#ffffff',
                  padding: '0.25rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}>
                  MOST POPULAR
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{
                  fontSize: '1.875rem',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '0.5rem'
                }}>Screen Porch Plans</h3>
                <p style={{ color: '#6B7280', marginBottom: '2rem' }}>Includes screen enclosure specs</p>
                <div style={{
                  fontSize: '3.75rem',
                  fontWeight: '800',
                  color: '#1A56DB',
                  marginBottom: '2rem'
                }}>$147</div>
                <ul style={{ textAlign: 'left', marginBottom: '2rem' }}>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#10B981', marginRight: '0.75rem' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Everything in Deck Plans
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#10B981', marginRight: '0.75rem' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Screen enclosure specifications
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#10B981', marginRight: '0.75rem' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Door and window schedules
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', color: '#10B981', marginRight: '0.75rem' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Priority processing
                  </li>
                </ul>
                <Link
                  href="/order"
                  style={{
                    display: 'block',
                    width: '100%',
                    backgroundColor: '#1A56DB',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    padding: '1rem 2rem',
                    borderRadius: '0.5rem',
                    textAlign: 'center',
                    textDecoration: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Order Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '6rem 0', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1rem'
            }}>
              How It Works
            </h2>
            <p style={{
              fontSize: '1.25rem',
              color: '#6B7280',
              maxWidth: '768px',
              margin: '0 auto'
            }}>
              Get your permit-ready plans in just three simple steps
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '5rem',
                height: '5rem',
                background: 'linear-gradient(to bottom right, #1A56DB, #1E40AF)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}>
                <span style={{ color: '#ffffff', fontSize: '1.875rem', fontWeight: 'bold' }}>1</span>
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '1rem'
              }}>Submit Your Sketch</h3>
              <p style={{
                color: '#6B7280',
                fontSize: '1.125rem',
                lineHeight: '1.6'
              }}>
                Upload your hand-drawn sketch, measurements, or photos. Include any special requirements or local building codes.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '5rem',
                height: '5rem',
                background: 'linear-gradient(to bottom right, #1A56DB, #1E40AF)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}>
                <span style={{ color: '#ffffff', fontSize: '1.875rem', fontWeight: 'bold' }}>2</span>
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '1rem'
              }}>We Create Your Plans</h3>
              <p style={{
                color: '#6B7280',
                fontSize: '1.125rem',
                lineHeight: '1.6'
              }}>
                Our professional drafters create detailed, permit-ready plans within 48 hours using industry-standard software.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '5rem',
                height: '5rem',
                background: 'linear-gradient(to bottom right, #1A56DB, #1E40AF)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}>
                <span style={{ color: '#ffffff', fontSize: '1.875rem', fontWeight: 'bold' }}>3</span>
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '1rem'
              }}>Get Approved & Build</h3>
              <p style={{
                color: '#6B7280',
                fontSize: '1.125rem',
                lineHeight: '1.6'
              }}>
                Submit your plans to local authorities for approval. Once approved, start building with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '6rem 0',
        background: 'linear-gradient(to right, #1A56DB, #1E40AF)',
        color: '#ffffff'
      }}>
        <div style={{ maxWidth: '768px', margin: '0 auto', padding: '0 1rem', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem'
          }}>
            Ready to Get Started?
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: '#BFDBFE',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Join hundreds of deck builders who trust us with their permit plans. Get your professional plans today.
          </p>
          <Link
            href="/order"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '1rem 2rem',
              backgroundColor: '#ffffff',
              color: '#1A56DB',
              fontWeight: 'bold',
              fontSize: '1.125rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.2s'
            }}
          >
            Start Your Order
            <svg style={{ marginLeft: '0.5rem', width: '1.25rem', height: '1.25rem' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#111827', color: '#ffffff', padding: '3rem 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Ready Set Plans</h3>
            <p style={{ color: '#9CA3AF', marginBottom: '1.5rem' }}>
              Professional drafting services for deck builders and contractors
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.875rem', color: '#9CA3AF' }}>
              <span>© 2024 Ready Set Plans</span>
              <span>•</span>
              <span>All rights reserved</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}