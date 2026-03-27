import { useState, useEffect, useRef } from 'react';
import { searchAirports } from '../services/api';

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
    if (!query || query.length < 2 || !isOpen) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchAirports(query);
        setResults(res.data || []);
      } catch (err) {
        console.error('Failed to fetch airports', err);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [query, isOpen]);

  const handleSelect = (airport) => {
    // Format the display string: "City (IATA) - Airport Name"
    const displayString = `${airport.city} (${airport.IATA})`;
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
                    {airport.city} {airport.country ? `, ${airport.country}` : ''}
                  </p>
                  <p className="text-xs text-gray-500">{airport.airport}</p>
                </div>
                {airport.IATA && (
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                    {airport.IATA}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {isOpen && query.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-500 text-center">
          No airports found matching "{query}"
        </div>
      )}
    </div>
  );
};

export default AirportAutocomplete;
