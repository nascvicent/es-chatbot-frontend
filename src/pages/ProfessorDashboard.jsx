import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import { BarChart2, BookOpen, Download, Home, Database, Moon, Sun, Menu } from 'lucide-react';
import logo from "../assets/upelogobased.png";
import UserImg from "../assets/user.png"; // Usado como imagem padrão/fallback
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

// Seus outros componentes
import DuvidasFrequentes from '../components/DuvidasFrequentes';
import GerenciarBase from '../components/GerenciarBase';
import Estatisticas from '../components/Estatisticas';
import ExportarDados from '../components/ExportarDados';

// Dados para o gráfico (pode vir de uma API no futuro)
const data = [
  { name: 'Jan', uso: 420 }, { name: 'Fev', uso: 310 }, { name: 'Mar', uso: 650 },
  { name: 'Abr', uso: 478 }, { name: 'Mai', uso: 589 }, { name: 'Jun', uso: 549 },
];

// Componente para o tooltip customizado do gráfico
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label}`}</p>
        <p className="intro">{`Uso: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// Itens do menu da barra lateral
const menuItems = [
  { key: 'painel', label: 'Painel', icon: <Home size={18} /> },
  { key: 'duvidas', label: 'Dúvidas Frequentes', icon: <BookOpen size={18} /> },
  { key: 'base', label: 'Gerenciar Base', icon: <Database size={18} /> },
  { key: 'estatisticas', label: 'Estatísticas', icon: <BarChart2 size={18} /> },
  { key: 'exportar', label: 'Exportar Dados', icon: <Download size={18} /> },
];


function ProfessorDashboard() {
  // Estados do componente
  const [theme, setTheme] = useState('dark');
  const [activeSection, setActiveSection] = useState('painel');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('Professor'); // Valor padrão
  const [userAvatar, setUserAvatar] = useState(UserImg); // Imagem padrão

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

  // Função para trocar de seção e fechar o menu no mobile
  const handleMenuItemClick = (key) => {
    setActiveSection(key);
    if (window.innerWidth < 769) {
      setIsSidebarOpen(false);
    }
  };

  // Função que renderiza o conteúdo da seção ativa
  const renderContent = () => {
    switch (activeSection) {
      case 'duvidas':
        return <DuvidasFrequentes />;
      case 'base':
        return <GerenciarBase />;
      case 'estatisticas':
        return <Estatisticas />;
      case 'exportar':
        return <ExportarDados />;
      case 'painel':
      default:
        return (
          <>
            <section className="stats-cards">
              <div className="card">
                <img src="https://img.icons8.com/ios/50/sent.png" alt="Respostas Enviadas" className="card-icon" />
                <h3>1.805</h3>
                <p>Respostas Enviadas</p>
              </div>
              <div className="card">
                <img src="https://img.icons8.com/ios/50/clock--v1.png" alt="Tempo Médio" className="card-icon" />
                <h3>3m 21s</h3>
                <p>Tempo Médio</p>
              </div>
              <div className="card">
                <img src="https://img.icons8.com/ios/50/chat-message--v1.png" alt="Dúvidas Frequentes" className="card-icon" />
                <h3>54</h3>
                <p>Dúvidas Frequentes</p>
              </div>
            </section>

            <section className="charts">
              <h3>Gráfico de Uso Mensal</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                  <XAxis dataKey="name" className="chart-axis-text" />
                  <YAxis className="chart-axis-text" />
                  <Tooltip cursor={{ fill: 'var(--chart-tooltip-cursor-bg)' }} content={<CustomTooltip />} />
                  <Bar dataKey="uso" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </section>
          </>
        );
    }
  };

  return (
    <div className={`admin-dashboard ${theme}`}>
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="profile-section">
          <img src={logo} alt="UPE Logo" className="profile-pic" />
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
            <h2>{menuItems.find(m => m.key === activeSection)?.label}</h2>
          </div>
          <div className="header-controls">
            <button onClick={toggleTheme} className="theme-toggle-button">
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