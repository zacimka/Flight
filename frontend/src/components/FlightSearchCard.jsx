import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchFlights } from '../services/api';
import AirportAutocomplete from './AirportAutocomplete';

const FlightSearchCard = () => {
  const [searchParams] = useSearchParams();
  const changeOrderId = searchParams.get('change_order_id');
  const existingPnr = searchParams.get('pnr');

  const [tripType, setTripType] = useState('roundtrip');
  const [criteria, setCriteria] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    children: 0,
    infants: 0,
    flightClass: 'economy',
  });

  // Multi-city segments
  const [segments, setSegments] = useState([
    { origin: '', destination: '', date: '' },
    { origin: '', destination: '', date: '' },
  ]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addSegment = () => {
    if (segments.length < 5) {
      setSegments([...segments, { origin: '', destination: '', date: '' }]);
    }
  };

  const removeSegment = (index) => {
    if (segments.length > 2) {
      const newSegments = segments.filter((_, i) => i !== index);
      setSegments(newSegments);
    }
  };

  const updateSegment = (index, field, value) => {
    const newSegments = [...segments];
    newSegments[index][field] = value;
    setSegments(newSegments);
  };

  const extractIata = (str) => {
    if(!str) return '';
    const cleanStr = str.trim();
    const match = cleanStr.match(/\(([^)]+)\)/); // Matches content inside parentheses
    if(match && match[1].length === 3) return match[1].toUpperCase();
    return cleanStr.slice(-3).toUpperCase();
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const originIata = extractIata(criteria.origin);
    const destIata = extractIata(criteria.destination);

    // Validate mandatory fields
    if (!originIata || !destIata || !criteria.departureDate) {
        setError("Fadlan buuxi meelaha bannaan (Origin, Destination, Date)");
        return;
    }

    // Clear any previous error
    setError('');

    // Pass the state to the DuffelBookingFlow so it can auto-run
    navigate('/search', { 
      state: { 
        origin: originIata, 
        destination: destIata, 
        departure_date: criteria.departureDate,
        return_date: criteria.returnDate,
        adults: criteria.passengers,
        children: criteria.children,
        cabin_class: criteria.flightClass,
        change_order: changeOrderId // PASS THE CHANGE ORDER ID
      } 
    });
  };

  return (
    <section className="relative -mt-16 mb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {changeOrderId && (
           <div className="mb-6 bg-blue-600 p-6 rounded-[2rem] shadow-xl animate-in slide-in-from-top-4 duration-500 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl">🔄</div>
              <div className="relative flex items-center gap-6">
                 <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl animate-spin-slow">🔄</div>
                 <div>
                    <h3 className="text-white font-black text-xl uppercase tracking-tight">Waxaad beddelaysaa duulimaadkaaga</h3>
                    <p className="text-blue-100 font-bold opacity-80 uppercase tracking-widest text-[10px] mt-1">Existing PNR: {existingPnr || 'N/A'}</p>
                 </div>
                 <button onClick={() => navigate('/')} className="ml-auto bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Cancel Change</button>
              </div>
           </div>
        )}

        <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            {[
              { id: 'roundtrip', label: '🔄 Round trip' },
              { id: 'oneway', label: '→ One way' },
              { id: 'multicity', label: '📍 Multi-city' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTripType(tab.id)}
                className={`flex-1 px-8 py-5 font-bold text-sm tracking-tight transition-all ${tripType === tab.id
                    ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSearch} className="p-8 sm:p-10">
            {tripType === 'multicity' ? (
              <div className="space-y-6 mb-8">
                {segments.map((segment, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-3xl bg-gray-50/50 border border-gray-100 relative group animate-in slide-in-from-left-4 duration-300">
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">
                      {index + 1}
                    </div>

                    <AirportAutocomplete
                      label="From"
                      placeholder="Origin"
                      value={segment.origin}
                      onChange={(val) => updateSegment(index, 'origin', val)}
                    />
                    <AirportAutocomplete
                      label="To"
                      placeholder="Destination"
                      value={segment.destination}
                      onChange={(val) => updateSegment(index, 'destination', val)}
                    />
                    <div className="relative">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Departure</label>
                      <input
                        type="date"
                        value={segment.date}
                        onChange={(e) => updateSegment(index, 'date', e.target.value)}
                        className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition outline-none font-medium text-sm"
                      />
                      {segments.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeSegment(index)}
                          className="absolute -right-2 -top-2 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-500 hover:text-white"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {segments.length < 5 && (
                  <button
                    type="button"
                    onClick={addSegment}
                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold text-sm hover:border-blue-400 hover:text-blue-600 transition flex items-center justify-center gap-2"
                  >
                    <span>+</span> Add Another Flight
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <AirportAutocomplete
                  label="From"
                  placeholder="From"
                  value={criteria.origin}
                  onChange={(val) => setCriteria({ ...criteria, origin: val })}
                />
                <AirportAutocomplete
                  label="To"
                  placeholder="To"
                  value={criteria.destination}
                  onChange={(val) => setCriteria({ ...criteria, destination: val })}
                />
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Departure</label>
                  <input
                    type="date"
                    value={criteria.departureDate}
                    onChange={(e) => setCriteria({ ...criteria, departureDate: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-blue-600/10 transition outline-none font-medium text-sm"
                  />
                </div>
                {tripType === 'roundtrip' && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Return</label>
                    <input
                      type="date"
                      value={criteria.returnDate}
                      onChange={(e) => setCriteria({ ...criteria, returnDate: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-blue-600/10 transition outline-none font-medium text-sm"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8 pt-8 border-t border-gray-50">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Adults</label>
                <select
                  value={criteria.passengers}
                  onChange={(e) => setCriteria({ ...criteria, passengers: parseInt(e.target.value) })}
                  className="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-blue-600/10 transition appearance-none font-bold text-sm cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Children</label>
                <select
                  value={criteria.children}
                  onChange={(e) => setCriteria({ ...criteria, children: parseInt(e.target.value) })}
                  className="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-blue-600/10 transition appearance-none font-bold text-sm cursor-pointer"
                >
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Infants (on lap)</label>
                <select
                  value={criteria.infants}
                  onChange={(e) => setCriteria({ ...criteria, infants: parseInt(e.target.value) })}
                  className="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-blue-600/10 transition appearance-none font-bold text-sm cursor-pointer"
                >
                  {[0, 1, 2, 3, 4].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Cabin Class</label>
                <select
                  value={criteria.flightClass}
                  onChange={(e) => setCriteria({ ...criteria, flightClass: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-4 focus:ring-blue-600/10 transition appearance-none font-bold text-sm cursor-pointer"
                >
                  <option value="economy">Economy</option>
                  <option value="premium">Premium</option>
                  <option value="business">Business</option>
                  <option value="first">First Class</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 animate-shake">
                <span className="text-xl">⚠️</span>
                <span className="text-red-700 text-sm font-bold">{error}</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Optimizing Fares...
                  </span>
                ) : (
                  <>
                    <span className="text-xl">🔍</span>
                    <span>Search Best Flights</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default FlightSearchCard;
