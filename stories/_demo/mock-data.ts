/** Datos ficticios para el catálogo. Ninguno es de una persona real. */

export const doctors = [
  { id: 'd1', name: 'Marta', lastName: 'Gómez', professionalRegistration: 1204 },
  { id: 'd2', name: 'Juan Pablo', lastName: 'Fernández', professionalRegistration: 2318 },
  { id: 'd3', name: 'Lucía', lastName: 'Benítez', professionalRegistration: 987 },
  { id: 'd4', name: 'Raúl', lastName: 'Gómez Ortiz', professionalRegistration: 4410 },
  { id: 'd5', name: 'Ana', lastName: 'Villalba', professionalRegistration: 3052 },
  { id: 'd6', name: 'Sergio', lastName: 'Acosta', professionalRegistration: 1876 },
];

export const studies = [
  { id: 's1', code: 475, name: 'Hemograma completo', abbreviation: 'HEMO' },
  { id: 's2', code: 660, name: 'Glucemia', abbreviation: 'GLU' },
  { id: 's3', code: 1031, name: 'Creatinina', abbreviation: 'CREA' },
  { id: 's4', code: 890, name: 'Colesterol total', abbreviation: 'COL' },
  { id: 's5', code: 1112, name: 'Hepatograma', abbreviation: 'HEPA' },
  { id: 's6', code: 1515001, name: 'Recuento de glóbulos blancos (sub-ítem)', abbreviation: 'GB' },
];

export const profiles = [
  { id: 'p1', name: 'Control anual', shortcutCode: 'CA', studies: studies.slice(0, 4) },
  { id: 'p2', name: 'Prequirúrgico', shortcutCode: 'PQ', studies: studies.slice(0, 3) },
];

export const diagnoses = [
  { id: 'dx1', code: 'J00', name: 'Rinofaringitis aguda (resfriado común)' },
  { id: 'dx2', code: 'E11', name: 'Diabetes mellitus tipo 2' },
  { id: 'dx3', code: 'I10', name: 'Hipertensión esencial (primaria)' },
  { id: 'dx4', code: 'D64.9', name: 'Anemia, no especificada' },
  { id: 'dx5', code: 'N39.0', name: 'Infección de vías urinarias, sitio no especificado' },
];

export const insurances = [
  { id: 'o1', code: 101, abbreviation: 'OSDEMO', name: 'Obra Social de Demostración' },
  { id: 'o2', code: 205, abbreviation: 'MUTUAL', name: 'Mutual de Ejemplo' },
  { id: 'o3', code: 310, abbreviation: 'PREPAGA', name: 'Prepaga Ficticia' },
];

export const patients = [
  { id: 'pa1', DNI: 30111222, name: 'Carla', lastName: 'Rojas' },
  { id: 'pa2', DNI: 27456789, name: 'Mateo', lastName: 'Ibarra' },
  { id: 'pa3', DNI: 41999000, name: 'Sofía', lastName: 'Luna' },
];

export const biochemists = [
  { id: 'b1', name: 'Paula', lastName: 'Méndez', professionalRegistration: 512, DNI: 25000111 },
  { id: 'b2', name: 'Diego', lastName: 'Sosa', professionalRegistration: 733, DNI: 28000222 },
];

export const worksheets = [
  { id: 'w1', code: 1, name: 'Hematología' },
  { id: 'w2', code: 2, name: 'Química clínica' },
  { id: 'w3', code: 3, name: 'Hepatograma y lipidograma' },
];

/** Escaneo de DNI nuevo (PDF417) con datos inventados. */
export const SAMPLE_DNI_SCAN = '!00123456789@ROJAS@CARLA@F@30111222@A@12/09/1988@01/03/2020';

/** Simula un servidor: espera, respeta el AbortSignal y filtra por el texto. */
export function fakeServer<T>(
  items: readonly T[],
  text: (item: T) => string,
  { delayMs = 600, fail = false }: { delayMs?: number; fail?: boolean } = {},
) {
  return (query: string, signal: AbortSignal): Promise<T[]> =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (fail) return reject(new Error('El servidor no respondió'));
        const q = query.toLowerCase();
        resolve(items.filter((item) => text(item).toLowerCase().includes(q)));
      }, delayMs);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Cancelado', 'AbortError'));
      });
    });
}
