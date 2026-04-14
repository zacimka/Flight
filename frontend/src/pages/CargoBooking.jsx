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
    setTrackResult('<span class="text-[#c9963a]">⏳ Searching...</span>');
    setTimeout(() => {
      if (val.startsWith('ZGC')) {
        setTrackResult(`
          <div class="bg-[#f0f7f0] border border-[#c3e6c3] rounded-lg p-3 text-[#0a0a0f]">
            <strong class="text-[#1a6b6b]">✓ In Transit</strong><br>
            <span class="text-xs text-[#7a7870]">Last update: Heathrow Cargo Hub → En route to Mogadishu</span>
          </div>`);
      } else {
        setTrackResult('<span class="text-[#c44b2b]">No shipment found. Check your reference number.</span>');
      }
    }, 1200);
  };

  const progressFills = { 1: 'w-1/3', 2: 'w-2/3', 3: 'w-full' };

  return (
    <div className="bg-[#f5f3ee] text-[#0a0a0f] min-h-screen text-left font-sans">
      
      {/* HERO */}
      <div className="bg-[#0a0a0f] relative overflow-hidden min-h-[340px] flex flex-col">
        <div 
          className="absolute inset-0"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(201,150,58,0.04) 40px, rgba(201,150,58,0.04) 41px), repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(201,150,58,0.04) 40px, rgba(201,150,58,0.04) 41px)' }}
        ></div>
        <div 
          className="absolute w-[600px] h-[600px] rounded-full pointer-events-none -top-[200px] -right-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(201,150,58,0.12) 0%, transparent 70%)' }}
        ></div>
        <div className="px-12 py-10 relative z-10 flex-1 flex flex-col justify-center mt-12 md:mt-2">
          <div className="inline-flex items-center gap-2 bg-[#c9963a]/10 border border-[#c9963a]/20 text-[#c9963a] px-3 py-1 rounded text-[11px] font-semibold tracking-wider uppercase mb-5 w-fit">
            📦 International Cargo
          </div>
          <h1 className="font-['Syne'] text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Ship Anywhere.<br /><em className="not-italic text-[#c9963a]">We Handle It.</em>
          </h1>
          <p className="text-white/50 text-base max-w-[520px] leading-relaxed font-light">
            UK → Somalia · China → Somalia · Door-to-door delivery with tracking. Fast, reliable, affordable.
          </p>
        </div>
      </div>

      {/* ROUTES BAR */}
      <div className="bg-[#c9963a] px-6 md:px-12 py-3 flex gap-8 items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0a0a0f]">🇬🇧 UK → 🇸🇴 Somalia <span className="w-1.5 h-1.5 bg-[#0a0a0f] rounded-full opacity-40"></span> 5–7 days air</div>
        <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0a0a0f]">🇨🇳 China → 🇸🇴 Somalia <span className="w-1.5 h-1.5 bg-[#0a0a0f] rounded-full opacity-40"></span> 25–35 days sea</div>
        <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0a0a0f]">🇸🇴 Somalia → 🇬🇧 UK <span className="w-1.5 h-1.5 bg-[#0a0a0f] rounded-full opacity-40"></span> On request</div>
        <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0a0a0f]">📦 Door-to-door available</div>
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
        {/* BOOKING FORM */}
        <div className="bg-white rounded-2xl border border-[#ddd9d0] overflow-hidden shadow-sm">
          <div className="h-[3px] bg-[#ddd9d0] relative overflow-hidden">
            <div className={`h-full bg-gradient-to-r from-[#c9963a] to-[#1a6b6b] transition-all duration-400 ease-out ${!isSuccess ? progressFills[currentStep] : 'w-full'}`}></div>
          </div>

          <div className="p-7 md:p-8 border-b border-[#ddd9d0] flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#1a6b6b] to-[#2a9090] rounded-lg flex items-center justify-center text-lg shadow-sm">📦</div>
            <h2 className="font-['Syne'] text-lg font-bold text-gray-900">Book Cargo</h2>
            <div className="flex gap-2 ml-auto">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${!isSuccess && currentStep >= 1 ? (currentStep === 1 ? 'bg-[#c9963a]' : 'bg-[#1a6b6b]') : 'bg-[#1a6b6b]'}`}></div>
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${!isSuccess && currentStep >= 2 ? (currentStep === 2 ? 'bg-[#c9963a]' : 'bg-[#1a6b6b]') : (isSuccess ? 'bg-[#1a6b6b]' : 'bg-[#ddd9d0]')}`}></div>
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${!isSuccess && currentStep >= 3 ? (currentStep === 3 ? 'bg-[#c9963a]' : 'bg-[#1a6b6b]') : (isSuccess ? 'bg-[#1a6b6b]' : 'bg-[#ddd9d0]')}`}></div>
            </div>
          </div>

          {!isSuccess && (
            <div className="p-6 md:p-8">
              {/* STEP 1: Route & Service */}
              <div className={`${currentStep === 1 ? 'block' : 'hidden'}`}>
                <div className="font-['Syne'] text-xl font-bold mb-1.5 text-gray-900">Choose Route & Service</div>
                <div className="text-[#7a7870] text-sm mb-7">Select your shipping route and preferred service</div>

                <label className="block text-xs font-semibold tracking-wider text-[#7a7870] uppercase mb-2">Shipping Route</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
                  <div className={`border-2 rounded-xl p-4 cursor-pointer text-center transition-all duration-200 ${selectedRoute === 'uk-somalia' ? 'border-[#c9963a] bg-[#c9963a]/5' : 'border-[#ddd9d0] bg-white hover:-translate-y-0.5 hover:border-[#c9963a]'}`} onClick={() => selectRoute('uk-somalia')}>
                    <div className="text-[22px] mb-2 flex items-center justify-center gap-1">🇬🇧 <span className="text-sm opacity-40">→</span> 🇸🇴</div>
                    <div className="font-['Syne'] text-[11px] font-bold tracking-wide uppercase text-[#0a0a0f]">UK → Somalia</div>
                    <div className="text-[11px] text-[#7a7870] mt-1">5–7 days air</div>
                  </div>
                  <div className={`border-2 rounded-xl p-4 cursor-pointer text-center transition-all duration-200 ${selectedRoute === 'china-somalia' ? 'border-[#c9963a] bg-[#c9963a]/5' : 'border-[#ddd9d0] bg-white hover:-translate-y-0.5 hover:border-[#c9963a]'}`} onClick={() => selectRoute('china-somalia')}>
                    <div className="text-[22px] mb-2 flex items-center justify-center gap-1">🇨🇳 <span className="text-sm opacity-40">→</span> 🇸🇴</div>
                    <div className="font-['Syne'] text-[11px] font-bold tracking-wide uppercase text-[#0a0a0f]">China → Somalia</div>
                    <div className="text-[11px] text-[#7a7870] mt-1">25–35 days sea</div>
                  </div>
                  <div className={`border-2 rounded-xl p-4 cursor-pointer text-center transition-all duration-200 ${selectedRoute === 'somalia-uk' ? 'border-[#c9963a] bg-[#c9963a]/5' : 'border-[#ddd9d0] bg-white hover:-translate-y-0.5 hover:border-[#c9963a]'}`} onClick={() => selectRoute('somalia-uk')}>
                    <div className="text-[22px] mb-2 flex items-center justify-center gap-1">🇸🇴 <span className="text-sm opacity-40">→</span> 🇬🇧</div>
                    <div className="font-['Syne'] text-[11px] font-bold tracking-wide uppercase text-[#0a0a0f]">Somalia → UK</div>
                    <div className="text-[11px] text-[#7a7870] mt-1">Contact us</div>
                  </div>
                </div>

                <label className="block text-xs font-semibold tracking-wider text-[#7a7870] uppercase mb-2">Service Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
                  <div className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 ${selectedService === 'air' ? 'border-[#1a6b6b] bg-[#1a6b6b]/5' : 'border-[#ddd9d0] bg-white hover:border-[#1a6b6b]'}`} onClick={() => selectService('air', 4.5)}>
                    <div className="text-2xl mb-2.5">✈️</div>
                    <div className="font-['Syne'] text-sm font-bold mb-1 text-gray-900">Air Freight</div>
                    <div className="text-xs text-[#7a7870] leading-relaxed">Fast delivery. Best for urgent or valuable items.</div>
                    <div className="mt-3 text-[13px] font-semibold text-[#1a6b6b]">From £4.50/kg</div>
                  </div>
                  <div className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 ${selectedService === 'sea' ? 'border-[#1a6b6b] bg-[#1a6b6b]/5' : 'border-[#ddd9d0] bg-white hover:border-[#1a6b6b]'}`} onClick={() => selectService('sea', 1.2)}>
                    <div className="text-2xl mb-2.5">🚢</div>
                    <div className="font-['Syne'] text-sm font-bold mb-1 text-gray-900">Sea Freight</div>
                    <div className="text-xs text-[#7a7870] leading-relaxed">Economical for large shipments. Best for China route.</div>
                    <div className="mt-3 text-[13px] font-semibold text-[#1a6b6b]">From £1.20/kg</div>
                  </div>
                  <div className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 ${selectedService === 'express' ? 'border-[#1a6b6b] bg-[#1a6b6b]/5' : 'border-[#ddd9d0] bg-white hover:border-[#1a6b6b]'}`} onClick={() => selectService('express', 8.5)}>
                    <div className="text-2xl mb-2.5">⚡</div>
                    <div className="font-['Syne'] text-sm font-bold mb-1 text-gray-900">Express (FedEx)</div>
                    <div className="text-xs text-[#7a7870] leading-relaxed">3–5 days. Full tracking. Door-to-door.</div>
                    <div className="mt-3 text-[13px] font-semibold text-[#1a6b6b]">From £8.50/kg</div>
                  </div>
                  <div className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 ${selectedService === 'economy' ? 'border-[#1a6b6b] bg-[#1a6b6b]/5' : 'border-[#ddd9d0] bg-white hover:border-[#1a6b6b]'}`} onClick={() => selectService('economy', 3.2)}>
                    <div className="text-2xl mb-2.5">💼</div>
                    <div className="font-['Syne'] text-sm font-bold mb-1 text-gray-900">Economy (Aramex)</div>
                    <div className="text-xs text-[#7a7870] leading-relaxed">Budget-friendly. Reliable for non-urgent cargo.</div>
                    <div className="mt-3 text-[13px] font-semibold text-[#1a6b6b]">From £3.20/kg</div>
                  </div>
                </div>

                {/* PRICE CALCULATOR */}
                <div className="bg-gradient-to-br from-[#0a0a0f] to-[#1a2a2a] rounded-xl p-6 mb-6 text-white shadow-lg">
                  <h4 className="font-['Syne'] text-sm font-bold text-[#c9963a] mb-4 tracking-wide">💰 INSTANT PRICE CALCULATOR</h4>
                  <div className="flex items-center gap-3 mb-3">
                    <label className="text-white/50 w-7 text-right text-[11px] uppercase m-0">KG</label>
                    <input type="number" placeholder="Weight (kg)" value={weight} onChange={handleWeightChange} min="0.5" step="0.5" className="flex-1 bg-white/10 border border-white/10 text-white placeholder-white/30 px-4 py-3 rounded-lg text-sm focus:border-[#c9963a] focus:ring-0 outline-none transition-colors" />
                  </div>
                  <div className="bg-[#c9963a]/10 border border-[#c9963a]/20 rounded-lg p-4 mt-4 flex justify-between items-center">
                    <div className="text-xs text-white/50 text-left">ESTIMATED TOTAL</div>
                    <div className="font-['Syne'] text-2xl font-extrabold text-[#c9963a]">{price}</div>
                  </div>
                </div>
              </div>

              {/* STEP 2: Cargo Details */}
              <div className={`${currentStep === 2 ? 'block' : 'hidden'}`}>
                <div className="font-['Syne'] text-xl font-bold mb-1.5 text-gray-900">Cargo Details</div>
                <div className="text-[#7a7870] text-sm mb-7">Tell us what you're shipping</div>

                <div className="mb-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-wider text-[#7a7870] uppercase mb-2">Weight (KG)</label>
                      <input type="number" placeholder="e.g. 25" min="0.5" step="0.5" value={weight} onChange={handleWeightChange} className="w-full px-4 py-3 border-[1.5px] border-[#ddd9d0] rounded-lg text-sm text-[#0a0a0f] focus:border-[#c9963a] focus:ring-[3px] focus:ring-[#c9963a]/10 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-wider text-[#7a7870] uppercase mb-2">Number of Parcels</label>
                      <input type="number" placeholder="e.g. 3" min="1" className="w-full px-4 py-3 border-[1.5px] border-[#ddd9d0] rounded-lg text-sm text-[#0a0a0f] focus:border-[#c9963a] focus:ring-[3px] focus:ring-[#c9963a]/10 outline-none transition-all" />
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-semibold tracking-wider text-[#7a7870] uppercase mb-2">Contents / Description</label>
                  <input type="text" placeholder="e.g. Clothes, Electronics, Food items" className="w-full px-4 py-3 border-[1.5px] border-[#ddd9d0] rounded-lg text-sm text-[#0a0a0f] focus:border-[#c9963a] focus:ring-[3px] focus:ring-[#c9963a]/10 outline-none transition-all" />
                </div>

                <div className="mb-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-wider text-[#7a7870] uppercase mb-2">Declared Value (£)</label>
                      <input type="number" placeholder="e.g. 500" className="w-full px-4 py-3 border-[1.5px] border-[#ddd9d0] rounded-lg text-sm text-[#0a0a0f] focus:border-[#c9963a] focus:ring-[3px] focus:ring-[#c9963a]/10 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-wider text-[#7a7870] uppercase mb-2">Add Insurance?</label>
                      <select className="w-full px-4 py-3 border-[1.5px] border-[#ddd9d0] rounded-lg text-sm text-[#0a0a0f] bg-white focus:border-[#c9963a] focus:ring-[3px] focus:ring-[#c9963a]/10 outline-none transition-all appearance-none cursor-pointer">
                        <option value="no">No Insurance</option>
                        <option value="basic">Basic (1% of value)</option>
                        <option value="full">Full Cover (2.5% of value)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-semibold tracking-wider text-[#7a7870] uppercase mb-2">Special Instructions (Optional)</label>
                  <textarea placeholder="Fragile items, special handling, preferred delivery time..." className="w-full px-4 py-3 border-[1.5px] border-[#ddd9d0] rounded-lg text-sm text-[#0a0a0f] focus:border-[#c9963a] focus:ring-[3px] focus:ring-[#c9963a]/10 outline-none transition-all min-h-[90px] resize-y"></textarea>
                </div>
              </div>

              {/* STEP 3: Contact Info */}
              <div className={`${currentStep === 3 ? 'block' : 'hidden'}`}>
                <div className="font-['Syne'] text-xl font-bold mb-1.5 text-gray-900">Sender & Recipient</div>
                <div className="text-[#7a7870] text-sm mb-7">Enter contact details for both sides</div>

                <div className="bg-[#f8f6f2] rounded-xl p-5 mb-6 border border-[#ddd9d0]/50">
                  <div className="font-['Syne'] text-xs font-bold uppercase tracking-wide text-[#7a7870] mb-4">📤 Sender (UK)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-wider text-[#7a7870] uppercase mb-2">Full Name</label>
                      <input type="text" placeholder="Your name" className="w-full px-4 py-3 border-[1.5px] border-[#ddd9d0] rounded-lg text-sm text-[#0a0a0f] focus:border-[#c9963a] focus:ring-[3px] focus:ring-[#c9963a]/10 outline-none transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-wider text-[#7a7870] uppercase mb-2">Phone</label>
                      <input type="tel" placeholder="+44 7xxx xxxxxx" className="w-full px-4 py-3 border-[1.5px] border-[#ddd9d0] rounded-lg text-sm text-[#0a0a0f] focus:border-[#c9963a] focus:ring-[3px] focus:ring-[#c9963a]/10 outline-none transition-all bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold tracking-wider text-[#7a7870] uppercase mb-2">Collection Address</label>
                    <input type="text" placeholder="Your UK address" className="w-full px-4 py-3 border-[1.5px] border-[#ddd9d0] rounded-lg text-sm text-[#0a0a0f] focus:border-[#c9963a] focus:ring-[3px] focus:ring-[#c9963a]/10 outline-none transition-all bg-white" />
                  </div>
                </div>

                <div className="bg-[#f0f7f7] rounded-xl p-5 mb-6 border border-[#1a6b6b]/20">
                  <div className="font-['Syne'] text-xs font-bold uppercase tracking-wide text-[#1a6b6b] mb-4">📥 Recipient (Somalia)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold tracking-wider text-[#7a7870] uppercase mb-2">Full Name</label>
                      <input type="text" placeholder="Recipient name" className="w-full px-4 py-3 border-[1.5px] border-[#ddd9d0] rounded-lg text-sm text-[#0a0a0f] focus:border-[#c9963a] focus:ring-[3px] focus:ring-[#c9963a]/10 outline-none transition-all bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold tracking-wider text-[#7a7870] uppercase mb-2">Phone (Somali number)</label>
                      <input type="tel" placeholder="+252 6xx xxxxxx" className="w-full px-4 py-3 border-[1.5px] border-[#ddd9d0] rounded-lg text-sm text-[#0a0a0f] focus:border-[#c9963a] focus:ring-[3px] focus:ring-[#c9963a]/10 outline-none transition-all bg-white" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-semibold tracking-wider text-[#7a7870] uppercase mb-2">City</label>
                    <select className="w-full px-4 py-3 border-[1.5px] border-[#ddd9d0] rounded-lg text-sm text-[#0a0a0f] bg-white focus:border-[#c9963a] focus:ring-[3px] focus:ring-[#c9963a]/10 outline-none transition-all appearance-none cursor-pointer">
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
                    <label className="block text-xs font-semibold tracking-wider text-[#7a7870] uppercase mb-2">Delivery Address / Area</label>
                    <input type="text" placeholder="Area / street name" className="w-full px-4 py-3 border-[1.5px] border-[#ddd9d0] rounded-lg text-sm text-[#0a0a0f] focus:border-[#c9963a] focus:ring-[3px] focus:ring-[#c9963a]/10 outline-none transition-all bg-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-[#7a7870] uppercase mb-2">Your Email (for confirmation)</label>
                  <input type="email" placeholder="your@email.com" className="w-full px-4 py-3 border-[1.5px] border-[#ddd9d0] rounded-lg text-sm text-[#0a0a0f] focus:border-[#c9963a] focus:ring-[3px] focus:ring-[#c9963a]/10 outline-none transition-all bg-white" />
                </div>
              </div>
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {isSuccess && (
            <div className="p-12 px-8 text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-gradient-to-br from-[#1a6b6b] to-[#2a9090] rounded-full flex items-center justify-center text-3xl mx-auto mb-6 text-white shadow-lg">✓</div>
              <h3 className="font-['Syne'] text-2xl font-extrabold mb-2 text-gray-900">Booking Confirmed!</h3>
              <p className="text-[#7a7870] text-sm mb-6 leading-relaxed">Your cargo booking has been received. We'll contact you within 2 hours to confirm pickup and payment details.</p>
              <div className="inline-block bg-[#f5f3ee] border border-[#ddd9d0] rounded-xl p-5 mb-6 shadow-inner">
                <div className="text-[11px] uppercase tracking-widest text-[#7a7870] font-semibold mb-1">Booking Reference</div>
                <div className="font-['Syne'] text-2xl font-extrabold tracking-widest text-[#0a0a0f]">{bookingRef}</div>
              </div>
              <p className="text-xs text-[#7a7870]">📱 You'll receive a WhatsApp confirmation shortly</p>
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex gap-3 px-6 md:px-8 py-5 border-t border-[#ddd9d0] bg-[#fafaf8]">
            {!isSuccess ? (
              <>
                {currentStep > 1 && (
                  <button className="px-6 py-3 border-[1.5px] border-[#ddd9d0] text-[#7a7870] bg-transparent rounded-lg font-['Syne'] text-sm font-bold tracking-wide hover:border-[#0a0a0f] hover:text-[#0a0a0f] transition-colors" onClick={prevStep}>← Back</button>
                )}
                <button 
                  className={`flex-1 px-7 py-3 text-white rounded-lg font-['Syne'] text-sm font-bold tracking-wide transition-all shadow-md hover:-translate-y-px ${currentStep === 3 ? 'bg-[#1a6b6b] hover:shadow-lg hover:shadow-[#1a6b6b]/30' : 'bg-[#0a0a0f] hover:bg-[#1a6b6b] hover:shadow-lg hover:shadow-[#1a6b6b]/30'}`}
                  onClick={nextStep}
                >
                  {currentStep === 3 ? '✓ Confirm Booking' : 'Continue →'}
                </button>
              </>
            ) : (
              <button className="flex-1 px-7 py-3 bg-[#1a6b6b] text-white rounded-lg font-['Syne'] text-sm font-bold tracking-wide hover:-translate-y-px hover:shadow-lg hover:shadow-[#1a6b6b]/30 transition-all" onClick={resetForm}>
                📦 Book Another Shipment
              </button>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="flex flex-col gap-6">
          {/* TRACK */}
          <div className="bg-white border border-[#ddd9d0] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#ddd9d0] flex items-center gap-2.5 bg-white">
              <span className="text-lg">🔍</span>
              <h3 className="font-['Syne'] text-sm font-bold text-gray-900">Track Shipment</h3>
            </div>
            <div className="p-5">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter tracking number" 
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="flex-1 px-4 py-2 border-[1.5px] border-[#ddd9d0] rounded-lg text-[13px] outline-none focus:border-[#c9963a] transition-all"
                />
                <button onClick={trackShipment} className="px-5 py-2 bg-[#0a0a0f] hover:bg-[#1a6b6b] text-white rounded-lg font-['Syne'] text-[13px] font-bold transition-colors">Track</button>
              </div>
              {trackResult && (
                <div className="mt-3 text-[13px] text-[#7a7870] font-medium" dangerouslySetInnerHTML={{ __html: trackResult }}></div>
              )}
            </div>
          </div>

          {/* PROVIDERS */}
          <div className="bg-white border border-[#ddd9d0] rounded-2xl shadow-sm overflow-hidden hidden lg:block">
            <div className="px-5 py-4 border-b border-[#ddd9d0] flex items-center gap-2.5">
              <span className="text-lg">🤝</span>
              <h3 className="font-['Syne'] text-sm font-bold text-gray-900">Our Partners</h3>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3.5 pb-3 border-b border-[#ddd9d0]/50">
                <div className="w-11 h-11 bg-[#4d148c] text-[#ff6600] rounded-lg flex items-center justify-center font-extrabold text-xs tracking-wider shrink-0 shadow-sm">FedEx</div>
                <div className="flex-1">
                  <div className="font-['Syne'] text-sm font-bold mb-0.5 text-gray-900">FedEx International</div>
                  <div className="text-[11px] text-[#7a7870]">UK → Somalia · Express</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-[#c44b2b]/10 text-[#c44b2b] rounded tracking-wide uppercase">Fast</span>
              </div>
              <div className="flex items-center gap-3.5 pb-3 border-b border-[#ddd9d0]/50">
                <div className="w-11 h-11 bg-[#e8002d] text-white rounded-lg flex items-center justify-center font-extrabold text-xs tracking-wider shrink-0 shadow-sm">ARX</div>
                <div className="flex-1">
                  <div className="font-['Syne'] text-sm font-bold mb-0.5 text-gray-900">Aramex</div>
                  <div className="text-[11px] text-[#7a7870]">UK → Somalia · Economy</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-[#1a6b6b]/10 text-[#1a6b6b] rounded tracking-wide uppercase">Value</span>
              </div>
              <div className="flex items-center gap-3.5 pt-1">
                <div className="w-11 h-11 bg-[#006b3f] text-[#ffd700] rounded-lg flex items-center justify-center font-extrabold text-[10px] shrink-0 shadow-sm">TWK</div>
                <div className="flex-1">
                  <div className="font-['Syne'] text-sm font-bold mb-0.5 text-gray-900">Tawakal Express</div>
                  <div className="text-[11px] text-[#7a7870]">UK → Somalia · Local</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-[#c9963a]/15 text-[#c9963a] rounded tracking-wide uppercase">Somali</span>
              </div>
            </div>
          </div>

          {/* TIPS */}
          <div className="bg-white border border-[#ddd9d0] rounded-2xl shadow-sm overflow-hidden hidden lg:block">
            <div className="px-5 py-4 border-b border-[#ddd9d0] flex items-center gap-2.5">
              <span className="text-lg">💡</span>
              <h3 className="font-['Syne'] text-sm font-bold text-gray-900">Shipping Tips</h3>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex gap-3 pb-3 border-b border-[#ddd9d0]/50">
                <div className="w-8 h-8 rounded-lg bg-[#f5f3ee] flex items-center justify-center shrink-0">📋</div>
                <div className="text-[13px] leading-relaxed text-[#7a7870]"><strong className="text-[#0a0a0f] font-semibold">Always declare contents.</strong> Undeclared items may be held at customs and cause delays.</div>
              </div>
              <div className="flex gap-3 pb-3 border-b border-[#ddd9d0]/50">
                <div className="w-8 h-8 rounded-lg bg-[#f5f3ee] flex items-center justify-center shrink-0">⚖️</div>
                <div className="text-[13px] leading-relaxed text-[#7a7870]"><strong className="text-[#0a0a0f] font-semibold">Volumetric weight</strong> may apply for large, light packages. We'll calculate for you.</div>
              </div>
              <div className="flex gap-3 pb-3 border-b border-[#ddd9d0]/50">
                <div className="w-8 h-8 rounded-lg bg-[#f5f3ee] flex items-center justify-center shrink-0">🚫</div>
                <div className="text-[13px] leading-relaxed text-[#7a7870]"><strong className="text-[#0a0a0f] font-semibold">Prohibited:</strong> Cash, khat, weapons, chemicals. Full list on request.</div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#f5f3ee] flex items-center justify-center shrink-0">📦</div>
                <div className="text-[13px] leading-relaxed text-[#7a7870]"><strong className="text-[#0a0a0f] font-semibold">Packing service</strong> available from £10. We box and label everything for you.</div>
              </div>
            </div>
          </div>

          {/* CONTACT LISTING */}
          <div className="bg-[#0a0a0f] rounded-2xl p-6 text-center text-white shadow-lg relative overflow-hidden">
            <div className="text-3xl mb-3">📞</div>
            <div className="font-['Syne'] text-[15px] font-bold mb-1">Need Help?</div>
            <div className="text-[13px] text-white/50 mb-5 font-medium">Our team speaks Somali & English</div>
            <a href="https://wa.me/447000000000" className="block bg-[#25D366] text-white p-3 rounded-lg font-['Syne'] text-[13px] font-bold mb-2.5 hover:bg-[#20ba56] transition-colors shadow-sm">💬 WhatsApp Us</a>
            <a href="tel:+44700000000" className="block bg-white/10 text-white p-3 rounded-lg font-['Syne'] text-[13px] font-bold hover:bg-white/20 transition-colors">📞 Call Us</a>
          </div>
        </div>
      </div>
      
      {/* WHATSAPP FLOAT */}
      <a href="https://wa.me/447000000000" className="fixed bottom-6 right-6 bg-[#25D366] text-white w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-xl hover:scale-110 transition-transform z-50">💬</a>
    </div>
  );
};

export default CargoBooking;
