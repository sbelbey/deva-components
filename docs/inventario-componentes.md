# Inventario de componentes de la familia DEVA

Ticket: DEVA-230 (épica DEVA-229, versión DEVA-1.4.0). Relevado el 23/10/2026 y actualizado el 2/11/2026 (DEVA creció de 271 a 328 `.tsx` con la rama 1.3.13).

Alcance: todos los `.tsx` de la UI de `deva` (renderer), `deva-ward-portal`, `nexus/frontend` y `deva-landing/deva-landing-web`. Detalle fila por fila en [inventario-componentes.csv](inventario-componentes.csv) (431 archivos); las columnas `decision` y `notas` quedan vacías para DEVA-231.

## 1. Stack de cada proyecto

| Proyecto | `.tsx` | React | Estilos | Notas |
|---|---|---|---|---|
| deva (renderer) | 328 | 18 | **MUI 6** (219 archivos), 3 mezclan MUI y Tailwind | Electron; contextos y servicios propios |
| deva-ward-portal | 30 | 19 | **Tailwind 4**, componentes de UI escritos a mano | Vite 8, TS 6, vitest |
| nexus (frontend) | 59 | 19 | **Tailwind 4** + Radix + `class-variance-authority` + `clsx` + `tailwind-merge` (estilo shadcn) | Vite 8, TS 6 |
| deva-landing | 14 | 19 (Next 16) | Tailwind 4 | Sólo pantallas y animaciones propias |

Los cuatro ya usan `deva-design` v1.1.0 (tokens). `deva` y el portal también usan `deva-components` v1.0.2 (hooks de búsqueda sin estilo).

**Lectura:** portal y Nexus tienen el mismo stack (React 19, Tailwind 4, Vite 8, TS 6, `lucide-react`). DEVA es el distinto: React 18 y MUI. Es el que condiciona la decisión de tecnología (DEVA-232).

## 2. Qué hay por proyecto (clasificación gruesa)

La clasificación es automática por ruta y sirve sólo como orientación. En `deva` "pantalla" incluye subcomponentes que viven bajo `pages/`.

| Proyecto | Componentes | Pantallas y subpantallas | Contextos/providers | Tests | Entrada |
|---|---|---|---|---|---|
| deva | 122 | 119 | (en `context/`, no separados) | 85 | 2 |
| deva-ward-portal | 18 | 6 | 2 | 2 | 2 |
| nexus | 22 | 30 | 5 | 0 | 2 |
| deva-landing | 0 | 14 | 0 | 0 | 0 |

### deva-ward-portal (`src/components`)
`ui/` hecho a mano: `Autocomplete`, `ColorModeSwitch`, `ConfirmDialog`, `Tip`, y `ui/index.tsx` (156 líneas, 8 usos: botones, campos y similares). `search/`: `SearchField` más cuatro autocompletes (diagnóstico, médico, obra social, estudio) sobre los hooks de `deva-components`. Propios del portal: `PatientEntryForm` (489 líneas), `RoundDetail` (444), `RoundsTray`, `BrandLockup`, `UsageTracker`.

### nexus (`frontend/src/components`)
`ui/` estilo shadcn: `badge`, `button` (17 usos), `card`, `dialog`, `input`, `label`, `password-input`, `select`, `sheet`, `table` (17 usos), `textarea`, `tooltip`. Aparte: `BrandLockup`, `ColorModeSwitch`, `ExportCsvButton` (9 usos), `LicenseExpiryBadge`, `LicenseStatusBadge`, y `layout/` (`AppShell`, `AuthShell`, `Navbar`, `Sidebar` de 212 líneas).

### deva (`src/renderer`)
Lo más usado y chico: `FormTitle` (20 líneas, 16 usos), `SettingsCard` (6), `PageLayout` (5), `DifferentialChart` (5), `StatusDot` (4), `DialogNotifications` (3). Buscadores en `components/search` (15 archivos, sobre `deva-components`); `DoctorSelectorField` y `DiagnosisSelectorField` los envuelven y agregan el alta de médico o diagnóstico (modal propio). Gráficos de resultados (`LoadLooseOrder/*Charts`). Cada sección de Configuraciones, facturación, estadísticas y alta de orden tiene sus subcomponentes propios.

