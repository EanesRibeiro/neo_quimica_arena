/**
 * Utilitário isolado para cálculo de probabilidade.
 */
export function calculateNaiveBayes(freqData, inputs) {
  const { competition, dayOfWeek, period, attendanceRange } = inputs;
  const key = `${competition}|${dayOfWeek}|${period}|${attendanceRange}`;
  const directMatch = freqData.combinations[key];
  const threshold = 5; // Limite mínimo de jogos para amostragem direta

  if (directMatch && directMatch.total >= threshold) {
    const total = directMatch.total;
    return {
      probabilities: {
        V: (directMatch.V / total) * 100,
        E: (directMatch.E / total) * 100,
        D: (directMatch.D / total) * 100
      },
      methodology: 'Amostragem Direta (Histórico Exato)',
      sampleSize: total
    };
  }

  // Fallback para Naive Bayes com Suavização de Laplace (alpha = 0.5)
  const alpha = 0.5;
  const totalGames = freqData.totals.total;
  const countV = freqData.totals.V;
  const countE = freqData.totals.E;
  const countD = freqData.totals.D;

  const competitionsList = Object.keys(freqData.byCompetition);
  const nComp = competitionsList.length;
  const nDay = 7;
  const nPeriod = 3;
  const nAttendance = 4;

  const pV_prior = (countV + alpha) / (totalGames + 3 * alpha);
  const pE_prior = (countE + alpha) / (totalGames + 3 * alpha);
  const pD_prior = (countD + alpha) / (totalGames + 3 * alpha);

  const getFeatureProb = (featureMap, val, classCount, numCategories) => {
    const item = featureMap[val];
    const matchCount = item ? item[classCount] || 0 : 0;
    const totalClass = classCount === 'V' ? countV : (classCount === 'E' ? countE : countD);
    return (matchCount + alpha) / (totalClass + numCategories * alpha);
  };

  const pComp_V = getFeatureProb(freqData.byCompetition, competition, 'V', nComp);
  const pDay_V = getFeatureProb(freqData.byDayOfWeek, dayOfWeek, 'V', nDay);
  const pPeriod_V = getFeatureProb(freqData.byPeriod, period, 'V', nPeriod);
  const pAttendance_V = getFeatureProb(freqData.byAttendanceRange, attendanceRange, 'V', nAttendance);

  const pComp_E = getFeatureProb(freqData.byCompetition, competition, 'E', nComp);
  const pDay_E = getFeatureProb(freqData.byDayOfWeek, dayOfWeek, 'E', nDay);
  const pPeriod_E = getFeatureProb(freqData.byPeriod, period, 'E', nPeriod);
  const pAttendance_E = getFeatureProb(freqData.byAttendanceRange, attendanceRange, 'E', nAttendance);

  const pComp_D = getFeatureProb(freqData.byCompetition, competition, 'D', nComp);
  const pDay_D = getFeatureProb(freqData.byDayOfWeek, dayOfWeek, 'D', nDay);
  const pPeriod_D = getFeatureProb(freqData.byPeriod, period, 'D', nPeriod);
  const pAttendance_D = getFeatureProb(freqData.byAttendanceRange, attendanceRange, 'D', nAttendance);

  const scoreV = pV_prior * pComp_V * pDay_V * pPeriod_V * pAttendance_V;
  const scoreE = pE_prior * pComp_E * pDay_E * pPeriod_E * pAttendance_E;
  const scoreD = pD_prior * pComp_D * pDay_D * pPeriod_D * pAttendance_D;

  const sumScores = scoreV + scoreE + scoreD;

  return {
    probabilities: {
      V: (scoreV / sumScores) * 100,
      E: (scoreE / sumScores) * 100,
      D: (scoreD / sumScores) * 100
    },
    methodology: 'Classificador Naive Bayes (Fallback)',
    sampleSize: directMatch ? directMatch.total : 0
  };
}
