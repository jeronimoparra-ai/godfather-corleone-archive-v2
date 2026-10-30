// =============================================
//  El Consejo de la Familia — Node Test Cases
//  Pure game-logic tests. Runs with: npx vitest run
// =============================================

import { describe, it, expect, beforeEach } from 'vitest';
import type {
  IndicatorState,
  Decision,
  Scenario,
  EndingId,
  FinalResult,
} from '../src/game/types';
import {
  clampIndicator,
  clampIndicatorState,
  computeScore,
  determineEnding,
  isDecisionValid,
  applyDecision,
  resolveOutcome,
  buildFinalResult,
  labelForDecision,
} from '../src/game/core';
import {
  ALL_SCENARIOS,
  getScenario,
  getDecision,
  SCENARIO_COUNT,
  DECISION_COUNT,
  SCENARIO_IDS,
} from '../src/game/scenarios';

/**
 * Helper: empty indicator state.
 */
function emptyIndicators(): IndicatorState {
  return { power: 50, loyalty: 50, reputation: 50 };
}

/**
 * Helper: indicator state with explicit overrides.
 */
function withIndicators(overrides: Partial<IndicatorState> = {}): IndicatorState {
  return { power: 50, loyalty: 50, reputation: 50, ...overrides };
}

describe('clampIndicator', () => {
  it('clamps a value below 0 to 0', () => {
    expect(clampIndicator(-5, 'power')).toBe(0);
    expect(clampIndicator(-100, 'loyalty')).toBe(0);
  });

  it('clamps a value above 100 to 100', () => {
    expect(clampIndicator(105, 'power')).toBe(100);
    expect(clampIndicator(999, 'reputation')).toBe(100);
  });

  it('returns a value within [0, 100]', () => {
    expect(clampIndicator(0, 'power')).toBe(0);
    expect(clampIndicator(50, 'loyalty')).toBe(50);
    expect(clampIndicator(100, 'reputation')).toBe(100);
  });

  it('rounds fractional values', () => {
    expect(clampIndicator(42.6, 'power')).toBe(43);
    expect(clampIndicator(42.4, 'loyalty')).toBe(42);
  });
});

describe('clampIndicatorState', () => {
  it('clamps all three indicators', () => {
    const state = { power: -5, loyalty: 150, reputation: 30 };
    const result = clampIndicatorState(state);
    expect(result.power).toBe(0);
    expect(result.loyalty).toBe(100);
    expect(result.reputation).toBe(30);
  });

  it('returns a valid state unchanged when all in range', () => {
    const state = { power: 0, loyalty: 100, reputation: 50 };
    const result = clampIndicatorState(state);
    expect(result).toEqual(state);
  });
});

describe('computeScore', () => {
  it('returns 0 when all indicators are 0', () => {
    expect(computeScore({ power: 0, loyalty: 0, reputation: 0 })).toBe(0);
  });

  it('returns 100 when all indicators are 100', () => {
    expect(computeScore({ power: 100, loyalty: 100, reputation: 100 })).toBe(100);
  });

  it('returns a weighted score within [0, 100]', () => {
    const state = { power: 80, loyalty: 60, reputation: 70 };
    const score = computeScore(state);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    // Manual: 80*0.4 + 60*0.3 + 70*0.3 = 32 + 18 + 21 = 71
    expect(score).toBe(71);
  });

  it('treats an unbalanced high-power state correctly', () => {
    const score = computeScore({ power: 100, loyalty: 0, reputation: 0 });
    expect(score).toBe(40); // 100*0.4
  });
});

