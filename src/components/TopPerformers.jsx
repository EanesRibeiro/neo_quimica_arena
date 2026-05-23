import React, { useState } from 'react';
import { Award, Users, Trophy, DollarSign, Goal, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import performersData from '../data/top_performers.json';

const TopPerformers = () => {
  const [activeTab, setActiveTab] = useState('players'); // 'players' ou 'matches'
  const [playerSubTab, setPlayerSubTab] = useState('goals'); // 'goals', 'assists', 'appearances', 'win_rate'
  const [matchSubTab, setMatchSubTab] = useState('attendance'); // 'attendance', 'revenue', 'wins'

  // Calcular o máximo de gols e assistências para a barra de progresso
  const maxGoals = Math.max(...performersData.players.top_scorers.map(p => p.gols), 1);
  const maxAssists = Math.max(...performersData.players.top_assists.map(p => p.assistencias), 1);

  return (
    <div className="panel-card reveal">
      <h2 className="panel-title">
        <Trophy className="panel-title-icon" size={24} />
        Hall da Fama &amp; Recordes da Arena
      </h2>

      <div className="sub-tabs">
        <button 
          className={`sub-tab-item ${activeTab === 'players' ? 'active' : ''}`}
          onClick={() => setActiveTab('players')}
        >
          Estatísticas de Jogadores
        </button>
        <button 
          className={`sub-tab-item ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          Recordes de Partidas
        </button>
      </div>

      {activeTab === 'players' && (
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Líderes históricos individuais que deixaram sua marca no gramado da Arena. Explore os artilheiros, assistentes de gala, atletas com mais jogos e os de melhor rendimento com o manto sagrado.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button 
              className={`sub-tab-item ${playerSubTab === 'goals' ? 'active' : ''}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '4px' }}
              onClick={() => setPlayerSubTab('goals')}
            >
              <Goal size={14} style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }} />
              Gols Marcados (Artilharia)
            </button>
            <button 
              className={`sub-tab-item ${playerSubTab === 'assists' ? 'active' : ''}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '4px' }}
              onClick={() => setPlayerSubTab('assists')}
            >
              <Award size={14} style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }} />
              Assistências (Garçons)
            </button>
            <button 
              className={`sub-tab-item ${playerSubTab === 'appearances' ? 'active' : ''}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '4px' }}
              onClick={() => setPlayerSubTab('appearances')}
            >
              <Users size={14} style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }} />
              Presenças (Jogos)
            </button>
            <button 
              className={`sub-tab-item ${playerSubTab === 'win_rate' ? 'active' : ''}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '4px' }}
              onClick={() => setPlayerSubTab('win_rate')}
            >
              <Star size={14} style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }} />
              Melhor Rendimento (&ge; 30 jogos)
            </button>
          </div>

          {playerSubTab === 'goals' && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Jogador</th>
                    <th>Posição Campo</th>
                    <th>Jogos Disputados</th>
                    <th style={{ textAlign: 'right' }}>Gols na Arena</th>
                  </tr>
                </thead>
                <tbody>
                  {performersData.players.top_scorers.map((player, index) => {
                    const progress = (player.gols / maxGoals) * 100;
                    return (
                      <tr key={player.jogador}>
                        <td className="table-rank">#{index + 1}</td>
                        <td style={{ position: 'relative', paddingBottom: '1.25rem' }}>
                          <span className="table-highlight">{player.jogador}</span>
                          <div style={{ position: 'absolute', bottom: '0.5rem', left: '1rem', right: '1rem', height: '4px', background: 'var(--md-sys-color-surface-container-highest)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--md-sys-color-primary)' }}></div>
                          </div>
                        </td>
                        <td>{player.posicao}</td>
                        <td>{player.jogos}</td>
                        <td style={{ textAlign: 'right', color: 'var(--md-sys-color-primary)', fontWeight: 'bold', fontSize: '1.05rem' }}>
                          {player.gols}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {playerSubTab === 'assists' && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Jogador</th>
                    <th>Posição Campo</th>
                    <th>Jogos Disputados</th>
                    <th style={{ textAlign: 'right' }}>Assistências na Arena</th>
                  </tr>
                </thead>
                <tbody>
                  {performersData.players.top_assists.map((player, index) => {
                    const progress = (player.assistencias / maxAssists) * 100;
                    return (
                      <tr key={player.jogador}>
                        <td className="table-rank">#{index + 1}</td>
                        <td style={{ position: 'relative', paddingBottom: '1.25rem' }}>
                          <span className="table-highlight">{player.jogador}</span>
                          <div style={{ position: 'absolute', bottom: '0.5rem', left: '1rem', right: '1rem', height: '4px', background: 'var(--md-sys-color-surface-container-highest)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--md-sys-color-secondary-container)' }}></div>
                          </div>
                        </td>
                        <td>{player.posicao}</td>
                        <td>{player.jogos}</td>
                        <td style={{ textAlign: 'right', color: 'var(--ouro)', fontWeight: 'bold', fontSize: '1.05rem' }}>
                          {player.assistencias}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {playerSubTab === 'appearances' && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Jogador</th>
                    <th>Posição Campo</th>
                    <th>Total de Jogos</th>
                    <th>Gols Marcados</th>
                    <th style={{ textAlign: 'right' }}>Aproveitamento de Pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {performersData.players.most_appearances.map((player, index) => (
                    <tr key={player.jogador}>
                      <td className="table-rank">#{index + 1}</td>
                      <td className="table-highlight">{player.jogador}</td>
                      <td>{player.posicao}</td>
                      <td style={{ fontWeight: 600 }}>{player.jogos}</td>
                      <td>{player.gols}</td>
                      <td style={{ textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {player.aproveitamento.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {playerSubTab === 'win_rate' && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Jogador</th>
                    <th>Posição Campo</th>
                    <th>Jogos Disputados</th>
                    <th style={{ textAlign: 'right' }}>Aproveitamento de Pontos na Arena</th>
                  </tr>
                </thead>
                <tbody>
                  {performersData.players.best_win_rates_min_30_games.map((player, index) => (
                    <tr key={player.jogador}>
                      <td className="table-rank">#{index + 1}</td>
                      <td className="table-highlight">{player.jogador}</td>
                      <td>{player.posicao}</td>
                      <td>{player.jogos}</td>
                      <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 'bold', fontSize: '1.05rem' }}>
                        {player.aproveitamento.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'matches' && (
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            Recordes históricos coletivos da Arena Corinthians. Conheça as partidas que registraram o maior número de torcedores pagantes, arrecadações milionárias e as goleadas mais sonoras aplicadas em Itaquera.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <button 
              className={`sub-tab-item ${matchSubTab === 'attendance' ? 'active' : ''}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '4px' }}
              onClick={() => setMatchSubTab('attendance')}
            >
              <Users size={14} style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }} />
              Público Recorde
            </button>
            <button 
              className={`sub-tab-item ${matchSubTab === 'revenue' ? 'active' : ''}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '4px' }}
              onClick={() => setMatchSubTab('revenue')}
            >
              <DollarSign size={14} style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }} />
              Maiores Rendas
            </button>
            <button 
              className={`sub-tab-item ${matchSubTab === 'wins' ? 'active' : ''}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '4px' }}
              onClick={() => setMatchSubTab('wins')}
            >
              <Trophy size={14} style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }} />
              Maiores Goleadas
            </button>
          </div>

          {matchSubTab === 'attendance' && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Adversário</th>
                    <th>Placar Final</th>
                    <th>Campeonato</th>
                    <th>Data</th>
                    <th style={{ textAlign: 'right' }}>Público Pagante</th>
                  </tr>
                </thead>
                <tbody>
                  {performersData.matches.highest_attendance.map((match, index) => (
                    <tr key={match.jogo}>
                      <td className="table-rank">#{index + 1}</td>
                      <td className="table-highlight">{match.adversario}</td>
                      <td>{match.placar}</td>
                      <td>{match.campeonato}</td>
                      <td>{match.data}</td>
                      <td style={{ textAlign: 'right', color: 'var(--ouro)', fontWeight: 'bold' }}>
                        {match.publico.toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {matchSubTab === 'revenue' && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Adversário</th>
                    <th>Placar Final</th>
                    <th>Campeonato</th>
                    <th>Data</th>
                    <th style={{ textAlign: 'right' }}>Arrecadação (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {performersData.matches.highest_revenue.map((match, index) => (
                    <tr key={match.jogo}>
                      <td className="table-rank">#{index + 1}</td>
                      <td className="table-highlight">{match.adversario}</td>
                      <td>{match.placar}</td>
                      <td>{match.campeonato}</td>
                      <td>{match.data}</td>
                      <td style={{ textAlign: 'right', color: 'var(--ouro)', fontWeight: 'bold' }}>
                        {match.renda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {matchSubTab === 'wins' && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Posição</th>
                    <th>Adversário</th>
                    <th>Placar Final</th>
                    <th>Campeonato</th>
                    <th>Data</th>
                    <th style={{ textAlign: 'right' }}>Saldo de Gols</th>
                  </tr>
                </thead>
                <tbody>
                  {performersData.matches.biggest_wins.map((match, index) => (
                    <tr key={match.jogo}>
                      <td className="table-rank">#{index + 1}</td>
                      <td className="table-highlight">{match.adversario}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>{match.placar}</td>
                      <td>{match.campeonato}</td>
                      <td>{match.data}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--success)' }}>
                        +{match.saldo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TopPerformers;
