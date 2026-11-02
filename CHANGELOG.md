# Changelog

## [Sin publicar] (1.4.0)

### Agregado
- Catálogo de componentes con Storybook 10 (`npm run storybook`): una página por hook de búsqueda (médico, estudio, diagnóstico, obra social, paciente con escaneo de DNI, bioquímico, planilla), modo claro/oscuro y revisión de accesibilidad. Estilos con Tailwind 4 y los tokens de `deva-design`. No cambia el paquete publicado (DEVA-233).
- Subpath `deva-components/ui` con los primeros componentes visuales compartidos: `BrandLockup`, `ColorModeSwitch`, `Tip` y `PasswordInput`. Tailwind 4 y tokens de `deva-design`, sin MUI ni íconos externos, React 18 y 19 (DEVA-234). Tests con las dos versiones (`npm run test:react19`) y una página por componente en el catálogo.
- Catálogo ordenado en **Primitivos** (`Alert`, `Button`, `ColorModeSwitch`, `PasswordInput`, `Spinner`, `TextField` con etiqueta flotante, `Tip`) y **Componentes** (`BrandLockup`, `PasswordField` con ojo y aviso de Bloq Mayús, plantilla de login `AuthLayout` + `LoginForm`). La plantilla no sabe de autenticación: cada app le pasa su marca, su selector de modo y qué hacer al enviar. `BrandLockup` ahora acepta no tener nombre de producto (DEVA de escritorio). Fuentes en `src/ui/primitives` y `src/ui/components`; la API pública de `deva-components/ui` no cambia.
- Documentos de la épica DEVA-229 en `docs/`: inventario, criterio de qué se comparte y decisión de tecnología.

## [1.0.2] - 2026-10-08

### Corregido
- `useInsuranceSearch`: `isSuspended` se lee por ref. Pasada como función inline ya no invalida el cache de opciones en cada render.

## [1.0.1] - 2026-10-08

### Corregido
- `useInsuranceSearch`: `getOptionById` y `options` devuelven el mismo objeto entre renders. Antes armaban uno nuevo cada vez, y en la piel MUI de DEVA eso pisaba con la etiqueta lo que se estaba tipeando.

## [1.0.0] - 2026-10-07

### Agregado
- Motor de búsqueda sin estilo (`useSearch`, `useLocalSearch`, `useRemoteSearch`): lista local o servidor inyectado, debounce, cancelación con `AbortSignal`, descarte de respuestas viejas, `loading` / `error` / `empty`, `excludeIds`, `getOptionById` y modo controlado.
- Normalización (`normalizeText`, `splitTerms`, `matchesAllTerms`…): sin acentos, sin puntos, minúsculas y varios términos en cualquier orden.
- Un hook por entidad, con su `toOption` por defecto para las formas de DEVA y del portal: `useStudySearch`, `useDoctorSearch`, `useDiagnosisSearch`, `useInsuranceSearch`, `usePatientSearch`, `useBiochemistSearch`, `useWorksheetSearch`.
- Estudio: `isCompoundSubItemCode` con la regex real de DEVA (`^151\d{3,}` sobre el code como texto), exclusión de sub-ítems salvo `includeSubItems`, perfiles por atajo y Enter por code exacto (`findByExactCode`, `resolveExact`).
- Paciente: escaneo del DNI con `'!'` (`parseDniScan`, `parseDniData`, `isDniScan`), copia de la lógica de DEVA sin date-fns.
- Diagnóstico: code ignorando puntos y `findByCode`. Médico: apellido, nombre y matrícula multi-término (en servidor manda el término más largo y filtra el resto). Obra social: suspendidas marcadas. Planilla: `findByCode`.
- Salidas ESM (`.mjs`), CJS (`.cjs`) y tipos (`.d.ts`).
