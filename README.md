# THE GODFATHER — THE CORLEONE ARCHIVE (V2.0)

**Version:** 2.0.0
**Institución:** SENA — Técnico en Programación de Software (Código 233104)
**Programa:** Programación de Software
**Código evidencia:** 233104 (SENA Evidence 21)
**Fecha:** 2026-10-30

---

## Descripción

**THE GODFATHER — THE CORLEONE ARCHIVE** es un archivo cinematográfico digital interactivo dedicado a *The Godfather* (1972), dirigida por Francis Ford Coppola.

El producto combina:
- **Archivo cinematográfico** — datos, personajes, cronología, legado.
- **Revista editorial** — experiencia de lectura premium, tipografías editoriales.
- **Narrativa interactiva** — secciones multimedia, cronología, galería.
- **Videojuego de decisiones** — *El Consejo de la Familia* (motor puro, localStorage).
- **Comunidad** — formulario de opiniones (Supabase / localStorage offline).

---

## Tecnologías

- **Bootstrap 5.3.3** (frontend real, verificado)
- **Vite 5.4.10** (builder)
- **TypeScript 5.6.2** (tipado estricto)
- **Supabase 2.15.8** (opiniones de comunidad, con modo offline)
- **localStorage** (persistencia del videojuego)
- **HTML5 / CSS3 / JavaScript**

---

## Estructura

```
V2/
├── index.html                  # Entrada HTML5
├── package.json                # Dependencias y scripts
├── tsconfig.json               # TypeScript 5.6.2 (strict)
├── vite.config.ts              # Vite 5.4.10 + manual chunks
├── src/
│   ├── main.ts                 # Entry: bootstrap, DI, mount
│   └── game/                   # Motor del videojuego (puro, sin DOM)
│       ├── index.ts            # Barrel de exportaciones
│       ├── types.ts            # Tipos y interfaces del motor
│       ├── scenarios.ts        # 6 escenarios con 3 decisiones cada uno
│       ├── core.ts             # Lógica pura: puntuación, finales, consecuencias
│       └── storage.ts          # Persistencia localStorage
├── public/
│   └── assets/
│       ├── css/                # Estilos V2
│       └── images/             # Imágenes de la V2
├── tests/
│   └── game.test.ts            # Pruebas del motor del juego
└── docs/
    ├── game-design/GAME_DESIGN_DOCUMENT.md
    ├── orchestration/AGENT_EXECUTION_LOG.md
    └── V2_IMPLEMENTATION_PLAN.md
```

---

## Scripts

```bash
npm run dev       # Servidor de desarrollo Vite
npm run build     # tsc && vite build  →  dist/
npm run preview   # Vista previa de la build
npm run test      # Vitest
```

---

## Videojuego: El Consejo de la Familia

El centro diferencial de la V2.

- **6 escenarios** de decisión narrativa.
- **3 decisiones** por escenario, cada una con consecuencias verificables.
- **3 indicadores:** power (Estrategia), loyalty (Lealtad), reputation (Imagen).
- **5 finales** calculados real: *El Legado*, *El Caído*, *El Defensor*, *El Estigado*, *La Familia Rotta*.
- **Persistencia:** `localStorage` (best score, partidas completadas, estadísticas).
- No depende de Supabase ni de autenticación.

Los indicadores se calculan real: `computeScore()`, `determineEnding()`, `applyDecision()` son funciones puras en `src/game/core.ts`.

---

## Pruebas

```bash
npm run build     # Compilación y build de producción
npm run test      # Ejecución de pruebas unitarias
```

---

## Estado actual

| Item | Estado |
|---|---|
| Arquitectura V2 | ✅ Propuesta y validada |
| Motor del juego | ✅ Implementado (Subagent B) |
| Contenido verificado | ✅ Hecho (Subagent C) |
| Crítica de la V2 | ✅ Hecha (Subagent D) |
| Interfaz visual V2 | ⚠️ Pendiente (Antigravity, FASE 3) |
| Imágenes V2 | ⚠️ Pendiente |
| Build de producción | ⚠️ Pendiente (FASE 7) |
| Pruebas de accesibilidad | ⚠ Pendiente (FASE 7) |
| Capturas reales | ⚠ Pendiente (FASE 8) |

---

## Evidencia académica

Se generarán documentos formales en FASE 8:
- `docs/evidence/ENVIDENCIA_21_Desarrollo_de_aplicativo_Bootstrap.docx`
- Capturas reales del entorno de producción (V2 con imágenes y juego funcional)
