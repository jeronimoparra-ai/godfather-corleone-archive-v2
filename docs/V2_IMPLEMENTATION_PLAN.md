# V2 IMPLEMENTATION PLAN — THE GODFATHER: THE CORLEONE ARCHIVE V2.0

**Document type:** Product & Architecture Definition
**Branch:** `redesign/corleone-archive-v2` (current worktree: parent repo root)
**Date:** 2026-10-30
**Orquestación:** Hermes (Chief Orchestration Agent) — con delegación paralela
**Product name:** THE GODFATHER — THE CORLEONE ARCHIVE (V2.0)
**Turno:** SECUENCIA CINEMATOGRÁFICA / ARCHIVO DIGITAL INTERACTIVO / VIDEOJUEGO DE DECISIONES

---

## 1. ESTADO INICIAL (FASE 0 — descubrimiento verificado)

| Criterio | Resultado |
|---|---|
| Proyecto V1 identificado | `/home/andresdev/multi-agent-demo/godfather-project/` (untracked) |
| Worktree protegido | `redesign/corleone-archive-v2` (rama + worktree en parent repo root) |
| V1 respaldado | `V1_ARCHIVE/godfather-project-v1/` |
| Agentes externos | `agy` (Antigravity CLI, mode `--print`/`-p`) y `gemini` (0.66.0) |
| Subagentes internos | A (Arquitecto), B (Game Designer), C (Contenido), D (Creador Dirección) |
| Build V1 | `npm run build` → EXIT 0 (bootstrap 5.3 + Vite + TS) |
| Estado | **Listo para el rediseño** |

**Nota:** `gemini` CLI en nuvem de Google; errores 503 transitorios en la API. No bloquea el flujo porque `agy` cubre la implementación visual y la tarea de revisión crítica la cumple el subagent D dentro del sandbox.

---

## 2. OBJETIVO DEL PRODUCTO (FASE 1)

**Name:** THE GODFATHER — THE CORLEONE ARCHIVE.
**Concept:** CINEMATIC EDITORIAL ARCHIVE — archivo cinematográfico digital interactivo que combina publicación premium, archivo histórico, narrativa interactiva y videojuego de decisiones.
**Requisitos académicos (SENA Evidence 21):** Bootstrap 5.3, grid, navbar, cards, modals, forms, componentes dinámicos, HTML5, CSS3, responsive, accesibilidad, usabilidad.
**Calidad visual:** rediseño completo — identidad distinta de V1, editorial y cinematográfica, asimétrica, espaciado generoso.

### 2.1 Estado de las entregas de FASE 1

| Subagente | Entrega | Ubicación | Estado |
|---|---|---|---|
| A — Arquitecto | `V2_ARCHITECTURE_PROPOSAL.md` | `V2/V2_ARCHITECTURE_PROPOSAL.md` | ✅ Terminada |
| B — Game Designer | `GAME_DESIGN_DOCUMENT.md`, `src/game/{types,scenarios,core,storage,index}.ts` | `V2/docs/game-design/`, `V2/src/game/` | ✅ Terminada |
| C — Contenido | `the_godfather_1972_verified.md` (hecho) | (en raíz) | ✅ Terminada |
| D — Creador Dirección | `CRÍTICA PRODUCTIVA` | (transcript) | ✅ Terminada |

