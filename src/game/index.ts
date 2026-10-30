// =============================================
//  El Consejo de la Familia — Game Logic Barrel
//  Re-exports the pure engine so UI code can import
//  a single namespace: `import * as Game from './game'`.
// =============================================

export * from './types';

export { ALL_SCENARIOS, getScenario, getDecision, SCENARIO_COUNT, DECISION_COUNT, SCENARIO_IDS, DECISION_IDS, getScenarioByIndex } from './scenarios';

export {
  clampIndicator,
  clampIndicatorState,
  dominantIndicator,
  recessiveIndicator,
  computeScore,
  determineEnding,
  isDecisionValid,
  applyDecision,
  resolveOutcome,
  buildFinalResult,
  labelForDecision,
} from './core';

export {
  STORAGE_KEY,
  saveState,
  loadState,
  clearState,
  serializeState,
  deserializeState,
} from './storage';
