import { describe, it, expect } from 'vitest';
import { calculateNaiveBayes } from '../naiveBayes';

// Mock de dados de frequência reduzidos para teste
const mockFreqData = {
  totals: { V: 10, E: 5, D: 5, total: 20 },
  byCompetition: {
    'BRASILEIRO': { V: 8, E: 3, D: 4, total: 15 },
    'COPA': { V: 2, E: 2, D: 1, total: 5 }
  },
  byDayOfWeek: {
    'DOM': { V: 5, E: 2, D: 2, total: 9 }
  },
  byPeriod: {
    'Tarde': { V: 6, E: 3, D: 1, total: 10 }
  },
  byAttendanceRange: {
    'range35kTo45k': { V: 7, E: 2, D: 2, total: 11 }
  },
  combinations: {
    'BRASILEIRO|DOM|Tarde|range35kTo45k': { V: 6, E: 1, D: 0, total: 7 }, // >= 5, amostragem direta
    'COPA|DOM|Tarde|range35kTo45k': { V: 1, E: 1, D: 0, total: 2 } // < 5, fallback
  }
};

describe('naiveBayes math engine', () => {
  it('deve usar amostragem direta quando total de jogos na combinação for >= 5', () => {
    const result = calculateNaiveBayes(mockFreqData, {
      competition: 'BRASILEIRO',
      dayOfWeek: 'DOM',
      period: 'Tarde',
      attendanceRange: 'range35kTo45k'
    });
    
    expect(result.methodology).toBe('Amostragem Direta (Histórico Exato)');
    expect(result.sampleSize).toBe(7);
    expect(result.probabilities.V).toBeCloseTo((6 / 7) * 100, 2);
  });

  it('deve usar fallback do classificador Naive Bayes com suavização de Laplace quando total < 5', () => {
    const result = calculateNaiveBayes(mockFreqData, {
      competition: 'COPA',
      dayOfWeek: 'DOM',
      period: 'Tarde',
      attendanceRange: 'range35kTo45k'
    });
    
    expect(result.methodology).toBe('Classificador Naive Bayes (Fallback)');
    // Total de probabilidades deve ser exatamente 100%
    const sum = result.probabilities.V + result.probabilities.E + result.probabilities.D;
    expect(sum).toBeCloseTo(100, 1);
  });
});
