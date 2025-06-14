import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import { BarChart2, BookOpen, Download, Home, Database, Moon, Sun, Menu, MessageCircle, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserImg from "../assets/user.png"; // Usado como imagem padrão/fallback

// Seus outros componentes
import DuvidasFrequentes from '../components/DuvidasFrequentes';
import GerenciarBase from '../components/GerenciarBase';
import Estatisticas from '../components/Estatisticas';

// Itens do menu da barra lateral
const menuItems = [
  { key: 'painel', label: 'Painel', icon: <Home size={18} /> },
  { key: 'duvidas', label: 'Dúvidas Frequentes', icon: <BookOpen size={18} /> },
  { key: 'base', label: 'Gerenciar Base', icon: <Database size={18} /> },
  { key: 'estatisticas', label: 'Estatísticas', icon: <BarChart2 size={18} /> },
];

function ProfessorDashboard() {
  const navigate = useNavigate();
  
  // Estados do componente
  const [theme, setTheme] = useState('dark');
  const [activeSection, setActiveSection] = useState('painel');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('Professor'); // Valor padrão
  const [userAvatar, setUserAvatar] = useState(UserImg); // Imagem padrão

  // Estados para dados da API
  const [statsData, setStatsData] = useState(null);
  const [anonymousQuestionsStats, setAnonymousQuestionsStats] = useState([]);
  const [topTopics, setTopTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para obter o token do localStorage (assumindo que está armazenado lá)
  const getAuthToken = () => {
    return localStorage.getItem('accessToken') 
  };

  // Função para fazer chamadas à API com autenticação
  const fetchWithAuth = async (url, options = {}) => {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  // Configuração da URL da API
  const API_URL = `${import.meta.env.VITE_API_URL}`;

  // Função para buscar estatísticas completas do chat
  const fetchChatStats = async (days = 30) => {
    try {
      const data = await fetchWithAuth(`${API_URL}/stats?days=${days}`);
      setStatsData(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas do chat:', error);
      setError('Erro ao carregar estatísticas do chat');
    }
  };

  // Função para buscar estatísticas das dúvidas anônimas
  const fetchAnonymousQuestionsStats = async () => {
    try {
      const data = await fetchWithAuth(`${API_URL}/anonymous-questions/stats`);
      setAnonymousQuestionsStats(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas de dúvidas anônimas:', error);
      setError(prev => prev || 'Erro ao carregar estatísticas de dúvidas');
    }
  };

  // Função para buscar temas mais comuns
  const fetchTopTopics = async () => {
    try {
      const data = await fetchWithAuth(`${API_URL}/anonymous-questions/topics?limit=10`);
      setTopTopics(data);
    } catch (error) {
      console.error('Erro ao buscar temas mais comuns:', error);
      setError(prev => prev || 'Erro ao carregar temas');
    }
  };

  // Carregar dados da API quando o componente montar
  useEffect(() => {
    const loadApiData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await Promise.all([
          fetchChatStats(),
          fetchAnonymousQuestionsStats(),
          fetchTopTopics()
        ]);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadApiData();
  }, []);

  // Efeito para trocar o tema na tag <body>
  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(theme);
  }, [theme]);

   useEffect(() => {
    const storedName = localStorage.getItem('userFirstName');
    const storedAvatar = localStorage.getItem('userAvatarUrl');

     if (storedName) {
      const nameParts = storedName.split(' ');
      
      // Formata o primeiro nome
      const formattedFirstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();

      let finalName = formattedFirstName;

      // Se existir um segundo nome, formata e adiciona também
      if (nameParts.length > 1) {
        const formattedSecondName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1).toLowerCase();
        finalName = `${formattedFirstName} ${formattedSecondName}`;
      }
      
      setUserName(finalName);
    }
    
    if (storedAvatar) {
      setUserAvatar(storedAvatar);
    }
  }, []);

  // Função para trocar o tema
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Função para voltar ao chat
  const handleBackToChat = () => {
    navigate('/chat');
  };

  // Função para trocar de seção e fechar o menu no mobile
  const handleMenuItemClick = (key) => {
    setActiveSection(key);
    if (window.innerWidth < 769) {
      setIsSidebarOpen(false);
    }
  };

  // Função para recarregar dados
  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchChatStats(),
        fetchAnonymousQuestionsStats(),
        fetchTopTopics()
      ]);
    } catch (error) {
      setError('Erro ao recarregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  // Função que renderiza o conteúdo da seção ativa
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column' }}>
          <Loader size={32} className="spin" />
          <p style={{ marginTop: '16px' }}>Carregando dados...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container" style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: 'var(--error-color, #e74c3c)', marginBottom: '16px' }}>{error}</p>
          <button onClick={handleRefreshData} className="retry-button">
            Tentar Novamente
          </button>
        </div>
      );
    }

    switch (activeSection) {
      case 'duvidas':
        return <DuvidasFrequentes />;
      case 'base':
        return <GerenciarBase />;
      case 'estatisticas':
        return <Estatisticas statsData={statsData} anonymousQuestionsStats={anonymousQuestionsStats} topTopics={topTopics} />;
      case 'painel':
      default:
        return (
          <>
            <section className="stats-cards">
              <div className="card">
                <img src="https://img.icons8.com/ios/50/sent.png" alt="Mensagens Enviadas" className="card-icon" />
                <h3>{statsData?.totals?.messages?.toLocaleString('pt-BR') || '0'}</h3>
                <p>Mensagens Enviadas</p>
              </div>
              <div className="card">
                <img src="https://img.icons8.com/ios/50/clock--v1.png" alt="Tempo Médio" className="card-icon" />
                <h3>
                  {statsData?.totals?.avg_response_time_ms 
                    ? `${Math.round(statsData.totals.avg_response_time_ms / 1000)}s`
                    : '0s'
                  }
                </h3>
                <p>Tempo Médio de Resposta</p>
              </div>
              <div className="card">
                <img src="https://img.icons8.com/ios/50/chat-message--v1.png" alt="Perguntas" className="card-icon" />
                <h3>{statsData?.totals?.questions?.toLocaleString('pt-BR') || '0'}</h3>
                <p>Perguntas Realizadas</p>
              </div>
              <div className="card">
                <img src="https://img.icons8.com/ios/50/user-group-man-man--v1.png" alt="Usuários Ativos" className="card-icon" />
                <h3>{statsData?.totals?.users?.toLocaleString('pt-BR') || '0'}</h3>
                <p>Usuários Ativos</p>
              </div>
            </section>

            {/* Informações de horário de pico */}
            {statsData?.peak_usage?.hour && statsData?.peak_usage?.day && (
              <section className="peak-usage-info" style={{ marginBottom: '24px' }}>
                <div className="info-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  <div className="info-card" style={{ padding: '16px', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h4>Horário de Maior Uso</h4>
                    <p>{statsData.peak_usage.hour.hour}h ({statsData.peak_usage.hour.period})</p>
                    <span style={{ fontSize: '0.9em', opacity: 0.7 }}>
                      {statsData.peak_usage.hour.messages} mensagens
                    </span>
                  </div>
                  <div className="info-card" style={{ padding: '16px', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h4>Dia de Maior Uso</h4>
                    <p>{statsData.peak_usage.day.day}</p>
                    <span style={{ fontSize: '0.9em', opacity: 0.7 }}>
                      {statsData.peak_usage.day.messages} mensagens
                    </span>
                  </div>
                </div>
              </section>
            )}
          </>
        );
    }
  };

  return (
    <div className={`admin-dashboard ${theme}`}>
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="profile-section">
          <div className="logo-text">ChatEdu</div>
        </div>
        <ul className="nav-menu">
          {menuItems.map(item => (
            <li key={item.key} className={activeSection === item.key ? 'active' : ''} onClick={() => handleMenuItemClick(item.key)}>
              {item.icon} {item.label}
            </li>
          ))}
        </ul>
      </aside>

      {isSidebarOpen && <div className="overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
          <div className="header-controls">
            <button 
              onClick={handleBackToChat} 
              className="back-to-chat-button" 
              title="Voltar ao Chat"
            >
              <MessageCircle size={20} />
            </button>
            <button onClick={toggleTheme} className="theme-toggle-button" title={theme === 'dark' ? 'Trocar para modo claro' : 'Trocar para modo escuro'}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="profile-info">
              <span>{userName}</span>
              <img src={userAvatar} alt="Foto do usuário" />
            </div>
          </div>
        </header>

        <section className="content-section">
          {renderContent()}
        </section>
      </main>
    </div>
  );
}

export default ProfessorDashboard;