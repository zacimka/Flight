import React, { useState, useEffect } from 'react';

const CargoBooking = () => {
  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('uk-somalia');
  const [selectedService, setSelectedService] = useState({ id: 'air', rate: 4.5 });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    description: '',
    parcels: '',
    declaredValue: '',
    insurance: 'No Insurance',
    instructions: '',
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    recName: '',
    recPhone: '',
    recCity: '',
    recAddress: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const totalPrice = weight ? (parseFloat(weight) * selectedService.rate).toFixed(2) : '—';

  const nextStep = () => {
    if (step < 3) setStep((prev) => prev + 1);
    else submitBooking();
  };
  const prevStep = () => setStep((prev) => prev - 1);

  const submitBooking = () => {
    const ref = `ZGC-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingRef(ref);

    const newBooking = {
      ref,
      route: selectedRoute,
      service: selectedService,
      weight,
      price: totalPrice,
      ...formData,
      status: 'In Transit', // Initial mock status
      date: new Date().toLocaleDateString()
    };

    const existingBookings = JSON.parse(localStorage.getItem('cargoBookings') || '[]');
    localStorage.setItem('cargoBookings', JSON.stringify([...existingBookings, newBooking]));
    
    setIsSubmitted(true);
  };

  const resetForm = () => {
    setStep(1);
    setIsSubmitted(false);
    setWeight('');
    setFormData({
      description: '', parcels: '', declaredValue: '', insurance: 'No Insurance', instructions: '',
      senderName: '', senderPhone: '', senderAddress: '', recName: '', recPhone: '', recCity: '', recAddress: ''
    });
    setTrackResult(null);
    setTrackingInput('');
  };

  // Tracking states
  const [trackingInput, setTrackingInput] = useState('');
  const [trackResult, setTrackResult] = useState(null);

  const trackShipment = () => {
    const val = trackingInput.trim().toUpperCase();
    if (!val) return;

    setTrackResult({ type: 'loading' });

    setTimeout(() => {
      const existingBookings = JSON.parse(localStorage.getItem('cargoBookings') || '[]');
      const foundBooking = existingBookings.find(b => b.ref.toUpperCase() === val);

      if (foundBooking) {
        setTrackResult({ type: 'success', data: foundBooking });
      } else {
        setTrackResult({ type: 'error' });
      }
    }, 800);
  };

  if (isSubmitted) {
    return (
      <div className="bg-[#f5f3ee] min-h-screen pt-12 pb-24 font-['DM_Sans',sans-serif]">
        <div className="max-w-4xl mx-auto p-12 bg-white rounded-2xl shadow-xl text-center border border-gray-100">
          <div className="w-20 h-20 bg-[#115e59] text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg animate-bounce">✓</div>
          <h3 className="text-3xl font-bold font-['Syne',sans-serif] mb-3 text-[#0a0a0f]">Booking Confirmed!</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">We've received your cargo booking request. Our team will contact you on WhatsApp shortly to confirm payment and collection.</p>
          <div className="bg-[#f9fafb] p-6 rounded-xl border border-gray-200 inline-block mb-8">
            <p className="text-xs uppercase tracking-widest text-[#7a7870] font-bold mb-2">Reference Number</p>
            <p className="text-3xl font-extrabold font-['Syne',sans-serif] text-[#0a0a0f] tracking-wider">{bookingRef}</p>
          </div>
          <div>
            <button onClick={resetForm} className="bg-[#0a0a0f] text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors">
              Book Another Shipment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f3ee] font-['DM_Sans',sans-serif] text-[#0a0a0f] pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        
        {/* LEFT COLUMN: MAIN FORM */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          {/* Progress Bar */}
          <div className="h-1 w-full bg-gray-100 flex">
            <div className="h-full bg-gradient-to-r from-[#115e59] to-[#c9963a] transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>

          {/* Form Header */}
          <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#115e59] text-white rounded-xl flex items-center justify-center text-xl shadow-sm">📦</div>
              <h2 className="text-xl font-extrabold font-['Syne',sans-serif] tracking-tight">Book Cargo</h2>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`w-2.5 h-2.5 rounded-full transition-colors ${step >= s ? 'bg-[#c9963a]' : 'bg-gray-200'}`}></div>
              ))}
            </div>
          </div>

          {/* Form Body - Step 1 */}
          <div className={`p-8 flex-1 transition-all duration-500 ${step === 1 ? 'block animate-in fade-in zoom-in-95' : 'hidden'}`}>
            <h1 className="text-[26px] font-extrabold font-['Syne',sans-serif] mb-2 leading-tight">Choose Route & Service</h1>
            <p className="text-sm text-[#7a7870] mb-8">Select your shipping route and preferred service</p>

            {/* Routes */}
            <label className="text-[11px] font-bold text-[#7a7870] uppercase tracking-widest mb-3 block">Shipping Route</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { id: 'uk-somalia', flag1: '🇬🇧', flag2: '🇸🇴', title: 'UK ➔ SOMALIA', desc: '5–7 days air' },
                { id: 'china-somalia', flag1: '🇨🇳', flag2: '🇸🇴', title: 'CHINA ➔ SOMALIA', desc: '25–35 days sea' },
                { id: 'somalia-uk', flag1: '🇸🇴', flag2: '🇬🇧', title: 'SOMALIA ➔ UK', desc: 'Contact us' }
              ].map(route => (
                <div 
                  key={route.id}
                  onClick={() => setSelectedRoute(route.id)}
                  className={`cursor-pointer px-4 py-5 border-2 rounded-xl text-center transition-all flex flex-col items-center justify-center ${selectedRoute === route.id ? 'border-[#c9963a] bg-orange-50/30' : 'border-gray-100 hover:border-[#c9963a]/50 bg-white shadow-sm'}`}
                >
                  <div className="text-2xl mb-2 flex items-center gap-2">{route.flag1} <span className="text-[10px] text-gray-300">➔</span> {route.flag2}</div>
                  <div className="text-[11px] font-bold uppercase tracking-wider mb-1">{route.title}</div>
                  <div className="text-xs text-[#7a7870]">{route.desc}</div>
                </div>
              ))}
            </div>

            {/* Services */}
            <label className="text-[11px] font-bold text-[#7a7870] uppercase tracking-widest mb-3 block">Service Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                { id: 'air', name: 'Air Freight', rate: 4.5, icon: '✈️', desc: 'Fast delivery. Best for urgent or valuable items.' },
                { id: 'sea', name: 'Sea Freight', rate: 1.2, icon: '🚢', desc: 'Economical for large shipments. Best for China route.' },
                { id: 'express', name: 'Express (FedEx)', rate: 8.5, icon: '⚡', desc: '3-5 days. Full tracking. Door-to-door.' },
                { id: 'economy', name: 'Economy (Aramex)', rate: 3.2, icon: '💼', desc: 'Budget-friendly. Reliable for non-urgent cargo.' }
              ].map(service => (
                <div 
                  key={service.id}
                  onClick={() => setSelectedService({ id: service.id, rate: service.rate })}
                  className={`cursor-pointer p-5 border-2 rounded-xl transition-all shadow-sm ${selectedService.id === service.id ? 'border-[#115e59] bg-[#115e59]/5' : 'border-gray-100 hover:border-[#115e59]/50 bg-white'}`}
                >
                  <div className="text-[26px] mb-3">{service.icon}</div>
                  <div className="font-bold text-[15px] mb-1 font-['Syne',sans-serif]">{service.name}</div>
                  <div className="text-[13px] text-[#7a7870] mb-3 leading-snug h-10">{service.desc}</div>
                  <div className="text-[#115e59] font-bold text-[13px]">From £{service.rate.toFixed(2)}/kg</div>
                </div>
              ))}
            </div>

            {/* Price Calculator */}
            <div className="bg-[#121418] rounded-xl p-6 relative overflow-hidden shadow-xl mt-6 border border-gray-800">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
              <h4 className="text-[#c9963a] font-extrabold text-[11px] uppercase tracking-widest mb-5 flex items-center gap-2 relative z-10">
                <span className="text-sm">💰</span> INSTANT PRICE CALCULATOR
              </h4>
              
              <div className="flex items-center gap-4 mb-4 relative z-10 w-full md:w-2/3">
                <label className="text-[10px] text-gray-500 font-bold uppercase w-6">KG</label>
                <input 
                  type="number" 
                  placeholder="Weight (kg)"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="bg-[#1f2229] border border-gray-700 rounded-lg px-4 py-3.5 w-full text-white placeholder-gray-500 font-medium outline-none focus:border-[#c9963a] transition-all shadow-inner text-sm"
                />
              </div>

              <div className="bg-[#1a1c23] border border-[#2d3039] rounded-lg p-5 flex justify-between items-center relative z-10 shadow-inner">
                <div className="text-[11px] text-gray-400 font-bold tracking-widest uppercase">ESTIMATED TOTAL</div>
                <div className="text-[28px] font-extrabold text-[#c9963a] font-['Syne',sans-serif]">{weight ? `£${totalPrice}` : '—'}</div>
              </div>
            </div>
          </div>

          {/* Form Body - Step 2 */}
          <div className={`p-8 flex-1 transition-all duration-500 ${step === 2 ? 'block animate-in slide-in-from-right-8' : 'hidden'}`}>
            <h1 className="text-[26px] font-extrabold font-['Syne',sans-serif] mb-2 leading-tight">Cargo Details</h1>
            <p className="text-sm text-[#7a7870] mb-8">Tell us what you're shipping</p>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-bold text-[#7a7870] uppercase tracking-widest mb-2 block">Item Description</label>
                  <input type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="e.g. Clothes, Electronics" className="w-full border-2 border-gray-100 rounded-xl p-4 text-sm outline-none focus:border-[#115e59] transition-all bg-gray-50/50" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#7a7870] uppercase tracking-widest mb-2 block">No. of Parcels</label>
                  <input type="number" name="parcels" value={formData.parcels} onChange={handleInputChange} placeholder="1" className="w-full border-2 border-gray-100 rounded-xl p-4 text-sm outline-none focus:border-[#115e59] transition-all bg-gray-50/50" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-bold text-[#7a7870] uppercase tracking-widest mb-2 block">Declared Value (£)</label>
                  <input type="number" name="declaredValue" value={formData.declaredValue} onChange={handleInputChange} placeholder="500" className="w-full border-2 border-gray-100 rounded-xl p-4 text-sm outline-none focus:border-[#115e59] transition-all bg-gray-50/50" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#7a7870] uppercase tracking-widest mb-2 block">Insurance</label>
                  <select name="insurance" value={formData.insurance} onChange={handleInputChange} className="w-full border-2 border-gray-100 rounded-xl p-4 text-sm outline-none focus:border-[#115e59] transition-all bg-gray-50/50 appearance-none">
                    <option>No Insurance</option>
                    <option>Basic Cover</option>
                    <option>Full Cover</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#7a7870] uppercase tracking-widest mb-2 block">Special Instructions</label>
                <textarea name="instructions" value={formData.instructions} onChange={handleInputChange} placeholder="Fragile items, special handling needed..." className="w-full border-2 border-gray-100 rounded-xl p-4 text-sm outline-none focus:border-[#115e59] transition-all h-32 resize-none bg-gray-50/50"></textarea>
              </div>
            </div>
          </div>

          {/* Form Body - Step 3 */}
          <div className={`p-8 flex-1 transition-all duration-500 ${step === 3 ? 'block animate-in slide-in-from-right-8' : 'hidden'}`}>
            <h1 className="text-[26px] font-extrabold font-['Syne',sans-serif] mb-2 leading-tight">Sender & Recipient</h1>
            <p className="text-sm text-[#7a7870] mb-8">Enter contact details for both sides</p>

            <div className="space-y-6">
              <div className="bg-[#fcfbf9] p-6 rounded-2xl border-2 border-[#eeebe3]">
                <p className="text-[#c9963a] font-extrabold text-[11px] uppercase tracking-widest mb-5 flex items-center gap-2"><span className="text-base">📤</span> SENDER (UK)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input type="text" name="senderName" value={formData.senderName} onChange={handleInputChange} placeholder="Full Name" className="w-full border border-gray-200 rounded-xl p-3.5 text-sm outline-none focus:border-[#c9963a] bg-white transition-colors" />
                  <input type="tel" name="senderPhone" value={formData.senderPhone} onChange={handleInputChange} placeholder="UK Phone" className="w-full border border-gray-200 rounded-xl p-3.5 text-sm outline-none focus:border-[#c9963a] bg-white transition-colors" />
                </div>
                <input type="text" name="senderAddress" value={formData.senderAddress} onChange={handleInputChange} placeholder="Collection Address" className="w-full border border-gray-200 rounded-xl p-3.5 text-sm outline-none focus:border-[#c9963a] bg-white transition-colors" />
              </div>

              <div className="bg-[#f0f7f7] p-6 rounded-2xl border-2 border-[#115e59]/20">
                <p className="text-[#115e59] font-extrabold text-[11px] uppercase tracking-widest mb-5 flex items-center gap-2"><span className="text-base">📥</span> RECIPIENT (SOMALIA)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input type="text" name="recName" value={formData.recName} onChange={handleInputChange} placeholder="Full Name" className="w-full border border-[#115e59]/30 rounded-xl p-3.5 text-sm outline-none focus:border-[#115e59] bg-white transition-colors" />
                  <input type="tel" name="recPhone" value={formData.recPhone} onChange={handleInputChange} placeholder="Somali Phone" className="w-full border border-[#115e59]/30 rounded-xl p-3.5 text-sm outline-none focus:border-[#115e59] bg-white transition-colors" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select name="recCity" value={formData.recCity} onChange={handleInputChange} className="w-full border border-[#115e59]/30 rounded-xl p-3.5 text-sm outline-none focus:border-[#115e59] bg-white transition-colors appearance-none">
                    <option value="">Select City</option>
                    <option value="Mogadishu">Mogadishu</option>
                    <option value="Hargeisa">Hargeisa</option>
                    <option value="Garowe">Garowe</option>
                  </select>
                  <input type="text" name="recAddress" value={formData.recAddress} onChange={handleInputChange} placeholder="Area / Street Name" className="w-full border border-[#115e59]/30 rounded-xl p-3.5 text-sm outline-none focus:border-[#115e59] bg-white transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="p-6 border-t border-gray-100 flex gap-4 bg-[#fcfcfb]">
            {step > 1 && (
              <button onClick={prevStep} className="px-8 py-4 rounded-xl border-2 border-gray-200 font-bold text-sm text-[#7a7870] hover:border-gray-800 hover:text-[#0a0a0f] transition-all bg-white shadow-sm">
                ← Back
              </button>
            )}
            <button 
              onClick={nextStep} 
              className="flex-1 px-8 py-4 rounded-xl font-bold text-[15px] text-white transition-all shadow-lg flex items-center justify-center gap-2 bg-[#0a0a0f] hover:bg-[#1a1a24] hover:-translate-y-0.5"
            >
              {step === 3 ? 'Confirm Collection' : 'Continue'} <span className="opacity-80">➔</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="space-y-6">
          
          {/* Track Shipment */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <span className="text-lg opacity-80">🔍</span>
              <h3 className="font-['Syne',sans-serif] font-bold text-[15px] tracking-tight">Track Shipment</h3>
            </div>
            <div className="p-5">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Enter tracking number" 
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0a0a0f] transition-colors bg-gray-50 focus:bg-white"
                />
                <button onClick={trackShipment} className="bg-[#0a0a0f] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-800 transition-colors">Track</button>
              </div>
              
              {/* Dynamic Tracking Result */}
              {trackResult?.type === 'loading' && (
                <div className="mt-4 text-sm text-[#c9963a] font-medium flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-[#c9963a] border-t-transparent rounded-full"></div> Searching...
                </div>
              )}
              {trackResult?.type === 'error' && (
                <div className="mt-4 text-sm text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                  No shipment found for this reference.
                </div>
              )}
              {trackResult?.type === 'success' && (
                <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-[#115e59]/10 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <span className="font-bold text-[#115e59] uppercase text-[10px] tracking-wider">{trackResult.data.status}</span>
                    <span className="text-xs text-gray-500">{trackResult.data.date}</span>
                  </div>
                  <div className="p-4 bg-gray-50 text-sm space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-gray-500">Route</span>
                      <span className="font-bold uppercase text-[11px]">{trackResult.data.route.replace('-', ' ➔ ')}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-gray-500">Weight & Price</span>
                      <span className="font-bold">{trackResult.data.weight}kg — £{trackResult.data.price}</span>
                    </div>
                    {trackResult.data.description && (
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <span className="text-gray-500">Contents</span>
                        <span className="font-bold text-xs truncate max-w-[150px]">{trackResult.data.description}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-start pt-1">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">From</p>
                        <p className="font-bold text-xs">{trackResult.data.senderName || 'Sender'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">To</p>
                        <p className="font-bold text-xs">{trackResult.data.recName || 'Receiver'}</p>
                        <p className="text-xs text-gray-500">{trackResult.data.recCity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Our Partners */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <span className="text-lg opacity-80">🤝</span>
              <h3 className="font-['Syne',sans-serif] font-bold text-[15px] tracking-tight">Our Partners</h3>
            </div>
            <div className="p-0">
              <div className="flex items-center gap-4 p-5 border-b border-gray-100">
                <div className="w-12 h-12 bg-[#4d148c] rounded-xl flex items-center justify-center font-extrabold text-[10px] tracking-wider shrink-0 shadow-sm overflow-hidden">
                  <div className="flex"><span className="text-white">Fed</span><span className="text-[#ff6600]">Ex</span></div>
                </div>
                <div className="flex-1">
                  <div className="font-['Syne',sans-serif] text-[13px] font-bold mb-0.5 text-[#0a0a0f]">FedEx International</div>
                  <div className="text-[11px] text-[#7a7870]">UK ➔ Somalia · Express</div>
                </div>
                <span className="text-[9px] font-extrabold px-2 py-1 bg-red-50 text-red-600 rounded uppercase tracking-widest">Fast</span>
              </div>
              <div className="flex items-center gap-4 p-5 border-b border-gray-100">
                <div className="w-12 h-12 bg-[#e8002d] text-white rounded-xl flex items-center justify-center font-extrabold text-[12px] tracking-wider shrink-0 shadow-sm">
                  ARX
                </div>
                <div className="flex-1">
                  <div className="font-['Syne',sans-serif] text-[13px] font-bold mb-0.5 text-[#0a0a0f]">Aramex</div>
                  <div className="text-[11px] text-[#7a7870]">UK ➔ Somalia · Economy</div>
                </div>
                <span className="text-[9px] font-extrabold px-2 py-1 bg-[#115e59]/10 text-[#115e59] rounded uppercase tracking-widest">Value</span>
              </div>
              <div className="flex items-center gap-4 p-5">
                <div className="w-12 h-12 bg-[#006b3f] text-[#ffd700] rounded-xl flex items-center justify-center font-extrabold text-[12px] tracking-wider shrink-0 shadow-sm">
                  TWK
                </div>
                <div className="flex-1">
                  <div className="font-['Syne',sans-serif] text-[13px] font-bold mb-0.5 text-[#0a0a0f]">Tawakal Express</div>
                  <div className="text-[11px] text-[#7a7870]">UK ➔ Somalia · Local</div>
                </div>
                <span className="text-[9px] font-extrabold px-2 py-1 bg-[#c9963a]/10 text-[#c9963a] rounded uppercase tracking-widest">Somali</span>
              </div>
            </div>
          </div>

          {/* Shipping Tips */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <span className="text-lg opacity-80">💡</span>
              <h3 className="font-['Syne',sans-serif] font-bold text-[15px] tracking-tight">Shipping Tips</h3>
            </div>
            <div className="p-0">
              <div className="flex gap-4 p-5 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-[#f5f3ee] flex items-center justify-center shrink-0 text-base shadow-inner border border-gray-200/60">📋</div>
                <div className="text-xs leading-relaxed text-[#7a7870]"><strong className="text-[#0a0a0f] font-bold">Always declare contents.</strong> Undeclared items may be held at customs and cause delays.</div>
              </div>
              <div className="flex gap-4 p-5 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-[#f5f3ee] flex items-center justify-center shrink-0 text-base shadow-inner border border-gray-200/60">⚖️</div>
                <div className="text-xs leading-relaxed text-[#7a7870]"><strong className="text-[#0a0a0f] font-bold">Volumetric weight</strong> may apply for large, light packages. We'll calculate for you.</div>
              </div>
              <div className="flex gap-4 p-5 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 text-base shadow-inner border border-red-100/60">🚫</div>
                <div className="text-xs leading-relaxed text-[#7a7870]"><strong className="text-[#0a0a0f] font-bold">Prohibited:</strong> Cash, khat, weapons, chemicals. Full list on request.</div>
              </div>
              <div className="flex gap-4 p-5">
                <div className="w-8 h-8 rounded-lg bg-[#c9963a]/10 flex items-center justify-center shrink-0 text-base shadow-inner border border-[#c9963a]/20">📦</div>
                <div className="text-xs leading-relaxed text-[#7a7870]"><strong className="text-[#0a0a0f] font-bold">Packing service</strong> available from £10. We box and label everything for you.</div>
              </div>
            </div>
          </div>

          {/* Need Help CTA */}
          <div className="bg-[#0a0a0f] rounded-2xl p-8 text-center text-white shadow-xl border border-gray-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#115e59] rounded-full blur-[80px] opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#c9963a] rounded-full blur-[60px] opacity-20"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-inner">
                <span className="text-2xl transform -scale-x-100 opacity-80">📞</span>
              </div>
              <h3 className="font-['Syne',sans-serif] text-lg font-bold mb-2">Need Help?</h3>
              <p className="text-[11px] text-gray-400 mb-6 mx-auto">Our team speaks Somali & English</p>
              
              <a href="https://wa.me/447000000000" className="bg-[#25D366] text-white w-full py-3.5 rounded-xl flex justify-center items-center gap-2 font-bold text-sm mb-3 hover:bg-[#1ebd5a] transition-all shadow-lg hover:shadow-[#25D366]/30">
                <span className="text-lg">💬</span> WhatsApp Us
              </a>
              
              <a href="tel:+44700000000" className="bg-[#1f2229] border border-gray-700 text-white w-full py-3.5 rounded-xl flex justify-center items-center gap-2 font-bold text-sm hover:bg-gray-800 transition-all shadow-sm">
                <span className="text-base opacity-80 transform -scale-x-100">📞</span> Call Us
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CargoBooking;
