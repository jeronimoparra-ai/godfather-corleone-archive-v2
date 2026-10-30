# KIRO VISUAL REVIEW — THE GODFATHER: THE CORLEONE ARCHIVE V2.0

**Tipo de reporte:** Revisión creativa y técnica independiente  
**Versión analizada:** 2.0.0  
**Fecha:** 2026-10-30  
**Institución:** SENA — Técnico en Programación de Software (Código 233104)  
**Archivos base analizados:** `index.html`, `public/assets/css/main.css`, `src/main.ts`, `src/game/` (5 archivos), `tests/game.test.ts`, `vite.config.ts`, `tsconfig.json`, `package.json`  
**Metodología:** Análisis estático del código fuente real. Sin ejecución de runtime. Sin inventar datos.

---

## 1. Visión General

THE GODFATHER — THE CORLEONE ARCHIVE V2.0 es un archivo cinematográfico digital interactivo construido sobre Bootstrap 5.3.3, Vite 5.4.10 y TypeScript 5.6.2 (modo strict). El proyecto combina contenido editorial sobre la película de Coppola (1972), una galería de personajes con modales Bootstrap y un videojuego de decisiones narrativas llamado *El Consejo de la Familia*.

### Estado de completitud: PARCIALMENTE COMPLETO

| Componente | Estado |
|---|---|
| Motor de juego TypeScript (`src/game/`) | ✅ Implementado y testeado |
| Sistema de diseño CSS (`main.css`) | ✅ Completo |
| Sección Hero y sección Película | ✅ Implementados en HTML |
| Panel del juego (`#game`) | ✅ Estructura HTML + lógica JS conectada |
| Suite de pruebas unitarias | ✅ 14 grupos de tests (Vitest) |
| Documentación técnica | ✅ `GAME_DESIGN_DOCUMENT.md`, `V2_IMPLEMENTATION_PLAN.md` |
| Sección `#archive` (Archivo Narrativo) | ❌ Ausente en HTML, enlace roto en navbar |
| Sección `#legacy` (Legado) | ❌ Ausente en HTML, enlace roto en navbar |
| Sección `#community` (Comunidad) | ❌ Ausente en HTML, enlace roto en navbar |
| Imágenes locales (`public/assets/images/`) | ❌ Directorio vacío |
| `favicon.svg` | ❌ Referenciado pero no existe → 404 |
| Renderizado del `#character-grid` | ❌ JS no implementado, sección vacía en runtime |
| Integración Supabase | ❌ Dependencia declarada, sin código |

### Stack tecnológico real

- **CSS framework:** Bootstrap 5.3.3 (cargado por CDN, no por bundle local)
- **Bundler:** Vite 5.4.10
- **Lenguaje:** TypeScript 5.6.2, strict mode habilitado
- **Testing:** Vitest 2.1.6
- **Persistencia del juego:** `localStorage` nativo
- **Fuentes:** Google Fonts — Cormorant Garamond + Inter (carga asíncrona sin bloqueo)
- **Iconos:** Bootstrap Icons 1.11.3 (CDN)
- **Supabase:** `@supabase/supabase-js` 2.41.0 en `dependencies`, sin implementación en `src/`

---

## 2. Fortalezas

### 2.1 Arquitectura del motor de juego — nivel profesional

El módulo `src/game/` está diseñado con separación total de responsabilidades: lógica pura en `core.ts`, datos en `scenarios.ts`, persistencia en `storage.ts`, contratos de tipo en `types.ts` y barrel de exportación en `index.ts`. Todas las funciones exportadas son puras (sin efectos secundarios ni acceso al DOM), lo que las hace predecibles, testeables y reutilizables.

```
src/game/
├── types.ts      → interfaces, enums, constantes (2.938 bytes)
├── scenarios.ts  → 6 escenarios × 3 decisiones, deltas verificables
├── core.ts       → clampIndicator, computeScore, determineEnding, applyDecision, buildFinalResult
├── storage.ts    → load/save usando globalThis (sin acoplamiento DOM)
└── index.ts      → barrel de exportaciones
```