describe('determineEnding', () => {
  it('legacy: all three indicators >= 60', () => {
    const result = determineEnding({ power: 70, loyalty: 80, reputation: 75 });
    expect(result).toBe('legacy');
  });

  it('fallen: power >= 60 but not all >= 60', () => {
    expect(determineEnding({ power: 80, loyalty: 30, reputation: 40 })).toBe('fallen');
    expect(determineEnding({ power: 90, loyalty: 20, reputation: 20 })).toBe('fallen');
  });

  it('defender: loyalty >= 60 but not all >= 60', () => {
    expect(determineEnding({ power: 30, loyalty: 90, reputation: 40 })).toBe('defender');
    expect(determineEnding({ power: 20, loyalty: 100, reputation: 20 })).toBe('defender');
  });

  it('saint: reputation >= 60 but not all >= 60', () => {
    expect(determineEnding({ power: 40, loyalty: 30, reputation: 80 })).toBe('saint');
    expect(determineEnding({ power: 20, loyalty: 20, reputation: 90 })).toBe('saint');
  });

  it('broken: all three indicators < 40', () => {
    expect(determineEnding({ power: 20, loyalty: 10, reputation: 30 })).toBe('broken');
    expect(determineEnding({ power: 0, loyalty: 0, reputation: 0 })).toBe('broken');
  });

  it('fallback: balanced middle range (40-59) -> legacy', () => {
    expect(determineEnding({ power: 55, loyalty: 50, reputation: 45 })).toBe('legacy');
    expect(determineEnding({ power: 45, loyalty: 45, reputation: 50 })).toBe('legacy');
  });

  it('fallback: weakest below 40 drags the ending to broken', () => {
    expect(determineEnding({ power: 50, loyalty: 20, reputation: 50 })).toBe('broken');
    expect(determineEnding({ power: 55, loyalty: 10, reputation: 50 })).toBe('broken');
  });

  it('clamps out-of-range values before deciding', () => {
    expect(determineEnding({ power: 120, loyalty: 60, reputation: 60 })).toBe('legacy');
    expect(determineEnding({ power: -10, loyalty: -10, reputation: -10 })).toBe('broken');
  });
});

describe('isDecisionValid', () => {
  it('returns true for a valid decision in a scenario', () => {
    expect(isDecisionValid('s1_family_council', 'd1a')).toBe(true);
    expect(isDecisionValid('s6_final_council', 'd6c')).toBe(true);
  });

  it('returns false for a decision not in the scenario', () => {
    expect(isDecisionValid('s1_family_council', 'd9z')).toBe(false);
    expect(isDecisionValid('s9_fake', 'd9z')).toBe(false);
  });

  it('returns false for unknown scenario id', () => {
    expect(isDecisionValid('nope', 'd1a')).toBe(false);
  });
});

describe('applyDecision', () => {
  const s1 = ALL_SCENARIOS[0] as Scenario;
  const d1a = getDecision(s1.id, 'd1a') as Decision;

  it('applies the delta to the indicators', () => {
    const current = { power: 50, loyalty: 50, reputation: 50 };
    const { indicators, delta } = applyDecision(s1, d1a, current);
    expect(delta.power).toBe(10);
    expect(delta.loyalty).toBe(-5);
    expect(delta.reputation).toBe(-10);
    expect(indicators.power).toBe(60);
    expect(indicators.loyalty).toBe(45);
    expect(indicators.reputation).toBe(40);
  });

  it('clamps the result when delta pushes the value out of range', () => {
    const current = { power: 95, loyalty: 95, reputation: 95 };
    const { indicators } = applyDecision(
      s1,
      getDecision(s1.id, 'd1a') as Decision,
      current,
    );
    // power + 10 -> clamp to 100; loyalty -5 -> 90; reputation -10 -> 85
    expect(indicators.power).toBe(100);
    expect(indicators.loyalty).toBe(90);
    expect(indicators.reputation).toBe(85);
  });

  it('throws when the decision does not belong to the scenario', () => {
    const s2 = ALL_SCENARIOS[1] as Scenario;
    const d1a = getDecision(s1.id, 'd1a') as Decision;
    expect(() => applyDecision(s2, d1a, { power: 0, loyalty: 0, reputation: 0 })).toThrow();
  });

  it('produces a valid state after applying any valid decision', () => {
    const s1 = ALL_SCENARIOS[0] as Scenario;
    for (const d of s1.decisions) {
      const current = { power: 50, loyalty: 50, reputation: 50 };
      const { indicators } = applyDecision(s1, d, current);
      expect(indicators.power).toBeGreaterThanOrEqual(0);
      expect(indicators.power).toBeLessThanOrEqual(100);
      expect(indicators.loyalty).toBeGreaterThanOrEqual(0);
      expect(indicators.loyalty).toBeLessThanOrEqual(100);
      expect(indicators.reputation).toBeGreaterThanOrEqual(0);
      expect(indicators.reputation).toBeLessThanOrEqual(100);
    }
  });
});