## 3. Duplicados entre proyectos

| Componente | Dónde | Diferencia observada |
|---|---|---|
| `BrandLockup` | portal, nexus | Casi idéntico (31 líneas). Cambia la palabra ("Pedidos"/"Nexus"), y Nexus acepta `className` con `cn()` |
| `ColorModeSwitch` | deva (MUI), portal, nexus | Misma función; el de Nexus (72 líneas) y el del portal (58) divergieron; el de DEVA es MUI |
| Proveedor de modo claro/oscuro | deva, portal (`theme/colorMode.tsx`), nexus (`ThemeProvider`) | Misma idea (`colorMode` por usuario, ver memoria `modo-claro-oscuro-por-usuario`), tres implementaciones |
| Autocompletes de diagnóstico, médico, obra social, estudio | deva, portal | Los dos usan los hooks de `deva-components`; sólo cambia la capa visual (MUI vs Tailwind) |
| `AppShell`, `AuthShell`/`Login`, `AuthProvider`, `router` | portal, nexus | Estructura equivalente, código separado |
| Kit de UI básico (botón, input, select, diálogo, tooltip, tabla) | portal (a mano), nexus (shadcn), deva (MUI) | Tres kits para lo mismo |
| `ConfirmDialog` | portal; Nexus usa `ui/dialog` directo | Mismo propósito, distinta capa |
| `PasswordField` / `password-input` | deva (derivaciones), nexus | Mismo propósito |

## 4. Candidatos preliminares (para decidir en DEVA-231)

No es una decisión; sólo ordena la discusión.

**A. Compartibles sin depender de MUI ni de Tailwind (lógica o tokens):** hooks de búsqueda (ya están en `deva-components`), proveedor de modo claro/oscuro (lógica), lógica de `ConfirmDialog`, `PasswordField`, formateos.

**B. Compartibles entre portal, Nexus y landing (mismo stack Tailwind + React 19):** `BrandLockup`, `ColorModeSwitch`, kit de UI básico, `AppShell`/`AuthShell`, `Login`. DEVA quedaría afuera, o usaría una versión MUI.

**C. Propios de cada proyecto:** pantallas de dominio (planillas, órdenes, facturación, estadísticas, licencias, costos, uso), todo lo que toca Electron, `PatientEntryForm`/`RoundDetail` (reglas del piso).

**D. Piloto sugerido (DEVA-234), chicos y de poco uso:** `BrandLockup` (2 y 3 usos, ya casi idéntico), `ColorModeSwitch` (2 usos), `Tip` (2), `PasswordField` (deva) / `password-input` (nexus), 3 usos. Los badges de licencia (15 líneas) se descartaron: son de dominio de Nexus y sólo los usa ese proyecto.

## 5. Preguntas abiertas para la decisión de tecnología (DEVA-232)

1. ¿DEVA sube a React 19 o los componentes compartidos soportan 18 y 19? `deva-components` hoy pide React ≥18.
2. ¿MUI se mantiene en DEVA (219 archivos) y se comparten sólo hooks y tokens con él, o se migra de a poco?
3. ¿Kit común de portal y Nexus: copiar el estilo shadcn de Nexus (Radix + cva) o hacer uno nuevo?
4. ¿Cómo se distribuye? Hoy es `github:sbelbey/deva-components#vX` con `dist/` commiteado.

## 6. Cómo se generó

Script propio (no se commitea) que recorre los `.tsx` de cada proyecto y calcula: líneas, librería de UI por imports (`@mui/`, `className` con utilidades Tailwind, Radix), acoplamiento (Electron, contexto, store, API, `deva-components`) y cantidad de archivos que importan cada componente por nombre. Los "usos" son aproximados: no detectan imports dinámicos ni renombrados, y los componentes de `index.tsx` se cuentan por el nombre de la carpeta.
