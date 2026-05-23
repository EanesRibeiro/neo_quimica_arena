import React, { useState } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Clock, 
  Calculator, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  DollarSign, 
  ChevronRight, 
  Sparkles,
  ShieldAlert,
  Goal
} from 'lucide-react';
import summaryData from './data/summary_stats.json';
import WinProbabilityCalculator from './components/WinProbabilityCalculator';
import ClutchMoments from './components/ClutchMoments';
import TopPerformers from './components/TopPerformers';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'calculator', 'clutch', 'records'

  const { general, financial_and_attendance, records, milestones } = summaryData;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <Trophy className="logo-icon" size={32} />
            <h1 className="logo-title">Arena Corinthians <span>Stats Hub</span></h1>
          </div>
          <nav className="nav-menu">
            <button 
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>
            <button 
              className={`nav-item ${activeTab === 'calculator' ? 'active' : ''}`}
              onClick={() => setActiveTab('calculator')}
            >
              <Calculator size={18} />
              Calculadora
            </button>
            <button 
              className={`nav-item ${activeTab === 'clutch' ? 'active' : ''}`}
              onClick={() => setActiveTab('clutch')}
            >
              <Clock size={18} />
              Clutch Moments
            </button>
            <button 
              className={`nav-item ${activeTab === 'records' ? 'active' : ''}`}
              onClick={() => setActiveTab('records')}
            >
              <Trophy size={18} />
              Recordes
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div>
            {/* Overview Grid */}
            <div className="overview-grid">
              <div className="stat-card">
                <div className="stat-card-header">
                  <span>Partidas Disputadas</span>
                  <Calendar className="stat-icon" size={18} />
                </div>
                <div className="stat-value">{general.total_games}</div>
                <div className="stat-sub">Jogos Oficiais e Amistosos</div>
              </div>

              <div className="stat-card win">
                <div className="stat-card-header">
                  <span>Vitórias</span>
                  <TrendingUp className="stat-icon" size={18} style={{ color: 'var(--success)' }} />
                </div>
                <div className="stat-value" style={{ color: 'var(--success)' }}>{general.wins}</div>
                <div className="stat-sub">{((general.wins / general.total_games) * 100).toFixed(1)}% das partidas</div>
              </div>

              <div className="stat-card draw">
                <div className="stat-card-header">
                  <span>Empates</span>
                  <TrendingUp className="stat-icon" size={18} style={{ color: 'var(--warning)' }} />
                </div>
                <div className="stat-value" style={{ color: 'var(--warning)' }}>{general.draws}</div>
                <div className="stat-sub">{((general.draws / general.total_games) * 100).toFixed(1)}% das partidas</div>
              </div>

              <div className="stat-card loss">
                <div className="stat-card-header">
                  <span>Derrotas</span>
                  <TrendingUp className="stat-icon" size={18} style={{ color: 'var(--danger)' }} />
                </div>
                <div className="stat-value" style={{ color: 'var(--danger)' }}>{general.losses}</div>
                <div className="stat-sub">{((general.losses / general.total_games) * 100).toFixed(1)}% das partidas</div>
              </div>
            </div>

            <div className="overview-grid">
              <div className="stat-card">
                <div className="stat-card-header">
                  <span>Aproveitamento Geral</span>
                  <Trophy className="stat-icon" size={18} />
                </div>
                <div className="stat-value">{general.win_percentage.toFixed(1)}%</div>
                <div className="stat-sub">Pontos Ganhos / Possíveis</div>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <span>Gols Marcados vs Sofridos</span>
                  <Goal className="stat-icon" size={18} />
                </div>
                <div className="stat-value">
                  {general.goals_scored} <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>x</span> {general.goals_conceded}
                </div>
                <div className="stat-sub">Saldo: <span style={{ color: general.goal_difference >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>{general.goal_difference >= 0 ? `+${general.goal_difference}` : general.goal_difference}</span></div>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <span>Público Acumulado</span>
                  <Users className="stat-icon" size={18} />
                </div>
                <div className="stat-value" style={{ fontSize: '1.6rem', marginTop: '0.4rem', marginBottom: '0.4rem' }}>
                  {financial_and_attendance.total_attendance.toLocaleString('pt-BR')}
                </div>
                <div className="stat-sub">Média: {Math.round(financial_and_attendance.average_attendance_with_crowd).toLocaleString('pt-BR')} (com público)</div>
              </div>

              <div className="stat-card">
                <div className="stat-card-header">
                  <span>Arrecadação Total</span>
                  <DollarSign className="stat-icon" size={18} />
                </div>
                <div className="stat-value" style={{ fontSize: '1.4rem', marginTop: '0.6rem', marginBottom: '0.6rem' }}>
                  {financial_and_attendance.total_revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </div>
                <div className="stat-sub">Média: {financial_and_attendance.average_revenue_with_crowd.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}</div>
              </div>
            </div>

            {/* Dashboard Cards & Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginTop: '2.5rem' }}>
              {/* Central Box for Invincibility Streak */}
              <div className="panel-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '5px solid var(--accent-gold)' }}>
                <Sparkles size={48} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                    Recorde de Invencibilidade na Arena: {general.unbeaten_streak_record} Jogos Consecutivos
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    O Corinthians ostenta um recorde incrível de {general.unbeaten_streak_record} jogos oficiais seguidos sem sofrer derrotas diante da sua torcida em Itaquera, consolidando o estádio como um dos caldeirões mais temidos da América do Sul.
                  </p>
                </div>
              </div>

              {/* Records and Milestones */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <div className="panel-card" style={{ marginBottom: 0 }}>
                  <h2 className="panel-title">
                    <Trophy className="panel-title-icon" size={24} />
                    Recordes e Estatísticas do Estádio
                  </h2>
                  <div className="milestones-grid" style={{ marginTop: '1rem' }}>
                    <div className="milestone-box">
                      <div className="milestone-title">
                        <Users size={18} />
                        Público Recorde
                      </div>
                      <div className="milestone-item">
                        <span className="milestone-label">Público Pagante</span>
                        <span className="milestone-value" style={{ color: 'var(--accent-gold)' }}>
                          {records.highest_attendance.publico.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="milestone-item">
                        <span className="milestone-label">Adversário</span>
                        <span className="milestone-value">{records.highest_attendance.adversario}</span>
                      </div>
                      <div className="milestone-item">
                        <span className="milestone-label">Placar</span>
                        <span className="milestone-value">{records.highest_attendance.placar}</span>
                      </div>
                      <div className="milestone-item">
                        <span className="milestone-label">Data / Campeonato</span>
                        <span className="milestone-value">{records.highest_attendance.data} ({records.highest_attendance.campeonato})</span>
                      </div>
                    </div>

                    <div className="milestone-box">
                      <div className="milestone-title">
                        <DollarSign size={18} />
                        Maior Bilheteria
                      </div>
                      <div className="milestone-item">
                        <span className="milestone-label">Renda Bruta</span>
                        <span className="milestone-value" style={{ color: 'var(--accent-gold)' }}>
                          {records.highest_revenue.renda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="milestone-item">
                        <span className="milestone-label">Adversário</span>
                        <span className="milestone-value">{records.highest_revenue.adversario}</span>
                      </div>
                      <div className="milestone-item">
                        <span className="milestone-label">Placar</span>
                        <span className="milestone-value">{records.highest_revenue.placar}</span>
                      </div>
                      <div className="milestone-item">
                        <span className="milestone-label">Data / Campeonato</span>
                        <span className="milestone-value">{records.highest_revenue.data} ({records.highest_revenue.campeonato})</span>
                      </div>
                    </div>

                    <div className="milestone-box">
                      <div className="milestone-title">
                        <Trophy size={18} />
                        Maior Goleada
                      </div>
                      <div className="milestone-item">
                        <span className="milestone-label">Resultado Final</span>
                        <span className="milestone-value" style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                          Corinthians {records.biggest_win.placar}
                        </span>
                      </div>
                      <div className="milestone-item">
                        <span className="milestone-label">Adversário</span>
                        <span className="milestone-value">{records.biggest_win.adversario}</span>
                      </div>
                      <div className="milestone-item">
                        <span className="milestone-label">Data / Campeonato</span>
                        <span className="milestone-value">{records.biggest_win.data} ({records.biggest_win.campeonato})</span>
                      </div>
                      <div className="milestone-item">
                        <span className="milestone-label">Saldo</span>
                        <span className="milestone-value">+{records.biggest_win.saldo} gols de saldo</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="panel-card" style={{ marginBottom: 0 }}>
                  <h2 className="panel-title">
                    <Sparkles className="panel-title-icon" size={24} />
                    Marcos Históricos (Milestones)
                  </h2>
                  <div className="milestones-grid" style={{ marginTop: '1rem' }}>
                    <div className="milestone-box">
                      <div className="milestone-title">
                        <Calendar size={18} />
                        Partida Inaugural
                      </div>
                      <div className="milestone-item">
                        <span className="milestone-label">Data</span>
                        <span className="milestone-value">{milestones.first_game.data}</span>
                      </div>
                      <div className="milestone-item">
                        <span className="milestone-label">Adversário</span>
                        <span className="milestone-value">{milestones.first_game.adversario}</span>
                      </div>
                      <div className="milestone-item">
                        <span className="milestone-label">Placar</span>
                        <span className="milestone-value" style={{ color: 'var(--danger)' }}>{milestones.first_game.placar}</span>
                      </div>
                      <div className="milestone-item">
                        <span className="milestone-label">Público Pagante</span>
                        <span className="milestone-value">{milestones.first_game.publico.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="milestone-item">
                        <span className="milestone-label">Técnico COR</span>
                        <span className="milestone-value">{milestones.first_game.tecnico}</span>
                      </div>
                    </div>

                    {milestones.first_cor_goal && milestones.first_cor_goal.jogador ? (
                      <div className="milestone-box">
                        <div className="milestone-title">
                          <Goal size={18} />
                          Primeiro Gol do Corinthians
                        </div>
                        <div className="milestone-item">
                          <span className="milestone-label">Autor do Gol</span>
                          <span className="milestone-value" style={{ color: 'var(--success)', fontWeight: 'bold' }}>
                            {milestones.first_cor_goal.jogador}
                          </span>
                        </div>
                        <div className="milestone-item">
                          <span className="milestone-label">Adversário</span>
                          <span className="milestone-value">{milestones.first_cor_goal.adversario}</span>
                        </div>
                        <div className="milestone-item">
                          <span className="milestone-label">Data da Partida</span>
                          <span className="milestone-value">{milestones.first_cor_goal.data}</span>
                        </div>
                        <div className="milestone-item">
                          <span className="milestone-label">Minuto do Gol</span>
                          <span className="milestone-value">{milestones.first_cor_goal.minuto}' (1T)</span>
                        </div>
                        <div className="milestone-item">
                          <span className="milestone-label">Placar Final</span>
                          <span className="milestone-value">{milestones.first_cor_goal.placar_final}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="milestone-box">
                        <div className="milestone-title">
                          <Goal size={18} />
                          Primeiro Gol do Corinthians
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                          <ShieldAlert size={24} style={{ display: 'block', margin: '0 auto 0.5rem', color: 'var(--warning)' }} />
                          Dados de gol não encontrados
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calculator' && <WinProbabilityCalculator />}

        {activeTab === 'clutch' && <ClutchMoments />}

        {activeTab === 'records' && <TopPerformers />}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} - Arena Corinthians Stats Hub. Desenvolvido para análise histórica da Arena.</p>
          <p>Dados processados: <span>400 partidas oficiais</span>. Estatísticas consolidadas offline.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
