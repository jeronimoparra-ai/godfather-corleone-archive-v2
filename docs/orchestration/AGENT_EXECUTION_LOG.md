# FASE 0 — Descubrimiento y Organización de Agentes

**Fecha:** 2026-10-30
**Agente responsable:** Hermes (Chief Orchestration Agent, Software Architect, Technical Project Director)
**Rama de trabajo:** `redesign/corleone-archive-v2` (trabajo en curso)
**Workspace:** `/home/andresdev/multi-agent-demo/` (parent repo root = worktree)

---

## 1. OTROS REPOSITORIOS / WORKTREES PROTEGIDOS

| Path | Rama | Estado |
|---|---|---|
| `/home/andresdev/multi-agent-demo` | `redesign/corleone-archive-v2` (HEAD=289e65d) | **Trabajo V2** |
| `/home/andresdev/orca/workspaces/multi-agent-demo/antigravity-worker` | `jeronimoparra-ai/antigravity-worker` | No afectado |
| `/home/andresdev/orca/workspaces/multi-agent-demo/gh-repo-clone-luis06-op-preversst` | `jeronimoparra-ai/gh-repo-clone-luis06-op-preversst` | No afectado |
| `/home/andresdev/orca/workspaces/multi-agent-demo/opencode-worker` | `jeronimoparra-ai/opencode-worker` | No afectado |
| `/home/andresdev/multi-agent-demo/godfather-project/` | (sin .git, no versionado) | **V1 original (no tocar)** |
| `/home/andresdev/multi-agent-demo/V1_ARCHIVE/godfather-project-v1/` | (copia de seguridad) | **V1 respaldado** |

---

## 2. HERRAMIENTAS EXTERNAS DISPONIBLES

| Herramienta | Ejecutable | Estado | Models disponibles |
|---|---|---|---|
| Antigravity CLI | `agy` | ✅ Funcional | gemini-3.8-flash-high/medium/low, claude-sonnet-4-6, claude-opus-4-6-thinking, gpt-oss-120b-medium |
| Gemini CLI | `gemini` | ✅ Funcional (interbales 503 transitorios; reintentar) | codeless / Google-backed |

**NOTA:** `gemini` 0.66.0 en nuvem de Google. Los errores 503 son de alta demanda, no de autenticación. Reintentar con paciencia.

---

## 3. ARQUITECTURA DEL PROYECTO V1 (conocida de fase previa)

- **Framework:** Bootstrap 5.3.3 (CDN) + Vite 5.4.10 + TypeScript 5.6.2
- **Dependencyes:** bootstrap, bootstrap-icons, supabase, @supabase/supabase-js
- **Entrada:** `index.html` (root) + `src/assets/js/main.js` (Vite module entry)
- **Contenido:** 7 personajes, 8 preguntas quiz, 6 timeline items, 6 galería (SVG data-URI), reproductor musical
- **State:** `localStorage` para opiniones de comunidad y puntuación de juego
- **Build:** `npm run build` (tsc + vite build) → EXIT 0

---

## 4. ROLES Y CONTRATOS DE AGENTES

### AGENTE EXTERNO 1: Antigravity CLI
**Rol:** Lead Visual Implementation Engineer
**Ámbito:** Interfaz visual, estilos, componentes, animaciones, responsive, Hero, Navbar, galería, modales, temporal
**Archivos que puede modificar:** `V2/index.html`, `V2/src/**`, `V2/public/assets/**`, `V2/package.json`, `V2/tsconfig.json`, `V2/vite.config.ts`
**Archivos que NO puede modificar:** `V1_ARCHIVE/**`, `godfather-project/**`, `*.sql`, `*.md` de documentación institucional, `package-lock.json` (a menos que Hermes lo autorice)

### AGENTE EXTERNO 2: Gemini CLI
**Rol:** Creative Director and Independent UX/UI Reviewer
**Primera intervención:** Produce `docs/design/V2_CREATIVE_DIRECTION.md` (solo dirección, sin modificar archivos fuente)
**Segunda intervención:** Produce `docs/design/GEMINI_VISUAL_REVIEW.md` (revisión, sin modificar archivos compartidos)

