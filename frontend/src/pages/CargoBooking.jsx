import React, { useState } from 'react';

const CargoBooking = () => {
  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('uk-somalia');
  const [selectedService, setSelectedService] = useState({ id: 'air', rate: 4.5 });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Qiimaha qiyaasta ah
  const totalPrice = weight ? (parseFloat(weight) * selectedService.rate).toFixed(2) : '—';

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleBooking = () => {
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-12 bg-white rounded-2xl shadow-xl text-center border border-gray-100">
        <div className="w-20 h-20 bg-teal-600 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg animate-bounce">✓</div>
        <h3 className="text-2xl font-bold font-syne mb-2">Booking Confirmed!</h3>
        <p className="text-gray-500 mb-8">We've received your request. Our team will contact you on WhatsApp shortly.</p>
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 inline-block">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">Reference Number</p>
          <p className="text-2xl font-extrabold font-syne text-gray-900">ZGC-{Math.floor(100000 + Math.random() * 900000)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f3ee] font-dmsans text-[#0a0a0f]">
      {/* Hero Section */}
      <div className="bg-[#0a0a0f] text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <span className="bg-gold/20 border border-gold/30 text-gold text-[10px] font-bold px-3 py-1 rounded tracking-widest uppercase mb-4 inline-block">
            📦 International Cargo
          </span>
          <h1 className="text-5xl font-extrabold font-syne tracking-tighter mb-4 leading-tight">
            Ship Anywhere. <br /> <span className="text-gold italic">We Handle It.</span>
          </h1>
          <p className="text-gray-400 max-w-md">UK → Somalia · China → Somalia. Door-to-door delivery with live tracking.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 -mt-10 relative z-20">
        {/* Main Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-100 w-full">
            <div 
              className="h-full bg-gold transition-all duration-500" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>

          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold font-syne flex items-center gap-3">
                <span className="w-8 h-8 bg-teal-600 text-white rounded-lg flex items-center justify-center text-sm">📦</span>
                Book Cargo Shipment
              </h2>
              <div className="flex gap-2">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`w-2 h-2 rounded-full ${step >= s ? 'bg-gold' : 'bg-gray-200'}`}></div>
                ))}
              </div>
            </div>

            {/* STEP 1: Route & Service */}
            {step === 1 && (
              <div className="animate-fadeIn">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Select Route</label>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {['uk-somalia', 'china-somalia', 'somalia-uk'].map((route) => (
                    <div 
                      key={route}
                      onClick={() => setSelectedRoute(route)}
                      className={`cursor-pointer p-4 border-2 rounded-xl text-center transition-all ${selectedRoute === route ? 'border-gold bg-gold/5' : 'border-gray-100 hover:border-gold/50'}`}
                    >
                      <div className="text-2xl mb-1">{route === 'uk-somalia' ? '🇬🇧 ✈️ 🇸🇴' : route === 'china-somalia' ? '🇨🇳 🚢 🇸🇴' : '🇸🇴 ✈️ 🇬🇧'}</div>
                      <div className="text-[10px] font-bold uppercase">{route.replace('-', ' → ')}</div>
                    </div>
                  ))}
                </div>

                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">Service Type</label>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { id: 'air', name: 'Air Freight', rate: 4.5, icon: '✈️' },
                    { id: 'sea', name: 'Sea Freight', rate: 1.2, icon: '🚢' }
                  ].map((service) => (
                    <div 
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`cursor-pointer p-5 border-2 rounded-xl transition-all ${selectedService.id === service.id ? 'border-teal-600 bg-teal-50' : 'border-gray-100 hover:border-teal-600/50'}`}
                    >
                      <div className="text-2xl mb-2">{service.icon}</div>
                      <div className="font-bold text-sm">{service.name}</div>
                      <div className="text-teal-600 font-bold text-xs">£{service.rate}/kg</div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#0a0a0f] rounded-xl p-6 text-white">
                  <h4 className="text-gold font-bold text-xs uppercase mb-4 tracking-widest">💰 Price Calculator</h4>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="number" 
                      placeholder="Enter Weight (KG)"
                      className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 w-full outline-none focus:border-gold"
                      onChange={(e) => setWeight(e.target.value)}
                    />
                    <div className="text-right min-w-[120px]">
                      <div className="text-[10px] text-gray-500 uppercase">Estimated Total</div>
                      <div className="text-2xl font-bold text-gold font-syne">£{totalPrice}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Item Description</label>
                    <input type="text" placeholder="Clothes, Electronics..." className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-gold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">No. of Parcels</label>
                    <input type="number" placeholder="1" className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-gold" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">Special Instructions</label>
                  <textarea className="w-full border border-gray-200 rounded-lg p-3 h-32 outline-none focus:border-gold" placeholder="Fragile items..."></textarea>
                </div>
              </div>
            )}

            {/* STEP 3: Contact */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <p className="text-gold font-bold text-[10px] uppercase mb-4">📤 Sender Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Full Name" className="w-full border border-gray-200 rounded-lg p-3 bg-white" />
                    <input type="tel" placeholder="UK Phone" className="w-full border border-gray-200 rounded-lg p-3 bg-white" />
                  </div>
                </div>
                <div className="bg-teal-50 p-6 rounded-xl border border-teal-100">
                  <p className="text-teal-600 font-bold text-[10px] uppercase mb-4">📥 Recipient Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Full Name" className="w-full border border-gray-200 rounded-lg p-3 bg-white" />
                    <input type="tel" placeholder="Somali Phone" className="w-full border border-gray-200 rounded-lg p-3 bg-white" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="bg-gray-50 p-6 border-t border-gray-200 flex gap-4">
            {step > 1 && (
              <button onClick={prevStep} className="px-8 py-3 rounded-lg border border-gray-300 font-bold text-sm hover:bg-white transition-all">← Back</button>
            )}
            <button 
              onClick={step === 3 ? handleBooking : nextStep} 
              className={`flex-1 py-3 rounded-lg font-bold text-sm text-white transition-all shadow-lg ${step === 3 ? 'bg-teal-600 hover:bg-teal-700' : 'bg-[#0a0a0f] hover:bg-teal-600'}`}
            >
              {step === 3 ? 'Confirm & Book Cargo' : 'Continue to Details →'}
            </button>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
            <h3 className="font-syne font-bold text-sm mb-4 flex items-center gap-2">🔍 Track Shipment</h3>
            <div className="flex gap-2">
              <input type="text" placeholder="ZGC-XXXXXX" className="flex-1 border border-gray-200 rounded-lg p-2 text-xs outline-none focus:border-gold" />
              <button className="bg-[#0a0a0f] text-white px-4 py-2 rounded-lg text-xs font-bold">Track</button>
            </div>
          </div>
          
          <div className="bg-[#0a0a0f] p-8 rounded-2xl text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-3xl mb-4 text-gold">📞</div>
              <p className="font-syne font-bold mb-2">Need Help?</p>
              <p className="text-[10px] text-gray-500 mb-6">Our Somali & English support team is here for you.</p>
              <a href="https://wa.me/yournumber" className="block bg-[#25D366] py-3 rounded-lg font-bold text-xs mb-2">💬 WhatsApp Us</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CargoBooking;
