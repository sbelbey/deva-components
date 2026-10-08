import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  doctorLabelLastNameFirst,
  useBiochemistSearch,
  useDiagnosisSearch,
  useDoctorSearch,
  useInsuranceSearch,
  usePatientSearch,
  useStudySearch,
  useWorksheetSearch,
} from '../src';

async function flush(ms = 300) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
  });
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

// --- estudio ---
const studies = [
  { id: 's1', code: 475, name: 'Hemograma completo', abbreviation: 'HMG' },
  { id: 's2', code: 1515001, name: 'Glóbulos rojos', abbreviation: 'GR' },
  { id: 's3', code: 151, name: 'Ceruloplasmina', abbreviation: 'CER' },
  { id: 's4', code: 475, name: 'Hemograma (copia con code repetido)', abbreviation: 'HMG2' },
];
const profiles = [{ _id: 'p1', name: 'Rutina', shortcutCode: 'R1', studies: [studies[0]] }];

describe('useStudySearch', () => {
  it('local: excluye sub-ítems, perfiles primero, compara por id', () => {
    const { result } = renderHook(() => useStudySearch({ source: { items: studies }, profiles }));
    expect(result.current.options.map((o) => `${o.kind}:${o.id}`)).toEqual([
      'profile:p1',
      'study:s1',
      'study:s3',
      'study:s4',
    ]);
    act(() => result.current.setInputValue('hemograma'));
    expect(result.current.options.map((o) => o.id)).toEqual(['s1', 's4']);
    // Dos estudios con el mismo code siguen siendo dos opciones distintas.
    expect(result.current.getOptionById('s4')?.label).toBe('475 - Hemograma (copia con code repetido)');
    expect(result.current.getOptionById('p1')?.kind).toBe('profile');
    act(() => result.current.setInputValue('glob'));
    expect(result.current.options).toEqual([]);
    expect(result.current.empty).toBe(true);
  });

  it('includeSubItems los muestra', () => {
    const { result } = renderHook(() => useStudySearch({ source: { items: studies }, includeSubItems: true }));
    act(() => result.current.setInputValue('glob'));
    expect(result.current.options.map((o) => o.id)).toEqual(['s2']);
  });

  it('Enter: findByExactCode y resolveExact (perfil primero)', () => {
    const { result } = renderHook(() => useStudySearch({ source: { items: studies }, profiles }));
    expect(result.current.findByExactCode('475')?.id).toBe('s1');
    expect(result.current.findByExactCode('1515001')).toBeUndefined();
    expect(result.current.findByExactCode('151')?.id).toBe('s3');
    expect(result.current.resolveExact('R1')).toEqual({ kind: 'profile', profile: profiles[0] });
    expect(result.current.resolveExact('475 - x')).toEqual({ kind: 'study', study: studies[0] });
  });

  it('servidor (forma del portal): filtra sub-ítems de la respuesta y excluye elegidos', async () => {
    const search = vi.fn(async () => [
      { id: 'w1', name: 'Hemograma', code: 475 },
      { id: 'w2', name: 'Hemoglobina (sub-ítem)', code: 1515002 },
      { id: 'w3', name: 'Hepatograma', code: 481 },
    ]);
    const { result } = renderHook(() => useStudySearch({ source: { search }, excludeIds: ['w3'] }));
    act(() => result.current.setInputValue('he'));
    await flush();
    expect(result.current.options.map((o) => o.id)).toEqual(['w1']);
    expect(result.current.findByExactCode('475')?.id).toBe('w1');
  });
});

// --- médico ---
const doctors = [
  { id: 'd1', name: 'Juan', lastName: 'Gómez', professionalRegistration: 1234 },
  { id: 'd2', name: 'Ana', lastName: 'Gómez', professionalRegistration: 999 },
  { id: 'd3', name: 'Juan', lastName: 'Pérez', professionalRegistration: 555 },
];

describe('useDoctorSearch', () => {
  it('local: multi-término y forma del Context de DEVA', () => {
    const { result } = renderHook(() => useDoctorSearch({ source: { items: doctors } }));
    act(() => result.current.setInputValue('Gomez Juan'));
    expect(result.current.options.map((o) => o.id)).toEqual(['d1']);
    expect(result.current.options[0].label).toBe('1234 - Juan Gómez');

    const ctx = renderHook(() =>
      useDoctorSearch({ source: { items: [{ id: 'c1', doctor: '1234 - Juan Gómez' }] } }),
    );
    act(() => ctx.result.current.setInputValue('juan 1234'));
    expect(ctx.result.current.options.map((o) => o.id)).toEqual(['c1']);
  });

  it('servidor: manda el término más largo y filtra el resto', async () => {
    const search = vi.fn(async (q: string) =>
      doctors.filter((d) => `${d.name} ${d.lastName}`.toLowerCase().includes(q.toLowerCase())),
    );
    const { result } = renderHook(() =>
      useDoctorSearch({
        source: { search },
        toOption: (d) => ({ id: d.id, label: doctorLabelLastNameFirst(d), raw: d }),
      }),
    );
    act(() => result.current.setInputValue('Juan Gómez'));
    await flush();
    expect(search).toHaveBeenCalledWith('Gómez', expect.any(AbortSignal));
    expect(result.current.options.map((o) => o.label)).toEqual(['Gómez, Juan · MP 1234']);
  });
});

// --- diagnóstico ---
const diagnoses = [
  { id: 'g1', code: 'A09.9', name: 'Gastroenteritis' },
  { id: 'g2', code: 'E11', name: 'Diabetes tipo 2' },
];

