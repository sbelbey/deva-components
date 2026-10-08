/**
 * Escaneo del DNI argentino con lector de código de barras. Copia de la
 * lógica real de DEVA (`renderer/utils/dniParser.utils.ts` parseDniData y
 * `pages/newOrder/libs/handleScanChanges.ts`), sin date-fns: la fecha se
 * interpreta igual que `parse(fecha, 'dd/MM/yyyy', new Date())`.
 */
export interface PatientFromDni {
  dni: number;
  lastName: string;
  name: string;
  gender: string;
  dateOfBirth: string | null;
  rawString: string;
}

/** Resultado de `parseDniScan`: el DNI, y los datos del paciente si el formato se reconoció. */
export interface DniScanResult {
  dni: number;
  patient: PatientFromDni | null;
}

const toUpperCase = (str: string) => {
  if (!str) return '';
  return str.toUpperCase();
};

function daysInMonth(year: number, month: number): number {
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

/** "DD/MM/YYYY" → ISO (medianoche local), o null. Equivale a date-fns parse 'dd/MM/yyyy'. */
export function parseDniDate(dateStr: string | null | undefined): string | null {
  if (typeof dateStr !== 'string') return null;
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{1,4})\s*$/.exec(dateStr);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > daysInMonth(year, month)) return null;
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

/** true si lo tipeado es un escaneo: empieza con '!' (así viene configurado el lector). */
export function isDniScan(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith('!');
}

/** Igual a parseDniData de DEVA: DNI nuevo (PDF417) o viejo, separados por '@'. */
export function parseDniData(rawData: string): PatientFromDni | null {
  if (!rawData) return null;

  // 1. Quitamos el '!' del principio si existe y los espacios.
  let cleanData = rawData.trim();
  if (cleanData.startsWith('!')) {
    cleanData = cleanData.substring(1);
  }

  // 2. Partimos por '@'.
  const parts = cleanData
    .split('@')
    .map((p) => p.trim())
    .filter((p) => p !== '');

  const genderMap: { [key: string]: string } = { M: 'MALE', F: 'FEMALE' };

  // DNI nuevo (PDF417): 0 trámite (11 dígitos), 1 apellido, 2 nombre,
  // 3 sexo, 4 DNI, 5 ejemplar, 6 nacimiento, 7 emisión.
  if (/^\d{11}/.test(parts[0])) {
    if (parts.length < 5) return null;
    return {
      dni: parseInt(parts[4], 10),
      lastName: toUpperCase(parts[1]),
      name: toUpperCase(parts[2]),
      gender: genderMap[parts[3]] || 'OTHER',
      dateOfBirth: parseDniDate(parts[6]),
      rawString: rawData,
    };
  }

  // DNI viejo: 0 DNI, 1 'A', 2 '1', 3 apellido, 4 nombre, 5 país,
  // 6 nacimiento, 7 sexo.
  if (/^\d{7,8}/.test(parts[0])) {
    return {
      dni: parseInt(parts[0], 10),
      lastName: toUpperCase(parts[3]),
      name: toUpperCase(parts[4]),
      dateOfBirth: parseDniDate(parts[6]),
      gender: genderMap[parts[7]] || 'OTHER',
      rawString: rawData,
    };
  }

  return null;
}

/**
 * Lo que hace DEVA en el blur cuando el DNI empieza con '!'
 * (handleChangeScan): si el formato se reconoce devuelve el DNI y los datos;
 * si no, se queda con los dígitos cuando son 7 u 8; si no, null.
 */
export function parseDniScan(rawData: string): DniScanResult | null {
  if (!rawData) return null;
  const patient = parseDniData(rawData);
  if (patient) return { dni: patient.dni, patient };

  const cleanRaw = rawData.replace(/^!/, '').trim();
  const numericOnly = cleanRaw.replace(/\D/g, '');
  if (numericOnly.length >= 7 && numericOnly.length <= 8) {
    return { dni: parseInt(numericOnly, 10), patient: null };
  }
  return null;
}
