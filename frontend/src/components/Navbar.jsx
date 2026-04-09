import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = ({ user, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Helper for rendering nav links
  const NavLink = ({ to, label }) => {
    const active = isActive(to);
    return (
      <Link 
        to={to} 
        className={`font-semibold text-[15px] pb-1 transition-colors ${
          active 
            ? 'text-orange-500 border-b-2 border-orange-500' 
            : 'text-gray-700 hover:text-orange-500 border-b-2 border-transparent'
        }`}
      >
        {label}
      </Link>
    );
  };

  const ExternalLink = ({ href, label }) => (
    <a 
      href={href} 
      className="font-semibold text-[15px] pb-1 text-gray-700 hover:text-orange-500 border-b-2 border-transparent transition-colors"
    >
      {label}
    </a>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 m-0">
      <div className="flex justify-between items-center py-[15px] px-[40px] max-w-7xl mx-auto">
        
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
           <img 
              src="/images/zamgo_logo.jpg" 
              alt="ZamGo Travel" 
              className="h-10 md:h-12 lg:h-14 w-auto object-contain"
              onError={(e) => {
                 e.target.style.display = 'none';
              }}
           />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-[30px]">
          <NavLink to="/" label="Flights" />
          <ExternalLink href="#hotels" label="Hotels" />
          <ExternalLink href="#packages" label="Packages" />
          <NavLink to="/about" label="About" />
          <NavLink to="/contact" label="Contact" />
          
          {/* Auth & Portal Buttons */}
          <div className="flex items-center gap-[20px] ml-4 border-l border-gray-200 pl-6">
            {user ? (
              <>
                {(user.user?.role === 'admin' || user.user?.role === 'agent') && (
                  <Link to={user.user.role === 'admin' ? '/admin' : '/agent'} className="text-orange-500 font-bold hover:text-orange-600 transition">
                    {user.user.role === 'admin' ? 'Admin Hub' : 'Agent Portal'}
                  </Link>
                )}
                {user.user?.role === 'user' && (
                  <Link to="/dashboard" className="text-orange-500 font-bold hover:text-orange-600 transition">My Trips</Link>
                )}
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-bold text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 font-bold hover:text-orange-500 transition">Login</Link>
                <Link to="/login" className="px-5 py-2 text-sm font-bold text-white bg-orange-500 rounded hover:bg-orange-600 transition">Sign up</Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-gray-700 hover:text-orange-500"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 py-4 space-y-3 shadow-lg">
          <Link to="/" className="block text-gray-700 font-bold hover:text-orange-500">Flights</Link>
          <a href="#hotels" className="block text-gray-700 font-bold hover:text-orange-500">Hotels</a>
          <a href="#packages" className="block text-gray-700 font-bold hover:text-orange-500">Packages</a>
          <Link to="/about" className="block text-gray-700 font-bold hover:text-orange-500">About</Link>
          <Link to="/contact" className="block text-gray-700 font-bold hover:text-orange-500">Contact</Link>
          
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            {user ? (
              <>
                {(user.user?.role === 'admin' || user.user?.role === 'agent') && (
                  <Link to={user.user.role === 'admin' ? '/admin' : '/agent'} className="text-orange-500 font-bold">
                    {user.user.role === 'admin' ? 'Admin Hub' : 'Agent Portal'}
                  </Link>
                )}
                {user.user?.role === 'user' && (
                  <Link to="/dashboard" className="text-orange-500 font-bold">My Trips</Link>
                )}
                <button onClick={logout} className="w-full text-left font-bold text-gray-700">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-bold text-gray-700">Login</Link>
                <Link to="/login" className="inline-block px-4 py-2 bg-orange-500 text-white font-bold rounded text-center">Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
