import { describe, it, expect } from 'vitest';
import { calculateNaiveBayes } from '../naiveBayes';

// Mock de dados de frequência para isolar o teste
const mockFreqData = {
  totals: {
    total: 100,
    V: 60,
    E: 25,
    D: 15
  },
  byCompetition: {
    "BRASILEIRO": { V: 40, E: 15, D: 10 }
  },
  byDayOfWeek: {
    "DOM": { V: 30, E: 10, D: 5 }
  },
  byPeriod: {
    "Tarde": { V: 35, E: 12, D: 7 }
  },
  byAttendanceRange: {
    "range35kTo45k": { V: 28, E: 11, D: 6 },
    "under25k": { V: 2, E: 2, D: 1 }
  },
  combinations: {
    "BRASILEIRO|DOM|Tarde|range35kTo45k": { total: 6, V: 4, E: 1, D: 1 },
    "BRASILEIRO|DOM|Tarde|under25k": { total: 2, V: 1, E: 1, D: 0 }
  }
};

describe('Naive Bayes Calculator', () => {
  it('should use Direct Sampling when exact match is >= threshold (5)', () => {
    const inputs = {
      competition: 'BRASILEIRO',
      dayOfWeek: 'DOM',
      period: 'Tarde',
      attendanceRange: 'range35kTo45k'
    };

    const result = calculateNaiveBayes(mockFreqData, inputs);

    expect(result.methodology).toBe('Amostragem Direta (Histórico Exato)');
    expect(result.sampleSize).toBe(6);
    expect(result.probabilities.V).toBeCloseTo((4 / 6) * 100, 2);
    expect(result.probabilities.E).toBeCloseTo((1 / 6) * 100, 2);
    expect(result.probabilities.D).toBeCloseTo((1 / 6) * 100, 2);
  });

  it('should use Naive Bayes fallback when exact match is < threshold (5)', () => {
    const inputs = {
      competition: 'BRASILEIRO',
      dayOfWeek: 'DOM',
      period: 'Tarde',
      attendanceRange: 'under25k'
    };

    const result = calculateNaiveBayes(mockFreqData, inputs);

    expect(result.methodology).toBe('Classificador Naive Bayes (Fallback)');
    expect(result.sampleSize).toBe(2);
    
    // As probabilidades devem somar 100%
    const sum = result.probabilities.V + result.probabilities.E + result.probabilities.D;
    expect(sum).toBeCloseTo(100, 2);
    
    // Vitórias devem ser maiores devido à prior do mock
    expect(result.probabilities.V).toBeGreaterThan(result.probabilities.D);
  });

  it('should use Naive Bayes fallback when combination does not exist at all', () => {
    const inputs = {
      competition: 'COPA DO BRASIL',
      dayOfWeek: 'QUA',
      period: 'Noite',
      attendanceRange: 'over45k'
    };

    const result = calculateNaiveBayes(mockFreqData, inputs);

    expect(result.methodology).toBe('Classificador Naive Bayes (Fallback)');
    expect(result.sampleSize).toBe(0);

    const sum = result.probabilities.V + result.probabilities.E + result.probabilities.D;
    expect(sum).toBeCloseTo(100, 2);
  });
});
