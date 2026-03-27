import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    try {
      const payload = mode === 'login' ? { email, password } : { name, email, password };
      const resp = mode === 'login' ? await login(payload) : await register(payload);
      onLogin(resp.data.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Auth failed');
    }
  };

  return (
    <main className="max-w-md mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-xl font-bold mb-4">{mode === 'login' ? 'Login' : 'Register'}</h1>
      <form className="space-y-3" onSubmit={submit}>
        {mode === 'register' && (
          <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn btn-primary">Submit</button>
      </form>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      <p className="text-sm mt-4">
        {mode === 'login' ? 'Need an account?' : 'Already have account?'}
        <button className="text-blue-600 ml-2" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Register' : 'Login'}</button>
      </p>
    </main>
  );
};

export default Login;
