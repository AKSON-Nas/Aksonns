import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Budgets from './pages/Budgets';
import Stock from './pages/Stock';
import Sales from './pages/Sales';
import Guide from './pages/Guide';
import AdminPanel from './pages/AdminPanel';
import PaymentPage from './pages/PaymentPage';
import Layout from './components/Layout';
import { Toaster } from 'sonner';
import '@/App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

axios.defaults.withCredentials = true;

export const AppContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const hash = window.location.hash;
      
      if (hash && hash.includes('session_id=')) {
        const sessionId = hash.split('session_id=')[1].split('&')[0];
        
        try {
          console.log('Processing session_id from OAuth redirect...');
          const sessionResponse = await axios.post(`${API}/auth/session`, { session_id: sessionId });
          console.log('Session created successfully:', sessionResponse.data);
          
          // Limpar hash
          window.location.hash = '';
          
          // Setar usuário do response
          if (sessionResponse.data.user) {
            setUser(sessionResponse.data.user);
          }
          
          setLoading(false);
          
          // Redirecionar para dashboard após um pequeno delay
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 100);
        } catch (error) {
          console.error('Session creation failed:', error);
          alert('Erro ao criar sessão. Tente novamente.');
          setLoading(false);
        }
        return;
      }
      
      try {
        const response = await axios.get(`${API}/auth/me`);
        setUser(response.data);
      } catch (error) {
        console.log('Not authenticated');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/dashboard" element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/" />} />
          <Route path="/budgets" element={user ? <Layout><Budgets /></Layout> : <Navigate to="/" />} />
          <Route path="/stock" element={user ? <Layout><Stock /></Layout> : <Navigate to="/" />} />
          <Route path="/sales" element={user ? <Layout><Sales /></Layout> : <Navigate to="/" />} />
          <Route path="/guide" element={user ? <Layout><Guide /></Layout> : <Navigate to="/" />} />
          <Route path="/admin" element={user && user.role === 'admin' ? <Layout><AdminPanel /></Layout> : <Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;