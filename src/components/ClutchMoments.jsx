import React, { useState } from 'react';
import { Clock, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import clutchData from '../data/clutch_moments.json';

const CORES = {
  barPadrao:  '#595959',  // cinza escuro para barras normais
  barPico:    '#F5F5F5',  // BRANCO/OURO para pico de gols
  barContra:  '#2E2E2E',  // preto médio para gols sofridos
  grid:       '#2E2E2E',
  eixo:       '#888888',
  tooltipBg:  '#0A0A0A',
  tooltipBrd: '#2E2E2E',
};

const PEAK_THRESHOLD = 0.75;

const getBarColor = (value, data, key) => {
  const max = Math.max(...data.map(d => d[key]));
  return value >= max * PEAK_THRESHOLD ? CORES.barPico : CORES.barPadrao;
};

const ClutchMoments = () => {
  const [activeTab, setActiveTab] = useState('distribution'); // 'distribution' ou 'turnarounds'
  
  const intervals = ["1-15", "16-30", "31-45", "45+", "46-60", "61-75", "76-90", "90+"];
  
  // Encontrar o pico de gols marcados
  const maxScored = Math.max(...intervals.map(i => clutchData.goals_by_interval[i].scored));

  // Preparar os dados para o Recharts
  const chartData = intervals.map(interval => {
    const item = clutchData.goals_by_interval[interval];
    return {
      name: `${interval}'`,
      Marcados: item.scored,
      Sofridos: item.conceded
    };
  });

  return (
    <div className="panel-card reveal">
      <div className="section-header">
        <span className="section-label">Moments</span>
        <h2 className="section-title">Clutch Moments &amp; Análise Temporal</h2>
      </div>

      <div className="sub-tabs">
        <button 
          className={`sub-tab-item ${activeTab === 'distribution' ? 'active' : ''}`}
          onClick={() => setActiveTab('distribution')}
        >
          Distribuição de Gols (15 Minutos)
        </button>
        <button 
          className={`sub-tab-item ${activeTab === 'turnarounds' ? 'active' : ''}`}
          onClick={() => setActiveTab('turnarounds')}
        >
          Índice de Viradas
        </button>
      </div>

      {activeTab === 'distribution' && (
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Distribuição detalhada dos gols marcados a favor do Corinthians e gols sofridos na Arena divididos em blocos de 15 minutos. Veja os momentos mais perigosos e os minutos de maior pressão do Timão.
          </p>

          <div className="clutch-grid">
            <div className="chart-container" style={{ minHeight: '350px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-light)' }}>
                Distribuição de Gols por Intervalos
              </h3>
              
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <XAxis dataKey="name" stroke={CORES.eixo} fontSize={12} />
                    <YAxis hide={true} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: CORES.tooltipBg, 
                        borderColor: CORES.tooltipBrd, 
                        borderRadius: '8px',
                        color: '#FFFFFF'
                      }}
                      itemStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#888', fontSize: 13 }} />
                    <Bar dataKey="Marcados" name="Gols Marcados" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-scored-${index}`} fill={getBarColor(entry.Marcados, chartData, 'Marcados')} />
                      ))}
                    </Bar>
                    <Bar dataKey="Sofridos" name="Gols Sofridos" fill={CORES.barContra} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-legend" style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', justifyContent: 'center', fontSize: '0.85rem' }}>
                <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="legend-color" style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: CORES.barPico }}></div>
                  <span>Pico Marcados (Pico &ge; 75%)</span>
                </div>
                <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="legend-color" style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: CORES.barPadrao }}></div>
                  <span>Outros Marcados</span>
                </div>
                <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="legend-color" style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: CORES.barContra }}></div>
                  <span>Sofridos</span>
                </div>
              </div>
            </div>

            <div className="prob-info-box" style={{ borderLeftColor: 'var(--vermelho)', height: 'fit-content' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} />
                Momentos de Pressão (Estatísticas)
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                O Corinthians costuma ser letal no final dos jogos: o intervalo de <span style={{ color: 'var(--vermelho)', fontWeight: 700 }}>76-90 minutos</span> e os acréscimos do segundo tempo (<span style={{ color: 'var(--vermelho)', fontWeight: 700 }}>90+</span>) concentram uma enorme parcela das redes balançadas na Arena.
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Defensivamente, o Corinthians demonstra solidez no início de cada tempo, sofrendo menos gols nos primeiros 15 minutos de partida (<span style={{ color: 'var(--text-light)', fontWeight: 700 }}>1-15'</span>) e após a volta do intervalo (<span style={{ color: 'var(--text-light)', fontWeight: 700 }}>46-60'</span>).
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'turnarounds' && (
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            A força da Fiel: análise das partidas em que o Corinthians esteve atrás no placar e buscou a virada, e as raras ocasiões em que cedeu a vitória na Arena.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="kpi-card" style={{ padding: '1.25rem' }}>
                <div className="kpi-card-header" style={{ marginBottom: '0.5rem', width: '100%' }}>
                  <span>Viradas a Favor</span>
                  <ChevronUp size={18} style={{ color: 'var(--vermelho)' }} />
                </div>
                <div className="kpi-value" style={{ fontSize: '2.25rem', color: 'var(--vermelho)' }}>
                  {clutchData.turnarounds.wins_after_conceding_first.count}
                </div>
                <div className="hs-sub" style={{ textAlign: 'center' }}>
                  ({clutchData.turnarounds.wins_after_conceding_first.percentage_of_wins.toFixed(1)}% das vitórias na Arena)
                </div>
              </div>

              <div className="kpi-card" style={{ padding: '1.25rem' }}>
                <div className="kpi-card-header" style={{ marginBottom: '0.5rem', width: '100%' }}>
                  <span>Viradas Contra</span>
                  <ChevronDown size={18} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <div className="kpi-value" style={{ fontSize: '2.25rem', color: 'var(--text-secondary)' }}>
                  {clutchData.turnarounds.losses_after_scoring_first.count}
                </div>
                <div className="hs-sub" style={{ textAlign: 'center' }}>
                  ({clutchData.turnarounds.losses_after_scoring_first.percentage_of_losses.toFixed(1)}% das derrotas na Arena)
                </div>
              </div>
            </div>

            <div className="prob-info-box" style={{ borderLeftColor: 'var(--vermelho)', height: 'fit-content' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={18} />
                Mítica da Invencibilidade
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                O baixíssimo índice de viradas contra ({clutchData.turnarounds.losses_after_scoring_first.count} jogos em toda a história) comprova a força mental do Corinthians na Neo Química Arena: uma vez à frente no placar, é extremamente improvável que o time perca os 3 pontos jogando em Itaquera.
              </p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ChevronUp size={20} style={{ color: 'var(--vermelho)' }} />
            Viradas Históricas do Corinthians na Arena (Últimos Confrontos)
          </h3>
          
          <div className="match-history-list">
            {clutchData.turnarounds.wins_after_conceding_first.featured_games.slice().reverse().map((game) => (
              <div key={game.jogo} className="match-history-row">
                <div>
                  <span style={{ color: 'var(--ouro)', fontWeight: '900', marginRight: '0.5rem' }}>#{game.jogo}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{game.data}</span>
                </div>
                <div style={{ fontWeight: '700', textAlign: 'center' }}>
                  CORINTHIANS <span style={{ background: 'var(--vermelho-alpha)', color: 'var(--text-primary)', padding: '2px 8px', borderRadius: '4px', margin: '0 8px' }}>{game.placar}</span> {game.adversario}
                </div>
                <div style={{ textTransform: 'uppercase', fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'right' }}>
                  {game.campeonato} · {game.publico.toLocaleString('pt-BR')} fiéis
                </div>
              </div>
            ))}
          </div>

          {clutchData.turnarounds.losses_after_scoring_first.featured_games.length > 0 && (
            <>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ChevronDown size={20} style={{ color: 'var(--text-secondary)' }} />
                Viradas Sofridas em Itaquera (Registros Históricos)
              </h3>
              
              <div className="match-history-list">
                {clutchData.turnarounds.losses_after_scoring_first.featured_games.slice().reverse().map((game) => (
                  <div key={game.jogo} className="match-history-row">
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: '900', marginRight: '0.5rem' }}>#{game.jogo}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{game.data}</span>
                    </div>
                    <div style={{ fontWeight: '700', textAlign: 'center' }}>
                      CORINTHIANS <span style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)', padding: '2px 8px', borderRadius: '4px', margin: '0 8px' }}>{game.placar}</span> {game.adversario}
                    </div>
                    <div style={{ textTransform: 'uppercase', fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'right' }}>
                      {game.campeonato} · {game.publico.toLocaleString('pt-BR')} fiéis
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ClutchMoments;
