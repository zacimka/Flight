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
          <div class="bg-[#f0f7f0] border border-[#c3e6c3] rounded-[8px] p-[12px] text-[#0a0a0f]">
            <strong class="text-[#1a6b6b]">✓ In Transit</strong><br>
            <span class="text-[12px] text-[#7a7870]">Last update: Heathrow Cargo Hub → En route to Mogadishu</span>
          </div>`);
      } else {
        setTrackResult('<span class="text-[#c44b2b]">No shipment found. Check your reference number.</span>');
      }
    }, 1200);
  };

  const progressFills = { 1: '33%', 2: '66%', 3: '100%' };

  return (
    <div className="font-['DM_Sans',sans-serif] bg-[#f5f3ee] text-[#0a0a0f] min-h-screen overflow-x-hidden text-left">
      {/* HERO */}
      <div className="bg-[#0a0a0f] p-0 relative overflow-hidden min-h-[340px] flex flex-col">
        <div 
          className="absolute inset-0"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(201,150,58,0.04) 40px, rgba(201,150,58,0.04) 41px), repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(201,150,58,0.04) 40px, rgba(201,150,58,0.04) 41px)' }}
        ></div>
        <div 
          className="absolute w-[600px] h-[600px] rounded-full pointer-events-none -top-[200px] -right-[100px]"
          style={{ background: 'radial-gradient(circle, rgba(201,150,58,0.12) 0%, transparent 70%)' }}
        ></div>
        
        <div className="px-6 py-8 md:px-12 md:py-14 relative z-10 flex-1 flex flex-col justify-center mt-10 md:mt-0">
          <div className="inline-flex items-center gap-[8px] bg-[rgba(201,150,58,0.1)] border border-[rgba(201,150,58,0.25)] text-[#c9963a] px-[12px] py-[5px] rounded-[4px] text-[11px] font-semibold tracking-[1.5px] uppercase mb-[20px] w-fit">
            📦 International Cargo
          </div>
          <h1 className="font-['Syne',sans-serif] text-[clamp(32px,5vw,52px)] font-extrabold text-white leading-[1.05] tracking-[-1.5px] mb-[16px]">
            Ship Anywhere.<br /><em className="not-italic text-[#c9963a]">We Handle It.</em>
          </h1>
          <p className="text-[rgba(255,255,255,0.5)] text-[16px] max-w-[520px] leading-[1.6] font-light">
            UK → Somalia · China → Somalia · Door-to-door delivery with tracking. Fast, reliable, affordable.
          </p>
        </div>
      </div>

      {/* ROUTES BAR */}
      <div className="bg-[#c9963a] px-[24px] md:px-[48px] py-[12px] flex gap-[32px] items-center overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-[8px] text-[13px] font-semibold text-[#0a0a0f]">🇬🇧 UK → 🇸🇴 Somalia <span className="w-[6px] h-[6px] bg-[#0a0a0f] rounded-full opacity-40"></span> 5–7 days air</div>
        <div className="flex items-center gap-[8px] text-[13px] font-semibold text-[#0a0a0f]">🇨🇳 China → 🇸🇴 Somalia <span className="w-[6px] h-[6px] bg-[#0a0a0f] rounded-full opacity-40"></span> 25–35 days sea</div>
        <div className="flex items-center gap-[8px] text-[13px] font-semibold text-[#0a0a0f]">🇸🇴 Somalia → 🇬🇧 UK <span className="w-[6px] h-[6px] bg-[#0a0a0f] rounded-full opacity-40"></span> On request</div>
        <div className="flex items-center gap-[8px] text-[13px] font-semibold text-[#0a0a0f]">📦 Door-to-door available</div>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-[24px] lg:gap-[48px] max-w-[1200px] mx-auto px-[24px] py-[24px] md:px-[48px] md:py-[48px]">

        {/* BOOKING FORM */}
        <div className="bg-white rounded-[16px] border border-[#ddd9d0] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] h-fit">
          <div className="h-[3px] bg-[#ddd9d0] relative overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#c9963a] to-[#1a6b6b] transition-all duration-400 ease-out" 
              style={{ width: !isSuccess ? progressFills[currentStep] : '100%' }}
            ></div>
          </div>

          <div className="px-[32px] py-[28px] border-b border-[#ddd9d0] flex items-center gap-[12px]">
            <div className="w-[36px] h-[36px] bg-gradient-to-br from-[#1a6b6b] to-[#2a9090] rounded-[8px] flex items-center justify-center text-[18px]">📦</div>
            <h2 className="font-['Syne',sans-serif] text-[18px] font-bold">Book Cargo</h2>
            <div className="flex gap-[8px] ml-auto">
              <div className={`w-[8px] h-[8px] rounded-full transition-all duration-300 ${!isSuccess && currentStep >= 1 ? (currentStep === 1 ? 'bg-[#c9963a]' : 'bg-[#1a6b6b]') : 'bg-[#1a6b6b]'}`}></div>
              <div className={`w-[8px] h-[8px] rounded-full transition-all duration-300 ${!isSuccess && currentStep >= 2 ? (currentStep === 2 ? 'bg-[#c9963a]' : 'bg-[#1a6b6b]') : (isSuccess ? 'bg-[#1a6b6b]' : 'bg-[#ddd9d0]')}`}></div>
              <div className={`w-[8px] h-[8px] rounded-full transition-all duration-300 ${!isSuccess && currentStep >= 3 ? (currentStep === 3 ? 'bg-[#c9963a]' : 'bg-[#1a6b6b]') : (isSuccess ? 'bg-[#1a6b6b]' : 'bg-[#ddd9d0]')}`}></div>
            </div>
          </div>

          {!isSuccess ? (
            <>
              {/* STEP 1: Route & Service */}
              <div className={`p-[32px] ${currentStep === 1 ? 'block' : 'hidden'}`}>
                <div className="font-['Syne',sans-serif] text-[20px] font-bold mb-[6px]">Choose Route & Service</div>
                <div className="text-[#7a7870] text-[14px] mb-[28px]">Select your shipping route and preferred service</div>

                <label className="block text-[12px] font-semibold tracking-[0.5px] uppercase text-[#7a7870] mb-[8px]">SHIPPING ROUTE</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px] mb-[28px]">
                  <div className={`border-2 rounded-[12px] px-[14px] py-[16px] cursor-pointer transition-all duration-200 text-center ${selectedRoute === 'uk-somalia' ? 'border-[#c9963a] bg-[rgba(201,150,58,0.05)]' : 'border-[#ddd9d0] bg-white hover:border-[#c9963a] hover:-translate-y-[2px]'}`} onClick={() => selectRoute('uk-somalia')}>
                    <div className="text-[22px] mb-[8px] flex items-center justify-center gap-[4px]">🇬🇧 <span className="text-[14px] opacity-40">→</span> 🇸🇴</div>
                    <div className="font-['Syne',sans-serif] text-[11px] font-bold tracking-[0.5px] uppercase text-[#0a0a0f]">UK → Somalia</div>
                    <div className="text-[11px] text-[#7a7870] mt-[4px]">5–7 days air</div>
                  </div>
                  <div className={`border-2 rounded-[12px] px-[14px] py-[16px] cursor-pointer transition-all duration-200 text-center ${selectedRoute === 'china-somalia' ? 'border-[#c9963a] bg-[rgba(201,150,58,0.05)]' : 'border-[#ddd9d0] bg-white hover:border-[#c9963a] hover:-translate-y-[2px]'}`} onClick={() => selectRoute('china-somalia')}>
                    <div className="text-[22px] mb-[8px] flex items-center justify-center gap-[4px]">🇨🇳 <span className="text-[14px] opacity-40">→</span> 🇸🇴</div>
                    <div className="font-['Syne',sans-serif] text-[11px] font-bold tracking-[0.5px] uppercase text-[#0a0a0f]">China → Somalia</div>
                    <div className="text-[11px] text-[#7a7870] mt-[4px]">25–35 days sea</div>
                  </div>
                  <div className={`border-2 rounded-[12px] px-[14px] py-[16px] cursor-pointer transition-all duration-200 text-center ${selectedRoute === 'somalia-uk' ? 'border-[#c9963a] bg-[rgba(201,150,58,0.05)]' : 'border-[#ddd9d0] bg-white hover:border-[#c9963a] hover:-translate-y-[2px]'}`} onClick={() => selectRoute('somalia-uk')}>
                    <div className="text-[22px] mb-[8px] flex items-center justify-center gap-[4px]">🇸🇴 <span className="text-[14px] opacity-40">→</span> 🇬🇧</div>
                    <div className="font-['Syne',sans-serif] text-[11px] font-bold tracking-[0.5px] uppercase text-[#0a0a0f]">Somalia → UK</div>
                    <div className="text-[11px] text-[#7a7870] mt-[4px]">Contact us</div>
                  </div>
                </div>

                <label className="block text-[12px] font-semibold tracking-[0.5px] uppercase text-[#7a7870] mb-[8px]">SERVICE TYPE</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px] mb-[28px]">
                  <div className={`border-2 rounded-[12px] p-[20px] cursor-pointer transition-all duration-200 bg-white ${selectedService === 'air' ? 'border-[#1a6b6b] bg-[rgba(26,107,107,0.04)]' : 'border-[#ddd9d0] hover:border-[#1a6b6b]'}`} onClick={() => selectService('air', 4.5)}>
                    <div className="text-[28px] mb-[10px]">✈️</div>
                    <div className="font-['Syne',sans-serif] text-[14px] font-bold mb-[4px]">Air Freight</div>
                    <div className="text-[12px] text-[#7a7870] leading-[1.5]">Fast delivery. Best for urgent or valuable items.</div>
                    <div className="mt-[12px] text-[13px] font-semibold text-[#1a6b6b]">From £4.50/kg</div>
                  </div>
                  <div className={`border-2 rounded-[12px] p-[20px] cursor-pointer transition-all duration-200 bg-white ${selectedService === 'sea' ? 'border-[#1a6b6b] bg-[rgba(26,107,107,0.04)]' : 'border-[#ddd9d0] hover:border-[#1a6b6b]'}`} onClick={() => selectService('sea', 1.2)}>
                    <div className="text-[28px] mb-[10px]">🚢</div>
                    <div className="font-['Syne',sans-serif] text-[14px] font-bold mb-[4px]">Sea Freight</div>
                    <div className="text-[12px] text-[#7a7870] leading-[1.5]">Economical for large shipments. Best for China route.</div>
                    <div className="mt-[12px] text-[13px] font-semibold text-[#1a6b6b]">From £1.20/kg</div>
                  </div>
                  <div className={`border-2 rounded-[12px] p-[20px] cursor-pointer transition-all duration-200 bg-white ${selectedService === 'express' ? 'border-[#1a6b6b] bg-[rgba(26,107,107,0.04)]' : 'border-[#ddd9d0] hover:border-[#1a6b6b]'}`} onClick={() => selectService('express', 8.5)}>
                    <div className="text-[28px] mb-[10px]">⚡</div>
                    <div className="font-['Syne',sans-serif] text-[14px] font-bold mb-[4px]">Express (FedEx)</div>
                    <div className="text-[12px] text-[#7a7870] leading-[1.5]">3–5 days. Full tracking. Door-to-door.</div>
                    <div className="mt-[12px] text-[13px] font-semibold text-[#1a6b6b]">From £8.50/kg</div>
                  </div>
                  <div className={`border-2 rounded-[12px] p-[20px] cursor-pointer transition-all duration-200 bg-white ${selectedService === 'economy' ? 'border-[#1a6b6b] bg-[rgba(26,107,107,0.04)]' : 'border-[#ddd9d0] hover:border-[#1a6b6b]'}`} onClick={() => selectService('economy', 3.2)}>
                    <div className="text-[28px] mb-[10px]">💼</div>
                    <div className="font-['Syne',sans-serif] text-[14px] font-bold mb-[4px]">Economy (Aramex)</div>
                    <div className="text-[12px] text-[#7a7870] leading-[1.5]">Budget-friendly. Reliable for non-urgent cargo.</div>
                    <div className="mt-[12px] text-[13px] font-semibold text-[#1a6b6b]">From £3.20/kg</div>
                  </div>
                </div>

                {/* PRICE CALCULATOR */}
                <div className="bg-gradient-to-br from-[#0a0a0f] to-[#1a2a2a] rounded-[12px] p-[24px] mb-[24px] text-white">
                  <h4 className="font-['Syne',sans-serif] text-[14px] font-bold text-[#c9963a] mb-[16px] tracking-[0.5px]">💰 INSTANT PRICE CALCULATOR</h4>
                  <div className="flex gap-[12px] mb-[12px] items-center">
                    <label className="text-[rgba(255,255,255,0.5)] w-[28px] text-right m-0 text-[11px] uppercase">KG</label>
                    <input type="number" placeholder="Weight (kg)" value={weight} onChange={handleWeightChange} min="0.5" step="0.5" className="flex-1 bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] text-white px-[16px] py-[12px] rounded-[8px] font-['DM_Sans',sans-serif] text-[14px] focus:border-[#c9963a] focus:shadow-none focus:outline-none placeholder-[rgba(255,255,255,0.3)] appearance-none" />
                  </div>
                  <div className="bg-[rgba(201,150,58,0.1)] border border-[rgba(201,150,58,0.2)] rounded-[8px] p-[16px] mt-[16px] flex justify-between items-center">
                    <div>
                      <div className="text-[12px] text-[rgba(255,255,255,0.5)]">ESTIMATED TOTAL</div>
                    </div>
                    <div className="font-['Syne',sans-serif] text-[24px] font-extrabold text-[#c9963a]">{price}</div>
                  </div>
                </div>
              </div>

              {/* STEP 2: Cargo Details */}
              <div className={`p-[32px] ${currentStep === 2 ? 'block' : 'hidden'}`}>
                <div className="font-['Syne',sans-serif] text-[20px] font-bold mb-[6px]">Cargo Details</div>
                <div className="text-[#7a7870] text-[14px] mb-[28px]">Tell us what you're shipping</div>

                <div className="mb-[20px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                    <div>
                      <label className="block text-[12px] font-semibold tracking-[0.5px] uppercase text-[#7a7870] mb-[8px]">Weight (KG)</label>
                      <input type="number" placeholder="e.g. 25" min="0.5" step="0.5" value={weight} onChange={handleWeightChange} className="w-full px-[16px] py-[12px] border-[1.5px] border-[#ddd9d0] rounded-[8px] font-['DM_Sans',sans-serif] text-[14px] text-[#0a0a0f] bg-white transition-colors duration-200 outline-none focus:border-[#c9963a] focus:shadow-[0_0_0_3px_rgba(201,150,58,0.1)] appearance-none" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold tracking-[0.5px] uppercase text-[#7a7870] mb-[8px]">Number of Parcels</label>
                      <input type="number" placeholder="e.g. 3" min="1" className="w-full px-[16px] py-[12px] border-[1.5px] border-[#ddd9d0] rounded-[8px] font-['DM_Sans',sans-serif] text-[14px] text-[#0a0a0f] bg-white transition-colors duration-200 outline-none focus:border-[#c9963a] focus:shadow-[0_0_0_3px_rgba(201,150,58,0.1)] appearance-none" />
                    </div>
                  </div>
                </div>

                <div className="mb-[20px]">
                  <label className="block text-[12px] font-semibold tracking-[0.5px] uppercase text-[#7a7870] mb-[8px]">Contents / Description</label>
                  <input type="text" placeholder="e.g. Clothes, Electronics, Food items" className="w-full px-[16px] py-[12px] border-[1.5px] border-[#ddd9d0] rounded-[8px] font-['DM_Sans',sans-serif] text-[14px] text-[#0a0a0f] bg-white transition-colors duration-200 outline-none focus:border-[#c9963a] focus:shadow-[0_0_0_3px_rgba(201,150,58,0.1)] appearance-none" />
                </div>

                <div className="mb-[20px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                    <div>
                      <label className="block text-[12px] font-semibold tracking-[0.5px] uppercase text-[#7a7870] mb-[8px]">Declared Value (£)</label>
                      <input type="number" placeholder="e.g. 500" className="w-full px-[16px] py-[12px] border-[1.5px] border-[#ddd9d0] rounded-[8px] font-['DM_Sans',sans-serif] text-[14px] text-[#0a0a0f] bg-white transition-colors duration-200 outline-none focus:border-[#c9963a] focus:shadow-[0_0_0_3px_rgba(201,150,58,0.1)] appearance-none" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold tracking-[0.5px] uppercase text-[#7a7870] mb-[8px]">Add Insurance?</label>
                      <select className="w-full px-[16px] py-[12px] border-[1.5px] border-[#ddd9d0] rounded-[8px] font-['DM_Sans',sans-serif] text-[14px] text-[#0a0a0f] bg-white transition-colors duration-200 outline-none focus:border-[#c9963a] focus:shadow-[0_0_0_3px_rgba(201,150,58,0.1)] appearance-none cursor-pointer">
                        <option value="no">No Insurance</option>
                        <option value="basic">Basic (1% of value)</option>
                        <option value="full">Full Cover (2.5% of value)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mb-[20px]">
                  <label className="block text-[12px] font-semibold tracking-[0.5px] uppercase text-[#7a7870] mb-[8px]">Special Instructions (Optional)</label>
                  <textarea placeholder="Fragile items, special handling, preferred delivery time..." className="w-full px-[16px] py-[12px] border-[1.5px] border-[#ddd9d0] rounded-[8px] font-['DM_Sans',sans-serif] text-[14px] text-[#0a0a0f] bg-white transition-colors duration-200 outline-none focus:border-[#c9963a] focus:shadow-[0_0_0_3px_rgba(201,150,58,0.1)] appearance-none min-h-[90px] resize-y"></textarea>
                </div>
              </div>

              {/* STEP 3: Contact Info */}
              <div className={`p-[32px] ${currentStep === 3 ? 'block' : 'hidden'}`}>
                <div className="font-['Syne',sans-serif] text-[20px] font-bold mb-[6px]">Sender & Recipient</div>
                <div className="text-[#7a7870] text-[14px] mb-[28px]">Enter contact details for both sides</div>

                <div className="bg-[#f8f6f2] rounded-[10px] p-[18px] mb-[24px]">
                  <div className="font-['Syne',sans-serif] text-[12px] font-bold text-uppercase tracking-[1px] text-[#7a7870] mb-[12px]">📤 Sender (UK)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] mb-[12px]">
                    <div>
                      <label className="block text-[12px] font-semibold tracking-[0.5px] uppercase text-[#7a7870] mb-[8px]">Full Name</label>
                      <input type="text" placeholder="Your name" className="w-full px-[16px] py-[12px] border-[1.5px] border-[#ddd9d0] rounded-[8px] font-['DM_Sans',sans-serif] text-[14px] text-[#0a0a0f] bg-white transition-colors duration-200 outline-none focus:border-[#c9963a] focus:shadow-[0_0_0_3px_rgba(201,150,58,0.1)] appearance-none" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold tracking-[0.5px] uppercase text-[#7a7870] mb-[8px]">Phone</label>
                      <input type="tel" placeholder="+44 7xxx xxxxxx" className="w-full px-[16px] py-[12px] border-[1.5px] border-[#ddd9d0] rounded-[8px] font-['DM_Sans',sans-serif] text-[14px] text-[#0a0a0f] bg-white transition-colors duration-200 outline-none focus:border-[#c9963a] focus:shadow-[0_0_0_3px_rgba(201,150,58,0.1)] appearance-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold tracking-[0.5px] uppercase text-[#7a7870] mb-[8px]">Collection Address</label>
                    <input type="text" placeholder="Your UK address" className="w-full px-[16px] py-[12px] border-[1.5px] border-[#ddd9d0] rounded-[8px] font-['DM_Sans',sans-serif] text-[14px] text-[#0a0a0f] bg-white transition-colors duration-200 outline-none focus:border-[#c9963a] focus:shadow-[0_0_0_3px_rgba(201,150,58,0.1)] appearance-none" />
                  </div>
                </div>

                <div className="bg-[#f0f7f7] rounded-[10px] p-[18px] mb-[24px]">
                  <div className="font-['Syne',sans-serif] text-[12px] font-bold text-uppercase tracking-[1px] text-[#1a6b6b] mb-[12px]">📥 Recipient (Somalia)</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] mb-[12px]">
                    <div>
                      <label className="block text-[12px] font-semibold tracking-[0.5px] uppercase text-[#7a7870] mb-[8px]">Full Name</label>
                      <input type="text" placeholder="Recipient name" className="w-full px-[16px] py-[12px] border-[1.5px] border-[#ddd9d0] rounded-[8px] font-['DM_Sans',sans-serif] text-[14px] text-[#0a0a0f] bg-white transition-colors duration-200 outline-none focus:border-[#c9963a] focus:shadow-[0_0_0_3px_rgba(201,150,58,0.1)] appearance-none" />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold tracking-[0.5px] uppercase text-[#7a7870] mb-[8px]">Phone (Somali number)</label>
                      <input type="tel" placeholder="+252 6xx xxxxxx" className="w-full px-[16px] py-[12px] border-[1.5px] border-[#ddd9d0] rounded-[8px] font-['DM_Sans',sans-serif] text-[14px] text-[#0a0a0f] bg-white transition-colors duration-200 outline-none focus:border-[#c9963a] focus:shadow-[0_0_0_3px_rgba(201,150,58,0.1)] appearance-none" />
                    </div>
                  </div>
                  <div className="mb-[12px]">
                    <label className="block text-[12px] font-semibold tracking-[0.5px] uppercase text-[#7a7870] mb-[8px]">City</label>
                    <select className="w-full px-[16px] py-[12px] border-[1.5px] border-[#ddd9d0] rounded-[8px] font-['DM_Sans',sans-serif] text-[14px] text-[#0a0a0f] bg-white transition-colors duration-200 outline-none focus:border-[#c9963a] focus:shadow-[0_0_0_3px_rgba(201,150,58,0.1)] appearance-none cursor-pointer">
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
                    <label className="block text-[12px] font-semibold tracking-[0.5px] uppercase text-[#7a7870] mb-[8px]">Delivery Address / Area</label>
                    <input type="text" placeholder="Area / street name" className="w-full px-[16px] py-[12px] border-[1.5px] border-[#ddd9d0] rounded-[8px] font-['DM_Sans',sans-serif] text-[14px] text-[#0a0a0f] bg-white transition-colors duration-200 outline-none focus:border-[#c9963a] focus:shadow-[0_0_0_3px_rgba(201,150,58,0.1)] appearance-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold tracking-[0.5px] uppercase text-[#7a7870] mb-[8px]">Your Email (for confirmation)</label>
                  <input type="email" placeholder="your@email.com" className="w-full px-[16px] py-[12px] border-[1.5px] border-[#ddd9d0] rounded-[8px] font-['DM_Sans',sans-serif] text-[14px] text-[#0a0a0f] bg-white transition-colors duration-200 outline-none focus:border-[#c9963a] focus:shadow-[0_0_0_3px_rgba(201,150,58,0.1)] appearance-none" />
                </div>
              </div>
            </>
          ) : (
            /* SUCCESS */
            <div className="p-[48px_32px] text-center block">
              <div className="w-[72px] h-[72px] bg-gradient-to-br from-[#1a6b6b] to-[#2a9090] rounded-full flex items-center justify-center text-[32px] mx-auto mb-[24px] text-white
                animate-[popIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)]">✓</div>
              <h3 className="font-['Syne',sans-serif] text-[22px] font-extrabold mb-[8px]">Booking Confirmed!</h3>
              <p className="text-[#7a7870] text-[14px] mb-[24px] leading-[1.6]">Your cargo booking has been received. We'll contact you within 2 hours to confirm pickup and payment details.</p>
              <div className="bg-[#f5f3ee] border border-[#ddd9d0] rounded-[10px] px-[24px] py-[16px] inline-block mb-[24px]">
                <div className="text-[11px] uppercase tracking-[1px] text-[#7a7870] font-semibold mb-[4px]">Booking Reference</div>
                <div className="font-['Syne',sans-serif] text-[22px] font-extrabold tracking-[2px] text-[#0a0a0f]">{bookingRef}</div>
              </div>
              <p className="text-[12px] text-[#7a7870]">📱 You'll receive a WhatsApp confirmation shortly</p>
            </div>
          )}

          {/* BUTTONS */}
          <div className="flex gap-[12px] px-[32px] py-[24px] border-t border-[#ddd9d0] bg-[#fafaf8]">
            {!isSuccess ? (
              <>
                {currentStep > 1 && (
                  <button className="px-[20px] py-[13px] border-[1.5px] border-[#ddd9d0] text-[#7a7870] bg-transparent rounded-[8px] font-['Syne',sans-serif] text-[14px] font-bold tracking-[0.3px] hover:border-[#0a0a0f] hover:text-[#0a0a0f] transition-colors" onClick={prevStep}>← Back</button>
                )}
                <button 
                  className={`flex-1 px-[28px] py-[13px] text-white rounded-[8px] font-['Syne',sans-serif] text-[14px] font-bold tracking-[0.3px] transition-all hover:-translate-y-[1px] shadow-[0_6px_20px_rgba(26,107,107,0)] hover:shadow-[0_6px_20px_rgba(26,107,107,0.3)] border-none cursor-pointer ${currentStep === 3 ? 'bg-[#1a6b6b]' : 'bg-[#0a0a0f] hover:bg-[#1a6b6b]'}`}
                  onClick={nextStep}
                >
                  {currentStep === 3 ? '✓ Confirm Booking' : 'Continue →'}
                </button>
              </>
            ) : (
              <button className="flex-1 px-[28px] py-[13px] bg-[#1a6b6b] text-white rounded-[8px] font-['Syne',sans-serif] text-[14px] font-bold tracking-[0.3px] transition-all hover:-translate-y-[1px] shadow-[0_6px_20px_rgba(26,107,107,0)] hover:shadow-[0_6px_20px_rgba(26,107,107,0.3)] border-none cursor-pointer" onClick={resetForm}>
                📦 Book Another Shipment
              </button>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="flex flex-col gap-[20px] hidden lg:flex">

          {/* TRACK */}
          <div className="bg-white border border-[#ddd9d0] rounded-[16px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
            <div className="px-[24px] py-[18px] border-b border-[#ddd9d0] flex items-center gap-[10px]">
              <span className="text-[16px]">🔍</span>
              <h3 className="font-['Syne',sans-serif] text-[14px] font-bold">Track Shipment</h3>
            </div>
            <div className="px-[24px] py-[20px]">
              <div className="flex gap-[8px]">
                <input 
                  type="text" 
                  placeholder="Enter tracking number" 
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="flex-1 px-[16px] py-[12px] border-[1.5px] border-[#ddd9d0] rounded-[8px] font-['DM_Sans',sans-serif] text-[13px] text-[#0a0a0f] outline-none focus:border-[#c9963a] transition-all"
                />
                <button onClick={trackShipment} className="px-[18px] py-[12px] bg-[#0a0a0f] hover:bg-[#1a6b6b] text-white border-none rounded-[8px] font-['Syne',sans-serif] text-[13px] font-bold whitespace-nowrap transition-colors cursor-pointer">Track</button>
              </div>
              {trackResult && (
                <div className="mt-[12px] text-[13px] text-[#7a7870]" dangerouslySetInnerHTML={{ __html: trackResult }}></div>
              )}
            </div>
          </div>

          {/* PROVIDERS */}
          <div className="bg-white border border-[#ddd9d0] rounded-[16px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
            <div className="px-[24px] py-[18px] border-b border-[#ddd9d0] flex items-center gap-[10px]">
              <span className="text-[16px]">🤝</span>
              <h3 className="font-['Syne',sans-serif] text-[14px] font-bold">Our Partners</h3>
            </div>
            <div className="px-[24px] py-[20px]">
              <div className="flex items-center gap-[14px] py-[12px] border-b border-[#ddd9d0] pt-0">
                <div className="w-[44px] h-[44px] bg-[#4d148c] text-[#ff6600] rounded-[10px] flex items-center justify-center font-extrabold text-[12px] tracking-[0.5px] shrink-0">FedEx</div>
                <div className="flex-1">
                  <div className="font-['Syne',sans-serif] text-[13px] font-bold mb-[2px]">FedEx International</div>
                  <div className="text-[11px] text-[#7a7870]">UK → Somalia · Express</div>
                </div>
                <span className="text-[10px] font-bold px-[8px] py-[3px] bg-[rgba(196,75,43,0.1)] text-[#c44b2b] rounded-[4px] tracking-[0.5px] uppercase">Fast</span>
              </div>
              <div className="flex items-center gap-[14px] py-[12px] border-b border-[#ddd9d0]">
                <div className="w-[44px] h-[44px] bg-[#e8002d] text-white rounded-[10px] flex items-center justify-center font-extrabold text-[12px] tracking-[0.5px] shrink-0">ARX</div>
                <div className="flex-1">
                  <div className="font-['Syne',sans-serif] text-[13px] font-bold mb-[2px]">Aramex</div>
                  <div className="text-[11px] text-[#7a7870]">UK → Somalia · Economy</div>
                </div>
                <span className="text-[10px] font-bold px-[8px] py-[3px] bg-[rgba(26,107,107,0.1)] text-[#1a6b6b] rounded-[4px] tracking-[0.5px] uppercase">Value</span>
              </div>
              <div className="flex items-center gap-[14px] py-[12px] pb-0 border-none">
                <div className="w-[44px] h-[44px] bg-[#006b3f] text-[#ffd700] rounded-[10px] flex items-center justify-center font-extrabold text-[12px] tracking-[0.5px] shrink-0">TWK</div>
                <div className="flex-1">
                  <div className="font-['Syne',sans-serif] text-[13px] font-bold mb-[2px]">Tawakal Express</div>
                  <div className="text-[11px] text-[#7a7870]">UK → Somalia · Local</div>
                </div>
                <span className="text-[10px] font-bold px-[8px] py-[3px] bg-[rgba(201,150,58,0.12)] text-[#c9963a] rounded-[4px] tracking-[0.5px] uppercase">Somali</span>
              </div>
            </div>
          </div>

          {/* TIPS */}
          <div className="bg-white border border-[#ddd9d0] rounded-[16px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
            <div className="px-[24px] py-[18px] border-b border-[#ddd9d0] flex items-center gap-[10px]">
              <span className="text-[16px]">💡</span>
              <h3 className="font-['Syne',sans-serif] text-[14px] font-bold">Shipping Tips</h3>
            </div>
            <div className="px-[24px] py-[20px]">
              <div className="flex gap-[12px] mb-[16px] pb-[16px] border-b border-[#ddd9d0]">
                <div className="w-[32px] h-[32px] rounded-[8px] bg-[#f5f3ee] flex items-center justify-center shrink-0 text-[16px]">📋</div>
                <div className="text-[13px] leading-[1.5] text-[#7a7870]"><strong className="text-[#0a0a0f] font-semibold">Always declare contents.</strong> Undeclared items may be held at customs and cause delays.</div>
              </div>
              <div className="flex gap-[12px] mb-[16px] pb-[16px] border-b border-[#ddd9d0]">
                <div className="w-[32px] h-[32px] rounded-[8px] bg-[#f5f3ee] flex items-center justify-center shrink-0 text-[16px]">⚖️</div>
                <div className="text-[13px] leading-[1.5] text-[#7a7870]"><strong className="text-[#0a0a0f] font-semibold">Volumetric weight</strong> may apply for large, light packages. We'll calculate for you.</div>
              </div>
              <div className="flex gap-[12px] mb-[16px] pb-[16px] border-b border-[#ddd9d0]">
                <div className="w-[32px] h-[32px] rounded-[8px] bg-[#f5f3ee] flex items-center justify-center shrink-0 text-[16px]">🚫</div>
                <div className="text-[13px] leading-[1.5] text-[#7a7870]"><strong className="text-[#0a0a0f] font-semibold">Prohibited:</strong> Cash, khat, weapons, chemicals. Full list on request.</div>
              </div>
              <div className="flex gap-[12px] mb-0 pb-0 border-none">
                <div className="w-[32px] h-[32px] rounded-[8px] bg-[#f5f3ee] flex items-center justify-center shrink-0 text-[16px]">📦</div>
                <div className="text-[13px] leading-[1.5] text-[#7a7870]"><strong className="text-[#0a0a0f] font-semibold">Packing service</strong> available from £10. We box and label everything for you.</div>
              </div>
            </div>
          </div>

          {/* CONTACT LISTING */}
          <div className="bg-[#0a0a0f] rounded-[16px] p-[24px] text-center text-white">
            <div className="text-[28px] mb-[10px]">📞</div>
            <div className="font-['Syne',sans-serif] text-[15px] font-bold mb-[6px]">Need Help?</div>
            <div className="text-[13px] text-[rgba(255,255,255,0.5)] mb-[16px]">Our team speaks Somali & English</div>
            <a href="https://wa.me/447000000000" className="block bg-[#25D366] text-white p-[12px] rounded-[8px] font-['Syne',sans-serif] text-[13px] font-bold mb-[8px] no-underline">💬 WhatsApp Us</a>
            <a href="tel:+44700000000" className="block bg-[rgba(255,255,255,0.08)] text-white p-[12px] rounded-[8px] font-['Syne',sans-serif] text-[13px] font-bold no-underline">📞 Call Us</a>
          </div>
        </div>
      </div>
      
      {/* WHATSAPP FLOAT */}
      <a href="https://wa.me/447000000000" title="WhatsApp Us" className="fixed bottom-[24px] right-[24px] bg-[#25D366] text-white w-[56px] h-[56px] rounded-full flex items-center justify-center text-[26px] shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform cursor-pointer z-[100] no-underline">💬</a>
    </div>
  );
};

export default CargoBooking;
