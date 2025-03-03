import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { set } from 'lodash';
import setAuthToken  from "../API/setAuthToken";
interface AuthContextType {
  firstName: string;
  lastName: string;
  email: string;
  favorites: string[];
  cart: string[];
  login: (credentials: { email: string; password: string;}) => Promise<void>;
  logout: () => void;
  loggedIn: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);

  const isTokenExpired = (token: string): boolean => {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/api/auth/login`, credentials);
      const  {token, user} = response.data;
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setFavorites(user.favorites);
      setCart(user.cart);
      setLoggedIn(true);
      setAuthToken(token);
      localStorage.setItem('token', token);
      if (isTokenExpired(token)) {
        logout();
        showMessage('Session expired. Please log in again.', 'error');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data && error.response.data.message) {
          showMessage(error.response.data.message, 'error');
        } else {
          showMessage('Login Failed', 'error');
        }
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    setFirstName('');
    setLastName('');
    setEmail('');
    setFavorites([]);
    setCart([]);
    setAuthToken(null);
  };

  const showMessage = (msg = '', type = 'success') => {
      const toast: any = Swal.mixin({
          toast: true,
          position: 'top',
          showConfirmButton: false,
          timer: 3000,
          customClass: { container: 'toast' },
      });
      toast.fire({
          icon: type,
          title: msg,
          padding: '10px 20px',
      });
  };

  return (
    <AuthContext.Provider value={{ firstName, lastName, email, loggedIn, favorites, cart, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