Los archivos de game engine (src/game/*) son entregables reales del subagente B; están listos para integrarse.

---

## 3. ARQUITECTURA FUNCIONAL V2

### 3.1 Organización de archivos (contrato con el subagente A)

```
V2/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── README.md
├── docs/
│   ├── game-design/GAME_DESIGN_DOCUMENT.md
│   ├── design/V2_CREATIVE_DIRECTION.md         (pending on agy)
│   ├── design/GEMINI_VISUAL_REVIEW.md          (pending on agy+gemini)
│   ├── orchestration/AGENT_EXECUTION_LOG.md
│   └── evidence/ENVIDENCIA_21_*.docx           (Phase 8)
├── public/
│   ├── assets/
│   │   ├── css/main.css
│   │   └── images/
│   └── assets/images/characters/...
├── src/
│   ├── main.ts                               # Entry: bootstrap, DI, mount
│   ├── game/                                 # Motor del juego (Subagent B)
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── scenarios.ts
│   │   ├── core.ts
│   │   ├── storage.ts
│   │   └── (tests)
│   └── components/                           # UI (Antigravity)
├── tests/
│   └── game.test.ts                          # Pruebas del motor
```

### 3.2 Contratos de integración

| Contrato | Descripción |
|---|---|
| `Game` (namespace `src/game`) | Motor puro: `init()`, `applyDecision(decisionId)`, `getState()`, `saveState()`, `loadState()`, `clearState()` |
| Persistencia | `localStorage` — `corleone_archive_v2_game` (single key) |
| UI ↔ Game | UI solo lee/llama al motor. El motor nunca toca el DOM |
| Supabase | `src/services/supabase.ts` — opiniones de comunidad. Modo offline si no hay credenciales |
| Audio | `src/services/audio.ts` — reproductor ambiental |

### 3.3 Navegación (estructura de secciones)

| Sección | ID | Contenido |
|---|---|---|
| Inicio | `#home` | Hero cinematográfico, marca, navegación |
| La Película | `#movie` | Datos generales, sinopsis, reparto, producción, música, fotografía |
| Personajes | `#characters` | 7 personajes, galería, modales |
| Archivo Narrativo | `#archive` | Cronología, spoilers, editorial |
| El Juego | `#game` | Botonera: El Consejo de la Familia |
| Legado | `#legacy` | Análisis cinematográfico, cultural, narrativo |
| Comunidad | `#community` | Opiniones, form, Supabase |
| Galería | `#gallery` | Galería de personajes (detalle ampliado, modales) |

---

## 4. VIDEOJUEGO: EL CONSEJO DE LA FAMILIA

### 4.1 Mecánica (contrato del subagente B)

- **6 escenarios**, 3 decisiones cada uno.
- **3 indicadores:** power (Estrategia), loyalty (Lealtad), reputation (Imagen) — range 0..100.
- **Indicadores:** recuento en pantalla, delta por decisión, delta máximo +20/escenario.
- **Finales (5):**
  - `legacy` — "El Legado": equilibrio perfecto.
  - `fallen` — "El Caído": poder absoluto sin equilibrio.
  - `defender` — "El Defensor": unidad por lealtad.
  - `saint` — "El Estigado": imagen venerada, impotente.
  - `broken` — "La Familia Rotta": colapso.

### 4.2 Persistencia

- `localStorage` solo: `corleone_archive_v2_game`.
- Datos: best score, completed games, last result, stats básicas.
- El videojuego NO usa Supabase ni autenticación.

### 4.3 Pruebas

- `tests/game.test.ts` (Subagent B): pruebas unitarias del motor.
- Verificar en QA (FASE 7): build, TypeScript, tests, juego ejecutable.

---

## 5. DIRECCIÓN VISUAL (Fase 3: Antigravity)

### 5.1 Prioridades de diseño (del CRÍTICA PRODUCTIVA + paleta)

| Elemento | Especificación |
|---|---|
| Paleta | Marfil #F1EBDD, Negro Tinta #171513, Borgoña #4B121B, Dorado #A47A48, Gris Piedra #79736B, Blanco Cálido #FAF8F2 |
| Tipografía | Cormorant Garamond / Playfair Display + Inter / Source Sans Pro |
| Composición | Editorial, asimétrica, cinematográfica, espaciado generoso |
| Fondo | Secciones claras/oscuras alternando ritmo |
| Hero | Foto protagonista, texto editorial grande |

### 5.2 Entregables de Antigravity

- `public/assets/css/main.css` — estilos V2
- `src/main.ts` + componentes interactivos (Antigravity)
- `public/assets/images/` — imágenes de la V2 (Hero, personajes, galería)
- Revisión visual en navegador (Antigravity inspecciona el resultado)

---

## 6. CRITERIOS DE CALIDAD (FASES 6–9)

| Clave | Comprobado | Estado |
|---|---|---|
| Identidad visual totalmente renovada | — | Pendiente |
| Diseño editorial / cinematográfico | — | Pendiente |
| Navegación reorganizada | — | Pendiente |
| Responsive 375/768/1024/1440px | — | Pendiente |
| Bootstrap 5.3 efectivo | ✅ (build V1) | Hecho |
| Galería de personajes funcional | ✅ (build V1) | Hecho |
| Videojuego real: 6 escenarios | ✅ (Subagent B) | Hecho |
| 3 indicadores funcionales | ✅ (Subagent B) | Hecho |
| 5 finales calculados | ✅ (Subagent B) | Hecho |
| Persistencia localStorage | ✅ (Subagent B) | Hecho |
| Puntuación real | ✅ (Subagent B) | Hecho |
| Reproductor musical | — | Pendiente |
| Accesibilidad WCAG 2.1 AA | — | Pendiente |
| Build de producción EXIT 0 | ✅ (V1) | Hecho |
| Capturas reales | — | Pendiente |
| Word/PDF Evidence 21 | — | Pendiente |
| README actualizado | — | Pendiente |

---

## 7. PLAN DE EJECUCIÓN DE FASES

| Fase | Actores | Resultado esperado |
|---|---|---|
| FASE 2 | Hermes | `docs/V2_IMPLEMENTATION_PLAN.md` escrita (este documento) |
| FASE 3 | Antigravity (agy) + Gemini (gemini) | Interfaz visual V2, estilos, hero, navbar, secciones |
| FASE 4 | Subagent B (game) + Antigravity (UI) | Motor integrado y pruebas |
| FASE 5 | Hermes | Integración final, resolución de incompatibilidades |
| FASE 6 | Gemini (gemini) | `docs/design/GEMINI_VISUAL_REVIEW.md` |
| FASE 7 | QA + Hermes | Build, TypeScript, pruebas, responsive, accesibilidad |
| FASE 8 | Subagent E | README, Word, capturas reales |
| FASE 9 | Hermes | Informe final de entrega |

---

## 8. FLUJO DE TEAMWORK — Reglas de cobertura

- **Nadie sobrescribe los archivos del otro.** Se usan directories/areas aisladas.
- **Geminis revisión final** se hace sobre la implementación de Antigravity, no sobre los diseños.
- **Hermes aplica filtros:** build, TypeScript, pruebas, accesibilidad.
- **Serán el único"> que aprueba la entrega y publica (Si el usuario lo autoriza).
- **Los entregables de Subagent E** (README, Word, capturas) se generan en FASE 8.

---

## 9. RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| `gemini` API altamente demandada (503) | Medio | `agy` cubre implementación visual; subagent D cubre crítica |
| Backlog de diseño de Antigravity | Medio | Gerarquía y contratos publicados en FASE 2 |
| Accesibilidad incompleta | Medio | WCAG 2.1 AA checklist introducido en FASE 7 |
| Build V2 roto | Bajo | `tsc && vite build` como gate de entrega |

---

## 10. SIGUIENTE ACCIÓN

1. Hermes aplica el plan a Antigravity (agy) con el contexto completo del proyecto V2.
2. Antigravity genera la interfaz visual y estilos V2 (FASE 3).
3. Hermes integra con el engine del juego y verifica.
4. Gemini hace la revisión visual (FASE 6).
5. QA ejecuta pruebas cruzadas (FASE 7).
6. Subagent E genera la documentación (FASE 8).
7. Hermes entrega el informe final (FASE 9).

---

*Reporte del coordinador de orquestación. Generado por Hermes (Chief Orchestration Agent) — 2026-10-30.*
