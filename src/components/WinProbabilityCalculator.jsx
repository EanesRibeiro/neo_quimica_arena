import React, { useState, useEffect } from 'react';
import { Calculator, Info, HelpCircle } from 'lucide-react';
import freqData from '../data/calculator_frequencies.json';
import { calculateNaiveBayes } from '../utils/naiveBayes';
import ProbabilityGauge from './ProbabilityGauge';

const WinProbabilityCalculator = () => {
  const [competition, setCompetition] = useState('BRASILEIRO');
  const [dayOfWeek, setDayOfWeek] = useState('DOM');
  const [period, setPeriod] = useState('Tarde');
  const [attendanceRange, setAttendanceRange] = useState('range35kTo45k');
  
  const [probabilities, setProbabilities] = useState({ V: 0, E: 0, D: 0 });
  const [methodology, setMethodology] = useState('Amostragem Direta');
  const [sampleSize, setSampleSize] = useState(0);

  // Listas de opções carregadas do JSON
  const competitions = Object.keys(freqData.byCompetition).sort();
  const daysOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  const periods = ['Manhã', 'Tarde', 'Noite'];
  
  const attendanceRanges = [
    { key: 'under25k', label: 'Menos de 25 mil (< 25k)' },
    { key: 'range25kTo35k', label: '25 a 35 mil (25k - 35k)' },
    { key: 'range35kTo45k', label: '35 a 45 mil (35k - 45k)' },
    { key: 'over45k', label: 'Mais de 45 mil (> 45k)' }
  ];

  const quickMatches = [
    {
      label: 'Libertadores Noturna',
      config: { competition: 'LIBERTADORES', dayOfWeek: 'QUA', period: 'Noite', attendanceRange: 'range35kTo45k' }
    },
    {
      label: 'Dérbi Casa Cheia',
      config: { competition: 'BRASILEIRO', dayOfWeek: 'DOM', period: 'Tarde', attendanceRange: 'over45k' }
    },
    {
      label: 'Copa do Brasil Decisão',
      config: { competition: 'COPA DO BRASIL', dayOfWeek: 'QUA', period: 'Noite', attendanceRange: 'range35kTo45k' }
    },
    {
      label: 'Paulistão de Manhã',
      config: { competition: 'PAULISTA', dayOfWeek: 'DOM', period: 'Manhã', attendanceRange: 'range25kTo35k' }
    }
  ];

  const applyQuickMatch = (config) => {
    setCompetition(config.competition);
    setDayOfWeek(config.dayOfWeek);
    setPeriod(config.period);
    setAttendanceRange(config.attendanceRange);
  };

  const calculateProbabilities = () => {
    const result = calculateNaiveBayes(freqData, {
      competition,
      dayOfWeek,
      period,
      attendanceRange
    });
    setProbabilities(result.probabilities);
    setMethodology(result.methodology);
    setSampleSize(result.sampleSize);
  };

  useEffect(() => {
    calculateProbabilities();
  }, [competition, dayOfWeek, period, attendanceRange]);

  return (
    <div className="panel-card">
      <h2 className="panel-title">
        <Calculator className="panel-title-icon" size={24} />
        Calculadora de Probabilidade de Jogo
      </h2>
      
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Selecione os parâmetros abaixo para calcular a probabilidade estimada do Corinthians vencer, empatar ou perder o próximo confronto na Neo Química Arena com base no histórico estatístico real.
      </p>

      {/* Atalhos Rápidos (Quick Matches) */}
      <div className="quick-matches-container" style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginRight: '1rem', textTransform: 'uppercase' }}>Atalhos Rápidos:</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
          {quickMatches.map((qm, i) => {
            const isActive = 
              competition === qm.config.competition &&
              dayOfWeek === qm.config.dayOfWeek &&
              period === qm.config.period &&
              attendanceRange === qm.config.attendanceRange;
            return (
              <button
                key={i}
                type="button"
                onClick={() => applyQuickMatch(qm.config)}
                className={`sub-tab-item ${isActive ? 'active' : ''}`}
                style={{
                  border: '1px solid var(--bg-tertiary)',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.8rem',
                  backgroundColor: isActive ? '#C8232C' : 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  borderRadius: 'var(--border-radius)',
                  transition: 'var(--transition)'
                }}
              >
                {qm.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Campeonato</label>
          <select 
            className="select-control"
            value={competition} 
            onChange={(e) => setCompetition(e.target.value)}
          >
            {competitions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Dia da Semana</label>
          <select 
            className="select-control"
            value={dayOfWeek} 
            onChange={(e) => setDayOfWeek(e.target.value)}
          >
            {daysOfWeek.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Período do Dia</label>
          <select 
            className="select-control"
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
          >
            {periods.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Público Estimado</label>
          <select 
            className="select-control"
            value={attendanceRange} 
            onChange={(e) => setAttendanceRange(e.target.value)}
          >
            {attendanceRanges.map((r) => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="prob-results-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', alignItems: 'center' }}>
          <ProbabilityGauge probability={probabilities.V} />

          <div className="prob-bars">
            <div className="prob-bar-group">
              <div className="prob-label-row">
                <span>Vitória do Corinthians</span>
                <span style={{ color: 'var(--success)' }}>{probabilities.V.toFixed(1)}%</span>
              </div>
              <div className="prob-bar-track">
                <div 
                  className="prob-bar-fill win" 
                  style={{ width: `${probabilities.V}%` }}
                ></div>
              </div>
            </div>

            <div className="prob-bar-group">
              <div className="prob-label-row">
                <span>Empate</span>
                <span style={{ color: 'var(--warning)' }}>{probabilities.E.toFixed(1)}%</span>
              </div>
              <div className="prob-bar-track">
                <div 
                  className="prob-bar-fill draw" 
                  style={{ width: `${probabilities.E}%` }}
                ></div>
              </div>
            </div>

            <div className="prob-bar-group">
              <div className="prob-label-row">
                <span>Derrota do Corinthians</span>
                <span style={{ color: 'var(--danger)' }}>{probabilities.D.toFixed(1)}%</span>
              </div>
              <div className="prob-bar-track">
                <div 
                  className="prob-bar-fill loss" 
                  style={{ width: `${probabilities.D}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="prob-info-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-gold)' }}>
            <Info size={18} />
            Metodologia Aplicada
          </div>
          <div style={{ fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 600 }}>Método: </span>
            {methodology}
          </div>
          <div style={{ fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 600 }}>Jogos da combinação exata: </span>
            {sampleSize}
          </div>
          <div className="info-alert">
            <HelpCircle size={16} className="info-alert-icon" />
            <span>
              {sampleSize >= 5 
                ? "Utilizando frequência direta de resultados no histórico para a combinação exata de filtros selecionados."
                : "Amostragem histórica baixa (< 5 jogos). Ativada a modelagem probabilística de Naive Bayes para estimativa baseada no comportamento marginal das variáveis."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinProbabilityCalculator;
