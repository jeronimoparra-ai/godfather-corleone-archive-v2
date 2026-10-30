# EL CONSEJO DE LA FAMILIA

## Game Design Document — V2

**Versión:** 1.0
**Autor:** Subagente B — Game Designer / Game Engine
**Fecha:** 2026-10-30
**Rama de trabajo:** `redesign/corleone-archive-v2`
**Entregable:** `V2/src/game/` + documentación del motor de juego

---

## 1. Portada

| Campo | Valor |
|---|---|
| Título del juego | **El Consejo de la Familia** |
| Subtítulo | El asesor del patriarca |
| Género | Trama narrativa / elección de caminos |
| Basado en | *The Godfather* (1972) y su universo Corleone |
| Plataforma | Web (Vite + TypeScript) |
| Jugadores | 1 (single-player) |
| Estructura | 6 escenarios × 3 decisiones = 729 trayectorias posibles |
| Indicadores | 3 (Poder, Lealtad, Imagen) |
| Finales | 5 |
| Persistencia | `localStorage` |

---

## 2. Sinopsis

Vicenzo "Il Consigliere" Moretti es un personaje ficticio del mundo Corleone: abogado
licenciado, confesor fiel y ejecutor secreto de la familia Don Vito. El patriarca está
envejeciendo y el imperio se estira entre Sicilia y Nueva York. Entre el robo en 1946 y la
toma de poder de Michael en 1958, **seis escenarios** críticos ponen a prueba a la familia.
El jugador decide, en cada escenario, cuál es la línea de acción del consejero. Cada
elección modifica tres indicadores (Poder, Lealtad e Imagen), y el legado final del jugador
queda determinado por la combinación de los tres.

**Premisa central:** *"El poder no se hereda, se negocia. La familia no se protege, se
tiene."*

---

## 3. Propósito y audiencia

- **Propósito:** Demostrar motor de juego de trama con estado determinista, tres ejes de
  mora, y una estructura de finales condicionada por estado.
- **Audiencia:**
  - Jugador final: visitante de la página web (experiencia de 5–8 min por partida).
  - Desarrollador: persona que extiende escenarios o ajusta el algoritmo de finales.
  - QA: verificación del flujo de ejecución y de la persistencia.

---

## 4. Mecánicas centrales

| Concepto | Descripción |
|---|---|
| **Escenario** | Un capítulo narrativo con contexto, personajes involucrados, 3 opciones de decisión. |
| **Decisión** | Elección de uno de 3 cursos de acción. No hay "opciones de paciencia". |
| **Indicadores** | Tres variables enteras en el rango [0, 100] que rastrean el estado de la familia. |
| **Consecuencia** | Cada decisión suma/resta enteros a los tres indicadores, y genera texto de "resumen" del escenario. |
| **Trayectoria** | Secuencia ordenada de 6 decisiones. El orden es fijo (1→2→3→4→5→6). |
| **Final** | El resultado after the 6th scenario, computed by the ending algorithm from final indicators. |

### El árbol de decisión

- 6 capítulos en una espina lineal (seccion 1 → 2 → … → 6).
- Cada capítulo presenta 3 decisiones; **cada opción es válida y conduce al siguiente
  capítulo**.
- El resultado inmediato (texto) varía según la elección; los deltas de indicador varían
  también.
- 3⁶ = **729 trayectorias posibles**. Todas convergen al algoritmo de finales.

---

## 5. Indicadores

| Nombre (clave) | Rango | Describe | Afecta a |
|---|---|---|---|
| **Poder** (`power`) | 0–100 | Influencia política/criminal y alcance del imperio | "El Caído", "El Legado" |
| **Lealtad** (`loyalty`) | 0–100 | Confianza familiar y solidez de alianzas | "El Defensor", "El Legado" |
| **Imagen** (`reputation`) | 0–100 | Percepción pública y riesgo legal | "El Estigado", "El Legado" |

