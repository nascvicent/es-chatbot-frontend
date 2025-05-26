import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/Login';
import ChatPage from '../pages/ChatPage';
import FAQPage from '../pages/FAQPage';
import KnowledgeBasePage from '../pages/KnowledgeBasePage';
import StatsPage from '../pages/StatsPage';
import ExportPage from '../pages/ExportPage';
import Dashboard from '../pages/ProfessorDashboard'; 
import GoogleAuthCallback from '../pages/GoogleAuthCallback';

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/knowledge" element={<KnowledgeBasePage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/export" element={<ExportPage />} />
          <Route path="/google/callback" element={<GoogleAuthCallback />} />
      </Routes>
    </Router>
  );
}


export default AppRoutes;
