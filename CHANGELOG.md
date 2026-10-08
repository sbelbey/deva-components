# Changelog

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
