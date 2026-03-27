import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('travelopro_user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('travelopro_user', JSON.stringify(user));
    else localStorage.removeItem('travelopro_user');
  }, [user]);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return { user, login, logout, token: user?.token };
};
