// =============================================
//  El Consejo de la Familia — Core Logic
//  Pure functions, no DOM access, no I/O.
// =============================================

import type {
  Indicator,
  IndicatorState,
  DecisionDelta,
  Decision,
  Scenario,
  EndingId,
  FinalResult,
  Outcome,
} from './types';
import { ALL_SCENARIOS, getScenario, getDecision } from './scenarios';
import {
  INDICATOR_MIN,
  INDICATOR_MAX,
  SCORE_LEGACY_CUTOFF,
  SCORE_BROKEN_CUTOFF,
  ENDINGS,
} from './types';

/**
 * Clamps a raw indicator value to the valid range [0, 100].
 * @param value - The raw numeric value.
 * @returns The clamped integer in [0, 100].
 */
export function clampIndicator(value: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return INDICATOR_MIN;
  }
  return Math.max(INDICATOR_MIN, Math.min(INDICATOR_MAX, Math.round(value)));
}

/**
 * Clamps an entire indicator state object to [0, 100] for each indicator.
 */
export function clampIndicatorState(state: IndicatorState): IndicatorState {
  return {
    power: clampIndicator(state.power),
    loyalty: clampIndicator(state.loyalty),
    reputation: clampIndicator(state.reputation),
  };
}

/**
 * Returns the name of the indicator with the maximum value.
 */
export function dominantIndicator(state: IndicatorState): Indicator {
  const entries = [
    ['power', state.power],
    ['loyalty', state.loyalty],
    ['reputation', state.reputation],
  ] as const;
  return entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
}

/**
 * Returns the name of the indicator with the minimum value.
 */
export function recessiveIndicator(state: IndicatorState): Indicator {
  const entries = [
    ['power', state.power],
    ['loyalty', state.loyalty],
    ['reputation', state.reputation],
  ] as const;
  return entries.reduce((a, b) => (b[1] < a[1] ? b : a))[0];
}

/**
 * Computes the weighted score 0-100.
 * Score = power * 0.40 + loyalty * 0.30 + reputation * 0.30
 */
export function computeScore(indicators: IndicatorState): number {
  const clamped = clampIndicatorState(indicators);
  const raw =
    clamped.power * 0.40 +
    clamped.loyalty * 0.30 +
    clamped.reputation * 0.30;
  return Math.round(raw);
}

/**
 * Determines the ending from final indicators.
 */
export function determineEnding(indicators: IndicatorState): EndingId {
  const p = clampIndicator(indicators.power);
  const l = clampIndicator(indicators.loyalty);
  const i = clampIndicator(indicators.reputation);

  const allHigh = p >= SCORE_LEGACY_CUTOFF && l >= SCORE_LEGACY_CUTOFF && i >= SCORE_LEGACY_CUTOFF;
  const allLow = p < SCORE_BROKEN_CUTOFF && l < SCORE_BROKEN_CUTOFF && i < SCORE_BROKEN_CUTOFF;

  if (allHigh) return 'legacy';
  if (p >= SCORE_LEGACY_CUTOFF) return 'fallen';
  if (l >= SCORE_LEGACY_CUTOFF) return 'defender';
  if (i >= SCORE_LEGACY_CUTOFF) return 'saint';
  if (allLow) return 'broken';

  // Fallback: no single indicator is ≥ 60.
  // If the weakest indicator is below 40, the ending collapses.
  if (Math.min(p, l, i) < SCORE_BROKEN_CUTOFF) return 'broken';
  // Otherwise all are in a balanced middle range (40-59) → legacy.
  return 'legacy';
}

/**
 * Validates that a decision id belongs to the given scenario.
 */
export function isDecisionValid(
  scenarioId: string,
  decisionId: string,
): boolean {
  const scenario = getScenario(scenarioId);
  if (!scenario) return false;
  return scenario.decisions.some((d) => d.id === decisionId);
}

/**
 * Applies a decision to an indicator state, returning { indicators, delta }.
 * Clamps the result to [0, 100].
 * Throws if the decision does not belong to the scenario.
 */
export function applyDecision(
  scenario: Scenario,
  decision: Decision,
  currentIndicators: IndicatorState,
): { indicators: IndicatorState; delta: DecisionDelta } {
  // Verify the decision belongs to this scenario
  if (!scenario.decisions.some((d) => d.id === decision.id)) {
    throw new Error(
      `Decision ${decision.id} is not part of scenario ${scenario.id}`,
    );
  }

  const delta: DecisionDelta = {
    power: decision.delta.power,
    loyalty: decision.delta.loyalty,
    reputation: decision.delta.reputation,
  };

  const after: IndicatorState = {
    power: clampIndicator(currentIndicators.power + delta.power),
    loyalty: clampIndicator(currentIndicators.loyalty + delta.loyalty),
    reputation: clampIndicator(currentIndicators.reputation + delta.reputation),
  };

  return { indicators: after, delta };
}

/**
 * Resolves a full outcome for the given scenario, decision and current state.
 * Returns an Outcome object with before/after/delta and the outcome text.
 */
export function resolveOutcome(
  scenario: Scenario,
  decision: Decision,
  currentIndicators: IndicatorState,
): Outcome {
  const { indicators: after, delta } = applyDecision(
    scenario,
    decision,
    currentIndicators,
  );
  return {
    scenarioId: scenario.id,
    decisionId: decision.id,
    before: currentIndicators,
    after,
    delta,
    outcomeText: decision.outcome,
  };
}

/**
 * Builds the complete ending result from final indicators.
 */
export function buildFinalResult(indicators: IndicatorState): FinalResult {
  const ending = determineEnding(indicators);
  const endingInfo = ENDINGS[ending];

  return {
    ending,
    endingTitle: endingInfo.title,
    endingDescription: endingInfo.description,
    score: computeScore(indicators),
    indicators: clampIndicatorState(indicators),
  };
}

/**
 * Labels a decision id as e.g. "d1a" -> "A" (for UI badges).
 */
export function labelForDecision(decisionId: string): string {
  const match = decisionId.match(/^d\d([a-z])$/i);
  if (!match) return decisionId;
  return match[1].toUpperCase();
}