### SUBAGENTE A — Arquitecto Técnico
**Ámbito:** Arquitectura de V2, organización de archivos, contratos entre componentes, gestión de estado, integración, mantenimiento
**Entrega:** `docs/V2_ARCHITECTURE_PROPOSAL.md`

### SUBAGENTE B — Game Designer / Game Engine
**Ámbito:** Mecánicas, 6 escenarios, consecuencias, puntuación, indicadores, finales, persistencia local
**Entrega:** `V2/src/game/` + documentación del motor de juego

### SUBAGENTE C — Contenido e Investigación
**Ámbito:** Datos de la película, personajes, reparto, cronología, contexto histórico, fuentes y atribuciones
**Entrega:** Contenido verificado (voz de autoridad, sin inventar)

### SUBAGENTE D — QA Y Accesibilidad
**Ámbito:** Pruebas de funcionalidad, Bootstrap, responsive (375/768/1024/1440px), accesibilidad WCAG 2.1 AA, rendimiento, seguridad, juego
**Entrega:** Reportes de prueba

### SUBAGENTE E — Documentación
**Ámbito:** README, documentación técnica, Word, capturas reales, evidencia académica
**Entrega:** `V2/README.md`, `docs/evidence/ENVIDENCIA_21_*.docx`, capturas reales

---

## 5. FLUJO DE EJECUCIÓN

| Fase | Actividad | Entregable |
|---|---|---|
| FASE 0 | Descubrimiento, herramientas, trabajo protegido | Este documento |
| FASE 1 | Análisis paralelo (subagentes) + Gemini dirección creativa | `docs/V2_ARCHITECTURE_PROPOSAL.md`, `docs/design/V2_CREATIVE_DIRECTION.md` |
| FASE 2 | Definición del producto, contratos, plan | `docs/V2_IMPLEMENTATION_PLAN.md` |
| FASE 3 | Diseño y construcción visual (Antigravity) | V2 integrado |
| FASE 4 | Motor del videojuego (subagentes) | Motor funcional |
| FASE 5 | Integración general (Hermes) | Producto completo |
| FASE 6 | Revisión visual (Gemini) | `docs/design/GEMINI_VISUAL_REVIEW.md` |
| FASE 7 | QA | Reportes de pruebas |
| FASE 8 | Documentación | README, Word, capturas |
| FASE 9 | Entrega | Informe final |

---

## 6. PROTECCIÓN DEL REPOSITORIO

- ✅ V1 original: `/home/andresdev/multi-agent-demo/godfather-project/` (no modificado)
- ✅ V1 respaldo: `/home/andresdev/multi-agent-demo/V1_ARCHIVE/godfather-project-v1/`
- ✅ Rama de rediseño: `redesign/corleone-archive-v2` (trabajo en curso)
- ❌ No se eliminan worktrees existentes
- ❌ No se fuerza cambios de rama
- ❌ No se publican cambios
- ❌ No se hace force push

---

## 7. ORQUESTACIÓN (a partir de ahora)

- **Inicio del desarrollo:** cuando Gemini complete la dirección creativa y los subagentes terminen su análisis paralelo. CMD (Antigravity) comienza a la implementación visual inmediatamente con el plan de diseño aprobado por Hermes.

---

## FASE 0–2 — RESULTADOS DE V2 (Herlock / Subagentes completados)

### 7.1 FASE 1 — Análisis paralelo (subagentes)

| Subagente | Entregable | Ubicación | Estado |
|---|---|---|---|
| A — Arquitecto | `V2_ARCHITECTURE_PROPOSAL.md` | `V2/V2_ARCHITECTURE_PROPOSAL.md` | ✅ 19.9 KB, 419 líneas |
| B — Game Designer | `GAME_DESIGN_DOCUMENT.md` + motor del juego | `V2/docs/game-design/`, `V2/src/game/` | ✅ Terminado |
| C — Contenido | `the_godfather_1972_verified.md` | `the_godfather_1972_verified.md` | ✅ Hecho |
| D — Creador Dirección | CRÍTICA PRODUCTIVA | (transcript) | ✅ Hecha |

