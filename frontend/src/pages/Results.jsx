import { useLocation, useNavigate } from "react-router-dom";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const flights = location.state?.results ?? [];

  return (
    <main className="bg-gray-50 min-h-screen py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Search Results</h1>
            <p className="text-gray-500 font-medium mt-2">Found {flights.length} optimal routes for your journey.</p>
          </div>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition shadow-sm">
            Modify Search
          </button>
        </div>

        {flights.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-20 text-center">
            <div className="text-7xl mb-6 grayscale opacity-20">✈️</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">No routes available</h2>
            <p className="text-gray-400 font-medium mb-10 max-w-sm mx-auto">We couldn't find any flights matching your criteria. Try different dates or airports.</p>
            <button
              onClick={() => navigate("/")}
              className="px-10 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition shadow-lg"
            >
              New Search
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {flights.map((flight, idx) => (
              <article
                key={idx}
                className="bg-white rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden group"
              >
                <div className="p-8 sm:p-10 flex flex-col xl:flex-row gap-10">
                  {/* Left: Route Info */}
                  <div className="flex-grow space-y-8">
                    {flight.legs ? (
                      /* Multi-City Leg Display */
                      <div className="space-y-6 relative">
                        <div className="absolute left-4 top-4 bottom-4 w-px bg-gray-100 bg-dashed border-l border-dashed border-gray-300"></div>
                        {flight.legs.map((leg, lIdx) => (
                          <div key={leg.id} className="relative pl-12">
                             <div className="absolute left-2.5 top-0 w-3 h-3 bg-blue-600 rounded-full border-4 border-white shadow-sm"></div>
                             <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12">
                                <div className="min-w-[120px]">
                                   <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Flight {lIdx + 1}</p>
                                   <p className="font-black text-gray-900">{leg.airline}</p>
                                   <p className="text-xs text-gray-500">{leg.flightNumber}</p>
                                </div>
                                <div className="flex-grow grid grid-cols-2 gap-8 items-center">
                                   <div>
                                      <p className="text-lg font-black text-gray-900">{leg.departureTime}</p>
                                      <p className="text-xs font-bold text-gray-400">{leg.origin}</p>
                                   </div>
                                   <div className="text-right">
                                      <p className="text-lg font-black text-gray-900">{leg.arrivalTime}</p>
                                      <p className="text-xs font-bold text-gray-400">{leg.destination}</p>
                                   </div>
                                </div>
                                <div className="hidden sm:block text-right min-w-[100px]">
                                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Duration</p>
                                   <p className="text-xs font-bold text-gray-600">{leg.duration}</p>
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Single Route Display */
                      <div className="flex flex-col sm:flex-row items-center gap-10">
                        <div className="flex items-center gap-5 sm:min-w-[200px]">
                          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black">
                            {flight.airline?.[0] || "✈"}
                          </div>
                          <div>
                            <p className="font-black text-xl text-gray-900 tracking-tight">{flight.airline}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{flight.flightNumber}</p>
                          </div>
                        </div>

                        <div className="flex-grow grid grid-cols-3 gap-4 items-center w-full">
                          <div className="text-center sm:text-left">
                            <p className="text-2xl font-black text-gray-900">{flight.departureTime}</p>
                            <p className="text-sm font-bold text-gray-500">{flight.origin}</p>
                          </div>
                          <div className="flex flex-col items-center">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">{flight.duration}</p>
                            <div className="w-full flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full border-2 border-blue-400"></div>
                              <div className="h-px bg-gradient-to-r from-blue-400 to-transparent flex-grow"></div>
                              <span className="text-lg">✈️</span>
                              <div className="h-px bg-gradient-to-l from-blue-400 to-transparent flex-grow"></div>
                              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            </div>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-2">{flight.class || 'Economy'}</p>
                          </div>
                          <div className="text-center sm:text-right">
                            <p className="text-2xl font-black text-gray-900">{flight.arrivalTime}</p>
                            <p className="text-sm font-bold text-gray-500">{flight.destination}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Booking Summary */}
                  <div className="xl:w-80 xl:border-l border-gray-50 xl:pl-10 flex flex-col justify-center gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Detailed Pricing</p>
                        {flight.priceBreakdown ? (
                           <div className="space-y-2 bg-gray-50 p-4 rounded-2xl">
                              <div className="flex justify-between text-xs font-bold">
                                 <span className="text-gray-500 uppercase">Adults (x{flight.priceBreakdown.numAdults})</span>
                                 <span className="text-gray-900">${flight.priceBreakdown.totalAdults.toFixed(2)}</span>
                              </div>
                              {flight.priceBreakdown.numChildren > 0 && (
                                <div className="flex justify-between text-xs font-bold">
                                   <span className="text-blue-500 uppercase tracking-tighter">Children (x{flight.priceBreakdown.numChildren})</span>
                                   <span className="text-gray-900">${flight.priceBreakdown.totalChildren.toFixed(2)}</span>
                                </div>
                              )}
                              {flight.priceBreakdown.numInfants > 0 && (
                                <div className="flex justify-between text-xs font-bold">
                                   <span className="text-rose-500 uppercase tracking-tighter">Infants (x{flight.priceBreakdown.numInfants})</span>
                                   <span className="text-gray-900">${flight.priceBreakdown.totalInfants.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-xs font-bold pt-1 text-gray-400">
                                 <span>Subtotal Base</span>
                                 <span>${(flight.priceBreakdown.totalAdults + flight.priceBreakdown.totalChildren + flight.priceBreakdown.totalInfants).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-xs font-bold text-blue-600">
                                 <span>Service Fee (Markup)</span>
                                 <span>+${(flight.markup || 20).toFixed(2)}</span>
                              </div>
                              <div className="h-px bg-gray-200 my-2"></div>
                              <div className="flex justify-between text-sm font-black">
                                 <span className="text-gray-900 uppercase">Grand Total</span>
                                 <span className="text-gray-900">${(flight.finalPrice || (flight.priceBreakdown.totalAdults + flight.priceBreakdown.totalChildren + flight.priceBreakdown.totalInfants + (flight.markup || 20))).toFixed(2)}</span>
                              </div>
                           </div>
                        ) : (
                          <p className="text-3xl font-black text-gray-900 tracking-tighter">
                            ${(flight.finalPrice || flight.basePrice || 0).toFixed(2)}
                          </p>
                        )}
                      </div>

                      <div className="pt-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Due</p>
                        <p className="text-4xl font-black text-blue-600 tracking-tighter">
                          ${(flight.finalPrice || (flight.priceBreakdown ? (flight.priceBreakdown.totalAdults + flight.priceBreakdown.totalChildren + flight.priceBreakdown.totalInfants + (flight.markup || 20)) : (flight.basePrice || 0))).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate("/booking", { state: { flight } })}
                      className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-blue-600 hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1"
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Results;
