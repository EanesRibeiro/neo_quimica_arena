import React, { useState, useEffect } from 'react';
import { Calculator, Info, HelpCircle } from 'lucide-react';
import freqData from '../data/calculator_frequencies.json';

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

  const calculateProbabilities = () => {
    const key = `${competition}|${dayOfWeek}|${period}|${attendanceRange}`;
    const directMatch = freqData.combinations[key];
    const threshold = 5; // Limite mínimo de jogos para amostragem direta

    if (directMatch && directMatch.total >= threshold) {
      // 1. Amostragem Direta (Frequência Empírica)
      const total = directMatch.total;
      setProbabilities({
        V: (directMatch.V / total) * 100,
        E: (directMatch.E / total) * 100,
        D: (directMatch.D / total) * 100
      });
      setMethodology('Amostragem Direta (Histórico Exato)');
      setSampleSize(total);
    } else {
      // 2. Fallback para Naive Bayes com Suavização de Laplace (alpha = 0.5)
      const alpha = 0.5;
      
      const totalGames = freqData.totals.total;
      const countV = freqData.totals.V;
      const countE = freqData.totals.E;
      const countD = freqData.totals.D;
      
      // Quantidade de categorias de cada feature
      const nComp = competitions.length;
      const nDay = 7;
      const nPeriod = 3;
      const nAttendance = 4;

      // Calcular probabilidade a priori P(C)
      const pV_prior = (countV + alpha) / (totalGames + 3 * alpha);
      const pE_prior = (countE + alpha) / (totalGames + 3 * alpha);
      const pD_prior = (countD + alpha) / (totalGames + 3 * alpha);

      // Função auxiliar para calcular P(X_i | C)
      const getFeatureProb = (featureMap, val, classCount, numCategories) => {
        const item = featureMap[val];
        const matchCount = item ? item[classCount] || 0 : 0;
        const totalClass = classCount === 'V' ? countV : (classCount === 'E' ? countE : countD);
        return (matchCount + alpha) / (totalClass + numCategories * alpha);
      };

      // Probabilidades condicionais para Vitória (V)
      const pComp_V = getFeatureProb(freqData.byCompetition, competition, 'V', nComp);
      const pDay_V = getFeatureProb(freqData.byDayOfWeek, dayOfWeek, 'V', nDay);
      const pPeriod_V = getFeatureProb(freqData.byPeriod, period, 'V', nPeriod);
      const pAttendance_V = getFeatureProb(freqData.byAttendanceRange, attendanceRange, 'V', nAttendance);

      // Probabilidades condicionais para Empate (E)
      const pComp_E = getFeatureProb(freqData.byCompetition, competition, 'E', nComp);
      const pDay_E = getFeatureProb(freqData.byDayOfWeek, dayOfWeek, 'E', nDay);
      const pPeriod_E = getFeatureProb(freqData.byPeriod, period, 'E', nPeriod);
      const pAttendance_E = getFeatureProb(freqData.byAttendanceRange, attendanceRange, 'E', nAttendance);

      // Probabilidades condicionais para Derrota (D)
      const pComp_D = getFeatureProb(freqData.byCompetition, competition, 'D', nComp);
      const pDay_D = getFeatureProb(freqData.byDayOfWeek, dayOfWeek, 'D', nDay);
      const pPeriod_D = getFeatureProb(freqData.byPeriod, period, 'D', nPeriod);
      const pAttendance_D = getFeatureProb(freqData.byAttendanceRange, attendanceRange, 'D', nAttendance);

      // Calcular score final Naive Bayes (a posteriori proporcional)
      const scoreV = pV_prior * pComp_V * pDay_V * pPeriod_V * pAttendance_V;
      const scoreE = pE_prior * pComp_E * pDay_E * pPeriod_E * pAttendance_E;
      const scoreD = pD_prior * pComp_D * pDay_D * pPeriod_D * pAttendance_D;

      const sumScores = scoreV + scoreE + scoreD;

      // Normalizar probabilidades para somar 100%
      setProbabilities({
        V: (scoreV / sumScores) * 100,
        E: (scoreE / sumScores) * 100,
        D: (scoreD / sumScores) * 100
      });
      setMethodology('Classificador Naive Bayes (Fallback)');
      setSampleSize(directMatch ? directMatch.total : 0);
    }
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
