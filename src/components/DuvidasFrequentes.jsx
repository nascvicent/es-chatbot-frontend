import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, TrendingUp, Loader, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="intro">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DuvidasFrequentes() {
  // Estados principais
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState([]);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de filtros e paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [perPage, setPerPage] = useState(20);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de interface
  const [viewMode, setViewMode] = useState('list');
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

  // Configuração da API
  const API_URL = `${import.meta.env.VITE_API_URL}`;

  // Função para obter token de autenticação
  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  // Função para fazer chamadas autenticadas à API
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

  // Buscar dúvidas anônimas
  const fetchQuestions = async (page = 1, topic = '', search = '') => {
    try {
      let url = `${API_URL}/anonymous-questions?page=${page}&per_page=${perPage}`;
      if (topic) url += `&topic=${encodeURIComponent(topic)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const data = await fetchWithAuth(url);
      setQuestions(data.questions || []);
      setTotalQuestions(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / perPage));
    } catch (error) {
      console.error('Erro ao buscar dúvidas:', error);
      setError('Erro ao carregar dúvidas');
    }
  };

  // Buscar estatísticas das dúvidas
  const fetchStats = async () => {
    try {
      const data = await fetchWithAuth(`${API_URL}/anonymous-questions/stats`);
      setStats(data || []);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  // Buscar tópicos disponíveis
  const fetchTopics = async () => {
    try {
      const data = await fetchWithAuth(`${API_URL}/anonymous-questions/topics?limit=50`);
      setTopics(data || []);
    } catch (error) {
      console.error('Erro ao buscar tópicos:', error);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await Promise.all([
          fetchQuestions(currentPage, selectedTopic, searchTerm),
          fetchStats(),
          fetchTopics()
        ]);
      } catch (error) {
        setError('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentPage, selectedTopic, searchTerm, perPage]);

  // Manipular mudança de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Manipular filtro por tópico
  const handleTopicFilter = (topic) => {
    setSelectedTopic(topic);
    setCurrentPage(1);
  };

  // Manipular busca
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Alternar expansão da pergunta
  const toggleQuestionExpansion = (questionId) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  // Processar dados para gráficos
  const chartData = stats.slice(0, 10).map(item => ({
    name: item.topic.length > 15 ? item.topic.substring(0, 15) + '...' : item.topic,
    fullName: item.topic,
    value: item.question_count,
    latestDate: item.latest_question_date
  }));

  const pieData = stats.filter(item => item.question_count > 0).slice(0, 8);

  if (isLoading) {
    return (
      <div className="loading-container">
        <Loader size={32} className="spin" />
        <p>Carregando dúvidas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="duvidas-header">
        <div className="duvidas-title">
          <h2>Dúvidas Anônimas</h2>
          <p className="duvidas-subtitle">
            {totalQuestions} {totalQuestions === 1 ? 'dúvida encontrada' : 'dúvidas encontradas'}
          </p>
        </div>
        
        {/* Botões de visualização */}
        <div className="view-mode-buttons">
          <button
            onClick={() => setViewMode('list')}
            className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
          >
            <MessageCircle size={16} />
            Lista
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={`view-mode-btn ${viewMode === 'stats' ? 'active' : ''}`}
          >
            <TrendingUp size={16} />
            Estatísticas
          </button>
        </div>
      </div>

      {viewMode === 'stats' ? (
        // Visualização de Estatísticas
        <div>
          {/* Cards de resumo pequenos */}
          <div className="stats-summary">
            <div className="stat-card-small">
              <h4>{totalQuestions}</h4>
              <p>Total de Dúvidas</p>
            </div>
            <div className="stat-card-small">
              <h4>{stats.filter(s => s.question_count > 0).length}</h4>
              <p>Tópicos Ativos</p>
            </div>
            <div className="stat-card-small">
              <h4>{stats.length}</h4>
              <p>Total de Tópicos</p>
            </div>
          </div>

          {/* Gráficos */}
          {chartData.length > 0 && (
            <div className="charts-grid">
              {/* Gráfico de Barras */}
              <div className="chart-container">
                <h4>Dúvidas por Tópico</h4>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                    <XAxis 
                      dataKey="name" 
                      className="chart-axis-text"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      fontSize={11}
                    />
                    <YAxis className="chart-axis-text" fontSize={11} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="var(--primary-color)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Pizza */}
              {pieData.length > 0 && (
                <div className="chart-container">
                  <h4>Distribuição por Tópico</h4>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="question_count"
                        fontSize={10}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // Visualização de Lista
        <div>
          {/* Controles de filtro e busca */}
          <div className="filter-controls">
            {/* Busca */}
            <div className="search-input-container">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar nas dúvidas..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Filtro por tópico */}
            <select
              value={selectedTopic}
              onChange={(e) => handleTopicFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos os tópicos</option>
              {topics.map((topic, index) => (
                <option key={index} value={topic}>{topic}</option>
              ))}
            </select>

            {/* Items por página */}
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="filter-select"
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>

          {/* Lista de dúvidas */}
          {questions.length > 0 ? (
            <div className="questions-list">
              {questions.map((question) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <div className="question-content">
                      <div className="topic-tag">
                        {question.topic || question.classified_topic}
                      </div>
                      <p className="question-text">
                        {expandedQuestions.has(question.id) 
                          ? question.question 
                          : `${question.question.substring(0, 200)}${question.question.length > 200 ? '...' : ''}`
                        }
                      </p>
                    </div>
                    {question.question.length > 200 && (
                      <button
                        onClick={() => toggleQuestionExpansion(question.id)}
                        className="expand-btn"
                        title={expandedQuestions.has(question.id) ? 'Recolher' : 'Expandir'}
                      >
                        {expandedQuestions.has(question.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                  <div className="question-meta">
                    <span className="question-id">ID: #{question.id}</span>
                    <span className="question-date">
                      {new Date(question.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <MessageCircle size={48} />
              <p>
                {searchTerm || selectedTopic 
                  ? 'Nenhuma dúvida encontrada com os filtros aplicados.' 
                  : 'Nenhuma dúvida cadastrada ainda.'
                }
              </p>
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <ChevronLeft size={16} />
                Anterior
              </button>

              <span className="pagination-info">
                Página {currentPage} de {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Próxima
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
