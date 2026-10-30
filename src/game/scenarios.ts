// =============================================
//  El Consejo de la Familia — Scenario Data
//  Immutable data for the 6 scenarios.
// =============================================

import type { Scenario, Decision } from './types';

export const ALL_SCENARIOS: Scenario[] = [
  {
    id: 's1_family_council',
    title: 'La Junta de Familia',
    subtitle: 'El consejo de la familia',
    context:
      'Don Vito está enfermo en su estudio. Un intento de asesinato contra él fue descubierto. Las familias Barzini y Medicasosa lo culpan. El consejo de la familia se reúne para decidir la respuesta.',
    characters: ['Don Vito', 'Michael', 'Sonny', 'Tom Hagen', 'Conselheiro'],
    hints: [
      'Prestige: Barzini ofrece alianzas.',
      'Lealtad: ¿A quién crees?',
      'Imagen: ¿Qué harías a la luz de los medios?',
    ],
    decisions: [
      {
        id: 'd1a',
        label: 'A',
        text: 'Acompaño a Michael a la oferta de Barzini',
        outcome: 'Firmas la alianza con Barzini. El négoce amplía, pero la familia murmura.',
        delta: { power: 10, loyalty: -5, reputation: -10 },
      },
      {
        id: 'd1b',
        label: 'B',
        text: 'Niegues la alianza con Barzini',
        outcome: 'Desafías a Barzini en público. Los prestatarios se alejan, el ánimo es alto.',
        delta: { power: 6, loyalty: 12, reputation: -3 },
      },
      {
        id: 'd1c',
        label: 'C',
        text: 'Propones un arbitraje',
        outcome: 'Invitas a ambos lados a mediar. La paz se prolonga, el poder se estanca.',
        delta: { power: 3, loyalty: 8, reputation: 10 },
      },
    ],
  },
  {
    id: 's2_bank',
    title: 'El Banco',
    subtitle: 'La corrida bancaria',
    context:
      'El banco de la familia está impagando sus deudas. Un accionista importante pide retirar sus ahorros. Sonny amenaza con cerrar el banco si no se paga.',
    characters: ['Michael', 'Tom Hagen', 'Sonny'],
    hints: [
      'Prestige: el banco necesita ser salvado.',
      'Lealtad: proteger a los accionistas.',
      'Imagen: ¿confiar en el sistema legal?',
    ],
    decisions: [
      {
        id: 'd2a',
        label: 'A',
        text: 'Dejalo retirar sus ahorros',
        outcome: 'Respetas la ley. El sector bancario respeta más a la familia.',
        delta: { power: -6, loyalty: 10, reputation: 11 },
      },
      {
        id: 'd2b',
        label: 'B',
        text: 'Negociar la reestructuración',
        outcome: 'Aplagas el pago. El banco sobrevive, pero el ajuste de cuentas es incómodo.',
        delta: { power: 9, loyalty: -4, reputation: -5 },
      },
      {
        id: 'd2c',
        label: 'C',
        text: 'Dar el prestamo a la condicion de lealtad',
        outcome: 'Exiges el deposito como garantia. La familia se consolida, la confianza aprieta.',
        delta: { power: 12, loyalty: -8, reputation: -8 },
      },
    ],
  },
  {
    id: 's3_proposal',
    title: 'La Propuesta',
    subtitle: 'El asiento en el consejo',
    context:
      'Don Vito, jurando, ofrece a Michael un asiento en el consejo familiar. Es la puerta abierta al poder. Michael duda.',
    characters: ['Don Vito', 'Michael', 'Conselheiro'],
    hints: [
      'Prestige: la promesa del patriarca.',
      'Lealtad: el vínculo familiar.',
      'Imagen: el trato con la ley.',
    ],
    decisions: [
      {
        id: 'd3a',
        label: 'A',
        text: 'Acepta la propuesta',
        outcome: 'Michael se sienta en el consejo. El poder de la familia crece, el honor se pone a prueba.',
        delta: { power: 14, loyalty: -4, reputation: -9 },
      },
      {
        id: 'd3b',
        label: 'B',
        text: 'Se niega',
        outcome: 'Michael rechaza el asiento. La familia mantiene su código, pero el poder no se expande.',
        delta: { power: 4, loyalty: 16, reputation: -5 },
      },
      {
        id: 'd3c',
        label: 'C',
        text: 'Proporcionar co Presidente',
        outcome: 'Se propone que Michael y su hermano compartan presidencia. El equilibrio mantiene el rumbo.',
        delta: { power: 7, loyalty: 10, reputation: 0 },
      },
    ],
  },
  {
    id: 's4_vow',
    title: 'La Promesa',
    subtitle: 'El deber de un amigo',
    context:
      'Un antiguo aliado de la familia muere. Antes de irse, le pide un favor a Michael. No se trata de dinero, sino de una red de gente inocente (mujer y niños) dependientes de él.',
    characters: ['Michael', 'Aliado muerto', 'Inocentes (implícitos)'],
    hints: [
      'Prestige: la ley dice que no.',
      'Lealtad: la gente que te ha ayudado.',
      'Imagen: cómo verás en público.',
    ],
    decisions: [
      {
        id: 'd4a',
        label: 'A',
        text: 'Cumplir la promesa',
        outcome: 'El consejero abre las redes. La familia respeta el honor, el riesgo legal aumenta.',
        delta: { power: -4, loyalty: 14, reputation: 8 },
      },
      {
        id: 'd4b',
        label: 'B',
        text: 'Negar la promesa',
        outcome: 'Se niega. La familia se salva, pero la lealtad de los más débiles se rompe.',
        delta: { power: 10, loyalty: -15, reputation: -4 },
      },
      {
        id: 'd4c',
        label: 'C',
        text: 'Encontrar la alternativa',
        outcome: 'Se protege a los inocentes por otros caminos. El honor se mantiene, los gastos aumentan.',
        delta: { power: 0, loyalty: 9, reputation: 11 },
      },
    ],
  },
  {
    id: 's5_gambit',
    title: 'El Ranquillo',
    subtitle: 'La decisión de la guerra',
    context:
      'Una familia rival amenaza con atacar la zona. Michael, ahora nuevo líder, decide cómo responder. La guerra puede expandir el poder, pero costará vidas.',
    characters: ['Michael', 'Sonny', 'Aliados de la zona'],
    hints: [
      'Prestige: ¿expandir el territorio?',
      'Lealtad: la vida de los subordinados.',
      'Imagen: la justicia antes de la fuerza.',
    ],
    decisions: [
      {
        id: 'd5a',
        label: 'A',
        text: 'Atacar primero',
        outcome: 'La guerra severa a la rival. El imperio crece, el precio es la lealtad.',
        delta: { power: 18, loyalty: -9, reputation: -14 },
      },
      {
        id: 'd5b',
        label: 'B',
        text: 'Esperar la señal',
        outcome: 'Esperas que la rival se autocomplete. El poder no cambia, el estrés es alto.',
        delta: { power: 3, loyalty: 10, reputation: -5 },
      },
      {
        id: 'd5c',
        label: 'C',
        text: 'Negociar la tregua',
        outcome: 'Se firma una tregua. El imperio se estabiliza, la lealtad se recupera.',
        delta: { power: 14, loyalty: 6, reputation: 12 },
      },
    ],
  },
  {
    id: 's6_final_council',
    title: 'El Recuento',
    subtitle: 'La elección definitiva',
    context:
      'La crisis final. No todos en la familia pueden ser salvados. La elección define el legado.',
    characters: ['Don Vito', 'Michael', 'Conselheiro'],
    hints: [
      'Prestige: ¿expansión final?',
      'Lealtad: ¿sacar a unos a costa de otros?',
      'Imagen: cómo terminar este capítulo.',
    ],
    decisions: [
      {
        id: 'd6a',
        label: 'A',
        text: 'Apoyo total a la familia',
        outcome: 'Se cuida a todos. El imperio se enreda, el honor se mantiene.',
        delta: { power: 9, loyalty: 15, reputation: -11 },
      },
      {
        id: 'd6b',
        label: 'B',
        text: 'Supervivencia de unos',
        outcome: 'Se sacrifica a unos para rescatar a otros. El poder se fortalece, la lealtad se quiebra.',
        delta: { power: 14, loyalty: -4, reputation: 6 },
      },
      {
        id: 'd6c',
        label: 'C',
        text: 'Liderar el regreso a casa',
        outcome: 'La familia se reconcilia y regresa a la seguridad. Equilibrio final.',
        delta: { power: 3, loyalty: 10, reputation: 12 },
      },
    ],
  },
];

