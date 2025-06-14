import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'var(--tooltip-bg, #333)',
        color: 'var(--tooltip-text, #fff)',
        padding: '8px 12px',
        borderRadius: '4px',
        border: '1px solid var(--border-color, #666)',
        fontSize: '0.9em'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '4px 0 0 0', color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

export default function Estatisticas({ statsData, anonymousQuestionsStats, topTopics }) {
  // Processar dados das dúvidas anônimas para o gráfico de pizza
  const anonymousQuestionsPieData = anonymousQuestionsStats?.slice(0, 8).map((item, index) => ({
    name: item.topic,
    value: item.question_count,
    latestDate: item.latest_question_date
  })) || [];

  // Processar dados dos tópicos mais comuns para gráfico de barras
  const topTopicsBarData = topTopics?.slice(0, 10).map(topic => ({
    name: topic.length > 15 ? topic.substring(0, 15) + '...' : topic,
    fullName: topic,
    count: 1 // Como só temos os nomes, usamos 1 como placeholder
  })) || [];

  return (
    <div style={{ padding: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Estatísticas Detalhadas</h2>
        {statsData?.period && (
          <div style={{ fontSize: '0.9em', opacity: 0.7 }}>
            <span>{statsData.period}</span>
            {statsData.timezone && <span> • {statsData.timezone}</span>}
          </div>
        )}
      </div>

      {/* Resumo Geral */}
      {statsData && (
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Resumo Geral</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: 'var(--card-bg)', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>
                {statsData.totals.messages?.toLocaleString('pt-BR')}
              </h4>
              <p style={{ margin: 0, fontSize: '0.9em' }}>Total de Mensagens</p>
            </div>
            <div style={{ 
              padding: '20px', 
              backgroundColor: 'var(--card-bg)', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>
                {statsData.totals.questions?.toLocaleString('pt-BR')}
              </h4>
              <p style={{ margin: 0, fontSize: '0.9em' }}>Perguntas Feitas</p>
            </div>
            <div style={{ 
              padding: '20px', 
              backgroundColor: 'var(--card-bg)', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>
                {statsData.totals.users?.toLocaleString('pt-BR')}
              </h4>
              <p style={{ margin: 0, fontSize: '0.9em' }}>Usuários Únicos</p>
            </div>
            <div style={{ 
              padding: '20px', 
              backgroundColor: 'var(--card-bg)', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>
                {statsData.totals.avg_response_time_ms 
                  ? `${(statsData.totals.avg_response_time_ms / 1000).toFixed(1)}s`
                  : '0s'
                }
              </h4>
              <p style={{ margin: 0, fontSize: '0.9em' }}>Tempo Médio de Resposta</p>
            </div>
          </div>
        </section>
      )}

      {/* Horários de Pico */}
      {statsData?.peak_usage && (
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Horários de Maior Atividade</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '16px' 
          }}>
            <div style={{ 
              padding: '20px', 
              backgroundColor: 'var(--card-bg)', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)'
            }}>
              <h4 style={{ margin: '0 0 12px 0' }}>Horário de Pico</h4>
              <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '8px' }}>
                {statsData.peak_usage.hour.hour}h
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.9em' }}>
                {statsData.peak_usage.hour.period}
              </p>
              <p style={{ margin: 0, fontSize: '0.8em', opacity: 0.7 }}>
                {statsData.peak_usage.hour.messages} mensagens
              </p>
            </div>
            <div style={{ 
              padding: '20px', 
              backgroundColor: 'var(--card-bg)', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)'
            }}>
              <h4 style={{ margin: '0 0 12px 0' }}>Dia de Maior Uso</h4>
              <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '8px' }}>
                {statsData.peak_usage.day.day}
              </div>
              <p style={{ margin: 0, fontSize: '0.8em', opacity: 0.7 }}>
                {statsData.peak_usage.day.messages} mensagens
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Gráfico de Tópicos Mais Discutidos */}
      {statsData?.top_topics && statsData.top_topics.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Tópicos Mais Discutidos</h3>
          <div style={{ 
            backgroundColor: 'var(--card-bg)', 
            borderRadius: '8px', 
            border: '1px solid var(--border-color)',
            padding: '20px'
          }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statsData.top_topics} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis 
                  dataKey="topic" 
                  className="chart-axis-text"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis className="chart-axis-text" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="messages" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Estatísticas de Dúvidas Anônimas */}
      {anonymousQuestionsStats && anonymousQuestionsStats.length > 0 && (
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Dúvidas Anônimas por Tópico</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '24px' 
          }}>
            {/* Gráfico de Pizza */}
            <div style={{ 
              backgroundColor: 'var(--card-bg)', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              padding: '20px'
            }}>
              <h4 style={{ marginBottom: '16px' }}>Distribuição por Tópico</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={anonymousQuestionsPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                    outerRadius={80}
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

            {/* Lista de Estatísticas */}
            <div style={{ 
              backgroundColor: 'var(--card-bg)', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              padding: '20px'
            }}>
              <h4 style={{ marginBottom: '16px' }}>Detalhes dos Tópicos</h4>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {anonymousQuestionsStats.map((item, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      padding: '12px 0', 
                      borderBottom: index < anonymousQuestionsStats.length - 1 ? '1px solid var(--border-color)' : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>{item.topic}</div>
                      <div style={{ fontSize: '0.8em', opacity: 0.7 }}>
                        {item.latest_question_date 
                          ? `Última pergunta: ${new Date(item.latest_question_date).toLocaleDateString('pt-BR')}`
                          : 'Nenhuma pergunta ainda'
                        }
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                        {item.question_count}
                      </div>
                      <div style={{ fontSize: '0.8em', opacity: 0.7 }}>
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

      {/* Lista de Temas Mais Comuns */}
      {topTopics && topTopics.length > 0 && (
        <section>
          <h3 style={{ marginBottom: '16px' }}>Temas Mais Comuns nas Conversas</h3>
          <div style={{ 
            backgroundColor: 'var(--card-bg)', 
            borderRadius: '8px', 
            border: '1px solid var(--border-color)',
            padding: '20px'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '12px' 
            }}>
              {topTopics.map((topic, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: `${COLORS[index % COLORS.length]}20`,
                    border: `1px solid ${COLORS[index % COLORS.length]}`,
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '0.9em'
                  }}
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mensagem quando não há dados */}
      {(!statsData && !anonymousQuestionsStats?.length && !topTopics?.length) && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          backgroundColor: 'var(--card-bg)', 
          borderRadius: '8px',
          border: '1px solid var(--border-color)'
        }}>
          <p style={{ margin: 0, opacity: 0.7 }}>
            Nenhum dado de estatísticas disponível no momento.
          </p>
        </div>
      )}
    </div>
  );
}