describe('useDiagnosisSearch', () => {
  it('local: code ignorando puntos y findByCode', () => {
    const { result } = renderHook(() => useDiagnosisSearch({ source: { items: diagnoses } }));
    act(() => result.current.setInputValue('a099'));
    expect(result.current.options.map((o) => o.id)).toEqual(['g1']);
    expect(result.current.findByCode('A09.9')?.id).toBe('g1');
  });

  it('servidor', async () => {
    const search = vi.fn(async () => diagnoses);
    const { result } = renderHook(() => useDiagnosisSearch({ source: { search } }));
    act(() => result.current.setInputValue('dia'));
    await flush();
    expect(result.current.options.map((o) => o.label)).toEqual(['A09.9 - Gastroenteritis', 'E11 - Diabetes tipo 2']);
    expect(result.current.findByCode('e11')?.id).toBe('g2');
  });
});

// --- obra social ---
const insurances = [
  { id: 'i1', insurance: '24 - OSDE', code: 24, name: 'OSDE' },
  { id: 'i2', insurance: '30 - IOSFA', code: 30, name: 'IOSFA' },
];

describe('useInsuranceSearch', () => {
  it('local: marca las suspendidas sin ocultarlas', () => {
    const { result, rerender } = renderHook(
      (props: { suspended: number[] }) =>
        useInsuranceSearch({ source: { items: insurances }, suspendedCodes: props.suspended }),
      { initialProps: { suspended: [30] } },
    );
    expect(result.current.options.map((o) => [o.id, o.suspended, o.secondary])).toEqual([
      ['i1', false, undefined],
      ['i2', true, 'Suspendida'],
    ]);
    expect(result.current.getOptionById('i2')?.suspended).toBe(true);
    rerender({ suspended: [] });
    expect(result.current.options.every((o) => !o.suspended)).toBe(true);
  });

  it('servidor', async () => {
    const search = vi.fn(async () => [{ id: 'x', code: 24, abbreviation: 'OSDE' }]);
    const { result } = renderHook(() =>
      useInsuranceSearch({ source: { search }, isSuspended: (i) => i.code === 24 }),
    );
    act(() => result.current.setInputValue('osde'));
    await flush();
    expect(result.current.options[0]).toMatchObject({ id: 'x', label: '24 - OSDE', suspended: true });
  });
});

// --- paciente ---
describe('usePatientSearch', () => {
  it('local con DNIs sueltos y escaneo con "!"', () => {
    const { result } = renderHook(() =>
      usePatientSearch({ source: { items: ['30123456', '30999888', '25111222'] }, showAllWhenEmpty: false }),
    );
    act(() => result.current.setInputValue('301'));
    expect(result.current.options.map((o) => o.id)).toEqual(['30123456']);
    expect(result.current.isScan).toBe(false);
    expect(result.current.scan).toBeNull();

    act(() => result.current.setInputValue('!00512345678@PEREZ@ANA@F@30123456@B@12/09/1988'));
    expect(result.current.isScan).toBe(true);
    expect(result.current.options).toEqual([]);
    expect(result.current.empty).toBe(false);
    expect(result.current.scan?.dni).toBe(30123456);
    expect(result.current.scan?.patient?.name).toBe('ANA');
  });

  it('servidor: no consulta durante un escaneo', async () => {
    const search = vi.fn(async () => [{ patientId: 'p1', DNI: 30123456, lastName: 'Pérez', name: 'Ana' }]);
    const { result } = renderHook(() => usePatientSearch({ source: { search }, minChars: 7 }));
    act(() => result.current.setInputValue('!3012345678'));
    await flush();
    expect(search).not.toHaveBeenCalled();
    act(() => result.current.setInputValue('30123456'));
    await flush();
    expect(result.current.options[0]).toMatchObject({ id: 'p1', label: '30123456', secondary: 'Pérez, Ana' });
  });
});

// --- bioquímico ---
const biochemists = [
  { id: 'b1', name: 'Laura', lastName: 'Ríos', professionalRegistration: 321 },
  { id: 'b2', name: 'Laura', lastName: 'Ríos', professionalRegistration: 321 },
];

describe('useBiochemistSearch', () => {
  it('local: etiquetas repetidas no colisionan (por id)', () => {
    const { result } = renderHook(() => useBiochemistSearch({ source: { items: biochemists } }));
    act(() => result.current.setInputValue('rios'));
    expect(result.current.options.map((o) => o.id)).toEqual(['b1', 'b2']);
    expect(result.current.getOptionById('b2')?.raw).toBe(biochemists[1]);
  });

  it('servidor', async () => {
    const search = vi.fn(async () => biochemists.slice(0, 1));
    const { result } = renderHook(() => useBiochemistSearch({ source: { search } }));
    act(() => result.current.setInputValue('321'));
    await flush();
    expect(result.current.options.map((o) => o.label)).toEqual(['321 - Laura Ríos']);
  });
});

// --- planilla ---
const worksheets = [
  { id: 'w1', code: 1, name: 'Química' },
  { id: 'w2', code: 2, name: 'Hematología' },
];

describe('useWorksheetSearch', () => {
  it('local: code - name y findByCode', () => {
    const { result } = renderHook(() => useWorksheetSearch({ source: { items: worksheets } }));
    expect(result.current.options.map((o) => o.label)).toEqual(['1 - Química', '2 - Hematología']);
    act(() => result.current.setInputValue('hemat'));
    expect(result.current.options.map((o) => o.id)).toEqual(['w2']);
    expect(result.current.findByCode(1)?.id).toBe('w1');
  });

  it('servidor', async () => {
    const search = vi.fn(async () => worksheets);
    const { result } = renderHook(() => useWorksheetSearch({ source: { search } }));
    act(() => result.current.setInputValue('q'));
    await flush();
    expect(result.current.options).toHaveLength(2);
    expect(result.current.findByCode('2')?.id).toBe('w2');
  });
});