### 7.2 FASE 2 — Definición del producto

| Documento | Ubicación | Estado |
|---|---|---|
| `V2_IMPLEMENTATION_PLAN.md` | `V2/docs/V2_IMPLEMENTATION_PLAN.md` | ✅ Hecho |

### 7.3 FASE 3+ — Construcción visual y motor del juego (V2)

| Archivo | Estado | Tamaño |
|---|---|---|
| `V2/index.html` | ✅ Hecho | — |
| `V2/package.json` | ✅ Hecho | — |
| `V2/tsconfig.json` | ✅ Hecho | — |
| `V2/vite.config.ts` | ✅ Hecho | — |
| `V2/src/main.ts` | ✅ Hecho (UI + game bindings) | — |
| `V2/src/game/types.ts` | ✅ Hecho (motor) | — |
| `V2/src/game/scenarios.ts` | ✅ Hecho (6 escenarios, 3 decisiones) | 9.2 KB |
| `V2/src/game/core.ts` | ✅ Hecho (puntuación, finales, consecuencias) | 6.3 KB |
| `V2/src/game/storage.ts` | ✅ Hecho (localStorage) | 1.8 KB |
| `V2/src/game/index.ts` | ✅ Hecho (barrel) | — |
| `V2/public/assets/css/main.css` | ✅ Hecho (editorial, marfil/negro/dorado) | 11.3 KB |
| `V2/README.md` | ✅ Hecho | — |

### 7.4 Build de producción (V2)

```bash
$ npm run build
> tsc && vite build
✓ 9 modules transformed.
✓ built in 444ms
BUILD_EXIT=0
```

| Entregable | Tamaño |
|---|---|
| `dist/index.html` | 12.72 kB |
| `dist/assets/css/main.css` | 11.29 kB |
| `dist/assets/game-BN5NxZmD.js` | 9.51 kB |
| `dist/assets/index-C64B2DDg.js` | 3.65 kB |
| `dist/assets/index-CB8A4Dak.css` | 7.86 kB |

### 7.5 Prueba del motor de juego

La prueba de integración (Node) confirma:
- `SCENARIO_COUNT: 6` ✅
- `applyDecision()` aplica δ correctamente ✅
- `computeScore()` calcula puntuación real ✅
- `determineEnding()` asigna finales reales (5 finales) ✅
- 6 escenarios × 3 decisiones, 3 indicadores (power, loyalty, reputation) ✅

### 7.6 Estado actual del proyecto

| Criterio | Estado |
|---|---|
| Build de producción | ✅ EXIT 0 |
| Identidad visual V2 | ✅ CSS implementado (editorial, marfil/naranja/oro) |
| Interfaz V2 | ✅ HTML + CSS + JS implementados |
| Motor del juego | ✅ Implementado (motor puro, sin DOM) |
| Pruebas del motor | ✅ Smoke-test confirmada |
| Responsive | ⚠️ Pendiente (FASE 7) |
| Accesibilidad WCAG 2.1 AA | ⚠️ Pendiente (FASE 7) |
| Revisión visual (Gemini) | ⚠️ Pendiente (FASE 6) |
| Documentación (README, Word, capturas) | ⚠ Pendiente (FASE 8) |

### 7.7 Siguientes acciones

- FASE 6: Gemini (gemini) — revisión visual independiente → `docs/design/GEMINI_VISUAL_REVIEW.md`
- FASE 7: QA + Hermes — pruebas (build, Bootstrap, responsive, juego, accesibilidad)
- FASE 8: Subagent E — README, Word, capturas reales
- FASE 9: Hermes — informe final de entrega

---

*Reporte de FASE 0–2 — Hermes*
