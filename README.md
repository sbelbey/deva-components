# deva-components

Hooks de búsqueda **sin estilo** de la familia DEVA: estudio, médico, diagnóstico, obra social, paciente, bioquímico y planilla. Cada app les pone su propia piel (MUI en DEVA, Tailwind en el portal de pedidos).

- Sin dependencias de runtime. React es `peerDependency` (`>=18`, anda con React 18 y 19).
- Ninguna librería de UI: el paquete no sabe de MUI, Tailwind, axios ni rutas.
- Siempre se compara por **id**, nunca por etiqueta ni por code.

Diseño: [deva-design/docs/specs/2026-10-07-deva-components-diseno.md](https://github.com/sbelbey/deva-design/blob/main/docs/specs/2026-10-07-deva-components-diseno.md) (DEVA-107).

## Instalar

```bash
npm install github:sbelbey/deva-components#v1.0.0
```

`dist/` está commiteado, así que se instala sin build, igual que `deva-design`. Fijá siempre un tag.

## Idea general

Cada hook recibe una **fuente** inyectada:

```ts
// Lista ya cargada (DEVA: los Context bajan todo una vez)
{ source: { items: studies } }

// Servidor (portal / Nucleus): el hook hace debounce, cancela la consulta
// anterior con AbortSignal y descarta las respuestas viejas
{ source: { search: (q, signal) => CatalogService.searchStudies(q, { signal }) } }
```

y devuelve, listo para conectar a la piel:

```ts
{
  inputValue, setInputValue, reset,   // texto del input (el valor elegido = id, lo guarda la piel)
  options,                            // SearchOption<T>[] = { id, label, secondary?, raw, kind? }
  loading, error, empty,              // empty = se buscó y no hubo resultados
  getOptionById,                      // id -> opción (para mostrar el valor elegido)
  ...extras por entidad
}
```

Opciones comunes de todos los hooks:

| Opción | Para qué |
|---|---|
| `toOption(item)` | Mapper propio a `{ id, label, secondary?, raw }`. Cada entidad trae uno por defecto que acepta las formas de DEVA y del portal. |
| `excludeIds` | Ids que no se muestran (por ejemplo, los ya elegidos). Se siguen resolviendo con `getOptionById`. |
| `filter(item)` | Exclusión fija extra. |
| `minChars` | Mínimo para buscar (0 en local, 1 en servidor). |
| `debounceMs` | Debounce del servidor (300 ms). |
| `limit` | Máximo de opciones en local. |
| `showAllWhenEmpty` | En local, con la caja vacía muestra toda la lista (como el Autocomplete de MUI). `true` por defecto. |
| `remoteQuery`, `refineRemote` | Qué se le manda al servidor y si se vuelve a filtrar en el cliente. |
| `knownItems` | En modo servidor, items ya conocidos para que `getOptionById` resuelva el valor guardado sin buscar. |
| `deps` | Si `toOption` depende de algo que cambia, ponelo acá (las funciones se toman de la última render; no hace falta memoizarlas). |
| `inputValue` + `onInputValueChange` | Modo controlado. |

La búsqueda normaliza: sin acentos, sin puntos, en minúsculas y con varios términos en cualquier orden (`"gomez juan"` encuentra a "Juan Gómez").

## Hooks

### `useStudySearch`

Busca por code, nombre, abreviatura y atajo de perfil. **Excluye los sub-ítems de compuestos** salvo `includeSubItems: true` (sólo para gestión del catálogo).

```ts
const { studies } = useStudies();
const { profiles } = useAnalysisProfiles();
const search = useStudySearch({ source: { items: studies }, profiles, excludeIds: values.studies });

// Enter: perfil por atajo y, si no, estudio por code exacto ("475" o "475 - ...")
const hit = search.resolveExact(search.inputValue);
if (hit?.kind === 'profile') addMany(hit.profile.studies);
if (hit?.kind === 'study') add(hit.study.id);
// o sólo el estudio:
search.findByExactCode('475');
```

Las opciones de perfil vienen primero, con `kind: 'profile'`; las de estudio con `kind: 'study'`.

Funciones puras: `isCompoundSubItemCode(code)` (regex `^151\d{3,}` sobre el code como texto, la misma de `compositeAnalysis.dao.ts` getAllAnalyses: cubre 1515/1516/1517 y 151515/151525/151535, deja afuera el 151 real), `isCompoundSubItem`, `studyLabel` (`"code - name"`), `matchStudy`, `findStudyByExactCode`, `profileLabel`, `findProfileByShortcut`, `resolveStudyInput`. Se pueden importar desde el backend de DEVA o desde Nucleus.

### `useDoctorSearch`

Apellido, nombre y matrícula, con varios términos. Etiqueta por defecto la de DEVA (`"1234 - Juan Gómez"`); el portal usa `doctorLabelLastNameFirst` (`"Gómez, Juan · MP 1234"`). Acepta también lo que expone `useDoctor()` en DEVA (`{ id, doctor }`).

En modo servidor manda el **término más largo** y filtra el resto en el cliente, porque `/ward/doctors` busca un solo texto en un solo campo (hoy "Gomez Juan" no encuentra nada).

```ts
const doctor = useDoctorSearch({
  source: { search: (q, signal) => CatalogService.searchDoctors(q, { signal }) },
  toOption: (d) => ({ id: d.id, label: doctorLabelLastNameFirst(d), raw: d }),
});
```

### `useDiagnosisSearch`

Code ignorando los puntos (`"a099"` encuentra `A09.9`) y nombre. Extra: `findByCode(code)` (compara con `normalizeDiagnosisCode`, la misma clave que Orden digital).

```ts
const { diagnoses } = useDiagnosis();
const dx = useDiagnosisSearch({ source: { items: diagnoses } });
```

### `useInsuranceSearch`

Code, abreviatura y nombre. Las **suspendidas se marcan, no se ocultan** (la orden pasa a particular): cada opción trae `suspended` y `secondary: 'Suspendida'`.

```ts
const { insurance, suspendedInsuranceCodes } = useInsurance();
const os = useInsuranceSearch({ source: { items: insurance }, suspendedCodes: suspendedInsuranceCodes });
```

### `usePatientSearch`

Por DNI (y por apellido y nombre si los items los traen). Acepta DNIs sueltos (`usePatientsDNI()`), el `Patient` de DEVA o el `PatientDniMatch` del portal.

Entiende el **escaneo del DNI** que empieza con `'!'`: mientras dura no busca, `isScan` es `true` y `scan` trae `{ dni, patient }` (o `null`). Es la lógica real de DEVA (`parseDniData` + `handleChangeScan`), exportada como `parseDniScan`, `parseDniData` e `isDniScan`.

```ts
const patient = usePatientSearch({ source: { items: patientsDNI }, showAllWhenEmpty: false });

function onBlur() {
  if (patient.isScan && patient.scan) {
    setFieldValue('patient.DNI', String(patient.scan.dni));
    if (patient.scan.patient) { /* nombre, apellido, sexo, nacimiento */ }
  }
}
```

### `useBiochemistSearch`

Matrícula, nombre, apellido y DNI. Etiqueta `"matrícula - nombre apellido"`. Dos bioquímicos con la misma etiqueta siguen siendo dos opciones (por id).

### `useWorksheetSearch`

Code y nombre, etiqueta `"code - name"`. Extra: `findByCode(code)` para los sitios que guardan el code (Imprimir planillas).

### Motor común

`useSearch`, `useLocalSearch({ items, toOption })` y `useRemoteSearch({ search, toOption })` sirven para cualquier otra lista (por ejemplo, el catálogo de derivación). Y las funciones `normalizeText`, `splitTerms`, `buildHaystack`, `matchesAllTerms`, `matchText`.

## Pieles

El hook no pinta nada. Ejemplos mínimos de cómo conectarlo.

### MUI (DEVA)

```tsx
import { Autocomplete, TextField } from '@mui/material';
import { useStudySearch, type SearchOption, type StudyLike } from 'deva-components';

type Props = {
  value: string | null;                       // id
  onChange: (id: string | null, raw?: StudyLike) => void;
  label: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
};

export function StudyAutocomplete({ value, onChange, label, disabled, error, helperText }: Props) {
  const { studies } = useStudies();
  const search = useStudySearch({ source: { items: studies } });
  const selected = search.getOptionById(value) ?? null;

  return (
    <Autocomplete<SearchOption<StudyLike>>
      options={search.options}
      value={selected}
      inputValue={search.inputValue}
      onInputChange={(_e, text) => search.setInputValue(text)}
      onChange={(_e, option) => onChange(option?.id ?? null, option?.raw)}
      filterOptions={(x) => x}                 // ya filtra el hook
      getOptionLabel={(o) => o.label}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      getOptionKey={(o) => o.id}
      loading={search.loading}
      noOptionsText="Sin resultados"
      loadingText="Buscando…"
      disabled={disabled}
      renderInput={(params) => (
        <TextField {...params} label={label} error={error} helperText={helperText} />
      )}
    />
  );
}
```

Mientras se tipea, `value` no cambia: el id sólo cambia al elegir una opción (ya no queda `undefined` en el formulario).

### Tailwind (portal de pedidos)

```tsx
import { useDoctorSearch, doctorLabelLastNameFirst } from 'deva-components';

export function DoctorAutocomplete({ value, onChange }: { value: string | null; onChange: (id: string | null) => void }) {
  const search = useDoctorSearch({
    source: { search: (q, signal) => CatalogService.searchDoctors(q, { signal }) },
    toOption: (d) => ({ id: d.id, label: doctorLabelLastNameFirst(d), raw: d }),
  });
  const selected = search.getOptionById(value);

  return (
    <div className="relative">
      <input
        role="combobox"
        aria-expanded={search.options.length > 0}
        className="h-11 w-full rounded-deva border border-deva-line bg-deva-surface px-3 text-deva-ink"
        value={search.inputValue}
        placeholder={selected?.label ?? 'Buscar médico'}
        onChange={(e) => search.setInputValue(e.target.value)}
      />
      {search.inputValue && (
        <ul role="listbox" className="absolute z-10 mt-1 w-full rounded-deva bg-deva-surface shadow-deva-md">
          {search.loading && <li className="px-3 py-2 text-deva-ink-soft">Buscando…</li>}
          {search.empty && <li className="px-3 py-2 text-deva-ink-soft">Sin resultados</li>}
          {search.options.map((o) => (
            <li
              key={o.id}
              role="option"
              aria-selected={o.id === value}
              className="cursor-pointer px-3 py-2 hover:bg-deva-surface-2"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(o.id); search.reset(); }}
            >
              {o.label}
              {o.secondary && <span className="ml-2 text-deva-ink-soft">{o.secondary}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Desarrollo

```bash
npm install
npm test           # vitest + Testing Library + jsdom
npm run typecheck
npm run build      # tsup → dist/ (ESM .mjs, CJS .cjs, .d.ts)
```

Para publicar una versión: subir `version` en `package.json`, `npm run build`, `npm test`, anotar en `CHANGELOG.md`, commitear `dist/`, crear el tag `vX.Y.Z` y pushear con `--tags`.