- Se almacenan como números enteros.
- Cada decisión aplica una delta entera a uno, dos o los tres indicadores.
- Los valores se **clampean** (ajustan) al rango [0, 100] después de cada actualización.
- La suma total de los tres indicadores es la "calificación básica" pre-final.

### Semántica de los indicadores

- **Poder:** control institucional (bancos, zonas de influencia, Informales), capacidad
  de movilidad de recursos. Alta Poder con baja Lealtad/Imagen = imperio frágil.
- **Lealtad:** promesas cumplidas, sacrificios, lealtad de los subordinados y de los
  parientes. Alta Lealtad sin poder = figura respetada pero débil.
- **Imagen:** percepción pública, carácter legal/ética, imagen de "hombre de honor".
  Alta Imagen sin poder/lealtad = venerado pero impotente.

---

## 6. Escenarios

Cada escenario define:
- `id`, `title`, `subtitle`, `context` (contexto), `characters` (personajes), `hints` (pistas).
- `decisions`: array de 3 objetos con `id`, `label`, `text`, `delta` y `outcome`.
- `summary`: plantilla de texto de "resumen" que se llena con los indicadores.

---

### Escenario 1 — **La Junta de Familia** (`s1_family_council`)

- **Contexto:** Don Vito está enfermo en su estudio. Un intento de asesinato contra él fue
  descubierto. Las familias Barzini y Medicasosa lo culpan. El consejo de la familia se
  reúne para decidir la respuesta.
- **Personajes:** Don Vito (en cama), Michael, Sonny, Tom Hagen, el consejero (jugador).

| Opción | ID | Delta (Poder, Lealtad, Imagen) | Resumen |
|---|---|---|---|
| A: Acompaño a Michael a la oferta de Barzini | `d1a` | (+10, −5, −10) | "Firmas la alianza con Barzini. El négoce amplía, pero la familia murmura." |
| B: Niegues la alianza con Barzini | `d1b` | (+6, +12, −3) | "Desafías a Barzini en público. Los prestatarios se alejan, el ánimo es alto." |
| C: Propones un arbitraje | `d1c` | (+3, +8, +10) | "Invitas a ambos lados a mediar. La paz se prolonga, el poder se estanca." |

- **Flujo:** Siempre → escenario 2.

---

### Escenario 2 — **El Banco** (`s2_bank`)

- **Contexto:** El banco de la familia está impagando sus deudas. Un accionista importante
  pide retirar sus ahorros. Sonny amenaza con cerrar el banco si no se paga.
- **Personajes:** Michael (banco), Tom Hagen (asesor legal), Sonny (presión familiar).

| Opción | ID | Delta | Resumen |
|---|---|---|---|
| A: Dejarlo retirar | `d2a` | (−6, +10, +11) | "Respetas la ley. El sector bancario respeta más a la familia." |
| B: Negociar reestructuración | `d2b` | (+9, −4, −5) | "Aplagas el pago. El banco sobrevive, pero el ajuste de cuentas es incómodo." |
| C: Prestar a condición de lealtad | `d2c` | (+12, −8, −8) | "Exiges el depósito como garantía. La familia se consolida, la confianza aprieta." |

- **Flujo:** Siempre → escenario 3.

---

### Escenario 3 — **La Propuesta** (`s3_proposal`)

- **Contexto:** Don Vito, jurando, ofrece a Michael un asiento en el consejo familiar. Es
  la puerta abierta al poder. Michael duda.
- **Personajes:** Don Vito, Michael, el consejero (jugador).

| Opción | ID | Delta | Resumen |
|---|---|---|---|
| A: Acepta la propuesta | `d3a` | (+14, −4, −9) | "Michael se sienta en el consejo. El poder de la familia crece, el honor se pone a prueba." |
| B: Se niega | `d3b` | (+4, +16, −5) | "Michael rechaza el asiento. La familia mantiene su código, pero el poder no se expande." |
| C: Proponer un co-presidente | `d3c` | (+7, +10, 0) | "Se propone que Michael y su hermano compartan presidencia. El equilibrio mantiene el rumbo." |

