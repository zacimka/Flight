import { useState, useEffect, useRef } from 'react';
import { searchAirports } from '../services/api';

const MAJOR_AIRPORTS = [
  { city_name: 'London', iata_code: 'LHR', airport_name: 'Heathrow Airport' },
  { city_name: 'Mogadishu', iata_code: 'MGQ', airport_name: 'Aden Adde Intl' },
  { city_name: 'Istanbul', iata_code: 'IST', airport_name: 'Istanbul Airport' },
  { city_name: 'Dubai', iata_code: 'DXB', airport_name: 'Dubai Intl' },
  { city_name: 'Hargeisa', iata_code: 'HGA', airport_name: 'Egal Intl' },
  { city_name: 'Nairobi', iata_code: 'NBO', airport_name: 'Jomo Kenyatta Intl' }
];

const AirportAutocomplete = ({ label, placeholder, value, onChange }) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  // Sync external value changes
  useEffect(() => {
    if (value !== query) {
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmedQuery = query?.trim();
    if (!trimmedQuery || trimmedQuery.length < 2 || !isOpen) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchAirports(trimmedQuery);
        const list = res.data?.data || res.data;
        if (Array.isArray(list) && list.length > 0) {
           setResults(list);
        } else {
           throw new Error("No results from API");
        }
      } catch (err) {
        console.error('Failed to fetch airports, using standard fallback', err);
        const fallback = MAJOR_AIRPORTS.filter(a => 
           a.city_name.toLowerCase().includes(trimmedQuery.toLowerCase()) || 
           a.iata_code.toLowerCase().includes(trimmedQuery.toLowerCase())
        );
        setResults(fallback);
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms debounce for smoother UI

    return () => clearTimeout(delayDebounceFn);
  }, [query, isOpen]);

  const handleSelect = (airport) => {
    // Format the display string: "City (IATA) - Airport Name"
    const matchedIata = airport.iata_code || airport.IATA;
    const matchedCity = airport.city_name || airport.city;
    const displayString = `${matchedCity} (${matchedIata})`;
    
    setQuery(displayString);
    onChange(displayString); // Passes value back to parent component
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    onChange(e.target.value); // Keep parent state in sync even if not selected
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-xs font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-3.5 text-gray-400">📍</span>
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onClick={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          autoComplete="off"
        />
        {loading && (
          <span className="absolute right-3 top-3.5 text-blue-500 animate-spin">
            ⏳
          </span>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {results.map((airport, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(airport)}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    {airport.city_name || airport.city} {airport.country ? `, ${airport.country}` : ''}
                  </p>
                  <p className="text-xs text-gray-500">{airport.airport_name || airport.airport}</p>
                </div>
                {(airport.iata_code || airport.IATA) && (
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                    {airport.iata_code || airport.IATA}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {isOpen && query.trim().length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-20 w-full mt-2 bg-white/95 backdrop-blur-md border border-red-100 rounded-2xl shadow-xl p-6 text-sm text-gray-500 text-center animate-fade-in">
          <div className="text-2xl mb-2">📍</div>
          <p className="font-bold text-gray-900">Please try again</p>
          <p className="text-xs mt-1">Make sure you spell the city or IATA code correctly (e.g., LHR, DXB, MGQ)</p>
        </div>
      )}
    </div>
  );
};

export default AirportAutocomplete;
