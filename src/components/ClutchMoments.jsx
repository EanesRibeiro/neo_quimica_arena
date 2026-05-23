import React, { useState } from 'react';
import { Clock, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import clutchData from '../data/clutch_moments.json';

const ClutchMoments = () => {
  const [activeTab, setActiveTab] = useState('distribution'); // 'distribution' ou 'turnarounds'
  
  const intervals = ["1-15", "16-30", "31-45", "45+", "46-60", "61-75", "76-90", "90+"];
  
  // Encontrar o valor máximo para escala das barras
  const maxGoals = Math.max(
    ...intervals.flatMap(interval => [
      clutchData.goals_by_interval[interval].scored,
      clutchData.goals_by_interval[interval].conceded
    ])
  );

  return (
    <div className="panel-card">
      <h2 className="panel-title">
        <Clock className="panel-title-icon" size={24} />
        Clutch Moments &amp; Análise Temporal
      </h2>

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
            <div className="chart-container">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-gold)' }}>
                Minutos e Intervalos de Gols
              </h3>
              
              {intervals.map((interval) => {
                const item = clutchData.goals_by_interval[interval];
                const scoredPercent = (item.scored / maxGoals) * 100;
                const concededPercent = (item.conceded / maxGoals) * 100;
                
                return (
                  <div key={interval} className="bar-chart-row">
                    <div className="chart-label">{interval}'</div>
                    <div className="chart-bars-wrap">
                      {/* Barra de gols marcados */}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div 
                          className="chart-bar-single scored" 
                          style={{ width: `${scoredPercent}%`, minWidth: item.scored > 0 ? '4px' : '0' }}
                        ></div>
                        <span className="chart-val" style={{ color: 'var(--success)' }}>{item.scored}</span>
                      </div>
                      
                      {/* Barra de gols sofridos */}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div 
                          className="chart-bar-single conceded" 
                          style={{ width: `${concededPercent}%`, minWidth: item.conceded > 0 ? '4px' : '0' }}
                        ></div>
                        <span className="chart-val" style={{ color: 'var(--danger)' }}>{item.conceded}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color scored"></div>
                  <span>Gols Marcados ({
                    intervals.reduce((acc, i) => acc + clutchData.goals_by_interval[i].scored, 0)
                  })</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color conceded"></div>
                  <span>Gols Sofridos ({
                    intervals.reduce((acc, i) => acc + clutchData.goals_by_interval[i].conceded, 0)
                  })</span>
                </div>
              </div>
            </div>

            <div className="prob-info-box" style={{ borderLeftColor: 'var(--accent-gold)', height: 'fit-content' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-gold)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} />
                Momentos de Pressão (Estatísticas)
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                O Corinthians costuma ser letal no final dos jogos: o intervalo de <span style={{ color: 'var(--success)', fontWeight: 700 }}>76-90 minutos</span> e os acréscimos do segundo tempo (<span style={{ color: 'var(--success)', fontWeight: 700 }}>90+</span>) concentram uma enorme parcela das redes balançadas na Arena.
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Defensivamente, o Corinthians demonstra solidez no início de cada tempo, sofrendo menos gols nos primeiros 15 minutos de partida (<span style={{ color: 'var(--danger)', fontWeight: 700 }}>1-15'</span>) e após a volta do intervalo (<span style={{ color: 'var(--danger)', fontWeight: 700 }}>46-60'</span>).
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
              <div className="stat-card win" style={{ padding: '1.25rem' }}>
                <div className="stat-card-header" style={{ marginBottom: '0.5rem' }}>
                  <span>Viradas a Favor</span>
                  <ChevronUp size={18} style={{ color: 'var(--success)' }} />
                </div>
                <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                  {clutchData.turnarounds.wins_after_conceding_first.count}
                </div>
                <div className="stat-sub">
                  ({clutchData.turnarounds.wins_after_conceding_first.percentage_of_wins.toFixed(1)}% das vitórias na Arena)
                </div>
              </div>

              <div className="stat-card loss" style={{ padding: '1.25rem' }}>
                <div className="stat-card-header" style={{ marginBottom: '0.5rem' }}>
                  <span>Viradas Contra</span>
                  <ChevronDown size={18} style={{ color: 'var(--danger)' }} />
                </div>
                <div className="stat-value" style={{ fontSize: '1.75rem' }}>
                  {clutchData.turnarounds.losses_after_scoring_first.count}
                </div>
                <div className="stat-sub">
                  ({clutchData.turnarounds.losses_after_scoring_first.percentage_of_losses.toFixed(1)}% das derrotas na Arena)
                </div>
              </div>
            </div>

            <div className="prob-info-box" style={{ borderLeftColor: 'var(--success)', height: 'fit-content' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--success)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={18} />
                Mítica da Invencibilidade
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                O baixíssimo índice de viradas contra ({clutchData.turnarounds.losses_after_scoring_first.count} jogos em {clutchData.turnarounds.wins_after_conceding_first.featured_games[0] ? 'toda a história' : '400 jogos'}) comprova a força mental do Corinthians na Neo Química Arena: uma vez à frente no placar, é extremamente improvável que o time perca os 3 pontos jogando em Itaquera.
              </p>
            </div>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ChevronUp size={20} style={{ color: 'var(--success)' }} />
            Viradas Históricas do Corinthians na Arena (Últimos Confrontos)
          </h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Jogo</th>
                  <th>Adversário</th>
                  <th>Placar Final</th>
                  <th>Campeonato</th>
                  <th>Data</th>
                  <th>Público</th>
                </tr>
              </thead>
              <tbody>
                {clutchData.turnarounds.wins_after_conceding_first.featured_games.slice().reverse().map((game) => (
                  <tr key={game.jogo}>
                    <td className="table-rank">#{game.jogo}</td>
                    <td className="table-highlight">{game.adversario}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{game.placar}</td>
                    <td>{game.campeonato}</td>
                    <td>{game.data}</td>
                    <td>{game.publico.toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {clutchData.turnarounds.losses_after_scoring_first.featured_games.length > 0 && (
            <>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ChevronDown size={20} style={{ color: 'var(--danger)' }} />
                Viradas Sofridas em Itaquera (Registros Históricos)
              </h3>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Jogo</th>
                      <th>Adversário</th>
                      <th>Placar Final</th>
                      <th>Campeonato</th>
                      <th>Data</th>
                      <th>Público</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clutchData.turnarounds.losses_after_scoring_first.featured_games.slice().reverse().map((game) => (
                      <tr key={game.jogo}>
                        <td className="table-rank">#{game.jogo}</td>
                        <td className="table-highlight">{game.adversario}</td>
                        <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{game.placar}</td>
                        <td>{game.campeonato}</td>
                        <td>{game.data}</td>
                        <td>{game.publico.toLocaleString('pt-BR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ClutchMoments;
