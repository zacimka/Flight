import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-24 bg-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-tight">
              Redefining the Future of <br />
              <span className="text-blue-500">Travel Technology</span>
            </h1>
            <p className="text-slate-400 text-xl max-w-3xl mx-auto font-medium leading-relaxed">
              At ZamGo Travel, we blend cutting-edge technology with world-class travel services to bring the globe within your reach. Our mission is to simplify the way you explore the planet.
            </p>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px]"></div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-6">Our Philosophy</h4>
              <h2 className="text-4xl font-black text-gray-900 mb-8 leading-tight">We build tools that empower travelers and agents everywhere.</h2>
              <div className="space-y-6">
                 <div className="flex gap-6">
                    <div className="text-3xl">🚀</div>
                    <div>
                       <h3 className="text-xl font-bold text-gray-900 mb-2">High-Speed Technology</h3>
                       <p className="text-gray-500 text-sm leading-relaxed font-medium">Our engine processes millions of flight paths in milliseconds, ensuring you get the best price available instantly.</p>
                    </div>
                 </div>
                 <div className="flex gap-6">
                    <div className="text-3xl">🛡️</div>
                    <div>
                       <h3 className="text-xl font-bold text-gray-900 mb-2">Unmatched Reliability</h3>
                       <p className="text-gray-500 text-sm leading-relaxed font-medium">From secure Stripe payments to encrypted user data, we prioritize your safety at every step of your journey.</p>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                 <div className="bg-gray-100 rounded-3xl p-8 text-center h-48 flex flex-col justify-center shadow-inner">
                    <p className="text-4xl font-black text-gray-900 mb-2">600+</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Airlines</p>
                 </div>
                 <div className="bg-blue-600 rounded-3xl p-8 text-center h-48 flex flex-col justify-center text-white shadow-xl">
                    <p className="text-4xl font-black mb-2">50k</p>
                    <p className="text-xs font-bold text-blue-200 uppercase tracking-widest leading-tight">Monthly Bookings</p>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="bg-slate-900 rounded-3xl p-8 text-center h-48 flex flex-col justify-center text-white shadow-lg">
                    <p className="text-4xl font-black mb-2">120+</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Countries</p>
                 </div>
                 <div className="bg-gray-100 rounded-3xl p-8 text-center h-48 flex flex-col justify-center shadow-inner">
                    <p className="text-4xl font-black text-gray-900 mb-2">4.9/5</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">User Rating</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gray-50">
         <div className="max-w-4xl mx-auto bg-white p-12 md:p-20 rounded-[3rem] shadow-2xl text-center border border-gray-100 relative overflow-hidden">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-8 leading-tight">Ready to start your next adventure?</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
               <Link to="/" className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:shadow-2xl hover:bg-blue-700 transition transform hover:-translate-y-1">Search Flights Now</Link>
               <Link to="/contact" className="px-10 py-5 bg-white border-2 border-gray-100 text-gray-900 font-black rounded-2xl hover:bg-gray-50 transition transform hover:-translate-y-1">Contact Our Team</Link>
            </div>
            {/* Background design element */}
            <div className="absolute -bottom-10 -right-10 text-[180px] opacity-5 rotate-12">✈️</div>
         </div>
      </section>
    </main>
  );
};

export default About;