- **Flujo:** Siempre → escenario 4.

---

### Escenario 4 — **La Promesa** (`s4_vow`)

- **Contexto:** Un antiguo aliado de la familia muere. Antes de irmse, le pide un favor a
  Michael. No se trata de dinero, sino de una red de gente inocente (mujer y niños),
  dependientes de él.
- **Personajes:** Michael, un aliado muerto, las víctimas (no mencionadas directamente).

| Opción | ID | Delta | Resumen |
|---|---|---|---|
| A: Cumplir la promesa | `d4a` | (−4, +14, +8) | "El consejero abre las redes. La familia respeta el honor, el riesgo legal aumenta." |
| B: Negar la promesa | `d4b` | (+10, −15, −4) | "Se niega. La familia se salva, pero la lealtad de los más débiles se rompe." |
| C: Encontrar una alternativa | `d4c` | (0, +9, +11) | "Se protege a los inocentes por otros caminos. El honor se mantiene, los gastos aumentan." |

- **Flujo:** Siempre → escenario 5.

---

### Escenario 5 — **El Ranquillo** (`s5_gambit`)

- **Contexto:** Una familia rival amenaza con atacar la zona. Michael, ahora nuevo líder,
  decide cómo responder. La guerra puede expandir el poder, pero costará vidas.
- **Personajes:** Michael (capo), Sonny (solver de conflictos), los aliados de la zona.

| Opción | ID | Delta | Resumen |
|---|---|---|---|
| A: Atacar primero | `d5a` | (+18, −9, −14) | "La guerra severa la rival. El imperio crece, el precio es la lealtad." |
| B: Esperar la señal | `d5b` | (+3, +10, −5) | "Esperas que la rival se autocomplete. El poder no cambia, el estrés es alto." |
| C: Negociar tregua | `d5c` | (+14, +6, +12) | "Se firma una tregua. El imperio se estabiliza, la lealtad se recupera." |

- **Flujo:** Siempre → escenario 6.

---

### Escenario 6 — **El Recuento** (`s6_final_council`)

- **Contexto:** La crisis final. No todos en la familia pueden ser salvados. La elección
  define el legado.
- **Personajes:** Don Vito (preocupo), Michael (decide), el consejero (jugador, definitivo).

| Opción | ID | Delta | Resumen |
|---|---|---|---|
| A: Apoyo total a la familia | `d6a` | (+9, +15, −11) | "Se cuida a todos. El imperio se enreda, el honor se mantiene." |
| B: Supervivencia de unos | `d6b` | (+14, −4, +6) | "Se sacrifica a unos para rescatar a otros. El poder se fortalece, la lealtad se quiebra." |
| C: Liderar el regreso a casa | `d6c` | (+3, +10, +12) | "La familia se reconcilia y regresa a la seguridad. Equilibrio final." |

- **Flujo:** → Final (algoritmo de finales).

---

## 7. Árbol de decisión (mapa de estado)

```
[S1] La Junta de Familia          (3 opciones → deltas fijas)
   │
   ▼
[S2] El Banco                       (3 opciones → deltas fijas)
   │
   ▼
[S3] La Propuesta                   (3 opciones → deltas fijas)
   │
   ▼
[S4] La Promesa                     (3 opciones → deltas fijas)
   │
   ▼
[S5] El Ranquillo                   (3 opciones → deltas fijas)
   │
   ▼
[S6] El Recuento                    (3 opciones → deltas fijas)
   │
   ▼
[FINAL] Algoritmo de finales
```

Cada decisión produce dos efectos:
1. **Cambios de indicador** (delta aplicado → clamp).
2. **Texto de flujo** (el resumen del escenario se asocia con el contexto del tercer
   escenario según la opción, de forma determinista).

---

## 8. Arquitectura de la máquina de estado