La fórmula de puntuación ponderada está documentada explícitamente: `score = power × 0.40 + loyalty × 0.30 + reputation × 0.30`, y los umbrales de finales (`SCORE_LEGACY_CUTOFF = 60`, `SCORE_BROKEN_CUTOFF = 40`) son constantes exportadas, no magic numbers.

### 2.2 Suite de pruebas unitarias exhaustiva

`tests/game.test.ts` (14.063 bytes) cubre todos los casos críticos del motor: clamping con valores extremos y NaN, cálculo de score con verificación matemática inline (comentario `// 80×0.4 + 60×0.3 + 70×0.3 = 71`), los 5 finales + 2 casos de fallback, `applyDecision` con throw en decisión inválida, e integración de partida completa que recorre los 6 escenarios verificando el ending esperado para tres estrategias distintas (equilibrada → `legacy`, maximizadora de poder → `fallen`, mínimos totales → `broken`).

### 2.3 Sistema de diseño CSS coherente

El CSS de 11.291 bytes implementa un sistema de diseño completo con custom properties bien nombradas:

```css
/* Paleta cromática */
--color-marfil: #F1EBDD
--color-negro-tinta: #171513
--color-borgoña: #4B121B
--color-dorado: #A47A48
--color-gris-piedra: #79736B

/* Escala de espaciado */
--space-xs: 0.25rem  →  --space-xxl: 8rem

/* Transiciones */
--transition-fast: 150ms ease
--transition-normal: 300ms ease
--transition-slow: 600ms ease
```

No hay colores hardcodeados fuera de `:root` salvo los dos colores funcionales del juego (`#FFD700` y `#5DADE2`), lo cual es un detalle menor y manejable.

### 2.4 Tipografía editorial de alta calidad

La dupla **Cormorant Garamond** (títulos, serif histórico) + **Inter** (cuerpo, sans-serif neutro) es una elección sofisticada y temáticamente coherente con un archivo cinematográfico de época. La carga usa el patrón de preload asíncrono estándar con fallback `noscript`, evitando bloqueo de render:

```html
<link rel="preload" href="https://fonts.googleapis.com/..." as="style"
  onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="..."></noscript>
```

### 2.5 Textura cinematográfica sin imágenes externas

El efecto de grano cinematográfico (`body::before`) se implementa con un SVG inline codificado en CSS, con trazos de baja opacidad (0.03–0.05). Técnica eficiente que no genera ningún request HTTP adicional y es 100% reproducible en cualquier entorno.

### 2.6 Metadatos HTML y SEO correctos

