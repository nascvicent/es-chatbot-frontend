import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import LoginPage from '../pages/Login';
import ChatPage from '../pages/ChatPage';
import FAQPage from '../pages/FAQPage';
import KnowledgeBasePage from '../pages/KnowledgeBasePage';
import StatsPage from '../pages/StatsPage';
import ExportPage from '../pages/ExportPage';
import Dashboard from '../pages/ProfessorDashboard'; 
import GoogleAuthCallback from '../pages/GoogleAuthCallback';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/knowledge" element={<KnowledgeBasePage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/export" element={<ExportPage />} />
        <Route path="/google/callback" element={<GoogleAuthCallback />} />
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