El motor se modela como una **máquina de estados determinista** en la que los estados no
codifican la historia, solo el *punto de control* de la interfaz. Todo el contenido de la
historia vive en los datos escenario (complemento puro), y la máquina solo reacciona a
eventos del usuario.

### Estados

| Estado ID | Propósito | Datos de entrada | Salida |
|---|---|---|---|
| `MENU` | Pantalla de inicio, inicio de partida | — | `SCENARIO` (escenario 1) |
| `SCENARIO` | Muestra el escenario + 3 opciones | `scenario`, `indicators` | `OUTCOME` (luego → `SCENARIO`) |
| `OUTCOME` | Muestra el resumen de la decisión y los nuevos indicadores | `scenario`, `decision`, `oldIndicators`, `newIndicators` | `SCENARIO` (próximo escenario) o `GAME_OVER` |
| `GAME_OVER` | Muestra el final según los indicadores finales | `ending`, `indicators` | `MENU` (reiniciar) |

### Transiciones

```
MENU  → SCENARIO    (inicio; escenario 1)
SCENARIO → OUTCOME   (decisión enviada)
OUTCOME → SCENARIO   (siguiente escenario; si escenario 6, → GAME_OVER)
OUTCOME → GAME_OVER  (escenario 6 + decisión)
GAME_OVER → MENU     (reiniciar)
```

### Reglas de ejecución

- **Solo lectura del UI:** la máquina no manipula DOM, solo devuelve datos.
- **Determinismo:** mismo estado + misma decisión → misma salida.
- **Sin efectos secundarios:** la lógica pura no toca `localStorage`; eso está en un
  `storage.ts` separado (capa de persistor).

### Diagrama conceptual

```
   ┌────────┐   iniciar   ┌───────────┐   elección   ┌───────────┐
   │ MENU   │────────────▶│ SCENARIO  │─────────────▶│ OUTCOME   │
   └────────┘             └───────────┘              └─────┬─────┘
                                                          │ decisión final
                                                          ▼
                                                     ┌──────────────┐
                                                     │ GAME_OVER   │
                                                     └──────────────┘
                                                                  │ reiniciar
                                                                  ▼
                                                             ┌────────┐
                                                             │ MENU  │
                                                             └────────┘
```

---

## 9. Algoritmo de puntuación

La puntuación es una **suma ponderada** de los tres indicadores que se reporta como una
calificación final (0–100), complementaria al algoritmo de finales.

```
Score = (Poder × 0.40) + (Lealtad × 0.30) + (Imagen × 0.30)
```

- Redondeo al entero más cercano.
- El peso de Poder es el mayor porque la estabilidad del imperio es la condición
  principal; Lealtad e Imagen son igualmente importantes.
- El Score se usa en pantalla de finales para el ranking; el legado se decide por el
  algoritmo de finales.

```ts
function computeScore(indicators): number {
  const total =
    indicators.power * 0.40 +
    indicators.loyalty * 0.30 +
    indicators.reputation * 0.30;
  return Math.round(total);
}
```

---

## 10. Algoritmo de finales

Cinco finales dependen de la comparación de los tres indicadores finales con umbrales.

### Reglas

1. **El Legado** — si los tres indicadores son ≥ 60 (equilibrio absoluto).
2. **El Caído** — si Poder ≥ 60, pero no todos ≥ 60 (poder sin equilibrio).
3. **El Defensor** — si Lealtad ≥ 60, pero no todos ≥ 60 (lealtad sin equilibrio).
4. **El Estigado** — si Imagen ≥ 60, pero no todos ≥ 60 (imagen sin equilibrio).
5. **La Familia Rotta** — si todos los indicadores < 40 (colapso).

Si ninguna regla de arriba se cumple (p.ej. unos indicadores ≥60 y otros entre 40 y 59),
se aplica como **respaldo**: el final es el de la máxima "norma" alcanzada:
- Si `max(power, loyalty, reputation) ≥ 60` → el final de la indicador con mayor
  valor (Poder → Caído, Lealtad → Defensor, Imagen → Estigado).
