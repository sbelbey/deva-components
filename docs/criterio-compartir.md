# Criterio: qué se comparte entre proyectos y qué no

Ticket: DEVA-231 (épica DEVA-229, versión DEVA-1.4.0). Propuesta del 2/11/2026, a revisar. La columna `decision` de [inventario-componentes.csv](inventario-componentes.csv) ya está completa con este criterio.

## 1. Reglas

Un componente se comparte si cumple **las tres**:

1. **Lo necesitan al menos dos proyectos** (o ya existe duplicado hoy). Un componente que usa un solo proyecto no se mueve, aunque sea genérico: se mueve cuando aparece el segundo.
2. **No contiene reglas de dominio de un proyecto** (licencias, órdenes, planillas, rondas, obras sociales…). Si las tiene, es propio.
3. **No depende de algo que sólo existe en un proyecto**: Electron, servicios o API propios, contextos propios. Lo que necesite de afuera lo recibe por props.

Si falla alguna, el componente es **propio** y se queda donde está.

## 2. Tres capas

| Capa | Qué va | Dónde vive | Estado |
|---|---|---|---|
| 1. Tokens | colores, tipografía, logos | `deva-design` | hecho (v1.1.0) |
| 2. Lógica sin UI | hooks, proveedores de estado, reglas | `deva-components` | hecho para búsquedas (v1.0.2); falta modo claro/oscuro y analítica |
| 3. Componentes visuales | botón, diálogo, tooltip, lockup… | por definir en DEVA-232 | no existe |

Regla práctica: todo lo que se pueda resolver en la capa 2 se hace ahí, porque sirve igual a DEVA (MUI) y al portal y Nexus (Tailwind). La capa 3 es la que depende de la tecnología.

## 3. Valores de `decision`

| Valor | Significa | Filas |
|---|---|---|
| `propio` | se queda en su proyecto | 389 |
| `compartir-visual` | capa 3; lo necesitan 2 o más proyectos | 24 |
| `compartir-logica` | capa 2; se puede resolver sin UI | 6 |
| `unificar` | ya hay una versión por proyecto con la misma función; se reducen a una cuando se decida la tecnología | 12 |

## 4. Lo que se comparte

**Capa 2 (`compartir-logica`)**
- Modo claro/oscuro: `theme/colorMode` (portal) y `ThemeProvider`/`ThemeContext` (Nexus). DEVA tiene el suyo en `context/`.
- `AuthProvider` de portal y Nexus: antes de mover hay que ver si difiere el backend de login (Cognito vs JWT propio).
- `UsageTracker` (portal, 13 líneas): analítica de uso; confirmar si otro proyecto lo necesita (DEVA-120).

**Capa 3 (`compartir-visual`)**
- `BrandLockup` (portal, Nexus), `ColorModeSwitch` (portal, Nexus, DEVA).
- Kit base de Nexus (`ui/`: button, card, dialog, input, label, select, sheet, switch, table, textarea, tooltip, badge): es la base candidata del kit común, porque el portal repite lo mismo a mano.
- `Tip` (portal) ≈ `tooltip` (Nexus). `ConfirmDialog` (portal): Nexus no tiene uno propio, usa `ui/dialog` en cada pantalla.
- `PasswordField` (DEVA) ≈ `password-input` (Nexus).
- `AppShell`, `AuthShell` (portal, Nexus): estructura equivalente; fase 2, después del piloto.

**`unificar`**
- Autocompletes de diagnóstico, médico, obra social, estudio y bioquímico, más `SearchField`: la lógica ya es común (`deva-components`); falta que la capa visual sea una sola, y eso depende de si DEVA sigue con MUI.
- `ui/index.tsx` y `ui/Autocomplete.tsx` del portal: se reemplazan por el kit común.

## 5. Lo que NO se comparte

- Pantallas y sus subcomponentes (planillas, órdenes, facturación, estadísticas, configuraciones; en Nexus clientes, licencias, costos, uso).
- Todo lo acoplado a Electron o a servicios propios de DEVA.
- Los formularios del piso (`PatientEntryForm`, `RoundDetail`, `RoundsTray`): son reglas del portal de pedidos.
- Insignias y botones de dominio de Nexus (`LicenseStatusBadge`, `LicenseExpiryBadge`, `ExportCsvButton`): sólo los usa Nexus.
- Los routers y las entradas de cada app.
- La landing: sólo tiene pantallas y animaciones propias.
- Los componentes MUI de DEVA sin equivalente en otro proyecto (`FormTitle`, `PageLayout`, `SettingsCard`, gráficos). Se revisan si DEVA-232 decide migrar de MUI.

## 6. Piloto (DEVA-234)

Candidatos que cumplen la regla 1 (dos proyectos) y son chicos: `BrandLockup`, `ColorModeSwitch`, `Tip`/`tooltip` y `PasswordField`/`password-input`. Cada uno tiene 2 o 3 usos por proyecto.

## 7. Qué no resuelve este criterio

- Si DEVA comparte la capa 3 (MUI vs Tailwind, React 18 vs 19): lo define DEVA-232. Hasta entonces, las filas de DEVA con `compartir-visual` o `unificar` quedan "a confirmar".
- La clasificación se hizo por ruta, nombre y acoplamiento, con reglas explícitas; no se leyó cada archivo. Los candidatos `compartir-*` y `unificar` se contrastaron entre proyectos (diferencias de BrandLockup, ColorModeSwitch y proveedores de modo medidas; el resto por nombre y función); los `propio` son el valor por defecto. Hay que revisarlos en la reunión de decisión.