/** Returns the scenario with the given id, or undefined if none. */
export function getScenario(scenarioId: string): Scenario | undefined {
  return ALL_SCENARIOS.find((s) => s.id === scenarioId);
}

/** Returns the decision with the given id within the scenario, or undefined. */
export function getDecision(
  scenarioId: string,
  decisionId: string,
): Decision | undefined {
  const scenario = getScenario(scenarioId);
  if (!scenario) return undefined;
  return scenario.decisions.find((d) => d.id === decisionId);
}

/** Total number of scenarios (6) and decisions (18). */
export const SCENARIO_COUNT = ALL_SCENARIOS.length;
export const DECISION_COUNT = ALL_SCENARIOS.reduce(
  (sum, s) => sum + s.decisions.length,
  0,
);

/** Sorted list of all scenario ids. */
export const SCENARIO_IDS = ALL_SCENARIOS.map((s) => s.id);

/** Returns the scenario in the linear spine by index (0-based). */
export function getScenarioByIndex(index: number): Scenario {
  if (index < 0 || index >= SCENARIO_COUNT) {
    throw new RangeError(`Scenario index out of range: ${index}`);
  }
  return ALL_SCENARIOS[index];
}

/** List of all decision ids (18 total). */
export const DECISION_IDS = ALL_SCENARIOS.flatMap((s) => s.decisions.map((d) => d.id));
