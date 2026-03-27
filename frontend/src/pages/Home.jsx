import Hero from "../components/Hero";
import FlightSearchCard from "../components/FlightSearchCard";

const Home = () => {
  return (
    <main className="bg-gray-50 min-h-screen">
      <Hero />
      <FlightSearchCard />

      {/* Features Section */}
      <section className="bg-white py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
            Why choose ZamGo Travel?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Best Prices
              </h3>
              <p className="text-gray-600">
                Compare flights from 600+ airlines and find the cheapest options
                instantly
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Instant Booking
              </h3>
              <p className="text-gray-600">
                Book your flights in seconds with instant confirmation and email
                tickets
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-4">
                <span className="text-3xl">🎧</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                24/7 Support
              </h3>
              <p className="text-gray-600">
                Our customer support team is always ready to help you with any
                questions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to explore?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Browse through our featured destinations or search for your perfect
            flight
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["NYC", "LAX", "ORD", "MIA", "DEN", "SFO", "BOS", "ATL"].map(
              (airport) => (
                <div
                  key={airport}
                  className="bg-white/10 backdrop-blur p-3 rounded-lg hover:bg-white/20 transition cursor-pointer"
                >
                  <div className="text-2xl">✈</div>
                  <div className="font-semibold mt-2">{airport}</div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
