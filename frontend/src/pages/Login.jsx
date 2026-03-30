import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = mode === 'login' ? { email, password } : { name, email, password };
      const resp = mode === 'login' ? await login(payload) : await register(payload);
      const userData = resp.data.data;
      onLogin(userData);
      
      // Route based on user role
      if (userData.user.role === 'admin') {
        navigate('/admin');
      } else if (userData.user.role === 'agent') {
        navigate('/agent');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white opacity-5 transform -skew-y-6"></div>
          <h1 className="text-3xl font-black relative z-10 mb-2 mt-4">
            {mode === 'login' ? 'Welcome Back!' : 'Join ZamGo Travel'}
          </h1>
          <p className="text-blue-100 relative z-10 font-medium text-sm">
            {mode === 'login' 
               ? 'Sign in to access your bookings and trips.' 
               : 'Create an account to unlock exclusive flight deals.'}
          </p>
        </div>

        {/* Form Section */}
        <div className="p-8 sm:p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-shake">
              <span className="text-xl">⚠️</span>
              <span className="text-red-700 text-sm font-bold">{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={submit}>
            {mode === 'register' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input 
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition outline-none font-medium text-gray-900" 
                  placeholder="e.g. John Doe" 
                  value={name} 
                  required
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input 
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition outline-none font-medium text-gray-900" 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                required
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input 
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition outline-none font-medium text-gray-900" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                required
                minLength={6}
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                mode === 'login' ? 'Sign In Securely' : 'Create Free Account'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col items-center">
            <p className="text-gray-500 font-medium text-sm">
              {mode === 'login' ? "Don't have an account yet?" : "Already a member?"}
            </p>
            <button 
              type="button"
              className="mt-2 text-blue-600 font-black hover:text-blue-800 transition focus:outline-none" 
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
                setPassword('');
              }}
            >
              {mode === 'login' ? 'Create a new account' : 'Log in to your account'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