describe('resolveOutcome', () => {
  it('returns scenarioId, decisionId, before, after, delta, outcomeText', () => {
    const s1 = ALL_SCENARIOS[0] as Scenario;
    const d1a = getDecision(s1.id, 'd1a') as Decision;
    const before = { power: 30, loyalty: 40, reputation: 30 };
    const outcome = resolveOutcome(s1, d1a, before);
    expect(outcome.scenarioId).toBe(s1.id);
    expect(outcome.decisionId).toBe(d1a.id);
    expect(outcome.before).toEqual(before);
    expect(outcome.delta.power).toBe(10);
    expect(outcome.delta.loyalty).toBe(-5);
    expect(outcome.delta.reputation).toBe(-10);
    expect(outcome.after.power).toBe(40);
    expect(outcome.after.loyalty).toBe(35);
    expect(outcome.after.reputation).toBe(20);
    expect(outcome.outcomeText).toBe(d1a.outcome);
  });
});

describe('buildFinalResult', () => {
  it('returns a FinalResult with matching ending and score', () => {
    const result = buildFinalResult({ power: 70, loyalty: 80, reputation: 75 });
    expect(result.ending).toBe('legacy');
    expect(typeof result.score).toBe('number');
    expect(result.endingTitle).toBe('El Legado');
    expect(result.endingDescription).toBeTruthy();
    expect(result.indicators).toEqual({ power: 70, loyalty: 80, reputation: 75 });
  });

  it('produces a result for a fallen ending', () => {
    const result = buildFinalResult({ power: 90, loyalty: 20, reputation: 30 });
    expect(result.ending).toBe('fallen');
    // 90*0.4 + 20*0.3 + 30*0.3 = 36 + 6 + 9 = 51
    expect(result.score).toBe(51);
    expect(result.indicators).toEqual({ power: 90, loyalty: 20, reputation: 30 });
  });
});

describe('scenario data integrity', () => {
  it('exports exactly 6 scenarios', () => {
    expect(SCENARIO_COUNT).toBe(6);
    expect(ALL_SCENARIOS).toHaveLength(6);
  });

  it('every scenario has exactly 3 decisions', () => {
    for (const s of ALL_SCENARIOS) {
      expect(s.decisions).toHaveLength(3);
    }
  });

  it('exports 18 decisions total', () => {
    expect(DECISION_COUNT).toBe(18);
    // Recompute to verify
    const total = ALL_SCENARIOS.reduce((sum, s) => sum + s.decisions.length, 0);
    expect(total).toBe(18);
  });

  it('every decision has a delta object with integer values', () => {
    for (const s of ALL_SCENARIOS) {
      for (const d of s.decisions) {
        expect(d.delta).toHaveProperty('power');
        expect(d.delta).toHaveProperty('loyalty');
        expect(d.delta).toHaveProperty('reputation');
        expect(typeof d.delta.power).toBe('number');
        expect(typeof d.delta.loyalty).toBe('number');
        expect(typeof d.delta.reputation).toBe('number');
      }
    }
  });

  it('every scenario id and decision id is unique', () => {
    const scenarioIds = ALL_SCENARIOS.map((s) => s.id);
    const decisionIds: string[] = [];
    for (const s of ALL_SCENARIOS) {
      for (const d of s.decisions) {
        decisionIds.push(d.id);
      }
    }
    expect(new Set(scenarioIds).size).toBe(scenarioIds.length);
    expect(new Set(decisionIds).size).toBe(decisionIds.length);
  });

  it('scenario ids are sequential s1..s6', () => {
    const ids = ALL_SCENARIOS.map((s) => s.id);
    expect(ids).toEqual(['s1_family_council', 's2_bank', 's3_proposal', 's4_vow', 's5_gambit', 's6_final_council']);
  });

  it('getScenario and getDecision return the correct data', () => {
    const s1 = getScenario('s1_family_council');
    expect(s1).toBeDefined();
    expect(s1?.title).toBe('La Junta de Familia');
    expect(getScenario('s99')).toBeUndefined();

    const d1a = getDecision('s1_family_council', 'd1a');
    expect(d1a).toBeDefined();
    expect(d1a?.label).toBe('A');
    expect(getDecision('s6_final_council', 'd6c')).toBeDefined();
  });
});

