import type { Meta, StoryObj } from '@storybook/react-vite';
import { doctorLabelLastNameFirst, useDoctorSearch, type DoctorLike } from '../../src';
import { SearchBox } from '../_demo/SearchBox';
import { doctors, fakeServer } from '../_demo/mock-data';

const meta = {
  title: 'Búsqueda/Médico',
  parameters: {
    docs: {
      description: {
        component:
          'Busca médicos por apellido, nombre y matrícula, con varios términos en cualquier orden ("gomez marta", "1204 gomez"). Sirve con una lista ya cargada (DEVA) o consultando al servidor (portal).',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Local() {
  const search = useDoctorSearch({ source: { items: doctors } });
  return <SearchBox search={search} label="Médico solicitante" placeholder="Apellido, nombre o matrícula" />;
}

function ConEtiquetaDelPortal() {
  const search = useDoctorSearch({
    source: { items: doctors },
    toOption: (doctor: DoctorLike) => ({ id: String(doctor.id), label: doctorLabelLastNameFirst(doctor), raw: doctor }),
  });
  return <SearchBox search={search} label="Médico (formato del portal)" />;
}

function Servidor({ fail }: { fail?: boolean }) {
  const search = useDoctorSearch({
    source: {
      search: fakeServer(doctors, (d) => `${d.name} ${d.lastName} ${d.professionalRegistration}`, { fail }),
    },
  });
  return <SearchBox search={search} label="Médico (consulta al servidor)" />;
}

/** Lista ya cargada, como hace DEVA. Con la caja vacía muestra todos. */
export const ListaCargada: Story = { render: () => <Local /> };

/** Misma búsqueda, pero con la etiqueta "Apellido, Nombre · MP matrícula" del portal. */
export const EtiquetaDelPortal: Story = { render: () => <ConEtiquetaDelPortal /> };

/** Consulta al servidor con espera de 600 ms; se cancela la consulta anterior al seguir escribiendo. */
export const ConsultaAlServidor: Story = { render: () => <Servidor /> };

/** Si el servidor falla, se muestra el error y no queda cargando. */
export const ErrorDelServidor: Story = { render: () => <Servidor fail /> };
