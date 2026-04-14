import React, { useState } from 'react';

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
    setTrackResult('<span class="text-gold">⏳ Searching...</span>');
    setTimeout(() => {
      if (val.startsWith('ZGC')) {
        setTrackResult(`
          <div class="bg-[#f0f7f0] border border-[#c3e6c3] rounded-lg p-3 text-ink">
            <strong class="text-teal">✓ In Transit</strong><br>
            <span class="text-xs text-muted">Last update: Heathrow Cargo Hub → En route to Mogadishu</span>
          </div>`);
      } else {
        setTrackResult('<span class="text-rust">No shipment found. Check your reference number.</span>');
      }
    }, 1200);
  };

  const progressFills = { 1: 'w-1/3', 2: 'w-2/3', 3: 'w-full' };

  return (
    <div className="font-dmsans bg-paper text-ink min-h-screen overflow-x-hidden text-left">
      {/* HERO */}
      <div className="bg-ink p-0 relative overflow-hidden min-h-[340px] flex flex-col">
        <div 
          className="absolute inset-0"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(201,150,58,0.04) 40px, rgba(201,150,58,0.04) 41px), repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(201,150,58,0.04) 40px, rgba(201,150,58,0.04) 41px)' }}
        ></div>
        <div 
          className="absolute w-[600px] h-[600px] rounded-full pointer-events-none -top-[200px] -right-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(201,150,58,0.12) 0%, transparent 70%)' }}
        ></div>
        
        <div className="px-6 py-12 md:px-12 md:py-14 relative z-10 flex-1 flex flex-col justify-center mt-10 md:mt-0">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/25 text-gold px-3 py-1.5 rounded text-[11px] font-semibold tracking-widest uppercase mb-5 w-fit">
            📦 International Cargo
          </div>
          <h1 className="font-syne text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Ship Anywhere.<br /><em className="not-italic text-gold">We Handle It.</em>
          </h1>
          <p className="text-white/50 text-base max-w-[520px] leading-relaxed font-light">
            UK → Somalia · China → Somalia · Door-to-door delivery with tracking. Fast, reliable, affordable.
          </p>
        </div>
      </div>

      {/* ROUTES BAR */}
      <div className="bg-gold px-6 md:px-12 py-3 flex gap-8 items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">🇬🇧 UK → 🇸🇴 Somalia <span className="w-1.5 h-1.5 bg-ink rounded-full opacity-40"></span> 5–7 days air</div>
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">🇨🇳 China → 🇸🇴 Somalia <span className="w-1.5 h-1.5 bg-ink rounded-full opacity-40"></span> 25–35 days sea</div>
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">🇸🇴 Somalia → 🇬🇧 UK <span className="w-1.5 h-1.5 bg-ink rounded-full opacity-40"></span> On request</div>
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">📦 Door-to-door available</div>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-12 max-w-7xl mx-auto px-6 py-6 md:px-12 md:py-12">

        {/* BOOKING FORM */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm h-fit">
          <div className="h-1 bg-border relative overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-gold to-teal transition-all duration-500 ease-out ${!isSuccess ? progressFills[currentStep] : 'w-full'}`} 
            ></div>
          </div>

          <div className="px-6 py-6 border-b border-border flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-teal to-teal-light rounded-lg flex items-center justify-center text-lg shadow-sm">📦</div>
            <h2 className="font-syne text-lg font-bold text-ink">Book Cargo</h2>
            <div className="flex gap-2 ml-auto">
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${!isSuccess && currentStep >= 1 ? (currentStep === 1 ? 'bg-gold' : 'bg-teal') : 'bg-teal'}`}></div>
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${!isSuccess && currentStep >= 2 ? (currentStep === 2 ? 'bg-gold' : 'bg-teal') : (isSuccess ? 'bg-teal' : 'bg-border')}`}></div>
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${!isSuccess && currentStep >= 3 ? (currentStep === 3 ? 'bg-gold' : 'bg-teal') : (isSuccess ? 'bg-teal' : 'bg-border')}`}></div>
            </div>
          </div>

          {!isSuccess ? (
            <div className={`p-6 md:p-8 transition-opacity duration-500 relative`}>
              {/* STEP 1: Route & Service */}
              <div className={`${currentStep === 1 ? 'block animate-in fade-in zoom-in-95 duration-500' : 'hidden'}`}>
                <div className="font-syne text-xl font-bold mb-1.5 text-ink">Choose Route & Service</div>
                <div className="text-muted text-sm mb-7">Select your shipping route and preferred service</div>

                <label className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2">SHIPPING ROUTE</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
                  <div className={`border-2 rounded-xl px-3 py-4 cursor-pointer transition-all duration-300 text-center ${selectedRoute === 'uk-somalia' ? 'border-gold bg-gold/5' : 'border-border bg-white hover:border-gold hover:-translate-y-0.5'}`} onClick={() => selectRoute('uk-somalia')}>
                    <div className="text-2xl mb-2 flex items-center justify-center gap-1">🇬🇧 <span className="text-sm opacity-40">→</span> 🇸🇴</div>
                    <div className="font-syne text-[11px] font-bold tracking-wider uppercase text-ink">UK → Somalia</div>
                    <div className="text-xs text-muted mt-1">5–7 days air</div>
                  </div>
                  <div className={`border-2 rounded-xl px-3 py-4 cursor-pointer transition-all duration-300 text-center ${selectedRoute === 'china-somalia' ? 'border-gold bg-gold/5' : 'border-border bg-white hover:border-gold hover:-translate-y-0.5'}`} onClick={() => selectRoute('china-somalia')}>
                    <div className="text-2xl mb-2 flex items-center justify-center gap-1">🇨🇳 <span className="text-sm opacity-40">→</span> 🇸🇴</div>
                    <div className="font-syne text-[11px] font-bold tracking-wider uppercase text-ink">China → Somalia</div>
                    <div className="text-xs text-muted mt-1">25–35 days sea</div>
                  </div>
                  <div className={`border-2 rounded-xl px-3 py-4 cursor-pointer transition-all duration-300 text-center ${selectedRoute === 'somalia-uk' ? 'border-gold bg-gold/5' : 'border-border bg-white hover:border-gold hover:-translate-y-0.5'}`} onClick={() => selectRoute('somalia-uk')}>
                    <div className="text-2xl mb-2 flex items-center justify-center gap-1">🇸🇴 <span className="text-sm opacity-40">→</span> 🇬🇧</div>
                    <div className="font-syne text-[11px] font-bold tracking-wider uppercase text-ink">Somalia → UK</div>
                    <div className="text-xs text-muted mt-1">Contact us</div>
                  </div>
                </div>

                <label className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2">SERVICE TYPE</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
                  <div className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 bg-white ${selectedService === 'air' ? 'border-teal bg-teal/5' : 'border-border hover:border-teal hover:shadow-sm'}`} onClick={() => selectService('air', 4.5)}>
                    <div className="text-3xl mb-2.5">✈️</div>
                    <div className="font-syne text-sm font-bold mb-1 text-ink">Air Freight</div>
                    <div className="text-xs text-muted leading-relaxed">Fast delivery. Best for urgent or valuable items.</div>
                    <div className="mt-3 text-sm font-semibold text-teal">From £4.50/kg</div>
                  </div>
                  <div className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 bg-white ${selectedService === 'sea' ? 'border-teal bg-teal/5' : 'border-border hover:border-teal hover:shadow-sm'}`} onClick={() => selectService('sea', 1.2)}>
                    <div className="text-3xl mb-2.5">🚢</div>
                    <div className="font-syne text-sm font-bold mb-1 text-ink">Sea Freight</div>
                    <div className="text-xs text-muted leading-relaxed">Economical for large shipments. Best for China route.</div>
                    <div className="mt-3 text-sm font-semibold text-teal">From £1.20/kg</div>
                  </div>
                  <div className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 bg-white ${selectedService === 'express' ? 'border-teal bg-teal/5' : 'border-border hover:border-teal hover:shadow-sm'}`} onClick={() => selectService('express', 8.5)}>
                    <div className="text-3xl mb-2.5">⚡</div>
                    <div className="font-syne text-sm font-bold mb-1 text-ink">Express (FedEx)</div>
                    <div className="text-xs text-muted leading-relaxed">3–5 days. Full tracking. Door-to-door.</div>
                    <div className="mt-3 text-sm font-semibold text-teal">From £8.50/kg</div>
                  </div>
                  <div className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 bg-white ${selectedService === 'economy' ? 'border-teal bg-teal/5' : 'border-border hover:border-teal hover:shadow-sm'}`} onClick={() => selectService('economy', 3.2)}>
                    <div className="text-3xl mb-2.5">💼</div>
                    <div className="font-syne text-sm font-bold mb-1 text-ink">Economy (Aramex)</div>
                    <div className="text-xs text-muted leading-relaxed">Budget-friendly. Reliable for non-urgent cargo.</div>
                    <div className="mt-3 text-sm font-semibold text-teal">From £3.20/kg</div>
                  </div>
                </div>

                {/* PRICE CALCULATOR */}
                <div className="bg-gradient-to-br from-ink to-[#1a2a2a] rounded-xl p-6 mb-2 text-white shadow-lg">
                  <h4 className="font-syne text-sm font-bold text-gold mb-4 tracking-wide">💰 INSTANT PRICE CALCULATOR</h4>
                  <div className="flex gap-3 mb-3 items-center">
                    <label className="text-white/50 w-7 text-right m-0 text-xs uppercase">KG</label>
                    <input type="number" placeholder="Weight (kg)" value={weight} onChange={handleWeightChange} min="0.5" step="0.5" className="flex-1 bg-white/10 border border-white/10 text-white px-4 py-3 rounded-lg font-dmsans text-sm focus:border-gold focus:ring-0 outline-none placeholder-white/30 transition-colors" />
                  </div>
                  <div className="bg-gold/10 border border-gold/20 rounded-lg p-4 mt-4 flex justify-between items-center">
                    <div>
                      <div className="text-xs text-white/50">ESTIMATED TOTAL</div>
                    </div>
                    <div className="font-syne text-2xl font-extrabold text-gold">{price}</div>
                  </div>
                </div>
              </div>

              {/* STEP 2: Cargo Details */}
              <div className={`${currentStep === 2 ? 'block animate-in slide-in-from-right-4 duration-500' : 'hidden'}`}>
                <div className="font-syne text-xl font-bold mb-1.5 text-ink">Cargo Details</div>
                <div className="text-muted text-sm mb-7">Tell us what you're shipping</div>

                <div className="mb-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2">Weight (KG)</label>
                      <input type="number" placeholder="e.g. 25" min="0.5" step="0.5" value={weight} onChange={handleWeightChange} className="w-full px-4 py-3 border-[1.5px] border-border rounded-lg font-dmsans text-sm text-ink bg-white transition-shadow duration-300 outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/10 appearance-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2">Number of Parcels</label>
                      <input type="number" placeholder="e.g. 3" min="1" className="w-full px-4 py-3 border-[1.5px] border-border rounded-lg font-dmsans text-sm text-ink bg-white transition-shadow duration-300 outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/10 appearance-none" />
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2">Contents / Description</label>
                  <input type="text" placeholder="e.g. Clothes, Electronics, Food items" className="w-full px-4 py-3 border-[1.5px] border-border rounded-lg font-dmsans text-sm text-ink bg-white transition-shadow duration-300 outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/10" />
                </div>

                <div className="mb-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2">Declared Value (£)</label>
                      <input type="number" placeholder="e.g. 500" className="w-full px-4 py-3 border-[1.5px] border-border rounded-lg font-dmsans text-sm text-ink bg-white transition-shadow duration-300 outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/10 appearance-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2">Add Insurance?</label>
                      <select className="w-full px-4 py-3 border-[1.5px] border-border rounded-lg font-dmsans text-sm text-ink bg-white transition-shadow duration-300 outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/10 appearance-none cursor-pointer">
                        <option value="no">No Insurance</option>
                        <option value="basic">Basic (1% of value)</option>
                        <option value="full">Full Cover (2.5% of value)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-2">
                  <label className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2">Special Instructions (Optional)</label>
                  <textarea placeholder="Fragile items, special handling, preferred delivery time..." className="w-full px-4 py-3 border-[1.5px] border-border rounded-lg font-dmsans text-sm text-ink bg-white transition-shadow duration-300 outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/10 min-h-[90px] resize-y"></textarea>
                </div>
              </div>

              {/* STEP 3: Contact Info */}
              <div className={`${currentStep === 3 ? 'block animate-in slide-in-from-right-4 duration-500' : 'hidden'}`}>
                <div className="font-syne text-xl font-bold mb-1.5 text-ink">Sender & Recipient</div>
                <div className="text-muted text-sm mb-7">Enter contact details for both sides</div>

                <div className="bg-[#f8f6f2] rounded-xl p-5 mb-6 shadow-sm border border-border/50">
                  <div className="font-syne text-xs font-bold uppercase tracking-widest text-[#7a7870] mb-4">📤 Sender (UK)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2">Full Name</label>
                      <input type="text" placeholder="Your name" className="w-full px-4 py-3 border-[1.5px] border-border rounded-lg font-dmsans text-sm text-ink bg-white transition-shadow duration-300 outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/10" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2">Phone</label>
                      <input type="tel" placeholder="+44 7xxx xxxxxx" className="w-full px-4 py-3 border-[1.5px] border-border rounded-lg font-dmsans text-sm text-ink bg-white transition-shadow duration-300 outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2">Collection Address</label>
                    <input type="text" placeholder="Your UK address" className="w-full px-4 py-3 border-[1.5px] border-border rounded-lg font-dmsans text-sm text-ink bg-white transition-shadow duration-300 outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/10" />
                  </div>
                </div>

                <div className="bg-[#f0f7f7] rounded-xl p-5 mb-6 shadow-sm border border-teal/20">
                  <div className="font-syne text-xs font-bold uppercase tracking-widest text-teal mb-4">📥 Recipient (Somalia)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2">Full Name</label>
                      <input type="text" placeholder="Recipient name" className="w-full px-4 py-3 border-[1.5px] border-border rounded-lg font-dmsans text-sm text-ink bg-white transition-shadow duration-300 outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/10" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2">Phone (Somali number)</label>
                      <input type="tel" placeholder="+252 6xx xxxxxx" className="w-full px-4 py-3 border-[1.5px] border-border rounded-lg font-dmsans text-sm text-ink bg-white transition-shadow duration-300 outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/10" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2">City</label>
                    <select className="w-full px-4 py-3 border-[1.5px] border-border rounded-lg font-dmsans text-sm text-ink bg-white transition-shadow duration-300 outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/10 appearance-none cursor-pointer">
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
                    <label className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2">Delivery Address / Area</label>
                    <input type="text" placeholder="Area / street name" className="w-full px-4 py-3 border-[1.5px] border-border rounded-lg font-dmsans text-sm text-ink bg-white transition-shadow duration-300 outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/10" />
                  </div>
                </div>

                <div className="mb-2">
                  <label className="block text-xs font-semibold tracking-wider uppercase text-muted mb-2">Your Email (for confirmation)</label>
                  <input type="email" placeholder="your@email.com" className="w-full px-4 py-3 border-[1.5px] border-border rounded-lg font-dmsans text-sm text-ink bg-white transition-shadow duration-300 outline-none focus:border-gold focus:ring-[3px] focus:ring-gold/10" />
                </div>
              </div>
            </div>
          ) : (
            /* SUCCESS */
            <div className="py-12 px-6 md:px-12 text-center animate-in zoom-in-95 fade-in duration-500">
              <div className="w-20 h-20 bg-gradient-to-br from-teal to-teal-light rounded-full flex items-center justify-center text-4xl mx-auto mb-6 text-white shadow-lg">✓</div>
              <h3 className="font-syne text-2xl md:text-3xl font-extrabold mb-3 text-ink">Booking Confirmed!</h3>
              <p className="text-muted text-sm mb-6 leading-relaxed max-w-md mx-auto">Your cargo booking has been received. We'll contact you within 2 hours to confirm pickup and payment details.</p>
              <div className="bg-paper border border-border rounded-xl px-6 py-5 inline-block mb-6 shadow-inner">
                <div className="text-xs uppercase tracking-widest text-muted font-bold mb-1.5">Booking Reference</div>
                <div className="font-syne text-2xl font-extrabold tracking-[2px] text-ink">{bookingRef}</div>
              </div>
              <p className="text-xs text-muted flex items-center justify-center gap-2">📱 You'll receive a WhatsApp confirmation shortly</p>
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex gap-3 px-6 py-5 md:px-8 bg-[#fafaf8] border-t border-border">
            {!isSuccess ? (
              <>
                {currentStep > 1 && (
                  <button className="px-5 py-3.5 border-[1.5px] border-border text-muted bg-transparent rounded-lg font-syne text-sm font-bold tracking-wide hover:border-ink hover:text-ink transition-colors" onClick={prevStep}>← Back</button>
                )}
                <button 
                  className={`flex-1 px-7 py-3.5 text-white rounded-lg font-syne text-sm font-bold tracking-wide transition-all duration-300 shadow-md border-none cursor-pointer hover:-translate-y-0.5 ${currentStep === 3 ? 'bg-teal hover:shadow-teal/30 hover:shadow-lg' : 'bg-ink hover:bg-teal hover:shadow-teal/30 hover:shadow-lg'}`}
                  onClick={nextStep}
                >
                  {currentStep === 3 ? '✓ Confirm Booking' : 'Continue →'}
                </button>
              </>
            ) : (
              <button className="flex-1 px-7 py-3.5 bg-teal text-white rounded-lg font-syne text-sm font-bold tracking-wide transition-all duration-300 shadow-md hover:-translate-y-0.5 hover:shadow-teal/30 hover:shadow-lg border-none cursor-pointer" onClick={resetForm}>
                📦 Book Another Shipment
              </button>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="flex-col gap-6 hidden lg:flex">

          {/* TRACK */}
          <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
              <span className="text-lg">🔍</span>
              <h3 className="font-syne text-sm font-bold text-ink">Track Shipment</h3>
            </div>
            <div className="p-6">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter tracking number" 
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="flex-1 px-4 py-3 border-[1.5px] border-border rounded-lg font-dmsans text-[13px] text-ink outline-none focus:border-gold transition-colors"
                />
                <button onClick={trackShipment} className="px-5 py-3 bg-ink hover:bg-teal text-white border-none rounded-lg font-syne text-[13px] font-bold whitespace-nowrap transition-colors cursor-pointer">Track</button>
              </div>
              {trackResult && (
                <div className="mt-3 text-[13px] text-muted animate-in fade-in duration-300" dangerouslySetInnerHTML={{ __html: trackResult }}></div>
              )}
            </div>
          </div>

          {/* PROVIDERS */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
              <span className="text-lg">🤝</span>
              <h3 className="font-syne text-sm font-bold text-ink">Our Partners</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3.5 pb-4 mb-4 border-b border-border/60">
                <div className="w-11 h-11 bg-[#4d148c] text-[#ff6600] rounded-xl flex items-center justify-center font-extrabold text-[11px] tracking-wider shrink-0 shadow-sm">FedEx</div>
                <div className="flex-1">
                  <div className="font-syne text-[13px] font-bold mb-0.5 text-ink">FedEx International</div>
                  <div className="text-[11px] text-muted">UK → Somalia · Express</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-rust/10 text-rust rounded tracking-wider uppercase">Fast</span>
              </div>
              <div className="flex items-center gap-3.5 pb-4 mb-4 border-b border-border/60">
                <div className="w-11 h-11 bg-[#e8002d] text-white rounded-xl flex items-center justify-center font-extrabold text-[11px] tracking-wider shrink-0 shadow-sm">ARX</div>
                <div className="flex-1">
                  <div className="font-syne text-[13px] font-bold mb-0.5 text-ink">Aramex</div>
                  <div className="text-[11px] text-muted">UK → Somalia · Economy</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-teal/10 text-teal rounded tracking-wider uppercase">Value</span>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 bg-[#006b3f] text-[#ffd700] rounded-xl flex items-center justify-center font-extrabold text-[11px] tracking-wider shrink-0 shadow-sm">TWK</div>
                <div className="flex-1">
                  <div className="font-syne text-[13px] font-bold mb-0.5 text-ink">Tawakal Express</div>
                  <div className="text-[11px] text-muted">UK → Somalia · Local</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-gold/15 text-gold rounded tracking-wider uppercase">Somali</span>
              </div>
            </div>
          </div>

          {/* TIPS */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border flex items-center gap-3">
              <span className="text-lg">💡</span>
              <h3 className="font-syne text-sm font-bold text-ink">Shipping Tips</h3>
            </div>
            <div className="p-6">
              <div className="flex gap-3.5 mb-4 pb-4 border-b border-border/60">
                <div className="w-8 h-8 rounded-lg bg-paper flex items-center justify-center shrink-0 text-base">📋</div>
                <div className="text-[13px] leading-relaxed text-muted mt-1"><strong className="text-ink font-semibold">Always declare contents.</strong> Undeclared items may be held at customs and cause delays.</div>
              </div>
              <div className="flex gap-3.5 mb-4 pb-4 border-b border-border/60">
                <div className="w-8 h-8 rounded-lg bg-paper flex items-center justify-center shrink-0 text-base">⚖️</div>
                <div className="text-[13px] leading-relaxed text-muted mt-1"><strong className="text-ink font-semibold">Volumetric weight</strong> may apply for large, light packages. We'll calculate for you.</div>
              </div>
              <div className="flex gap-3.5 mb-4 pb-4 border-b border-border/60">
                <div className="w-8 h-8 rounded-lg bg-paper flex items-center justify-center shrink-0 text-base">🚫</div>
                <div className="text-[13px] leading-relaxed text-muted mt-1"><strong className="text-ink font-semibold">Prohibited:</strong> Cash, khat, weapons, chemicals. Full list on request.</div>
              </div>
              <div className="flex gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-paper flex items-center justify-center shrink-0 text-base">📦</div>
                <div className="text-[13px] leading-relaxed text-muted mt-1"><strong className="text-ink font-semibold">Packing service</strong> available from £10. We box and label everything for you.</div>
              </div>
            </div>
          </div>

          {/* CONTACT LISTING */}
          <div className="bg-ink rounded-2xl p-6 text-center text-white shadow-lg">
            <div className="text-3xl mb-3">📞</div>
            <div className="font-syne text-base font-bold mb-1.5">Need Help?</div>
            <div className="text-[13px] text-white/60 mb-5 font-medium">Our team speaks Somali & English</div>
            <a href="https://wa.me/447000000000" className="block bg-[#25D366] text-white p-3.5 rounded-xl font-syne text-[13px] font-bold mb-3 hover:bg-[#20ba56] transition-colors shadow-sm">💬 WhatsApp Us</a>
            <a href="tel:+44700000000" className="block bg-white/10 text-white p-3.5 rounded-xl font-syne text-[13px] font-bold hover:bg-white/20 transition-colors">📞 Call Us</a>
          </div>
        </div>
      </div>
      
      {/* WHATSAPP FLOAT */}
      <a href="https://wa.me/447000000000" title="WhatsApp Us" className="fixed bottom-6 right-6 bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform cursor-pointer z-[100]">💬</a>
    </div>
  );
};

export default CargoBooking;
