import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { DniScanResult } from '../../src';
import {
  BiochemistAutocomplete,
  DiagnosisAutocomplete,
  DoctorAutocomplete,
  InsuranceAutocomplete,
  PatientDniAutocomplete,
  StudyAutocomplete,
  WorksheetAutocomplete,
} from '../../src/ui';
import { biochemists, diagnoses, doctors, insurances, patients, profiles, SAMPLE_DNI_SCAN, studies, worksheets } from '../_demo/mock-data';

const meta = {
  title: 'Primitivos/Autocompletes',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Un autocomplete por tipo de dato, con el mismo comportamiento que en DEVA. Todos comparten la base `Combobox`: el valor es siempre el **id** de la opción, mientras se tipea el valor no cambia (sólo al elegir o al borrar todo), al salir del campo vuelve la etiqueta de lo elegido, y se maneja con teclado (flechas, Enter, Escape). Los de médico, diagnóstico y obra social eligen por **código exacto** con Enter o Tab. Los datos son inventados.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm pt-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Readout({ children }: { children: ReactNode }) {
  return <pre className="mt-3 overflow-auto rounded-deva bg-deva-surface-2 p-3 text-xs text-deva-ink">{children}</pre>;
}

/** Busca por apellido, nombre y matrícula, en cualquier orden. Probá «gomez marta» o «987» + Enter. */
export const Medico: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <>
        <DoctorAutocomplete label="Médico" doctors={doctors} value={value} onChange={setValue} selectByExactCode />
        <Readout>{`id elegido: ${value ?? '—'}`}</Readout>
      </>
    );
  },
};

/** El punto del código no importa («d649» encuentra D64.9). Con Enter o Tab elige el código exacto. */
export const Diagnostico: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <>
        <DiagnosisAutocomplete label="Diagnóstico" diagnoses={diagnoses} value={value} onChange={setValue} selectByExactCode />
        <Readout>{`id elegido: ${value ?? '—'}`}</Readout>
      </>
    );
  },
};

/** Escribir el número y Enter elige la coincidencia exacta. Las suspendidas se ofrecen marcadas. */
export const ObraSocial: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <>
        <InsuranceAutocomplete
          label="Obra social"
          insurances={insurances}
          suspendedCodes={[205]}
          value={value}
          onChange={setValue}
          selectByExactCode
        />
        <Readout>{`id elegido: ${value ?? '—'}\nprobá: 101 + Enter`}</Readout>
      </>
    );
  },
};

/** Texto libre: un DNI que no está en la lista es un paciente nuevo. Se confirma al salir del campo o con Enter. */
export const DniDelPaciente: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    const [scan, setScan] = useState<DniScanResult | null | undefined>(undefined);
    return (
      <>
        <PatientDniAutocomplete
          label="DNI del paciente"
          patients={patients}
          value={value}
          onChange={setValue}
          onScan={(result) => setScan(result)}
        />
        <p className="mt-3 text-xs text-deva-ink-soft">
          Para ver el escaneo pegá esto en el campo: <code className="break-all">{SAMPLE_DNI_SCAN}</code>
        </p>
        <Readout>{`DNI: ${value ?? '—'}\nescaneo: ${scan === undefined ? '—' : JSON.stringify(scan)}`}</Readout>
      </>
    );
  },
};

/** Busca por matrícula, nombre, apellido y DNI. */
export const Bioquimico: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <>
        <BiochemistAutocomplete label="Bioquímico" biochemists={biochemists} value={value} onChange={setValue} />
        <Readout>{`id elegido: ${value ?? '—'}`}</Readout>
      </>
    );
  },
};

/** Para «agregar a una lista»: después de elegir el campo queda vacío. Enter con un code exacto («2») agrega esa planilla. */
export const PlanillaDeTrabajo: Story = {
  render: () => {
    const [added, setAdded] = useState<string[]>([]);
    return (
      <>
        <WorksheetAutocomplete
          label="Planilla"
          worksheets={worksheets}
          value={null}
          clearOnSelect
          onChange={(id) => id && setAdded((current) => (current.includes(id) ? current : [...current, id]))}
          onEnter={(text, tools) => {
            const found = tools.findByCode(text);
            if (!found) return;
            setAdded((current) => (current.includes(found.id as string) ? current : [...current, found.id as string]));
            tools.reset();
          }}
        />
        <Readout>{`agregadas: ${added.length ? added.join(', ') : '—'}`}</Readout>
      </>
    );
  },
};

/** Estudios y perfiles: «CA» es el atajo del perfil «Control anual». Enter con un code exacto («475») agrega ese estudio. */
export const Estudio: Story = {
  render: () => {
    const [added, setAdded] = useState<string[]>([]);
    return (
      <>
        <StudyAutocomplete
          label="Estudio"
          studies={studies}
          profiles={profiles}
          value={null}
          clearOnSelect
          onChange={(id) => id && setAdded((current) => [...current, `estudio ${id}`])}
          onProfileSelect={(profile) => setAdded((current) => [...current, `perfil ${profile.name}`])}
          onEnter={(text, tools) => {
            const match = tools.resolveExact(text);
            if (!match) return;
            setAdded((current) => [...current, match.kind === 'profile' ? `perfil ${match.profile.name}` : `estudio ${match.study.id}`]);
            tools.reset();
          }}
        />
        <Readout>{`agregados: ${added.length ? added.join(', ') : '—'}`}</Readout>
      </>
    );
  },
};

/** La versión baja, para tablas y filtros: sin etiqueta flotante, con texto de ejemplo. */
export const VersionBaja: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>('o1');
    return (
      <InsuranceAutocomplete
        label="Obra social"
        size="sm"
        placeholder="Código o nombre"
        insurances={insurances}
        value={value}
        onChange={setValue}
        selectByExactCode
      />
    );
  },
};

/** Con error, deshabilitado y cargando la lista. */
export const Estados: Story = {
  render: () => (
    <div className="space-y-5">
      <DoctorAutocomplete label="Médico (con error)" doctors={doctors} value={null} onChange={() => undefined} error helperText="Elegí un médico" />
      <DoctorAutocomplete label="Médico (deshabilitado)" doctors={doctors} value="d2" onChange={() => undefined} disabled />
      <DoctorAutocomplete label="Médico (cargando la lista)" doctors={undefined} value={null} onChange={() => undefined} />
    </div>
  ),
};
