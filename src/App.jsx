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
  const [selectedYear, setSelectedYear] = useState('Todos');

  const { financial_and_attendance, records, milestones } = summaryData;

  // Lista de oponentes únicos ordenada
  const opponents = useMemo(() => {
    return Object.keys(summaryData.by_opponent).sort();
  }, []);

  // Lista de anos disponíveis ordenados
  const years = useMemo(() => {
    return summaryData.yearly_stats.map(s => s.year).sort((a, b) => a - b);
  }, []);

  // Controladores de filtros para evitar conflitos de agregação
  const handleOpponentChange = (e) => {
    const opp = e.target.value;
    setSelectedOpponent(opp);
    if (opp) {
      setSelectedYear('Todos'); // Reseta ano quando escolhe oponente
    }
  };

  const handleYearChange = (e) => {
    const yr = e.target.value;
    setSelectedYear(yr);
    if (yr !== 'Todos') {
      setSelectedOpponent(''); // Reseta oponente quando escolhe ano
    }
  };

  // Dados consolidados dinâmicos com base nos filtros
  const currentData = useMemo(() => {
    if (selectedOpponent) {
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
        total_attendance: null,
        total_revenue: null,
        isYearFiltered: false,
        isOpponentFiltered: true
      };
    }
    
    if (selectedYear !== 'Todos') {
      const yearNum = parseInt(selectedYear, 10);
      const yrData = summaryData.yearly_stats.find(s => s.year === yearNum);
      if (yrData) {
        return {
          total_games: yrData.total_games,
          wins: yrData.wins,
          draws: yrData.draws,
          losses: yrData.losses,
          win_percentage: yrData.win_percentage,
          goals_scored: yrData.goals_scored,
          goals_conceded: yrData.goals_conceded,
          goal_difference: yrData.goals_scored - yrData.goals_conceded,
          total_attendance: Math.round(yrData.average_attendance * yrData.total_games),
          total_revenue: yrData.revenue,
          isYearFiltered: true,
          isOpponentFiltered: false
        };
      }
    }

    // Padrão Geral (Sem filtros)
    return {
      total_games: summaryData.general.total_games,
      wins: summaryData.general.wins,
      draws: summaryData.general.draws,
      losses: summaryData.general.losses,
      win_percentage: summaryData.general.win_percentage,
      goals_scored: summaryData.general.goals_scored,
      goals_conceded: summaryData.general.goals_conceded,
      goal_difference: summaryData.general.goal_difference,
      total_attendance: summaryData.financial_and_attendance.total_attendance,
      total_revenue: summaryData.financial_and_attendance.total_revenue,
      isYearFiltered: false,
      isOpponentFiltered: false
    };
  }, [selectedOpponent, selectedYear]);

  // Inicializa a observação automática de Scroll Reveal para elementos com a classe '.reveal'
  useScrollReveal();

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
          <div className="shell">
            {/* Bloco Hero Editorial */}
            <div className="hero reveal">
              <div className="hero-eyebrow">Neo Química Arena · 2014–2025</div>
              <div className="hero-headline">
                {currentData.total_games} jogos.<br />
                <em>{currentData.wins} vitórias.</em>
              </div>
              <div className="hero-sub">
                {selectedOpponent 
                  ? `Histórico detalhado de confrontos diretos contra o ${selectedOpponent} jogando em Itaquera.`
                  : selectedYear !== 'Todos'
                    ? `Estatísticas consolidadas do Corinthians como mandante durante a temporada de 20${selectedYear}.`
                    : "Análise histórica completa do aproveitamento, bilheteria e recordes do Timão em Itaquera."
                }
              </div>
              
              <div className="hero-strip">
                <div className="hero-stat">
                  <div className="hs-label">Aproveitamento</div>
                  <div className="hs-num" style={{ color: 'var(--vermelho)' }}>
                    {currentData.win_percentage.toFixed(1)}<span className="unit">%</span>
                  </div>
                  <div className="hs-sub">{selectedYear !== 'Todos' ? `Em 20${selectedYear}` : 'Geral na Arena'}</div>
                </div>
                <div className="hero-stat">
                  <div className="hs-label">Gols Marcados</div>
                  <div className="hs-num">{currentData.goals_scored}</div>
                  <div className="hs-sub">Saldo {currentData.goal_difference >= 0 ? `+${currentData.goal_difference}` : currentData.goal_difference}</div>
                </div>
                <div className="hero-stat">
                  <div className="hs-label">Público Acumulado</div>
                  <div className="hs-num">
                    {currentData.total_attendance 
                      ? (currentData.total_attendance / 1000000).toFixed(1) 
                      : '-'}
                    <span className="unit">{currentData.total_attendance ? 'M' : ''}</span>
                  </div>
                  <div className="hs-sub">Fiel em Itaquera</div>
                </div>
                <div className="hero-stat">
                  <div className="hs-label">Bilheteria</div>
                  <div className="hs-num" style={{ color: 'var(--ouro)' }}>
                    {currentData.total_revenue 
                      ? `R$ ${(currentData.total_revenue / 1000000).toFixed(0)}` 
                      : '-'}
                    <span className="unit">{currentData.total_revenue ? 'M' : ''}</span>
                  </div>
                  <div className="hs-sub">Renda líquida aproximada</div>
                </div>
              </div>
            </div>

            {/* Painel de Filtros Integrado */}
            <div className="panel-card reveal" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span className="form-label" style={{ fontSize: '10px' }}>Confronto Direto (Oponente)</span>
                  <select 
                    className="select-control"
                    style={{ minWidth: '220px', padding: '0.5rem' }}
                    value={selectedOpponent}
                    onChange={handleOpponentChange}
                  >
                    <option value="">Arena Geral (Todos os Adversários)</option>
                    {opponents.map((opp) => (
                      <option key={opp} value={opp}>{opp}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span className="form-label" style={{ fontSize: '10px' }}>Filtrar por Ano</span>
                  <select 
                    className="select-control"
                    style={{ minWidth: '220px', padding: '0.5rem' }}
                    value={selectedYear}
                    onChange={handleYearChange}
                  >
                    <option value="Todos">Todos os Anos (2014–2025)</option>
                    {years.map((y) => (
                      <option key={y} value={y}>Ano 20{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(selectedOpponent || selectedYear !== 'Todos') && (
                <button 
                  onClick={() => { setSelectedOpponent(''); setSelectedYear('Todos'); }}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--border-radius)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  Limpar Filtros
                </button>
              )}
            </div>

            {/* Overview Animada com KPICards */}
            {(selectedOpponent || selectedYear !== 'Todos') && (
              <div className="overview-grid reveal" style={{ marginTop: '1.5rem' }}>
                <KPICard label="Partidas Disputadas" value={currentData.total_games} delay={0} />
                <KPICard label="Vitórias do Timão" value={currentData.wins} delay={150} />
                <KPICard label="Gols Marcados" value={currentData.goals_scored} delay={300} />
                <KPICard label="Saldo de Gols" value={currentData.goal_difference} delay={450} />
              </div>
            )}

            {/* Seção de Aproveitamento Alvinegra */}
            <div className="panel-card reveal">
              <div className="section-header">
                <span className="section-label">Resultado</span>
                <h2 className="section-title">Aproveitamento de Confrontos</h2>
              </div>
              
              <div className="wdl-row">
                <div className="wdl-pill">
                  <div className="wdl-num" style={{ color: 'var(--vermelho)' }}>{currentData.wins}</div>
                  <div className="wdl-bar">
                    <div className="wdl-bar-fill" style={{ width: `${(currentData.wins / currentData.total_games * 100) || 0}%`, backgroundColor: 'var(--vermelho)' }}></div>
                  </div>
                  <div className="wdl-label">Vitórias · {((currentData.wins / currentData.total_games * 100) || 0).toFixed(1)}%</div>
                </div>
                <div className="wdl-pill">
                  <div className="wdl-num" style={{ color: 'var(--text-light)' }}>{currentData.draws}</div>
                  <div className="wdl-bar">
                    <div className="wdl-bar-fill" style={{ width: `${(currentData.draws / currentData.total_games * 100) || 0}%`, backgroundColor: 'var(--text-secondary)' }}></div>
                  </div>
                  <div className="wdl-label">Empates · {((currentData.draws / currentData.total_games * 100) || 0).toFixed(1)}%</div>
                </div>
                <div className="wdl-pill">
                  <div className="wdl-num" style={{ color: 'var(--text-secondary)' }}>{currentData.losses}</div>
                  <div className="wdl-bar">
                    <div className="wdl-bar-fill" style={{ width: `${(currentData.losses / currentData.total_games * 100) || 0}%`, backgroundColor: '#333333' }}></div>
                  </div>
                  <div className="wdl-label">Derrotas · {((currentData.losses / currentData.total_games * 100) || 0).toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* Visualizações Gráficas de Aproveitamento */}
            <div className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                
                {/* Painel de Clássicos */}
                <div className="panel-card" style={{ marginBottom: 0 }}>
                  <h3 className="panel-title" style={{ fontSize: '1.2rem' }}>
                    <Activity className="panel-title-icon" size={20} />
                    Desempenho em Clássicos
                  </h3>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                    {['PALMEIRAS', 'SÃO PAULO', 'SANTOS'].map(rival => {
                      const data = summaryData.by_opponent[rival] || { win_percentage: 0, wins: 0, draws: 0, losses: 0, total_games: 0 };
                      return (
                        <div key={rival} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{rival}</span>
                            <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: '1.2rem', color: 'var(--vermelho)' }}>{data.win_percentage.toFixed(1)}%</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-quaternary)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${data.win_percentage}%`, height: '100%', backgroundColor: 'var(--vermelho)', borderRadius: '4px' }}></div>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {data.total_games} Jogos: {data.wins}V · {data.draws}E · {data.losses}D
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Line Chart - Evolução Financeira Anual (Geral) */}
                {!selectedOpponent && selectedYear === 'Todos' && (
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
                          <XAxis dataKey="year" stroke="var(--text-secondary)" fontSize={11} formatter={(y) => `20${y}`} />
                          <YAxis yAxisId="left" hide={true} />
                          <YAxis yAxisId="right" orientation="right" hide={true} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#2E2E2E', color: '#FFF' }}
                            formatter={(value, name) => {
                              if (name === "Receita Anual") return [`R$ ${(value / 1000000).toFixed(1)}M`, "Receita Anual"];
                              return [`R$ ${value.toFixed(1)}`, "Ticket Médio"];
                            }}
                          />
                          <Line yAxisId="left" type="monotone" dataKey="revenue" name="Receita Anual" stroke="#C8232C" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                          <Line yAxisId="right" type="monotone" dataKey="ticket_price" name="Ticket Médio" stroke="var(--ouro)" strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Destaques de Recordes & Marcos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginTop: '2.5rem' }}>
              {/* Central Box for Invincibility Streak */}
              {!selectedOpponent && selectedYear === 'Todos' && (
                <div className="panel-card reveal" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '5px solid var(--vermelho)' }}>
                  <Sparkles size={48} style={{ color: 'var(--vermelho)', flexShrink: 0 }} />
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
                <div className="panel-card reveal" style={{ marginBottom: 0 }}>
                  <h2 className="panel-title">
                    <Trophy className="panel-title-icon" size={24} />
                    Recordes e Estatísticas do Estádio
                  </h2>
                  <div className="milestones-grid" style={{ marginTop: '1rem' }}>
                    <div className="milestone-box" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                      <div className="milestone-title" style={{ justifyContent: 'center', borderBottom: 'none', paddingBottom: 0, marginBottom: '0.5rem' }}>
                        <Users size={18} />
                        Público Recorde
                      </div>
                      <div style={{ textAlign: 'center', fontFamily: 'Barlow Condensed', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '1rem' }}>
                        {records.highest_attendance.publico.toLocaleString('pt-BR')}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{records.highest_attendance.adversario} ({records.highest_attendance.placar})</div>
                        <div>{records.highest_attendance.data} · {records.highest_attendance.campeonato}</div>
                      </div>
                    </div>

                    <div className="milestone-box" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                      <div className="milestone-title" style={{ justifyContent: 'center', borderBottom: 'none', paddingBottom: 0, marginBottom: '0.5rem' }}>
                        <DollarSign size={18} />
                        Maior Bilheteria
                      </div>
                      <div style={{ textAlign: 'center', fontFamily: 'Barlow Condensed', fontSize: '2.5rem', fontWeight: 900, color: 'var(--ouro)', lineHeight: 1, marginBottom: '1rem' }}>
                        {records.highest_revenue.renda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{records.highest_revenue.adversario} ({records.highest_revenue.placar})</div>
                        <div>{records.highest_revenue.data} · {records.highest_revenue.campeonato}</div>
                      </div>
                    </div>

                    <div className="milestone-box" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                      <div className="milestone-title" style={{ justifyContent: 'center', borderBottom: 'none', paddingBottom: 0, marginBottom: '0.5rem' }}>
                        <Trophy size={18} />
                        Maior Goleada
                      </div>
                      <div style={{ textAlign: 'center', fontFamily: 'Barlow Condensed', fontSize: '2.5rem', fontWeight: 900, color: 'var(--vermelho)', lineHeight: 1, marginBottom: '1rem' }}>
                        COR {records.biggest_win.placar}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>contra {records.biggest_win.adversario} (+{records.biggest_win.saldo} gols)</div>
                        <div>{records.biggest_win.data} · {records.biggest_win.campeonato}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="panel-card reveal" style={{ marginBottom: 0 }}>
                  <h2 className="panel-title">
                    <Sparkles className="panel-title-icon" size={24} />
                    Marcos Históricos (Milestones)
                  </h2>
                  <div className="milestones-grid" style={{ marginTop: '1rem' }}>
                    <div className="milestone-box" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                      <div className="milestone-title" style={{ justifyContent: 'center', borderBottom: 'none', paddingBottom: 0, marginBottom: '0.5rem' }}>
                        <Calendar size={18} />
                        Partida Inaugural
                      </div>
                      <div style={{ textAlign: 'center', fontFamily: 'Barlow Condensed', fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '1rem' }}>
                        {milestones.first_game.data.split('/')[2]}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>COR {milestones.first_game.placar} {milestones.first_game.adversario}</div>
                        <div>{milestones.first_game.data} · {milestones.first_game.publico.toLocaleString('pt-BR')} pagantes</div>
                      </div>
                    </div>

                    {milestones.first_cor_goal && milestones.first_cor_goal.jogador ? (
                      <div className="milestone-box" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                        <div className="milestone-title" style={{ justifyContent: 'center', borderBottom: 'none', paddingBottom: 0, marginBottom: '0.5rem' }}>
                          <Goal size={18} />
                          Primeiro Gol na Arena
                        </div>
                        <div style={{ textAlign: 'center', fontFamily: 'Barlow Condensed', fontSize: '2.5rem', fontWeight: 900, color: 'var(--vermelho)', lineHeight: 1, marginBottom: '1rem', textTransform: 'uppercase' }}>
                          {milestones.first_cor_goal.jogador}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>aos {milestones.first_cor_goal.minuto}' contra {milestones.first_cor_goal.adversario}</div>
                          <div>{milestones.first_cor_goal.data} · Placar Final: {milestones.first_cor_goal.placar_final}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="milestone-box">
                        <div className="milestone-title">
                          <Goal size={18} />
                          Primeiro Gol do Corinthians
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>
                          <ShieldAlert size={24} style={{ display: 'block', margin: '0 auto 0.5rem', color: 'var(--vermelho)' }} />
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
