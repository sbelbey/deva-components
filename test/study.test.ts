import { describe, expect, it } from 'vitest';
import {
  COMPOUND_SUBITEM_CODE_REGEX,
  findProfileByShortcut,
  findStudyByExactCode,
  isCompoundSubItem,
  isCompoundSubItemCode,
  matchProfile,
  matchStudy,
  profileLabel,
  resolveStudyInput,
  studyLabel,
  studyToOption,
} from '../src';

describe('isCompoundSubItemCode (regex real de DEVA)', () => {
  it('reconoce las familias de sub-ítems', () => {
    for (const code of [1515001, 1516123, 1517999, 151515, 151525, 151535, '1515001', 15162711]) {
      expect(isCompoundSubItemCode(code)).toBe(true);
    }
  });
  it('deja afuera los estudios reales', () => {
    for (const code of [151, 1510, 15100, 475, 1, 21515001, '', null, undefined]) {
      expect(isCompoundSubItemCode(code)).toBe(false);
    }
  });
  it('es la misma regex que el backend', () => {
    expect(COMPOUND_SUBITEM_CODE_REGEX.source).toBe('^151\\d{3,}');
    expect(isCompoundSubItem({ code: 151515 })).toBe(true);
    expect(isCompoundSubItem(null)).toBe(false);
  });
});

describe('estudio: etiqueta y búsqueda', () => {
  const hemo = { id: 'a1', code: 475, name: 'Hemograma completo', abbreviation: 'HMG' };
  it('etiqueta code - name', () => {
    expect(studyLabel(hemo)).toBe('475 - Hemograma completo');
    expect(studyLabel({ id: 'x', name: 'Sin code' })).toBe('Sin code');
    expect(studyLabel({ _id: 'x9' })).toBe('x9');
    expect(studyToOption(hemo)).toEqual({
      id: 'a1',
      label: '475 - Hemograma completo',
      raw: hemo,
      kind: 'study',
    });
  });
  it('busca por code, nombre y abreviatura', () => {
    expect(matchStudy(hemo, '475')).toBe(true);
    expect(matchStudy(hemo, 'hemog compl')).toBe(true);
    expect(matchStudy(hemo, 'hmg')).toBe(true);
    expect(matchStudy(hemo, 'orina')).toBe(false);
  });
});

describe('findStudyByExactCode (Enter)', () => {
  const studies = [
    { id: 'a', code: 475, name: 'Hemograma' },
    { id: 'b', code: 47, name: 'Otro' },
    { id: 'c', code: '12', name: 'Code texto' },
  ];
  it('acepta "475" y "475 - ..."', () => {
    expect(findStudyByExactCode(studies, '475')?.id).toBe('a');
    expect(findStudyByExactCode(studies, ' 475 - Hemograma ')?.id).toBe('a');
    expect(findStudyByExactCode(studies, '47')?.id).toBe('b');
    expect(findStudyByExactCode(studies, '12')?.id).toBe('c');
  });
  it('no inventa coincidencias', () => {
    expect(findStudyByExactCode(studies, 'hemo')).toBeUndefined();
    expect(findStudyByExactCode(studies, '4')).toBeUndefined();
    expect(findStudyByExactCode(studies, '')).toBeUndefined();
    expect(findStudyByExactCode(undefined, '475')).toBeUndefined();
  });
});

describe('perfiles / atajos', () => {
  const profiles = [{ _id: 'p1', name: 'Rutina', shortcutCode: 'R1', studies: [] }];
  it('etiqueta, match y atajo exacto', () => {
    expect(profileLabel(profiles[0])).toBe('R1 - Rutina');
    expect(matchProfile(profiles[0], 'rut')).toBe(true);
    expect(findProfileByShortcut(profiles, 'R1')?._id).toBe('p1');
    expect(findProfileByShortcut(profiles, 'R1 - Rutina')?._id).toBe('p1');
    expect(findProfileByShortcut(profiles, 'r1')).toBeUndefined();
  });
  it('resolveStudyInput: el perfil primero, después el code', () => {
    const studies = [{ id: 's', code: 99, name: 'X' }];
    const numeric = [{ _id: 'p2', name: 'Atajo', shortcutCode: '99' }];
    expect(resolveStudyInput('99', studies, numeric)).toEqual({ kind: 'profile', profile: numeric[0] });
    expect(resolveStudyInput('99', studies, [])).toEqual({ kind: 'study', study: studies[0] });
    expect(resolveStudyInput('nada', studies, numeric)).toBeNull();
    expect(resolveStudyInput('', studies, numeric)).toBeNull();
  });
});
