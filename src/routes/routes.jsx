import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import LoginPage from '../pages/Login';
import ChatPage from '../pages/ChatPage';
import FAQPage from '../pages/FAQPage';
import Dashboard from '../pages/ProfessorDashboard'; 
import GoogleAuthCallback from '../pages/GoogleAuthCallback';
import PrivateRoute from '../pages/PrivateRoute';



function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Rotas Públicas */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/google/callback" element={<GoogleAuthCallback />} />
        <Route path="/faq" element={<FAQPage />} />

        {/* Rotas Privadas para Usuários Normais (e Admins) */}
        <Route 
          path="/chat" 
          element={
            <PrivateRoute>
              <ChatPage />
            </PrivateRoute>
          } 
        />
        
        {/* Rota Privada que requer permissão de 'admin' */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute roleRequerida="admin">
              <Dashboard />
            </PrivateRoute>
          } 
        />
        
        
      </Routes>
    </AnimatePresence>
  );
}

function AppRoutes() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default AppRoutes;
