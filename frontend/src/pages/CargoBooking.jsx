import React, { useState } from 'react';
import './CargoBooking.css';

const CargoBooking = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRoute, setSelectedRoute] = useState('uk-somalia');
  const [selectedService, setSelectedService] = useState('air');
  const [ratePerKg, setRatePerKg] = useState(4.5);
  const [weight, setWeight] = useState('');
  const [price, setPrice] = useState('—');
  const [trackingInput, setTrackingInput] = useState('');
  const [trackResult, setTrackResult] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  const calcPriceInline = (w, rate) => {
    if (!w || w <= 0) return '—';
    return '£' + (w * rate).toFixed(2);
  };

  const handleWeightChange = (e) => {
    const w = parseFloat(e.target.value);
    setWeight(e.target.value);
    setPrice(calcPriceInline(w, ratePerKg));
  };

  const selectRoute = (route) => {
    setSelectedRoute(route);
  };

  const selectService = (service, rate) => {
    setSelectedService(service);
    setRatePerKg(rate);
    const w = parseFloat(weight);
    setPrice(calcPriceInline(w, rate));
  };

  const nextStep = () => {
    if (currentStep === 3) {
      submitBooking();
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitBooking = () => {
    const ref = 'ZGC-' + Math.floor(100000 + Math.random() * 900000);
    setBookingRef(ref);
    setIsSuccess(true);
  };

  const resetForm = () => {
    setCurrentStep(1);
    setIsSuccess(false);
    setWeight('');
    setPrice('—');
  };

  const trackShipment = () => {
    const val = trackingInput.trim();
    if (!val) return;
    setTrackResult('<span style="color:var(--gold)">⏳ Searching...</span>');
    setTimeout(() => {
      if (val.startsWith('ZGC')) {
        setTrackResult(`
          <div style="background:#f0f7f0;border:1px solid #c3e6c3;border-radius:8px;padding:12px;color:var(--ink);">
            <strong style="color:var(--teal)">✓ In Transit</strong><br>
            <span style="font-size:12px;color:var(--muted)">Last update: Heathrow Cargo Hub → En route to Mogadishu</span>
          </div>`);
      } else {
        setTrackResult('<span style="color:var(--rust)">No shipment found. Check your reference number.</span>');
      }
    }, 1200);
  };

  const progressFills = { 1: '33%', 2: '66%', 3: '100%' };

  return (
    <div className="cargo-page">
      {/* HERO */}
      <div className="hero">
        <div className="hero-pattern"></div>
        <div class="hero-glow"></div>
        <div className="hero-content mt-10">
          <div className="hero-eyebrow">📦 International Cargo</div>
          <h1>Ship Anywhere.<br /><em>We Handle It.</em></h1>
          <p>UK → Somalia · China → Somalia · Door-to-door delivery with tracking. Fast, reliable, affordable.</p>
        </div>
      </div>

      {/* ROUTES BAR */}
      <div className="routes-bar">
        <div className="route-pill">🇬🇧 UK → 🇸🇴 Somalia <span className="dot"></span> 5–7 days air</div>
        <div className="route-pill">🇨🇳 China → 🇸🇴 Somalia <span className="dot"></span> 25–35 days sea</div>
        <div className="route-pill">🇸🇴 Somalia → 🇬🇧 UK <span className="dot"></span> On request</div>
        <div className="route-pill">📦 Door-to-door available</div>
      </div>

      {/* MAIN */}
      <div className="main">
        {/* BOOKING FORM */}
        <div className="form-card">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: !isSuccess ? progressFills[currentStep] : '100%' }}></div>
          </div>

          <div className="form-header">
            <div className="icon">📦</div>
            <h2>Book Cargo</h2>
            <div className="step-indicator">
              <div className={`step-dot ${!isSuccess && currentStep >= 1 ? (currentStep === 1 ? 'active' : 'done') : 'done'}`}></div>
              <div className={`step-dot ${!isSuccess && currentStep >= 2 ? (currentStep === 2 ? 'active' : 'done') : (isSuccess ? 'done' : '')}`}></div>
              <div className={`step-dot ${!isSuccess && currentStep >= 3 ? (currentStep === 3 ? 'active' : 'done') : (isSuccess ? 'done' : '')}`}></div>
            </div>
          </div>

          {!isSuccess && (
            <>
              {/* STEP 1: Route & Service */}
              <div className={`step ${currentStep === 1 ? 'active' : ''}`}>
                <div className="step-title">Choose Route & Service</div>
                <div className="step-sub">Select your shipping route and preferred service</div>

                <label>SHIPPING ROUTE</label>
                <div className="route-grid">
                  <div className={`route-card ${selectedRoute === 'uk-somalia' ? 'selected' : ''}`} onClick={() => selectRoute('uk-somalia')}>
                    <div className="flag-row">🇬🇧 <span className="arrow">→</span> 🇸🇴</div>
                    <div className="route-name">UK → Somalia</div>
                    <div className="route-time">5–7 days air</div>
                  </div>
                  <div className={`route-card ${selectedRoute === 'china-somalia' ? 'selected' : ''}`} onClick={() => selectRoute('china-somalia')}>
                    <div className="flag-row">🇨🇳 <span className="arrow">→</span> 🇸🇴</div>
                    <div className="route-name">China → Somalia</div>
                    <div className="route-time">25–35 days sea</div>
                  </div>
                  <div className={`route-card ${selectedRoute === 'somalia-uk' ? 'selected' : ''}`} onClick={() => selectRoute('somalia-uk')}>
                    <div className="flag-row">🇸🇴 <span className="arrow">→</span> 🇬🇧</div>
                    <div className="route-name">Somalia → UK</div>
                    <div className="route-time">Contact us</div>
                  </div>
                </div>

                <label>SERVICE TYPE</label>
                <div className="service-grid">
                  <div className={`service-card ${selectedService === 'air' ? 'selected' : ''}`} onClick={() => selectService('air', 4.5)}>
                    <div className="s-icon">✈️</div>
                    <div className="s-name">Air Freight</div>
                    <div className="s-desc">Fast delivery. Best for urgent or valuable items.</div>
                    <div className="s-price">From £4.50/kg</div>
                  </div>
                  <div className={`service-card ${selectedService === 'sea' ? 'selected' : ''}`} onClick={() => selectService('sea', 1.2)}>
                    <div className="s-icon">🚢</div>
                    <div className="s-name">Sea Freight</div>
                    <div className="s-desc">Economical for large shipments. Best for China route.</div>
                    <div className="s-price">From £1.20/kg</div>
                  </div>
                  <div className={`service-card ${selectedService === 'express' ? 'selected' : ''}`} onClick={() => selectService('express', 8.5)}>
                    <div className="s-icon">⚡</div>
                    <div className="s-name">Express (FedEx)</div>
                    <div className="s-desc">3–5 days. Full tracking. Door-to-door.</div>
                    <div className="s-price">From £8.50/kg</div>
                  </div>
                  <div className={`service-card ${selectedService === 'economy' ? 'selected' : ''}`} onClick={() => selectService('economy', 3.2)}>
                    <div className="s-icon">💼</div>
                    <div className="s-name">Economy (Aramex)</div>
                    <div className="s-desc">Budget-friendly. Reliable for non-urgent cargo.</div>
                    <div className="s-price">From £3.20/kg</div>
                  </div>
                </div>

                {/* PRICE CALCULATOR */}
                <div className="calc-box">
                  <h4>💰 INSTANT PRICE CALCULATOR</h4>
                  <div className="calc-row">
                    <label>KG</label>
                    <input type="number" placeholder="Weight (kg)" value={weight} onChange={handleWeightChange} min="0.5" step="0.5" />
                  </div>
                  <div className="price-result">
                    <div>
                      <div className="label">ESTIMATED TOTAL</div>
                    </div>
                    <div className="amount">{price}</div>
                  </div>
                </div>
              </div>

              {/* STEP 2: Cargo Details */}
              <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
                <div className="step-title">Cargo Details</div>
                <div className="step-sub">Tell us what you're shipping</div>

                <div className="field-group">
                  <div className="field-row">
                    <div>
                      <label>Weight (KG)</label>
                      <input type="number" placeholder="e.g. 25" min="0.5" step="0.5" value={weight} onChange={handleWeightChange} />
                    </div>
                    <div>
                      <label>Number of Parcels</label>
                      <input type="number" placeholder="e.g. 3" min="1" />
                    </div>
                  </div>
                </div>

                <div className="field-group">
                  <label>Contents / Description</label>
                  <input type="text" placeholder="e.g. Clothes, Electronics, Food items" />
                </div>

                <div className="field-group">
                  <div className="field-row">
                    <div>
                      <label>Declared Value (£)</label>
                      <input type="number" placeholder="e.g. 500" />
                    </div>
                    <div>
                      <label>Add Insurance?</label>
                      <select>
                        <option value="no">No Insurance</option>
                        <option value="basic">Basic (1% of value)</option>
                        <option value="full">Full Cover (2.5% of value)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="field-group">
                  <label>Special Instructions (Optional)</label>
                  <textarea placeholder="Fragile items, special handling, preferred delivery time..."></textarea>
                </div>
              </div>

              {/* STEP 3: Contact Info */}
              <div className={`step ${currentStep === 3 ? 'active' : ''}`}>
                <div className="step-title">Sender & Recipient</div>
                <div className="step-sub">Enter contact details for both sides</div>

                <div style={{ background: '#f8f6f2', borderRadius: '10px', padding: '18px', marginBottom: '24px' }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', marginBottom: '12px' }}>📤 Sender (UK)</div>
                  <div className="field-row" style={{ marginBottom: '12px' }}>
                    <div>
                      <label>Full Name</label>
                      <input type="text" placeholder="Your name" />
                    </div>
                    <div>
                      <label>Phone</label>
                      <input type="tel" placeholder="+44 7xxx xxxxxx" />
                    </div>
                  </div>
                  <div>
                    <label>Collection Address</label>
                    <input type="text" placeholder="Your UK address" />
                  </div>
                </div>

                <div style={{ background: '#f0f7f7', borderRadius: '10px', padding: '18px', marginBottom: '24px' }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--teal)', marginBottom: '12px' }}>📥 Recipient (Somalia)</div>
                  <div className="field-row" style={{ marginBottom: '12px' }}>
                    <div>
                      <label>Full Name</label>
                      <input type="text" placeholder="Recipient name" />
                    </div>
                    <div>
                      <label>Phone (Somali number)</label>
                      <input type="tel" placeholder="+252 6xx xxxxxx" />
                    </div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <label>City</label>
                    <select>
                      <option value="">Select city</option>
                      <option>Mogadishu</option>
                      <option>Hargeisa</option>
                      <option>Garowe</option>
                      <option>Kismayo</option>
                      <option>Bosaso</option>
                      <option>Berbera</option>
                      <option>Baidoa</option>
                    </select>
                  </div>
                  <div>
                    <label>Delivery Address / Area</label>
                    <input type="text" placeholder="Area / street name" />
                  </div>
                </div>

                <div>
                  <label>Your Email (for confirmation)</label>
                  <input type="email" placeholder="your@email.com" />
                </div>
              </div>
            </>
          )}

          {/* SUCCESS SCREEN */}
          {isSuccess && (
            <div className="success-screen active">
              <div className="success-icon">✓</div>
              <h3>Booking Confirmed!</h3>
              <p>Your cargo booking has been received. We'll contact you within 2 hours to confirm pickup and payment details.</p>
              <div className="booking-ref">
                <div className="ref-label">Booking Reference</div>
                <div className="ref-number">{bookingRef}</div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>📱 You'll receive a WhatsApp confirmation shortly</p>
            </div>
          )}

          {/* BUTTONS */}
          <div className="btn-row">
            {!isSuccess ? (
              <>
                {currentStep > 1 && (
                  <button className="btn btn-secondary" onClick={prevStep}>← Back</button>
                )}
                <button 
                  className="btn btn-primary" 
                  onClick={nextStep}
                  style={currentStep === 3 ? { background: 'var(--teal)' } : {}}
                >
                  {currentStep === 3 ? '✓ Confirm Booking' : 'Continue →'}
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={resetForm} style={{ background: 'var(--teal)' }}>
                📦 Book Another Shipment
              </button>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="sidebar">
          {/* TRACK */}
          <div className="info-card">
            <div className="info-card-header">
              <span>🔍</span>
              <h3>Track Shipment</h3>
            </div>
            <div className="info-card-body">
              <div className="track-bar">
                <input 
                  type="text" 
                  placeholder="Enter tracking number" 
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                />
                <button onClick={trackShipment}>Track</button>
              </div>
              {trackResult && (
                <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--muted)' }} dangerouslySetInnerHTML={{ __html: trackResult }}></div>
              )}
            </div>
          </div>

          {/* PROVIDERS */}
          <div className="info-card">
            <div className="info-card-header">
              <span>🤝</span>
              <h3>Our Partners</h3>
            </div>
            <div className="info-card-body">
              <div className="provider">
                <div className="provider-logo fedex-logo">FedEx</div>
                <div className="provider-info">
                  <div className="provider-name">FedEx International</div>
                  <div className="provider-routes">UK → Somalia · Express</div>
                </div>
                <span className="provider-badge badge-fast">Fast</span>
              </div>
              <div className="provider">
                <div className="provider-logo aramex-logo">ARX</div>
                <div className="provider-info">
                  <div className="provider-name">Aramex</div>
                  <div className="provider-routes">UK → Somalia · Economy</div>
                </div>
                <span className="provider-badge badge-cheap">Value</span>
              </div>
              <div className="provider">
                <div className="provider-logo tawakal-logo">TWK</div>
                <div className="provider-info">
                  <div className="provider-name">Tawakal Express</div>
                  <div className="provider-routes">UK → Somalia · Local</div>
                </div>
                <span className="provider-badge badge-local">Somali</span>
              </div>
            </div>
          </div>

          {/* TIPS */}
          <div className="info-card">
            <div className="info-card-header">
              <span>💡</span>
              <h3>Shipping Tips</h3>
            </div>
            <div className="info-card-body">
              <div className="tip-item">
                <div className="tip-icon">📋</div>
                <div className="tip-text"><strong>Always declare contents.</strong> Undeclared items may be held at customs and cause delays.</div>
              </div>
              <div className="tip-item">
                <div className="tip-icon">⚖️</div>
                <div className="tip-text"><strong>Volumetric weight</strong> may apply for large, light packages. We'll calculate for you.</div>
              </div>
              <div className="tip-item">
                <div className="tip-icon">🚫</div>
                <div className="tip-text"><strong>Prohibited:</strong> Cash, khat, weapons, chemicals. Full list on request.</div>
              </div>
              <div className="tip-item">
                <div className="tip-icon">📦</div>
                <div className="tip-text"><strong>Packing service</strong> available from £10. We box and label everything for you.</div>
              </div>
            </div>
          </div>

          {/* CONTACT */}
          <div style={{ background: 'var(--ink)', borderRadius: '16px', padding: '24px', color: 'white', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>📞</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>Need Help?</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}>Our team speaks Somali & English</div>
            <a href="https://wa.me/447000000000" style={{ display: 'block', background: '#25D366', color: 'white', textDecoration: 'none', padding: '12px', borderRadius: '8px', fontFamily: "'Syne', sans-serif", fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>💬 WhatsApp Us</a>
            <a href="tel:+44700000000" style={{ display: 'block', background: 'rgba(255,255,255,0.08)', color: 'white', textDecoration: 'none', padding: '12px', borderRadius: '8px', fontFamily: "'Syne', sans-serif", fontSize: '13px', fontWeight: 700 }}>📞 Call Us</a>
          </div>
        </div>
      </div>
      
      {/* WHATSAPP FLOAT */}
      <a href="https://wa.me/447000000000" className="whatsapp-float" title="WhatsApp Us">💬</a>
    </div>
  );
};

export default CargoBooking;