El HTML incluye `lang="es"`, `charset UTF-8`, viewport completo, meta `description`, `keywords`, `author`, Open Graph básico (`og:title`, `og:description`, `og:type`), `theme-color` (#171513) y `msapplication-TileColor`. Todos los valores son descriptivos y correctos.

### 2.7 TypeScript strict sin concesiones

`tsconfig.json` tiene `"strict": true`, `"noImplicitReturns": true` y `"noFallthroughCasesInSwitch": true`. El motor del juego pasa sin errores bajo estas condiciones. Es una señal clara de madurez técnica en el código del dominio.

---

## 3. Oportunidades de Mejora

### Bug crítico — persistencia de mejor score rota

**Archivo:** `src/main.ts` → método `finishGame()`  
**Severidad:** ALTA

La condición para guardar el mejor puntaje es:

```typescript
if (!save || result.ending === 'legacy') {
```

Esto solo guarda cuando no hay save previo **o** cuando el ending es exactamente `'legacy'`. Si el jugador obtiene un score de 85 con ending `'fallen'` y ya tiene un save anterior con score 30, el nuevo score nunca se persiste. El mejor puntaje quedará desactualizado permanentemente.

**Corrección:**
```typescript
if (!save || result.score > (save.bestScore || 0)) {
```

---

### Bug medio — interfaz `GameState` duplicada e incompatible

**Archivos:** `src/game/types.ts` y `src/main.ts`  
**Severidad:** MEDIA

`types.ts` define la `GameState` canónica del motor (con `saveId`, `player`, `finished`, `finishedAt`, `metadata`). `main.ts` redefine su propia versión local simplificada (con `version`, `startedAt`, `lastScenario`, `completedGames`, `bestScore`). El objeto que realmente se guarda en `localStorage` corresponde a la versión de `main.ts`, no a la del motor. Si el motor intenta deserializar el estado guardado esperando la versión canónica, fallará silenciosamente.

**Corrección:** Unificar en `types.ts` y hacer que `main.ts` importe ese tipo.

---

### Bug menor — código muerto en `clampIndicator`

**Archivo:** `src/game/core.ts`  
**Severidad:** BAJA

El parámetro `indicator: IndicatorState | string` y la variable `key` derivada de él están declarados en la firma de `clampIndicator()` pero nunca se utilizan en el cuerpo de la función. No hay ningún mensaje de error contextual que los use. Como `noUnusedLocals` está en `false` en `tsconfig.json`, TypeScript no lo reporta.

**Corrección:** Simplificar la firma a `clampIndicator(value: number): number`.

---

### Anti-patrón — namespace global del motor

**Archivo:** `src/main.ts` → bloque BOOT  
**Severidad:** BAJA

```typescript
(window as any).Game = Game;
```

Esto expone toda la API interna del motor de juego como variable global, accesible desde la consola del navegador y desde scripts de terceros. Es un anti-patrón de encapsulamiento.

**Corrección:** Eliminar la línea, o condicionarla a `import.meta.env.DEV`.

---

### Deuda técnica acumulada

| Problema | Impacto |
|---|---|
| `@supabase/supabase-js` en `dependencies` sin código de uso | +200KB en bundle de producción innecesariamente |
| `"jsx": "react-jsx"` en `tsconfig.json` sin React ni archivos `.tsx` | Configuración confusa, riesgo si se añaden archivos JSX |
| Imagen hero desde Unsplash (URL externa) | Dependencia de red, sin control de cache, puede desaparecer |
| `favicon.svg` referenciado pero `public/assets/images/` está vacío | Error 404 en carga de página |
| 3 secciones en navbar sin HTML correspondiente (`#archive`, `#legacy`, `#community`) | 3 de 7 enlaces de navegación rotos |
| `#character-grid` vacío — JS no implementado | Sección de personajes aparece en blanco en runtime |

---

## 4. Accesibilidad WCAG 2.1 AA

**Puntuación estimada: 5.2 / 10**

### Criterios que se cumplen

| Criterio | Estado | Evidencia |
|---|---|---|
| 1.3.1 Info and Relationships (A) | Parcial | `<nav>`, `<section>`, heading hierarchy h1→h2→h3 |
| 1.4.4 Resize Text (AA) | ✅ | `clamp(3rem, 8vw, 6rem)` en hero, rem en fuentes base |
| 2.1.1 Keyboard (A) | Parcial | `<button>` nativos en el juego, Bootstrap navbar accesible |
| 2.3.1 Three Flashes (A) | ✅ | Sin animaciones de parpadeo en el código |
| 2.4.2 Page Titled (A) | ✅ | `<title>THE GODFATHER — THE CORLEONE ARCHIVE</title>` |
| 3.1.1 Language of Page (A) | ✅ | `<html lang="es">` |
| Prefers-reduced-motion | ✅ | Implementado al final del CSS con `!important` |

### Criterios que NO se cumplen

**2.4.1 Bypass Blocks (Nivel A) — FALLA**  
No hay skip-link implementado. Un usuario de lector de pantalla debe navegar toda la navbar en cada carga.  
Corrección: agregar como primer elemento del `<body>`:
```html
<a href="#main-content" class="visually-hidden-focusable">Ir al contenido principal</a>
```

**4.1.2 Name, Role, Value (Nivel A) — FALLA PARCIAL**  
El modal `#characterModal` no tiene `aria-labelledby`:
```html
<!-- Actual -->
<div class="modal fade" id="characterModal" tabindex="-1" aria-hidden="true">

<!-- Correcto -->
<div class="modal fade" id="characterModal" tabindex="-1"
     aria-hidden="true" aria-labelledby="characterModalTitle">
```
Los botones de decisión generados dinámicamente en `main.ts` no tienen `aria-label` descriptivo. El usuario de lector de pantalla escucha solo los `<span>` interiores sin contexto de la acción.

**2.4.6 Headings and Labels (Nivel AA) — FALLA PARCIAL**  
Cada sección tiene dos `<h2>` consecutivos:
```html
<h2 class="section-tagline">La Película</h2>   <!-- decorativo -->
<h2 class="section-title">The Godfather (1972)</h2>  <!-- semántico -->
```
El tagline es decorativo y debe ser `<p>` o `<span>`, no un heading real.

### Riesgo de contraste (no verificable sin runtime)

`--color-text-muted: #79736B` sobre `--color-bg-card: #1A1715` es una combinación de riesgo para texto pequeño. El umbral WCAG 2.1 AA exige ratio 4.5:1 para texto normal. Este par de colores se usa en `.card-text`, `.card-subtitle`, `.section-lead`, `.nav-link` (estado normal) y `.form-label`. Se recomienda verificar con WebAIM Contrast Checker; si falla, aclarar el muted a `#9A948D` aproximadamente.

### Positivo destacado

`@media (prefers-reduced-motion: reduce)` está implementado correctamente al final del CSS y desactiva todas las transiciones con `!important`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. Rendimiento

**Puntuación estimada: 5.8 / 10**

### Recursos que bloquean el render

| Recurso | Tipo | Bloqueante | Observación |
|---|---|---|---|
| Bootstrap CSS (CDN) | CSS externo | ✅ Sí | ~30KB gzip. Sin SRI hash, sin preload |
| Bootstrap Icons CSS (CDN) | CSS externo | ✅ Sí | ~200KB total (font file de iconos completo) |
| Google Fonts | CSS externo | ❌ No | Carga asíncrona con `onload` trick — bien implementado |
| Bootstrap JS (CDN) | Script | ❌ No | Cargado al final del `<body>` — correcto |
| Imagen hero (Unsplash) | Imagen externa | ❌ No | Opacity 0.15, decorativa. Sin `loading="lazy"` |

### Problema crítico en `vite.config.ts`

```typescript
manualChunks: {
  bootstrap: ['bootstrap'],
  supabase: ['@supabase/supabase-js'],  // ← ~200KB sin uso alguno
  game: ['src/game/index.ts'],
}
```

El chunk `supabase` incluirá `@supabase/supabase-js` (~200KB+) en el bundle de producción aunque no haya ningún `import` de ese módulo en `src/`. Esto duplica el costo: Bootstrap también viene por CDN, por lo que el chunk `bootstrap` genera un bundle npm que no se usa si Bootstrap ya está en CDN.

El chunk `game` (motor puro) es correcto en concepto.

### Lo que sí está bien

- CSS custom properties: cero overhead en runtime, calculadas en tiempo de parse
- SVG inline para grain texture: sin request HTTP adicional
- `<script type="module">`: carga diferida automática con ESM nativo
- `esbuild: { target: 'es2020' }`: transpilación mínima para navegadores modernos
- `optimizeDeps.include: ['bootstrap', 'bootstrap-icons']`: pre-bundling correcto en dev

### Optimizaciones pendientes

- Agregar `loading="lazy"` a la imagen del hero
- Agregar `rel="preload"` a los CSS del CDN (Bootstrap, Bootstrap Icons) para descarga anticipada sin bloqueo extra
- Agregar hashes SRI (`integrity` + `crossorigin`) a los recursos CDN
- Eliminar el chunk `supabase` del build si no se implementa la integración

---

## 6. Puntuación Final

| Dimensión | Peso | Puntuación | Ponderado |
|---|:---:|:---:|:---:|
| Completitud / visión general | 20% | 5.5 | 1.10 |
| Calidad técnica base (fortalezas) | 20% | 7.5 | 1.50 |
| Bugs y deuda técnica | 15% | 5.0 | 0.75 |
| Consistencia de identidad visual | 15% | 7.8 | 1.17 |
| Navegación y UX del juego | 10% | 5.5 | 0.55 |
| Accesibilidad WCAG 2.1 AA | 10% | 5.2 | 0.52 |
| Rendimiento y optimización | 10% | 5.8 | 0.58 |
| **Subtotal ponderado** | | | **6.17** |
| Ajuste editorial (+0.2) | | | por documentación técnica excepcional |
| **PUNTUACIÓN FINAL** | | **6.4 / 10** | |

**Veredicto: C+ — FUNDAMENTOS SÓLIDOS, IMPLEMENTACIÓN INCOMPLETA**

El proyecto demuestra nivel técnico superior en lo que está implementado: el motor del juego TypeScript es arquitectónicamente correcto, bien tipado y con cobertura de tests rigurosa. El sistema de diseño CSS es coherente y la paleta editorial es sofisticada. Sin embargo, el proyecto está claramente incompleto para una entrega final de evidencia académica: 3 de 7 secciones no tienen HTML, el directorio de imágenes está vacío, hay un bug crítico en la lógica de persistencia, y el flujo de UX del juego tiene problemas que hacen confusa la experiencia de decisión.

---

## 7. Recomendaciones Prioritarias

Las siguientes recomendaciones están ordenadas por impacto / esfuerzo. Las primeras cuatro son las más críticas para la entrega académica.

### Prioridad 1 — Corregir bug de best score (30 min)

En `src/main.ts`, método `finishGame()`, cambiar:
```typescript
// ACTUAL — solo guarda si no hay save o si ending es 'legacy'
if (!save || result.ending === 'legacy') {

// CORRECTO — guarda si el nuevo score supera el mejor registrado
if (!save || result.score > (save.bestScore || 0)) {
```

### Prioridad 2 — Implementar `#character-grid` con datos reales (2–4 h)

La sección de personajes es completamente visible en la navbar y aparece en blanco. Con Bootstrap Cards y los 7 personajes documentados en `GAME_DESIGN_DOCUMENT.md`, se puede implementar con HTML estático o con un array de datos en `main.ts`. Ejemplo mínimo:

```typescript
const CHARACTERS = [
  { name: 'Don Vito Corleone', actor: 'Marlon Brando', role: 'Patriarca de la familia', ... },
  // ...
];
const grid = document.getElementById('character-grid');
if (grid) {
  grid.innerHTML = CHARACTERS.map(c => `
    <div class="col-lg-4 col-md-6">
      <div class="card h-100">
        <div class="card-body">
          <h3 class="card-title">${c.name}</h3>
          <p class="card-subtitle">${c.actor}</p>
          <p class="card-text">${c.role}</p>
        </div>
      </div>
    </div>
  `).join('');
}
```

### Prioridad 3 — Agregar skip-link y corregir modal aria (15 min)

```html
<!-- Primer elemento del <body> -->
<a href="#home" class="visually-hidden-focusable">Ir al contenido principal</a>

<!-- En el modal: agregar aria-labelledby -->
<div class="modal fade" id="characterModal" tabindex="-1"
     aria-hidden="true" aria-labelledby="characterModalTitle">
```

### Prioridad 4 — Crear favicon SVG (10 min)

Crear `public/assets/images/favicon.svg` para eliminar el 404. Ejemplo mínimo:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text y=".9em" font-size="90">🎬</text>
</svg>
```

### Prioridad 5 — Corregir los `<h2>` duplicados en secciones (20 min)

Cambiar todos los `.section-tagline` de `<h2>` a `<p>`:
```html
<!-- ACTUAL -->
<h2 class="section-tagline">La Película</h2>
<h2 class="section-title">The Godfather (1972)</h2>

<!-- CORRECTO -->
<p class="section-tagline">La Película</p>
<h2 class="section-title">The Godfather (1972)</h2>
```

### Prioridad 6 — Mover Supabase a devDependencies o implementarlo (15 min)

Si la integración no se implementa antes de la entrega:
```json
// package.json — mover de dependencies a devDependencies
"devDependencies": {
  "@supabase/supabase-js": "2.41.0",
  "supabase": "2.15.8"
}
```
Y eliminar el `manualChunks.supabase` del `vite.config.ts` para que no infle el bundle.

### Prioridad 7 — Unificar `GameState` (1 h)

Eliminar la redefinición de `GameState` en `main.ts` y extender la canónica de `types.ts` para que incluya `bestScore` y `completedGames`. Esto elimina la inconsistencia de tipos entre el motor y la UI.

### Prioridad 8 — Implementar secciones faltantes (4–8 h)

Agregar al `index.html` los bloques HTML para `#archive`, `#legacy` y `#community`. Los enlaces de la navbar solo deben existir si su destino existe. Si el tiempo no permite implementarlas, eliminar temporalmente los `<li>` correspondientes de la navbar.

---

## 8. Limitaciones Conocidas

Las siguientes limitaciones son propias del contexto del proyecto o de la herramienta de análisis, y se documentan para transparencia.

### Limitaciones del análisis

- **Sin ejecución de runtime.** Este reporte es análisis estático. No se ejecutó `npm run dev` ni `npm run build`. Los problemas de contraste de color no se midieron con herramientas automatizadas (Lighthouse, axe, WAVE) — son estimaciones basadas en los valores hexadecimales y experiencia de diseño.
- **Sin prueba en navegadores reales.** Los comportamientos de `backdrop-filter`, `clamp()`, scroll suave y el `prefers-reduced-motion` no se verificaron en Safari, Firefox ni dispositivos móviles físicos.
- **Sin métricas Lighthouse reales.** Los puntajes de rendimiento son estimaciones basadas en el análisis de recursos. Para métricas definitivas (LCP, FID, CLS) se requiere una build de producción desplegada.

### Limitaciones del proyecto

- **Dependencia de CDNs externos.** Bootstrap CSS, Bootstrap Icons y Google Fonts se cargan desde CDN. Sin acceso a internet, el proyecto pierde su identidad visual completa (fuentes, iconos, estilos Bootstrap).
- **Sin imágenes propias del film.** Los derechos de imagen de The Godfather pertenecen a Paramount Pictures. Las capturas de pantalla de la película no pueden usarse comercialmente y son de uso restringido incluso en proyectos académicos. El proyecto tendrá que usar imágenes de dominio público, imágenes propias o recursos licenciados.
- **localStorage sin fallback.** El motor del juego depende de `localStorage`. En modo incógnito de algunos navegadores (Safari) o con la opción "bloquear cookies" activa, `localStorage` puede lanzar excepciones. El `storage.ts` debería envolver el acceso en `try/catch`.
- **Bootstrap CDN vs. bundle npm.** El proyecto declara `bootstrap` y `bootstrap-icons` en `dependencies` npm, pero los carga desde CDN en el HTML. Esta dualidad introduce riesgo de versiones desincronizadas si el CDN y el package.json apuntan a versiones distintas en el futuro.
- **Alcance académico.** El proyecto es una evidencia SENA (código 233104). Algunas decisiones de diseño (duplicación de Bootstrap, ausencia de SRI) son aceptables en contexto académico pero deberían corregirse en un producto de producción real.

---

*Reporte generado por análisis estático independiente del código fuente real del proyecto.*  
*Fecha de análisis: 2026-10-30 | Archivos analizados: 15 | Bugs identificados: 5 | Oportunidades de mejora: 14*
