import { describe, expect, it } from 'vitest';
import {
  biochemistLabel,
  biochemistToOption,
  diagnosisLabel,
  doctorLabel,
  doctorLabelLastNameFirst,
  doctorToOption,
  findDiagnosisByCode,
  findWorksheetByCode,
  insuranceLabel,
  isInsuranceSuspended,
  matchBiochemist,
  matchDiagnosis,
  matchDoctor,
  matchInsurance,
  matchPatient,
  matchWorksheet,
  normalizeDiagnosisCode,
  patientId,
  patientLabel,
  patientToOption,
  worksheetLabel,
} from '../src';

describe('médico', () => {
  const doc = { id: 'd1', name: 'Juan Carlos', lastName: 'Gómez', professionalRegistration: 1234 };
  it('etiquetas de DEVA y del portal', () => {
    expect(doctorLabel(doc)).toBe('1234 - Juan Carlos Gómez');
    expect(doctorLabel({ id: 'd2', doctor: '55 - Ana Paz' })).toBe('55 - Ana Paz');
    expect(doctorLabel({ id: 'd3', name: 'Ana' })).toBe('Ana');
    expect(doctorLabelLastNameFirst(doc)).toBe('Gómez, Juan Carlos · MP 1234');
    expect(doctorLabelLastNameFirst({ id: 'x' })).toBe('Sin nombre');
    expect(doctorToOption(doc).id).toBe('d1');
  });
  it('multi-término por apellido, nombre y matrícula', () => {
    expect(matchDoctor(doc, 'Gomez Juan')).toBe(true);
    expect(matchDoctor(doc, 'juan gómez')).toBe(true);
    expect(matchDoctor(doc, '123 gom')).toBe(true);
    expect(matchDoctor(doc, 'gomez pedro')).toBe(false);
    expect(matchDoctor({ id: 'd2', doctor: '55 - Ana Paz' }, 'paz 55')).toBe(true);
  });
});

describe('diagnóstico', () => {
  const list = [
    { id: 'g1', code: 'A09.9', name: 'Gastroenteritis' },
    { id: 'g2', code: 'E11', name: 'Diabetes tipo 2' },
  ];
  it('etiqueta y code ignorando puntos', () => {
    expect(diagnosisLabel(list[0])).toBe('A09.9 - Gastroenteritis');
    expect(diagnosisLabel({ id: 'z', name: 'Sólo nombre' })).toBe('Sólo nombre');
    expect(diagnosisLabel({ id: 'z' })).toBe('z');
    expect(matchDiagnosis(list[0], 'a099')).toBe(true);
    expect(matchDiagnosis(list[0], 'A09.9')).toBe(true);
    expect(matchDiagnosis(list[1], 'diabetes 2')).toBe(true);
    expect(normalizeDiagnosisCode('a09.9')).toBe('A099');
    expect(findDiagnosisByCode(list, 'a099')?.id).toBe('g1');
    expect(findDiagnosisByCode(list, '')).toBeUndefined();
  });
});

describe('obra social', () => {
  it('etiqueta "code - abreviatura" y búsqueda', () => {
    const osde = { id: 'i1', code: 24, abbreviation: 'OSDE', name: 'Org. de Servicios Directos Empresarios' };
    expect(insuranceLabel(osde)).toBe('24 - OSDE');
    expect(insuranceLabel({ id: 'i2', insurance: '30 - IOSFA' })).toBe('30 - IOSFA');
    expect(insuranceLabel({ id: 'i3', name: 'Particular' })).toBe('Particular');
    expect(matchInsurance(osde, 'servicios')).toBe(true);
    expect(matchInsurance(osde, '24 osde')).toBe(true);
  });
  it('suspendidas por code numérico', () => {
    expect(isInsuranceSuspended({ code: 24 }, [24])).toBe(true);
    expect(isInsuranceSuspended({ code: '24' }, [24])).toBe(true);
    expect(isInsuranceSuspended({ code: 25 }, [24])).toBe(false);
    expect(isInsuranceSuspended({ code: null }, [24])).toBe(false);
    expect(isInsuranceSuspended({ code: 24 }, undefined)).toBe(false);
  });
});

describe('paciente', () => {
  it('DNI suelto y objeto', () => {
    expect(patientLabel('30123456')).toBe('30123456');
    expect(patientId(30123456)).toBe('30123456');
    const p = { _id: 'p1', DNI: 30123456, lastName: 'Pérez', name: 'Ana' };
    expect(patientToOption(p)).toEqual({ id: 'p1', label: '30123456', secondary: 'Pérez, Ana', raw: p });
    expect(patientId({ patientId: 'x1', name: 'A' })).toBe('x1');
    expect(matchPatient(p, '3012')).toBe(true);
    expect(matchPatient(p, 'perez')).toBe(true);
    expect(matchPatient('30123456', '0123')).toBe(true);
  });
});

describe('bioquímico', () => {
  const b = { id: 'b1', name: 'Laura', lastName: 'Ríos', professionalRegistration: 321, DNI: 25000111 };
  it('etiqueta y búsqueda', () => {
    expect(biochemistLabel(b)).toBe('321 - Laura Ríos');
    expect(biochemistToOption(b).id).toBe('b1');
    expect(matchBiochemist(b, 'rios laura')).toBe(true);
    expect(matchBiochemist(b, '25000')).toBe(true);
  });
});

describe('planilla', () => {
  const list = [
    { id: 'w1', code: 1, name: 'Química' },
    { id: 'w2', code: 2, name: 'Hematología' },
  ];
  it('etiqueta, búsqueda y code exacto', () => {
    expect(worksheetLabel(list[0])).toBe('1 - Química');
    expect(matchWorksheet(list[0], 'quim')).toBe(true);
    expect(findWorksheetByCode(list, '2')?.id).toBe('w2');
    expect(findWorksheetByCode(list, 3)).toBeUndefined();
    expect(findWorksheetByCode(list, null)).toBeUndefined();
  });
});
