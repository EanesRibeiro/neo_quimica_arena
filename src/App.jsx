import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  Clock, 
  Calculator, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  DollarSign, 
  Sparkles,
  ShieldAlert,
  Goal,
  Activity
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer 
} from 'recharts';
import summaryData from './data/summary_stats.json';
import WinProbabilityCalculator from './components/WinProbabilityCalculator';
import ClutchMoments from './components/ClutchMoments';
import TopPerformers from './components/TopPerformers';
import KPICard from './components/KPICard';
import { useScrollReveal } from './hooks/useScrollReveal';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'calculator', 'clutch', 'records'
  const [selectedOpponent, setSelectedOpponent] = useState('');

  const { financial_and_attendance, records, milestones } = summaryData;

  // Lista de oponentes únicos ordenada
  const opponents = useMemo(() => {
    return Object.keys(summaryData.by_opponent).sort();
  }, []);

  // Dados dinâmicos com base no adversário selecionado (Head-to-Head)
  const currentGeneral = useMemo(() => {
    if (!selectedOpponent) {
      return summaryData.general;
    }
    const oppData = summaryData.by_opponent[selectedOpponent];
    return {
      total_games: oppData.total_games,
      wins: oppData.wins,
      draws: oppData.draws,
      losses: oppData.losses,
      win_percentage: oppData.win_percentage,
      goals_scored: oppData.goals_scored,
      goals_conceded: oppData.goals_conceded,
      goal_difference: oppData.goals_scored - oppData.goals_conceded,
      unbeaten_streak_record: '-'
    };
  }, [selectedOpponent]);

  // Instanciar hooks de reveal para efeitos de scroll
  const [gridRef1, isVisible1] = useScrollReveal(0.02);
  const [gridRef2, isVisible2] = useScrollReveal(0.02);
  const [chartRef, isVisibleChart] = useScrollReveal(0.02);

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
            {/* Filtro Head-to-Head */}
            <div className="panel-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Activity size={20} style={{ color: 'var(--accent-gold)' }} />
                <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>Filtro Head-to-Head (Confronto Direto):</span>
              </div>
              <select 
                className="select-control"
                style={{ minWidth: '250px', padding: '0.5rem' }}
                value={selectedOpponent}
                onChange={(e) => setSelectedOpponent(e.target.value)}
              >
                <option value="">Arena Geral (Todos os Adversários)</option>
                {opponents.map((opp) => (
                  <option key={opp} value={opp}>{opp}</option>
                ))}
              </select>
            </div>

            {/* Overview Grid 1 */}
            <div ref={gridRef1} className="overview-grid">
              <KPICard 
                title="Partidas Disputadas" 
                value={currentGeneral.total_games} 
                icon={Calendar} 
                delay={0} 
                isVisible={isVisible1} 
              />
              <KPICard 
                title="Vitórias do Timão" 
                value={currentGeneral.wins} 
                icon={TrendingUp} 
                delay={100} 
                isVisible={isVisible1} 
                suffix={` (${((currentGeneral.wins / (currentGeneral.total_games || 1)) * 100).toFixed(1)}%)`}
              />
              <KPICard 
                title="Empates" 
                value={currentGeneral.draws} 
                icon={TrendingUp} 
                delay={200} 
                isVisible={isVisible1} 
                suffix={` (${((currentGeneral.draws / (currentGeneral.total_games || 1)) * 100).toFixed(1)}%)`}
              />
              <KPICard 
                title="Derrotas" 
                value={currentGeneral.losses} 
                icon={TrendingUp} 
                delay={300} 
                isVisible={isVisible1} 
                suffix={` (${((currentGeneral.losses / (currentGeneral.total_games || 1)) * 100).toFixed(1)}%)`}
              />
            </div>

            {/* Overview Grid 2 */}
            <div ref={gridRef2} className="overview-grid">
              <KPICard 
                title="Aproveitamento Geral" 
                value={currentGeneral.win_percentage} 
                suffix="%" 
                decimals={1}
                icon={Trophy} 
                delay={0} 
                isVisible={isVisible2} 
              />
              <KPICard 
                title="Gols do Timão" 
                value={currentGeneral.goals_scored} 
                icon={Goal} 
                delay={100} 
                isVisible={isVisible2} 
                suffix={` (Saldo: ${currentGeneral.goal_difference >= 0 ? `+${currentGeneral.goal_difference}` : currentGeneral.goal_difference})`}
              />
              <KPICard 
                title="Gols Sofridos" 
                value={currentGeneral.goals_conceded} 
                icon={ShieldAlert} 
                delay={200} 
                isVisible={isVisible2} 
              />
              
              {!selectedOpponent && (
                <>
                  <KPICard 
                    title="Público Acumulado" 
                    value={financial_and_attendance.total_attendance} 
                    icon={Users} 
                    delay={300} 
                    isVisible={isVisible2} 
                  />
                  <KPICard 
                    title="Bilheteria Acumulada" 
                    value={financial_and_attendance.total_revenue / 1000000} 
                    prefix="R$ "
                    suffix="M"
                    decimals={1}
                    icon={DollarSign} 
                    delay={400} 
                    isVisible={isVisible2} 
                  />
                </>
              )}
            </div>

            {/* Gráficos Recharts */}
            <div ref={chartRef} className={`reveal ${isVisibleChart ? 'visible' : ''}`} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginTop: '2.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                
                {/* Donut Chart - W/D/L */}
                <div className="panel-card" style={{ marginBottom: 0 }}>
                  <h3 className="panel-title" style={{ fontSize: '1.2rem' }}>
                    <Activity className="panel-title-icon" size={20} />
                    Aproveitamento de Confrontos (Donut Chart)
                  </h3>
                  <div style={{ width: '100%', height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Vitórias', value: currentGeneral.wins },
                            { name: 'Empates', value: currentGeneral.draws },
                            { name: 'Derrotas', value: currentGeneral.losses }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#C8232C" /> {/* Vermelho Corinthians */}
                          <Cell fill="#888888" /> {/* Cinza Empate */}
                          <Cell fill="#2E2E2E" /> {/* Preto/Cinza escuro Derrota */}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#C8232C', display: 'inline-block' }}></span>
                        Vitórias: {currentGeneral.wins}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#888888', display: 'inline-block' }}></span>
                        Empates: {currentGeneral.draws}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2E2E2E', display: 'inline-block' }}></span>
                        Derrotas: {currentGeneral.losses}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Line Chart - Evolução Financeira Anual (Apenas geral) */}
                {!selectedOpponent && (
                  <div className="panel-card" style={{ marginBottom: 0 }}>
                    <h3 className="panel-title" style={{ fontSize: '1.2rem' }}>
                      <TrendingUp className="panel-title-icon" size={20} />
                      Evolução de Bilheteria &amp; Ticket Médio
                    </h3>
                    <div style={{ width: '100%', height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={summaryData.yearly_stats}
                          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
                          <XAxis dataKey="year" stroke="var(--text-secondary)" fontSize={11} />
                          <YAxis yAxisId="left" stroke="#C8232C" fontSize={10} label={{ value: 'Renda (M$)', angle: -90, position: 'insideLeft', fill: '#C8232C', fontSize: 10 }} />
                          <YAxis yAxisId="right" orientation="right" stroke="var(--accent-gold)" fontSize={10} label={{ value: 'Ticket (R$)', angle: 90, position: 'insideRight', fill: 'var(--accent-gold)', fontSize: 10 }} />
                          <RechartsTooltip 
                            formatter={(value, name) => {
                              if (name === "Receita Anual") return [`R$ ${(value / 1000000).toFixed(1)}M`, "Receita Anual"];
                              return [`R$ ${value.toFixed(1)}`, "Ticket Médio"];
                            }}
                          />
                          <Line yAxisId="left" type="monotone" dataKey="revenue" name="Receita Anual" stroke="#C8232C" strokeWidth={2} activeDot={{ r: 8 }} />
                          <Line yAxisId="right" type="monotone" dataKey="ticket_price" name="Ticket Médio" stroke="var(--accent-gold)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dashboard Cards & Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginTop: '2.5rem' }}>
              {/* Central Box for Invincibility Streak */}
              {!selectedOpponent && (
                <div className="panel-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '5px solid var(--accent-gold)' }}>
                  <Sparkles size={48} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                      Recorde de Invencibilidade na Arena: {summaryData.general.unbeaten_streak_record} Jogos Consecutivos
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      O Corinthians ostenta um recorde incrível de {summaryData.general.unbeaten_streak_record} jogos oficiais seguidos sem sofrer derrotas diante da sua torcida em Itaquera, consolidando o estádio como um dos caldeirões mais temidos da América do Sul.
                    </p>
                  </div>
                </div>
              )}

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
