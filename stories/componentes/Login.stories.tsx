import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import logoBlue from 'deva-design/assets/deva-logo.png';
import logoWhite from 'deva-design/assets/deva-logo-white.png';
import { AuthLayout, BrandLockup, Button, ColorModeSwitch, LoginForm, type ColorMode } from '../../src/ui';

const logos = { blue: logoBlue, white: logoWhite };

/** El selector de modo de cada app va conectado a su propio estado; acá es sólo visual. */
function Switch() {
  const [mode, setMode] = useState<ColorMode>(
    document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light',
  );
  return (
    <ColorModeSwitch
      hideLabel
      mode={mode}
      onChange={(next) => {
        setMode(next);
        document.documentElement.setAttribute('data-theme', next);
      }}
    />
  );
}

const meta = {
  title: 'Componentes/Login (plantilla)',
  component: AuthLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Plantilla de las pantallas sin sesión de la familia DEVA. `AuthLayout` pone el panel de marca con degradado y el formulario; `LoginForm` es el formulario de ingreso (usuario, contraseña con ojo y Bloq Mayús, error y botón con carga). La plantilla no sabe de autenticación: cada app le pasa su marca, su selector de modo y qué hacer al enviar. Las tres historias de abajo son las tres apps usando la misma plantilla.',
      },
    },
  },
} satisfies Meta<typeof AuthLayout>;
export default meta;
type Story = StoryObj<typeof meta>;

const fakeLogin = (ok: boolean) => () =>
  new Promise<void>((resolve) => setTimeout(resolve, 900)).then(() => {
    if (!ok) throw new Error('Usuario o contraseña incorrectos.');
  });

function LoginDemo({ failWith }: { failWith?: string }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <LoginForm
      error={error}
      onSubmit={async () => {
        setError(null);
        await fakeLogin(!failWith)().catch(() => setError(failWith ?? null));
      }}
    />
  );
}

/** DEVA de escritorio: el panel muestra la versión instalada. */
export const Deva: Story = {
  args: { title: 'Iniciar sesión', brand: null, children: null },
  render: () => (
    <AuthLayout
      title="Iniciar sesión"
      brand={
        <BrandLockup
          tone="white"
          logos={logos}
          stacked
          logoClassName="h-auto w-[280px] lg:w-[340px] drop-shadow-[0_6px_18px_rgba(8,61,120,0.25)]"
        />
      }
      mobileBrand={<BrandLockup tone="blue" logos={logos} logoClassName="h-auto w-28" />}
      panelFooter="Versión 1.3.13"
      topRight={<Switch />}
    >
      <LoginDemo />
    </AuthLayout>
  ),
};

/** Portal de pedidos externos. */
export const Pedidos: Story = {
  args: { title: 'Iniciar sesión', brand: null, children: null },
  render: () => (
    <AuthLayout
      title="Iniciar sesión"
      brand={
        <BrandLockup
          product="Pedidos"
          tone="white"
          logos={logos}
          stacked
          logoClassName="h-auto w-[280px] lg:w-[340px] drop-shadow-[0_6px_18px_rgba(8,61,120,0.25)]"
          textClassName="text-3xl text-white/90 lg:text-4xl"
        />
      }
      mobileBrand={<BrandLockup product="Pedidos" tone="blue" logos={logos} logoClassName="h-auto w-28" textClassName="text-2xl" />}
      panelFooter="Portal de pedidos externos"
      topRight={<Switch />}
    >
      <LoginDemo failWith="Usuario o contraseña incorrectos. Si no la recordás, pedile al laboratorio que la restablezca." />
    </AuthLayout>
  ),
};

/** Nexus: con subtítulo, enlace para recuperar la contraseña y ayuda de primer ingreso. */
export const Nexus: Story = {
  args: { title: 'Iniciar sesión', brand: null, children: null },
  render: () => (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Ingresá con tu cuenta de Nexus."
      brand={
        <BrandLockup
          product="Nexus"
          tone="white"
          logos={logos}
          stacked
          logoClassName="h-auto w-[280px] lg:w-[340px] drop-shadow-[0_6px_18px_rgba(8,61,120,0.25)]"
          textClassName="text-3xl text-white/90 lg:text-4xl"
        />
      }
      mobileBrand={<BrandLockup product="Nexus" tone="blue" logos={logos} logoClassName="h-auto w-28" textClassName="text-2xl" />}
      tagline="Panel de auto-gestión de licencias DEVA para revendedores"
      panelFooter="Un producto de Certia"
      topRight={<Switch />}
    >
      <LoginForm
        usernameLabel="Email o usuario"
        submitLabel="Ingresar"
        forgotPassword={
          <a href="#recuperar" className="text-deva-ink-soft underline-offset-4 hover:text-deva-ink hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        }
        passwordHint="Si es tu primer ingreso, usá la contraseña temporal que te llegó por email."
        onSubmit={fakeLogin(true)}
      />
    </AuthLayout>
  ),
};

/** Mismo marco con otro contenido: el primer ingreso de DEVA (formulario ancho, 10 campos). */
export const FormularioAncho: Story = {
  args: { title: 'Primer ingreso', brand: null, children: null },
  render: () => (
    <AuthLayout
      wide
      title="Primer ingreso"
      subtitle="Completa esta configuración única para habilitar el acceso al sistema."
      brand={<BrandLockup tone="white" logos={logos} stacked logoClassName="h-auto w-[280px]" />}
      topRight={<Switch />}
    >
      <Button type="button" fullWidth>
        Guardar datos y continuar
      </Button>
    </AuthLayout>
  ),
};