- Si el máximo < 60 pero el mínimo < 40 → se elige el final del indicador más bajo.
- Si todos están entre [40, 60) → final "El Legado" (equilibrio intermedio).

### Pseudocódigo

```
function determineEnding(indicators):
    p = indicators.power
    l = indicators.loyalty
    i = indicators.reputation
    allHigh = p ≥ 60 AND l ≥ 60 AND i ≥ 60
    allLow  = p < 40 AND l < 40 AND i < 40

    if allHigh: return "legacy"
    if p ≥ 60:           return "fallen"
    if l ≥ 60:           return "defender"
    if i ≥ 60:           return "saint"
    if allLow:           return "broken"

    // respaldo: usar el indicador dominante
    const max = max(p, l, i)
    if max ≥ 60: return dominantIndicatorMax(...)  // fallen/defender/saint
    if min(p, l, i) < 40: return dominantIndicatorMin(...)
    return "legacy"   // rango intermedio
```

### Tabla de finales

| ID | Nombre | Condición | Resumen |
|---|---|---|---|
| `legacy` | **El Legado** | p ≥ 60 ∧ l ≥ 60 ∧ i ≥ 60 | El imperio es sostenible y respetado. |
| `fallen` | **El Caído** | p ≥ 60 ∧ ¬(todos ≥ 60) | Poder absoluto, pero sin equilibrio. |
| `defender` | **El Defensor** | l ≥ 60 ∧ ¬(todos ≥ 60) | Familia unida, pero sin alcance. |
| `saint` | **El Estigado** | i ≥ 60 ∧ ¬(todos ≥ 60) | Venerado, pero impotente. |
| `broken` | **La Familia Rotta** | p < 40 ∧ l < 40 ∧ i < 40 | El imperio colapsa. |

---

## 11. Esquema de `localStorage`

### Clave raíz

```
elConsejoV2:state
```

### Interfaz de persistencia

| Clave secundaria | Tipo | Uso |
|---|---|---|
| `state` | `object` (JSON) | Estado completo de la partida (ver abajo). |

### `GameState` (tipado)

```ts
interface GameState {
  version: 1;
  saveId: string;          // UUID v4, cambia solo al reiniciar
  player: {
    name: string;
    role: string;          // siempre "consigliere"
  };
  indicators: {
    power: number;         // 0..100
    loyalty: number;       // 0..100
    reputation: number;    // 0..100
  };
  history: HistoryEntry[]; // registro de decisiones
  finished: boolean;
  finishedAt: string | null;
  ending: string | null;
  metadata: {
    startedAt: string;
    completedAt: string | null;
  };
}

interface HistoryEntry {
  scenarioId: string;
  decisionId: string;
  delta: { power: number; loyalty: number; reputation: number };
  timestamp: string;       // ISO 8601
}
```

### Rutinas de persistencia

| Operación | Acción |
|---|---|
| `saveState(gameState)` | `localStorage.setItem('elConsejoV2:state', JSON.stringify(gameState))` |
| `loadState()` | `JSON.parse(localStorage.getItem('elConsejoV2:state'))` |
| `clearState()` | `localStorage.removeItem('elConsejoV2:state')` |

- Solo se guarda en `SCENARIO → OUTCOME` (después de cada decisión).
- El estado completo se guarda, incluyendo `history`, para reproducir o reanudar la partida.

---

## 12. Protocolo de persistencia

1. **Inicialización:** al cargar la app, intenta `loadState()`. Si falla (no existe o es
   corrupto), se inicia un estado inicial (0, 0, 0).
2. **Carga de la partida:** si el estado está completo (`finished === true`), la app
   pregunta si quiere reanudar o empezar de nuevo.
3. **Upsert:** cada decisión aplica el delta, clampa los indicadores, registra `history` y
   luego `saveState()`.
4. **Fallback:** si `JSON.stringify()` o `JSON.parse()` fallan por límite de tamaño (poco
   probable), se conserva el estado en memoria y se notifica al usuario.
