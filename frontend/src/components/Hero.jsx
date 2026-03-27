const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-20 pb-16 sm:pt-28 sm:pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Explore the world with{' '}
          <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 bg-clip-text text-transparent animate-pulse">
            confidence
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          Search and book cheap flights from over 600 airlines. Compare prices, find the best deals, and travel affordably.
        </p>

        <div className="flex justify-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
            <span className="text-2xl">✓</span>
            <span className="text-sm font-medium text-gray-700">Best Price Guarantee</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
            <span className="text-2xl">✓</span>
            <span className="text-sm font-medium text-gray-700">24/7 Support</span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-200">
            <span className="text-2xl">✓</span>
            <span className="text-sm font-medium text-gray-700">Instant Confirmation</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
