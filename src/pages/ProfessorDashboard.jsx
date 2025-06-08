import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import { BarChart2, BookOpen, Download, Home, Database, Moon, Sun } from 'lucide-react';
import logo from "../assets/upelogobased.png";
import UserImg from "../assets/user.png";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';


import DuvidasFrequentes from '../components/DuvidasFrequentes';
import GerenciarBase from '../components/GerenciarBase';
import Estatisticas from '../components/Estatisticas';
import ExportarDados from '../components/ExportarDados';

const data = [
  { name: 'Jan', uso: 420 },
  { name: 'Fev', uso: 310 },
  { name: 'Mar', uso: 650 },
  { name: 'Abr', uso: 478 },
  { name: 'Mai', uso: 589 },
  { name: 'Jun', uso: 549 },
];

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

const menuItems = [
  { key: 'painel', label: 'Painel', icon: <Home size={18} /> },
  { key: 'duvidas', label: 'Dúvidas Frequentes', icon: <BookOpen size={18} /> },
  { key: 'base', label: 'Gerenciar Base', icon: <Database size={18} /> },
  { key: 'estatisticas', label: 'Estatísticas', icon: <BarChart2 size={18} /> },
  { key: 'exportar', label: 'Exportar Dados', icon: <Download size={18} /> },
];

function ProfessorDashboard() {
  const [theme, setTheme] = useState('dark');
  const [activeSection, setActiveSection] = useState('painel');

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

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
                <img
                  src="https://img.icons8.com/ios/50/sent.png"
                  alt="Respostas Enviadas"
                  className="card-icon"
                />
                <h3>1.805</h3>
                <p>Respostas Enviadas</p>
              </div>
              <div className="card">
                <img
                  src="https://img.icons8.com/ios/50/clock--v1.png"
                  alt="Tempo Médio"
                  className="card-icon"
                />
                <h3>3m 21s</h3>
                <p>Tempo Médio</p>
              </div>
              <div className="card">
                <img
                  src="https://img.icons8.com/ios/50/chat-message--v1.png"
                  alt="Dúvidas Frequentes"
                  className="card-icon"
                />
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
      <aside className="sidebar">
        <div className="profile-section">
          <img src={logo} alt="UPE Logo" className="profile-pic" />
        </div>
        <ul className="nav-menu">
          {menuItems.map(item => (
            <li
              key={item.key}
              className={activeSection === item.key ? 'active' : ''}
              onClick={() => setActiveSection(item.key)}
            >
              {item.icon} {item.label}
            </li>
          ))}
        </ul>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h2>{menuItems.find(m => m.key === activeSection)?.label}</h2>
          <div className="header-controls">
            <button onClick={toggleTheme} className="theme-toggle-button">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="profile-info">
              <span>Professor</span>
              <img src={UserImg} alt="User" />
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
