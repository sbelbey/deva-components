import { describe, expect, it } from 'vitest';
import { parse } from 'date-fns';
import { isDniScan, parseDniData, parseDniDate, parseDniScan } from '../src';

/** Lo que hacía DEVA con date-fns, para comparar. */
function dateFnsReference(dateStr: string | undefined): string | null {
  try {
    const parsedDate = parse(dateStr as string, 'dd/MM/yyyy', new Date());
    if (isNaN(parsedDate.getTime())) return null;
    return parsedDate.toISOString();
  } catch {
    return null;
  }
}

describe('parseDniDate = date-fns parse dd/MM/yyyy', () => {
  const cases = [
    '12/09/1988',
    '1/2/2000',
    '29/02/2000',
    '29/02/1900',
    '29/02/2023',
    '31/04/2020',
    '00/01/2020',
    '10/13/2020',
    '12/09/88',
    '12-09-1988',
    'abc',
    '',
    '12/09/1988 ',
    ' 12/09/1988',
    '12/09/19888',
    undefined,
  ];
  for (const value of cases) {
    it(JSON.stringify(value), () => {
      expect(parseDniDate(value)).toBe(dateFnsReference(value));
    });
  }
});

describe('parseDniData (copia de DEVA)', () => {
  it('DNI nuevo (PDF417)', () => {
    const raw = '!00512345678@PEREZ@ana maria@F@30123456@B@12/09/1988@01/01/2015';
    expect(parseDniData(raw)).toEqual({
      dni: 30123456,
      lastName: 'PEREZ',
      name: 'ANA MARIA',
      gender: 'FEMALE',
      dateOfBirth: dateFnsReference('12/09/1988'),
      rawString: raw,
    });
  });

  it('DNI viejo', () => {
    const raw = '!@34033520 @A@1@BELBEY@SAUL IVAN@ARGENTINA@12/09/1988@M@';
    expect(parseDniData(raw)).toEqual({
      dni: 34033520,
      lastName: 'BELBEY',
      name: 'SAUL IVAN',
      gender: 'MALE',
      dateOfBirth: dateFnsReference('12/09/1988'),
      rawString: raw,
    });
  });

  it('sexo desconocido y datos incompletos', () => {
    expect(parseDniData('00512345678@A@B@X@30123456')?.gender).toBe('OTHER');
    expect(parseDniData('00512345678@A@B')).toBeNull();
    expect(parseDniData('hola')).toBeNull();
    expect(parseDniData('')).toBeNull();
  });
});

describe('parseDniScan (handleChangeScan de DEVA)', () => {
  it('detecta el escaneo por el "!"', () => {
    expect(isDniScan('!123')).toBe(true);
    expect(isDniScan('123')).toBe(false);
    expect(isDniScan(undefined)).toBe(false);
  });
  it('formato reconocido: DNI y datos', () => {
    const result = parseDniScan('!00512345678@PEREZ@ANA@F@30123456@B@12/09/1988');
    expect(result?.dni).toBe(30123456);
    expect(result?.patient?.lastName).toBe('PEREZ');
  });
  it('formato desconocido: sólo los dígitos si son 7 u 8', () => {
    expect(parseDniScan('!x30.123.456x')).toEqual({ dni: 30123456, patient: null });
    expect(parseDniScan('!abc12')).toBeNull();
    expect(parseDniScan('')).toBeNull();
  });
});
