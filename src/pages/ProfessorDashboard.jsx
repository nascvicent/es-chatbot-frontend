import React from 'react';
import '../styles/Dashboard.css';
import { BarChart2, FileText, BookOpen, Download, Home, Database } from 'lucide-react';
import UserImg from "../assets/user.png"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';


const data = [
  { name: 'Jan', uso: 400 },
  { name: 'Fev', uso: 300 },
  { name: 'Mar', uso: 200 },
  { name: 'Abr', uso: 278 },
  { name: 'Mai', uso: 189 },
];
// so pra simular o grafico

function ProfessorDashboard() {
  return (
    <div className="admin-dashboard">
      <aside className="sidebar">
        <div className="profile-section">
          <img src={UserImg} alt="Usuário" className="profile-pic" />
          <h3>Professor</h3>
          <span className="status online">● Online</span>
        </div>

        <ul className="nav-menu">
          <li><Home size={18} /> Painel</li>
          <li><BookOpen size={18} /> Dúvidas Frequentes</li>
          <li><Database size={18} /> Gerenciar Base</li>
          <li><BarChart2 size={18} /> Estatísticas</li>
          <li><Download size={18} /> Exportar Dados</li>
        </ul>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h2>Dashboard</h2>
          <div className="profile-info">
            <img src={UserImg} alt="User" />
            <span>Professor</span>
          </div>
        </header>

        <section className="stats-cards">
          <div className="card">
            <span>📥</span>
            <h3>1.805</h3>
            <p>Respostas Enviadas</p>
          </div>
          <div className="card">
            <span>⏱️</span>
            <h3>3m 21s</h3>
            <p>Tempo Médio</p>
          </div>
          <div className="card">
            <span>💬</span>
            <h3>54</h3>
            <p>Dúvidas Frequentes</p>
          </div>
        </section>

        <section className="charts" >
          <h3>Gráfico de Uso </h3>
          <ResponsiveContainer width="100%" height={250}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="uso" fill="#8884d8" />
  </BarChart>
</ResponsiveContainer>

        </section>
      </main>
    </div>
  );
}

export default ProfessorDashboard;
