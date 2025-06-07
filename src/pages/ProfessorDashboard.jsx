import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import { BarChart2, BookOpen, Download, Home, Database, Moon, Sun } from 'lucide-react';
import logo from "../assets/upelogobased.png";
import UserImg from "../assets/user.png";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

// Dados de exemplo para o gráfico
const data = [
  { name: 'Jan', uso: 420 },
  { name: 'Fev', uso: 310 },
  { name: 'Mar', uso: 650 },
  { name: 'Abr', uso: 478 },
  { name: 'Mai', uso: 589 },
  { name: 'Jun', uso: 549 },
];

// Componente customizado para o Tooltip que se adapta ao tema
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

function ProfessorDashboard() {
  // Estado para controlar o tema atual ('dark' ou 'light')
  const [theme, setTheme] = useState('dark');

  // Função para alternar o tema
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // Efeito para adicionar/remover a classe do tema no body
  useEffect(() => {
    document.body.className = ''; // Limpa classes existentes
    document.body.classList.add(theme); // Adiciona a classe do tema atual
  }, [theme]);

  return (
    <div className={`admin-dashboard ${theme}`}>
      <aside className="sidebar">
        <div className="profile-section">
          <img src={logo} alt="UPE Logo" className="profile-pic" />
        </div>

        <ul className="nav-menu">
          <li className="active"><Home size={18} /> Painel</li>
          <li><BookOpen size={18} /> Dúvidas Frequentes</li>
          <li><Database size={18} /> Gerenciar Base</li>
          <li><BarChart2 size={18} /> Estatísticas</li>
          <li><Download size={18} /> Exportar Dados</li>
        </ul>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h2>Dashboard</h2>
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

      </main>
    </div>
  );
}

export default ProfessorDashboard;