5. **Cierre:** el estado se guarda automáticamente sin pulsación de botón.

---

## 13. Clasificación de archivos (lógica separada de la UI)

```
V2/
├── src/
│   └── game/                       # ← Lógica pura, sin DOM
│       ├── types.ts                # Interfaces y tipos
│       ├── scenarios.ts            # Datos: 6 escenarios, 18 decisiones
│       ├── core.ts                 # Lógica pura: decision, score, ending, clamp
│       ├── storage.ts              # Persistencia localStorage (thin wrapper)
│       └── index.ts                # Barrel export
├── tests/
│   └── game.test.ts                # Casos de prueba para la lógica pura
├── package.json                    # scripts: dev, build, test
└── ...
```

### Contrato de componentes

- `core.ts`: funciones puras — `applyDecision`, `clampIndicator`, `computeScore`,
  `determineEnding`, `isDecisionValid`.
- `scenarios.ts`: datos inmutables — `getScenario`, `getAllScenarios`.
- `storage.ts`: encuadernación de `localStorage` — `saveState`, `loadState`, `clearState`.
- `ui/` (reserva para futuras implementaciones): consume la API de `core.ts` sin conocer
  el almacenamiento.

---

## 14. Pruebas Node (casos de prueba para la lógica JS pura)

El conjunto de pruebas cubre:

1. **clampIndicator** — límites inferiores, superiores y dentro del rango.
2. **applyDecision** — deltas aplicadas, indicadores válidos, clamp por resultado.
3. **isDecisionValid** — opción válida en escenario, opción inválida fuera de escenario.
4. **computeScore** — 0, 100, y combinaciones intermedias.
5. **determineEnding** — los 5 finales y el respaldo.
6. **scenarios** — 6 escenarios con 3 decisiones cada uno (18 decisiones, deltas válidos).
7. **storage** — save/load/clear redondeo; error de JSON corrupto.
8. **end-to-end integration** — 6 escenarios recorridos con una trayectoria arbitraria y
   verificación del final.

### Ejemplos de casos

```ts
// clampIndicator
assert.equal(clampIndicator(-5, 'power'), 0);
assert.equal(clampIndicator(105, 'power'), 100);
assert.equal(clampIndicator(42, 'power'), 42);

// applyDecision
const { indicators, delta } = applyDecision(current, decision);
assert.equal(delta.power, -10);
assert.equal(indicators.power, clamp(current.power - 10, 0, 100));

// determineEnding — El Legado
assert.equal(
  determineEnding({ power: 80, loyalty: 70, reputation: 75 }),
  'legacy'
);
```

### Cómo ejecutar

```bash
cd /home/andresdev/multi-agent-demo/V2
npm install        # instala vitest + typescript
npx vitest run     # ejecuta la suite de pruebas
```

---

## 15. Glosario

| Término | Significado |
|---|---|
| **Delta** | Cambio entero aplicado a un indicador por una decisión. |
| **Clamp** | Ajuste de un valor al rango límite [0, 100]. |
| **Estado** | Punto de control de la máquina de estados. |
| **Indicador** | Variable de estado (0–100) que rastrea un eje de la historia. |
| **Máquina de estado** | Modelo donde los estados representan pantallas y las transiciones
representan acciones del usuario. |
| **Trayectoria** | Secuencia de decisiones (6 decisiones). |
| **Final** | Resultado post-juego determinado por el algoritmo de finales. |

---

## 16. Referencias

- *The Godfather* (1972) — Francis Ford Coppola.
- *The Godfather Part II* (1974) — Francisco Coppola.
- Proyecto V1 original: `godfather-project/` (Bootstrap 5.3 + Vite + TypeScript).
- Proyecto V2 esqueleto: `V2/` (config vacía, `src/`, `public/`, `scripts/` vacíos).

---

*Documento generado para el Subagente B del flujo de trabajo V2 (Corleone-Archive).*