describe('integration: full game run', () => {
  it('runs a full game from scenario 1 to the ending', () => {
    let indicators: IndicatorState = { power: 50, loyalty: 50, reputation: 50 };
    let currentScenario = ALL_SCENARIOS[0] as Scenario;

    for (let idx = 0; idx < SCENARIO_COUNT; idx++) {
      const decision = currentScenario.decisions[idx % currentScenario.decisions.length];
      const { indicators: nextIndicators } = applyDecision(
        currentScenario,
        decision,
        indicators,
      );
      indicators = nextIndicators;
      // Advance to the next scenario in the linear spine
      currentScenario = ALL_SCENARIOS[idx + 1] as Scenario;
    }

    const result = buildFinalResult(indicators);
    expect(['legacy', 'fallen', 'defender', 'saint', 'broken']).toContain(result.ending);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('a balanced strategy leads to legacy', () => {
    let indicators: IndicatorState = { power: 50, loyalty: 50, reputation: 50 };
    const choices: string[] = ['d1c', 'd2a', 'd3c', 'd4c', 'd5c', 'd6c'];
    for (const id of choices) {
      const sIdx = parseInt(id[1], 10) - 1;
      const scenario = ALL_SCENARIOS[sIdx] as Scenario;
      const decision = scenario.decisions.find((d) => d.id === id)!;
      const { indicators: next } = applyDecision(scenario, decision, indicators);
      indicators = next;
    }
    const result = buildFinalResult(indicators);
    expect(result.ending).toBe('legacy');
  });

  it('a power-maximizing strategy leads to fallen', () => {
    let indicators: IndicatorState = { power: 50, loyalty: 50, reputation: 50 };
    const choices: string[] = ['d1b', 'd2b', 'd3a', 'd4b', 'd5a', 'd6b'];
    for (const id of choices) {
      const sIdx = parseInt(id[1], 10) - 1;
      const scenario = ALL_SCENARIOS[sIdx] as Scenario;
      const decision = scenario.decisions.find((d) => d.id === id)!;
      const { indicators: next } = applyDecision(scenario, decision, indicators);
      indicators = next;
    }
    const result = buildFinalResult(indicators);
    expect(result.ending).toBe('fallen');
  });

  it('the 6-decision loop always ends with a valid final result', () => {
    let indicators: IndicatorState = { power: 0, loyalty: 0, reputation: 0 };
    for (let i = 0; i < SCENARIO_COUNT; i++) {
      const scenario = ALL_SCENARIOS[i] as Scenario;
      const decision = scenario.decisions[0];
      const { indicators: next } = applyDecision(scenario, decision, indicators);
      indicators = next;
    }
    const result = buildFinalResult(indicators);
    expect(['legacy', 'fallen', 'defender', 'saint', 'broken']).toContain(result.ending);
  });
});
