const axios = require('axios');

const searchFlights = async (criteria) => {
  const apiKey = process.env.TRAVELOPRO_API_KEY;
  if (!apiKey) throw new Error('TRAVELOPRO_API_KEY is required');

  const url = 'https://api.travelopro.com/v1/flights/search';
  
  // Format segments for Travelopro API
  const payload = {
    tripType: criteria.tripType === 'multicity' ? 'multi' : criteria.tripType,
    adults: criteria.passengers || 1,
    children: criteria.children || 0,
    infants: criteria.infants || 0,
    class: criteria.class || 'economy',
  };

  if (criteria.tripType === 'multicity' && criteria.segments) {
    payload.segments = criteria.segments.map(s => ({
      origin: s.origin,
      destination: s.destination,
      date: s.date
    }));
  } else {
    payload.origin = criteria.origin;
    payload.destination = criteria.destination;
    payload.date = criteria.date;
    if (criteria.returnDate) payload.returnDate = criteria.returnDate;
  }

  // MOCK DATA implementation for simulation
  const generateMockFlights = () => {
    const airlines = ['Delta Airlines', 'Emirates', 'Qatar Airways', 'British Airways', 'Air France'];
    const flights = [];
    
    for (let i = 0; i < 5; i++) {
      const adultBasePrice = Math.floor(Math.random() * 800) + 200;
      const childBasePrice = Math.round(adultBasePrice * 0.75); // 25% child discount
      const infantBasePrice = Math.round(adultBasePrice * 0.10); // 90% infant discount (lap)
      
      const legs = (criteria.tripType === 'multicity' && criteria.segments) 
        ? criteria.segments.map((seg, idx) => {
            const depTime = new Date(seg.date || Date.now());
            depTime.setHours(10 + idx * 4);
            const arrTime = new Date(depTime);
            arrTime.setHours(arrTime.getHours() + 2 + Math.floor(Math.random() * 5));

            return {
                id: `LEG-${i}-${idx}-${Math.floor(Math.random() * 1000)}`,
                airline: airlines[Math.floor(Math.random() * airlines.length)],
                flightNumber: `AC${Math.floor(100 + Math.random() * 900)}`,
                origin: seg.origin,
                destination: seg.destination,
                departureTime: depTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                arrivalTime: arrTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                departure: { airport: seg.origin, time: depTime.toISOString() },
                arrival: { airport: seg.destination, time: arrTime.toISOString() },
                duration: `${Math.floor((arrTime - depTime) / 3600000)}h ${Math.floor(((arrTime - depTime) % 3600000) / 60000)}m`
            };
          })
        : null;

      const numAdults = criteria.passengers || 1;
      const numChildren = criteria.children || 0;
      const numInfants = criteria.infants || 0;
      
      const legMultiplier = legs ? legs.length * 0.8 : 1;
      const totalAdultPrice = adultBasePrice * numAdults * legMultiplier;
      const totalChildPrice = childBasePrice * numChildren * legMultiplier;
      const totalInfantPrice = infantBasePrice * numInfants * legMultiplier;

      const basePrice = totalAdultPrice + totalChildPrice + totalInfantPrice;
      const markupValue = 20; // Simulated markup
      const finalPrice = basePrice + markupValue;

      const flightData = {
        id: `FL-${Math.floor(Math.random() * 90000) + 10000}`,
        basePrice,
        markup: markupValue,
        finalPrice,
        // Keep price for compatibility
        price: finalPrice,
        priceBreakdown: {
            adultPrice: adultBasePrice * legMultiplier,
            childPrice: childBasePrice * legMultiplier,
            infantPrice: infantBasePrice * legMultiplier,
            numAdults,
            numChildren,
            numInfants,
            totalAdults: totalAdultPrice,
            totalChildren: totalChildPrice,
            totalInfants: totalInfantPrice,
            markup: markupValue,
            baseTotal: basePrice,
            grandTotal: finalPrice
        },
        currency: 'USD',
        class: criteria.class || 'economy',
        passengers: numAdults + numChildren + numInfants,
        tripType: criteria.tripType,
      };

      if (legs) {
        flightData.legs = legs;
        flightData.airline = legs[0].airline;
        flightData.flightNumber = legs[0].flightNumber;
        flightData.origin = legs[0].origin;
        flightData.destination = legs[legs.length - 1].destination;
        flightData.departureTime = legs[0].departureTime;
        flightData.arrivalTime = legs[legs.length - 1].arrivalTime;
        flightData.departure = legs[0].departure;
        flightData.arrival = legs[legs.length - 1].arrival;
      } else {
        const departureTime = new Date(criteria.date || Date.now());
        departureTime.setHours(departureTime.getHours() + Math.floor(Math.random() * 24));
        const arrivalTime = new Date(departureTime);
        arrivalTime.setHours(arrivalTime.getHours() + 2 + Math.floor(Math.random() * 10));

        flightData.airline = airlines[Math.floor(Math.random() * airlines.length)];
        flightData.flightNumber = `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 900) + 100}`;
        flightData.origin = criteria.origin;
        flightData.destination = criteria.destination;
        flightData.departureTime = departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        flightData.arrivalTime = arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        flightData.departure = { airport: criteria.origin, time: departureTime.toISOString() };
        flightData.arrival = { airport: criteria.destination, time: arrivalTime.toISOString() };
        flightData.duration = `${Math.floor((arrivalTime - departureTime) / 3600000)}h ${Math.floor(((arrivalTime - departureTime) % 3600000) / 60000)}m`;
      }

      flights.push(flightData);
    }
    
    return { results: flights, success: true };
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return generateMockFlights();
};

module.exports = { searchFlights };
