import Hero from "../components/Hero";
import FlightSearchCard from "../components/FlightSearchCard";

const Home = () => {
  return (
    <main className="bg-gray-50 min-h-screen">
      <Hero />
      <FlightSearchCard />


      {/* Popular Destinations Section */}
      <section className="bg-white py-20 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Trending Destinations</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Explore the most searched and highly rated locations worldwide. Book your flight and hotel together to save more.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { city: "Bali, Indonesia", price: "$499", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80" },
              { city: "Paris, France", price: "$349", image: "https://images.unsplash.com/photo-1549144510-bd1aa3790510?auto=format&fit=crop&w=800&q=80" },
              { city: "Tokyo, Japan", price: "$899", image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80" },
              { city: "Santorini, Greece", price: "$659", image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80" }
            ].map((dest, idx) => (
              <div key={idx} className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition duration-500 h-80">
                <div className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${dest.image})` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="text-2xl font-black text-white mb-1">{dest.city}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-300 font-bold text-sm uppercase tracking-wide">Flights from</span>
                    <span className="text-xl font-bold text-white bg-blue-600/90 backdrop-blur px-3 py-1 rounded-lg">{dest.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us & Trust Indicators */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-indigo-50 rounded-[3rem] transform -rotate-3"></div>
              <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=80" alt="Travelers" className="relative rounded-[2.5rem] shadow-xl object-cover h-[500px] w-full" />
              <div className="absolute -right-8 bottom-12 bg-white p-6 rounded-3xl shadow-2xl animate-bounce-slow hidden md:block border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">⭐</div>
                  <div>
                    <h4 className="font-black text-gray-900 text-lg">4.9/5 Rating</h4>
                    <p className="text-gray-500 text-sm font-medium">From 10,000+ reviews</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">The Ultimate Travel Experience Ecosystem</h2>
              <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                ZamGo Travel is more than just a flight booking engine. We provide an end-to-end concierge experience for all your travel needs, integrating hotels, car rentals, and exclusive worldwide packages.
              </p>
              
              <div className="space-y-6">
                 {[
                   { icon: '🛩️', title: 'Global Flight Network', desc: 'Real-time connections to over 600 airlines worldwide with zero hidden fees.' },
                   { icon: '🏨', title: 'Luxury & Boutique Hotels', desc: 'Exclusive partnerships granting you up to 30% off standard room rates.' },
                   { icon: '🛡️', title: 'Ironclad Buyer Protection', desc: '24/7 priority customer support and instant refund capabilities.' }
                 ].map((feat, idx) => (
                   <div key={idx} className="flex items-start gap-5">
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                         {feat.icon}
                      </div>
                      <div>
                         <h4 className="text-xl font-bold text-gray-900 mb-1">{feat.title}</h4>
                         <p className="text-gray-500 font-medium">{feat.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Holiday Packages */}
      <section className="bg-white py-24">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
               <div>
                  <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Premium Packages</h2>
                  <p className="text-lg text-gray-500">Curated all-inclusive experiences designed by our travel experts.</p>
               </div>
               <button className="text-blue-600 font-bold hover:text-blue-800 transition">View all packages &rarr;</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                 { title: "Maldives Honeymoon Escape", duration: "7 Days / 6 Nights", price: "$2,499", oldPrice: "$3,100", img: "https://images.unsplash.com/photo-1514282401047-d1531a4e618d?auto=format&fit=crop&w=800&q=80" },
                 { title: "Swiss Alps Adventure", duration: "5 Days / 4 Nights", price: "$1,850", oldPrice: "$2,200", img: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80" },
                 { title: "Dubai Luxury Tour", duration: "4 Days / 3 Nights", price: "$1,200", oldPrice: "$1,500", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80" }
               ].map((pkg, idx) => (
                 <div key={idx} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition duration-300 overflow-hidden group">
                    <div className="h-56 overflow-hidden relative">
                       <img src={pkg.img} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                       <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-black text-gray-900 uppercase tracking-widest">
                          {pkg.duration}
                       </div>
                    </div>
                    <div className="p-8">
                       <h3 className="text-xl font-black text-gray-900 mb-2">{pkg.title}</h3>
                       <div className="flex gap-2 text-sm text-gray-500 mb-6 font-medium">
                          <span>✈️ Flights incl.</span> • <span>🏨 5-Star Hotel</span>
                       </div>
                       <div className="flex justify-between items-end">
                          <div>
                             <p className="text-xs text-gray-400 font-bold line-through mb-1">{pkg.oldPrice}</p>
                             <p className="text-3xl font-black text-blue-600">{pkg.price}</p>
                          </div>
                          <button className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition">Book Now</button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gradient-to-br from-blue-900 to-indigo-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80')] mix-blend-overlay opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-blue-300 font-black text-sm uppercase tracking-widest mb-4 block">Get Secret Deals</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">Unlock Member-Only Prices</h2>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
            Subscribe to our newsletter and receive an exclusive 15% discount code for your first booking, plus weekly insights on the best travel combos.
          </p>
          <form className="flex flex-col sm:flex-row gap-2 justify-center max-w-lg mx-auto" onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }}>
            <input 
               type="email" 
               placeholder="Enter your email address" 
               className="px-6 py-4 w-full rounded-2xl border-0 focus:ring-4 focus:ring-blue-500/50 outline-none text-gray-900 font-medium"
               required
            />
            <button type="submit" className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl transition shadow-lg shrink-0">
              Subscribe Now
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Home;
