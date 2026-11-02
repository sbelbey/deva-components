# Decisión de tecnología para componentes compartidos

Ticket: DEVA-232 (épica DEVA-229, versión DEVA-1.4.0). Decidido por Saúl el 2/11/2026.

## Decisión

1. **Una sola base de estilos: Tailwind 4**, la misma que ya usan el portal de pedidos y Nexus. DEVA migra de MUI a Tailwind, **por etapas y conviviendo** con MUI mientras dure la migración.
2. **Catálogo: Storybook** (v10, soporta Vite 5–8 y React 16–19, verificado con `npm view` el 2/11).
3. **Tokens: `deva-design`** (ya entrega `tokens.css`, `tailwind.css` y `mui.mjs`). Los componentes compartidos usan sus variables.
4. **Distribución:** sin cambios, paquete en GitHub con versión (`github:sbelbey/deva-components#vX`).

## Alternativas descartadas

- **Componentes con estilo propio, sin migrar DEVA (opción A, la recomendada por Claude):** funcionaba en las tres apps sin tocar DEVA, pero deja dos sistemas de estilos para siempre. Se eligió migrar.
- **Compartir sólo entre portal y Nexus (B):** DEVA quedaba afuera.
- **Ladle y catálogo propio:** menos funciones, o todo a mano.

## Lo que implica (datos del relevo del 2/11)

| Tema | Hoy en DEVA | Consecuencia |
|---|---|---|
| Build | webpack 5 (portal y Nexus usan Vite); sin PostCSS ni Tailwind | Hay que sumar Tailwind 4 al build de DEVA y probar que no choque con los estilos de MUI |
| Componentes MUI | 298 imports de `@mui/material` y 290 de `@mui/icons-material` | Los íconos pasan a `lucide-react` (ya lo usan portal y Nexus) |
| Tabla de datos | `@mui/x-data-grid` en 23 archivos (15 imports) | No tiene equivalente directo en Tailwind: hay que elegir reemplazo (se decide antes de migrar las grillas) |
| Selector de fechas | `@mui/x-date-pickers` en 7 imports | Ídem: elegir reemplazo |
| Formularios | Formik | No depende de MUI; se mantiene |
| React | 18 (portal y Nexus usan 19) | Subir a 19 es un paso aparte; mientras tanto los componentes compartidos soportan 18 y 19 |
| Alcance | 219 archivos con MUI | No entra completo en 1.4.0; se hace por tandas en las versiones siguientes |

## Plan por etapas

Orden ajustado por Saúl el 2/11/2026: **primero se construyen los componentes y se prueban en el catálogo; después se implementan en DEVA.** No se hace antes una prueba de convivencia Tailwind + MUI en DEVA.

0. **1.4.0:** Storybook (DEVA-233, hecho), piloto de 4 componentes chicos construidos y probados en el catálogo con React 18 y 19 (DEVA-234), después sumar Tailwind al build de DEVA e implementarlos ahí (DEVA-392), y plan detallado de migración (DEVA-393).
1. **Versiones siguientes:** pantallas por tandas, de menor a mayor criticidad (primero las menos usadas; las de carga de resultados y órdenes al final), reemplazando íconos y botones por los del kit común.
2. **Al final:** grillas (`DataGrid`) y selectores de fecha, y recién ahí se quita MUI. React 19 se evalúa cuando sea necesario.

## Riesgos

- **Convivencia de estilos:** Tailwind y MUI pueden pisarse (reset de estilos, orden de las hojas de estilo). Se prueba en la etapa 0 antes de migrar nada, usando capas de CSS.
- **Pantallas críticas:** carga de resultados, órdenes y planillas son lo que usa el laboratorio todo el día; se dejan para el final y con QA completo.
- **Tiempo:** es el trabajo grande. Mientras dure, cada pantalla nueva de DEVA debería hacerse con el kit común para no seguir sumando MUI.
