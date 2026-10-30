// =============================================
//  El Consejo de la Familia — Game Logic
//  Types & Interfaces
//  Pure logic, no DOM access.
// =============================================

export type Indicator = 'power' | 'loyalty' | 'reputation';

export type EndingId =
  | 'legacy'   // El Legado
  | 'fallen'   // El Caído
  | 'defender' // El Defensor
  | 'saint'    // El Estigado
  | 'broken';  // La Familia Rotta

export interface IndicatorState {
  power: number;       // 0..100
  loyalty: number;     // 0..100
  reputation: number;  // 0..100
}

export interface DecisionDelta {
  power: number;
  loyalty: number;
  reputation: number;
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  context: string;
  characters: string[];
  hints: string[];
  decisions: Decision[];
}

export interface Decision {
  id: string;
  label: string;
  text: string;         // human-readable choice text
  delta: DecisionDelta;
  outcome: string;      // borné (flavor) text shown after the choice
}

export interface HistoryEntry {
  scenarioId: string;
  decisionId: string;
  delta: DecisionDelta;
  timestamp: string; // ISO 8601
}

// Canonical GameState — shared by engine (types.ts) and UI (main.ts)
export interface GameState {
  version: 1;
  saveId: string;
  player: { name: string; role: string };
  indicators: IndicatorState;
  history: HistoryEntry[];
  finished: boolean;
  finishedAt: string | null;
  ending: EndingId | null;
  metadata: { startedAt: string; completedAt: string | null };
  bestScore: number;       // mejor score acumulado
  completedGames: number;  // partidas totales completadas
  [key: string]: unknown;
}

export interface Outcome {
  scenarioId: string;
  decisionId: string;
  before: IndicatorState;
  after: IndicatorState;
  delta: DecisionDelta;
  outcomeText: string;
}

export interface FinalResult {
  ending: EndingId;
  endingTitle: string;
  endingDescription: string;
  score: number;
  indicators: IndicatorState;
}

// Thresholds
export const INDICATOR_MIN = 0;
export const INDICATOR_MAX = 100;
export const SCORE_LEGACY_CUTOFF = 60;
export const SCORE_BROKEN_CUTOFF = 40;
export const SCORE_DELTA_MAX = 20; // cap per-decision deltas to prevent inflation

export const ENDINGS: Record<EndingId, { title: string; description: string }> = {
  legacy: {
    title: 'El Legado',
    description:
      'El imperio es sostenible y respetado. El equilibrio entre poder, lealtad e imagen es perfecto.',
  },
  fallen: {
    title: 'El Caído',
    description:
      'El poder absoluto se alcanza, pero sin equilibrio. La familia se eleva, pero se rompe de adentro.',
  },
  defender: {
    title: 'El Defensor',
    description:
      'La familia se mantiene unida por la lealtad, pero sin alcance ni estabilidad.',
  },
  saint: {
    title: 'El Estigado',
    description:
      'Venerado por la imagen, pero impotente para proteger a sus. Se rinde un honor imposible.',
  },
  broken: {
    title: 'La Familia Rotta',
    description:
      'El imperio colapsa. Sin poder, lealtad ni imagen, la familia se disperse.',
  },
};
