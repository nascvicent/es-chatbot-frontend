import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="estatisticas-tooltip">
        <p className="estatisticas-tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="estatisticas-tooltip-value" style={{ color: entry.color }}>
            <strong>{entry.value}</strong> {entry.name === 'messages' ? 'mensagens' : entry.name}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = ['#4285f4', '#34a853', '#fbbc04', '#ea4335', '#9aa0a6', '#673ab7', '#e91e63', '#00bcd4'];

export default function Estatisticas({ statsData, anonymousQuestionsStats, topTopics }) {
  // Process anonymous questions data for pie chart - show all items
  const anonymousQuestionsPieData = anonymousQuestionsStats?.slice(0, 8).map((item, index) => ({
    name: item.topic,
    value: item.question_count,
    latestDate: item.latest_question_date
  })) || [];

  // Process most discussed topics - show all items
  const filteredTopTopics = statsData?.top_topics?.filter(topic => 
    topic && 
    topic.topic && 
    typeof topic.messages === 'number'
  ).slice(0, 10) // Limit to 10 most relevant topics for cleaner view
    .sort((a, b) => b.messages - a.messages) || [];

  // Show all anonymous questions stats
  const filteredAnonymousStats = anonymousQuestionsStats || [];

  // Format numbers with Brazilian locale
  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString('pt-BR');
  };

  return (
    <div className="estatisticas-container">
      <div className="estatisticas-header">
        <h2 className="estatisticas-title">Estatísticas</h2>
        {statsData?.period && (
          <div className="estatisticas-period-info">
            {statsData.period}
            {statsData.timezone && ` • ${statsData.timezone}`}
          </div>
        )}
      </div>

      {/* General Summary */}
      {statsData && (
        <section className="estatisticas-section">
          <h3 className="estatisticas-section-title">Resumo Geral</h3>
          <div className="resumo-geral-grid">
            <div className="resumo-card">
              <div className="resumo-card-value">
                {formatNumber(statsData.totals.messages)}
              </div>
              <p className="resumo-card-label">Total de Mensagens</p>
            </div>
            <div className="resumo-card">
              <div className="resumo-card-value">
                {formatNumber(statsData.totals.questions)}
              </div>
              <p className="resumo-card-label">Perguntas Feitas</p>
            </div>
            <div className="resumo-card">
              <div className="resumo-card-value">
                {formatNumber(statsData.totals.users)}
              </div>
              <p className="resumo-card-label">Usuários Únicos</p>
            </div>
            <div className="resumo-card">
              <div className="resumo-card-value">
                {statsData.totals.avg_response_time_ms 
                  ? `${(statsData.totals.avg_response_time_ms / 1000).toFixed(1)}s`
                  : '0s'
                }
              </div>
              <p className="resumo-card-label">Tempo Médio de Resposta</p>
            </div>
          </div>
        </section>
      )}

      {/* Peak Hours */}
      {statsData?.peak_usage && (
        <section className="estatisticas-section">
          <h3 className="estatisticas-section-title">Horários de Maior Atividade</h3>
          <div className="horarios-pico-grid">
            <div className="pico-card">
              <h4 className="pico-card-title">Horário de Pico</h4>
              <div className="pico-card-value">
                {statsData.peak_usage.hour.hour}h
              </div>
              <p className="pico-card-period">
                {statsData.peak_usage.hour.period}
              </p>
              <p className="pico-card-count">
                {formatNumber(statsData.peak_usage.hour.messages)} mensagens
              </p>
            </div>
            <div className="pico-card">
              <h4 className="pico-card-title">Dia de Maior Uso</h4>
              <div className="pico-card-value">
                {statsData.peak_usage.day.day}
              </div>
              <p className="pico-card-count">
                {formatNumber(statsData.peak_usage.day.messages)} mensagens
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Topics Chart from Anonymous Questions */}
      {filteredAnonymousStats.length > 0 && (
        <section className="estatisticas-section">
          <h3 className="estatisticas-section-title">
            Tópicos das Dúvidas Anônimas
            <span style={{ fontSize: '0.8em', opacity: 0.6, fontWeight: 'normal', marginLeft: '8px' }}>
              • Todos os tópicos
            </span>
          </h3>
          <div className="grafico-container">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart 
                data={filteredAnonymousStats.map((item, index) => ({
                  name: `Tópico ${index + 1}`,
                  fullName: item.topic,
                  uso: item.question_count,
                  latestDate: item.latest_question_date
                }))} 
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(66, 133, 244, 0.1)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="estatisticas-tooltip">
                          <p className="estatisticas-tooltip-label" style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                            {data.fullName || label}
                          </p>
                          <p className="estatisticas-tooltip-value">
                            <strong>{payload[0].value}</strong> {payload[0].value === 1 ? 'pergunta' : 'perguntas'}
                          </p>
                          {data.latestDate && (
                            <p className="estatisticas-tooltip-value" style={{ fontSize: '0.9em', opacity: 0.8 }}>
                              Última: {new Date(data.latestDate).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                          {payload[0].value === 0 && (
                            <p className="estatisticas-tooltip-value" style={{ fontSize: '0.9em', opacity: 0.8, fontStyle: 'italic' }}>
                              Nenhuma pergunta registrada
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="uso" 
                  fill="var(--primary-color)" 
                  radius={[3, 3, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Anonymous Questions Statistics */}
      {filteredAnonymousStats.length > 0 && (
        <section className="estatisticas-section">
          <h3 className="estatisticas-section-title">Dúvidas Anônimas por Tópico</h3>
          <div className="duvidas-anonimas-grid">
            {/* Pie Chart */}
            <div className="grafico-container">
              <h4>Distribuição por Tópico</h4>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={anonymousQuestionsPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => 
                      percent > 3 ? `${name}: ${value}` : ''
                    }
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {anonymousQuestionsPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Statistics List */}
            <div className="grafico-container">
              <h4>Detalhes dos Tópicos</h4>
              <div className="duvidas-lista">
                {filteredAnonymousStats.map((item, index) => (
                  <div key={index} className="duvida-item">
                    <div className="duvida-info">
                      <div className="duvida-topic">{item.topic}</div>
                      <div className="duvida-date">
                        {item.latest_question_date 
                          ? `Última pergunta: ${new Date(item.latest_question_date).toLocaleDateString('pt-BR')}`
                          : 'Nenhuma pergunta registrada'
                        }
                      </div>
                    </div>
                    <div className="duvida-stats">
                      <div className="duvida-count">
                        {item.question_count}
                      </div>
                      <div className="duvida-count-label">
                        {item.question_count === 1 ? 'pergunta' : 'perguntas'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Most Common Topics List */}
      {topTopics && topTopics.length > 0 && (
        <section className="estatisticas-section">
          <h3 className="estatisticas-section-title">Temas Mais Comuns</h3>
          <div className="grafico-container">
            <div className="temas-comuns-grid">
              {topTopics.slice(0, 12).map((topic, index) => (
                <div 
                  key={index}
                  className="tema-tag"
                  style={{
                    backgroundColor: `${COLORS[index % COLORS.length]}15`,
                    borderColor: `${COLORS[index % COLORS.length]}40`,
                  }}
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state message */}
      {(!statsData && !filteredAnonymousStats?.length && !topTopics?.length) && (
        <div className="estatisticas-empty">
          <p>Nenhum dado disponível no momento</p>
        </div>
      )}
    </div>
  );
}
