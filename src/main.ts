// =============================================
//  THE GODFATHER — THE CORLEONE ARCHIVE (V2)
//  Main entry — mounts the app shell and wires
//  the game engine (pure logic, no DOM) to the UI.
// =============================================

import * as Game from './game/index';
import '../public/assets/css/main.css';
import type { GameState, IndicatorState, HistoryEntry } from './game/types';

// DOM refs
const $ = (sel: string) => document.querySelector(sel);
const $$ = (sel: string) => document.querySelectorAll(sel);

const dom = {
  scenarioCounter: $('#scenario-counter') as HTMLSpanElement,
  powerValue: $('#power-value') as HTMLSpanElement,
  loyaltyValue: $('#loyalty-value') as HTMLSpanElement,
  reputationValue: $('#reputation-value') as HTMLSpanElement,
  scenarioText: $('#scenario-text') as HTMLDivElement,
  decisionButtons: $('#decision-buttons') as HTMLDivElement,
  nextBtn: $('#next-scenario') as HTMLButtonElement,
};

// ============================================================
//  GAME STATE
// ============================================================
let currentScenarioIndex = 0;
let isPlaying = false;

// ============================================================
//  GAME ACTIONS
// ============================================================
const actions = {
  init() {
    this.bindGame();
    this.showFirstScenario();
  },

  bindGame() {
    dom.nextBtn.addEventListener('click', () => {
      if (isPlaying) {
        this.showNextScenario();
      }
    });
  },

  showFirstScenario() {
    currentScenarioIndex = 0;
    isPlaying = true;
    this.renderScenario(0);
    this.updateIndicators();
    this.setScenarioCounter(1, Game.SCENARIO_COUNT);
    dom.nextBtn.disabled = false;
  },

  showNextScenario() {
    if (currentScenarioIndex < Game.SCENARIO_COUNT - 1) {
      currentScenarioIndex++;
      this.renderScenario(currentScenarioIndex);
      this.updateIndicators();
      this.setScenarioCounter(currentScenarioIndex + 1, Game.SCENARIO_COUNT);
    } else {
      this.finishGame();
    }
  },

  renderScenario(index: number) {
    const scenario = Game.getScenarioByIndex(index);
    if (!scenario) return;

    dom.scenarioText.textContent = scenario.context;
    dom.scenarioCounter.textContent = `Escenario ${index + 1} de ${Game.SCENARIO_COUNT}`;

    dom.decisionButtons.innerHTML = '';
    scenario.decisions.forEach((decision, idx) => {
      const btn = document.createElement('button');
      btn.className = 'decision-btn';
      btn.innerHTML = `
        <span class="decision-label">${String.fromCharCode(65 + idx)}.</span>
        <span class="decision-text">${decision.text}</span>
        <span class="decision-outcome">${decision.outcome}</span>
      `;
      btn.addEventListener('click', () => {
        this.applyDecision(idx, scenario);
      });
      dom.decisionButtons.appendChild(btn);
    });
  },

  applyDecision(idx: number, scenario: any) {
    // Load stored state (coerce unknown → canonical GameState from types.ts)
    const raw = Game.loadState();
    let state: GameState = {
      version: 1,
      saveId: crypto.randomUUID(),
      player: { name: '', role: '' },
      indicators: { power: 50, loyalty: 50, reputation: 50 },
      history: [],
      finished: false,
      finishedAt: null,
      ending: null,
      metadata: { startedAt: new Date().toISOString(), completedAt: null },
      bestScore: 0,
      completedGames: 0,
    };

    if (typeof raw === 'object' && raw !== null && raw.indicators) {
      state = raw as GameState;
      if (state.saveId === undefined) {
        state.saveId = crypto.randomUUID();
      }
    }

    const result = Game.applyDecision(scenario, scenario.decisions[idx], state.indicators);
    state.indicators = result.indicators;
    state.history.push({
      scenarioId: scenario.id,
      decisionId: scenario.decisions[idx].id,
      delta: result.delta,
      timestamp: new Date().toISOString(),
    });
    Game.saveState(state);

    this.renderScenario(currentScenarioIndex);
    this.updateIndicators();
    this.renderCharacterGrid();

    if (currentScenarioIndex === Game.SCENARIO_COUNT - 1) {
      dom.nextBtn.textContent = 'Finalizar partida';
      dom.nextBtn.classList.add('btn-success');
      isPlaying = false;
    }
  },

  updateIndicators() {
    const state = Game.loadState();
    if (state && typeof state === 'object' && (state as GameState).indicators) {
      const s = state as GameState;
      dom.powerValue.textContent = String(s.indicators.power);
      dom.loyaltyValue.textContent = String(s.indicators.loyalty);
      dom.reputationValue.textContent = String(s.indicators.reputation);
    }
  },

  setScenarioCounter(current: number, total: number) {
    dom.scenarioCounter.textContent = `Escenario ${current} de ${total}`;
  },

  finishGame() {
    isPlaying = false;
    const state = Game.loadState();
    const indicators = (state && typeof state === 'object' && (state as GameState).indicators)
      ? (state as GameState).indicators
      : { power: 50, loyalty: 50, reputation: 50 };
    const result = Game.buildFinalResult(indicators);
    dom.nextBtn.textContent = `Final: ${result.endingTitle}`;

    let save = this.loadSave();
    if (!save) {
      save = {
        version: 1,
        saveId: crypto.randomUUID(),
        player: { name: '', role: '' },
        indicators: { power: 50, loyalty: 50, reputation: 50 },
        history: [],
        finished: true,
        finishedAt: new Date().toISOString(),
        ending: result.ending,
        metadata: { startedAt: new Date().toISOString(), completedAt: null },
        bestScore: result.score,
        completedGames: 1,
      } as GameState;
    } else {
      if (result.score > save.bestScore) {
        save.bestScore = result.score;
      }
      save.completedGames = (save.completedGames || 0) + 1;
      save.finished = true;
      save.finishedAt = new Date().toISOString();
      save.ending = result.ending;
      save.metadata.completedAt = new Date().toISOString();
    }
    Game.saveState(save);
  },

  loadSave(): GameState | null {
    try {
      const raw = localStorage.getItem('elConsejoV2:state');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed as GameState;
    } catch {
      return null;
    }
  },

  renderCharacterGrid() {
    const grid = document.getElementById('character-grid');
    if (!grid) return;

    const characters = [
      { name: 'Don Vito Corleone', role: 'Patriarca', image: '/assets/images/favicon.svg' },
      { name: 'Michael Corleone', role: 'El Nuevo Patrón', image: '/assets/images/fredo-corleone.png' },
      { name: 'Sonny Corleone', role: 'El Mayor', image: '/assets/images/sonny-corleone.png' },
      { name: 'Tom Hagen', role: 'Advogado', image: '/assets/images/tom-hagen.png' },
      { name: 'Clemenza', role: 'El Guardián', image: '/assets/images/clemenza.png' },
      { name: 'Connie Corleone', role: 'Familia', image: '/assets/images/connie-corleone.png' },
      { name: 'Kay Adams', role: 'La Tentación', image: '/assets/images/kay-adams.png' },
      { name: 'Fredo Corleone', role: 'El Hermano Menor', image: '/assets/images/fredo-corleone.png' },
    ];

    grid.innerHTML = characters.map((c, i) => `
      <div class="col-6 col-md-4 col-xl-3">
        <div class="card h-100 border-0 character-card ${i % 2 === 0 ? 'card-even' : 'card-odd'}">
          <img src="${c.image}" class="card-img-top" alt="${c.name}" loading="eager">
          <div class="card-body">
            <h3 class="card-title text-body">${c.name}</h3>
            <p class="card-text text-muted">${c.role}</p>
          </div>
        </div>
      </div>
    `).join('');
  },
};

// ============================================================
//  BOOT
// ============================================================
if (typeof window !== 'undefined') {
  // Expose Game namespace only in development (avoid production pollution)
  if (import.meta.env.DEV) {
    (window as any).Game = Game;
  }

  window.addEventListener('beforeunload', () => {
    const state = Game.loadState();
    if (state && typeof state === 'object' && (state as GameState).history) {
      Game.saveState(state as GameState);
    }
  });

  actions.init();
}
