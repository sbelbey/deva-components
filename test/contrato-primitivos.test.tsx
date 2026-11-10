/**
 * Contrato de los primitivos de la familia DEVA, escrito contra lo que garantizan DEVA (MUI), el portal y Nexus:
 * botón que no envía solo ni dispara mientras carga, campos con etiqueta y ayuda vinculadas, selector de opción
 * única como el ToggleButtonGroup exclusivo de MUI, zona de PDF como PdfDropzone de DEVA, etc.
 */
import '@testing-library/jest-dom/vitest';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  Alert,
  BrandLockup,
  Button,
  ColorModeSwitch,
  EyeIcon,
  FileDropzone,
  PasswordInput,
  SearchField,
  SegmentedControl,
  Spinner,
  StatusDot,
  TextField,
  Tip,
  UserIcon,
} from '../src/ui';

afterEach(cleanup);

describe('Button', () => {
  it('no envía el formulario salvo que se pida (type="button" por defecto)', () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button>Cancelar</Button>
        <Button type="submit">Guardar</Button>
      </form>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('cargando no dispara onClick, queda ocupado y muestra la etiqueta del spinner', () => {
    const onClick = vi.fn();
    render(
      <Button loading loadingLabel="Ingresando" onClick={onClick}>
        Entrar
      </Button>,
    );
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('img', { name: 'Ingresando' })).toBeInTheDocument();
  });

  it('deshabilitado no dispara onClick y no se anuncia como ocupado', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Entrar
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
  });

  it('fullWidth ocupa todo el ancho; sin él no', () => {
    const { rerender } = render(<Button fullWidth>Ok</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
    rerender(<Button>Ok</Button>);
    expect(screen.getByRole('button')).not.toHaveClass('w-full');
  });

  it('pasa ref y atributos nativos, y la variante quiet no lleva el fondo de acción', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} variant="quiet" title="ayuda" data-x="1">
        Ok
      </Button>,
    );
    expect(ref.current).toBe(screen.getByRole('button'));
    expect(screen.getByRole('button')).toHaveAttribute('title', 'ayuda');
    expect(screen.getByRole('button')).not.toHaveClass('bg-deva-action');
  });

  it('la variante principal lleva el fondo de acción', () => {
    render(<Button>Ok</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-deva-action');
  });
});

describe('Alert y Spinner', () => {
  it('los tonos se distinguen y sólo el error es una alerta', () => {
    render(
      <>
        <Alert>e</Alert>
        <Alert tone="warn">w</Alert>
        <Alert tone="ok">o</Alert>
      </>,
    );
    expect(screen.getByText('e')).toHaveClass('text-deva-danger');
    expect(screen.getByText('w')).toHaveClass('text-deva-warn');
    expect(screen.getByText('o')).toHaveClass('text-deva-ok');
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getAllByRole('status')).toHaveLength(2);
  });

  it('el spinner se anuncia con una etiqueta por defecto y acepta una propia y clases', () => {
    const { rerender } = render(<Spinner />);
    expect(screen.getByRole('img', { name: 'Cargando' })).toHaveClass('animate-spin');
    rerender(<Spinner label="Leyendo" className="size-10" />);
    expect(screen.getByRole('img', { name: 'Leyendo' })).toHaveClass('size-10');
  });
});

describe('TextField', () => {
  it('la etiqueta nombra al campo y un id propio se respeta', () => {
    render(<TextField label="Usuario" id="usuario" />);
    expect(screen.getByLabelText('Usuario')).toHaveAttribute('id', 'usuario');
  });

  it('la versión normal no muestra placeholder (lo reemplaza la etiqueta flotante) y la baja sí', () => {
    const { rerender } = render(<TextField label="Usuario" placeholder="mi texto" />);
    expect(screen.getByLabelText('Usuario')).toHaveAttribute('placeholder', ' ');
    rerender(<TextField label="Usuario" placeholder="mi texto" compact />);
    expect(screen.getByLabelText('Usuario')).toHaveAttribute('placeholder', 'mi texto');
  });

  it('la versión baja deja la etiqueta sólo para lectores de pantalla y es más baja', () => {
    render(<TextField label="Usuario" compact />);
    expect(screen.getByText('Usuario')).toHaveClass('sr-only');
    expect(screen.getByLabelText('Usuario')).toHaveClass('h-10');
  });

  it('la versión normal tiene la etiqueta visible flotante y el alto de 56', () => {
    render(<TextField label="Usuario" />);
    expect(screen.getByText('Usuario')).not.toHaveClass('sr-only');
    expect(screen.getByLabelText('Usuario')).toHaveClass('h-14');
  });

  it('con tono error marca el campo inválido; con aviso o por defecto no', () => {
    const { rerender } = render(<TextField label="U" helper="mal" helperTone="error" />);
    expect(screen.getByLabelText('U')).toHaveAttribute('aria-invalid', 'true');
    rerender(<TextField label="U" helper="ojo" helperTone="warn" />);
    expect(screen.getByLabelText('U')).not.toHaveAttribute('aria-invalid');
    rerender(<TextField label="U" helper="ayuda" />);
    expect(screen.getByLabelText('U')).not.toHaveAttribute('aria-invalid');
  });

  it('el texto de ayuda está vinculado al campo y no hay vínculo sin ayuda', () => {
    const { rerender } = render(<TextField label="U" helper="Es obligatorio" />);
    expect(screen.getByLabelText('U')).toHaveAccessibleDescription('Es obligatorio');
    rerender(<TextField label="U" />);
    expect(screen.getByLabelText('U')).not.toHaveAttribute('aria-describedby');
  });

  it('el color de la ayuda sigue al tono', () => {
    const { rerender } = render(<TextField label="U" helper="x" helperTone="error" />);
    expect(screen.getByText('x')).toHaveClass('text-deva-danger');
    rerender(<TextField label="U" helper="x" helperTone="warn" />);
    expect(screen.getByText('x')).toHaveClass('text-deva-warn');
  });

  it('deja lugar al ícono de la izquierda y a los botones de la derecha, y no sin ellos', () => {
    const { rerender } = render(<TextField label="U" />);
    const bare = screen.getByLabelText('U');
    expect(bare).toHaveClass('pl-3.5');
    expect(bare).toHaveClass('pr-3.5');
    rerender(<TextField label="U" startIcon={<UserIcon />} endAdornment={<button type="button">x</button>} />);
    expect(screen.getByLabelText('U')).toHaveClass('pl-11');
    expect(screen.getByLabelText('U')).toHaveClass('pr-12');
    rerender(<TextField label="U" endAdornment={<button type="button">x</button>} endSize={2} />);
    expect(screen.getByLabelText('U')).toHaveClass('pr-[5.25rem]');
  });

  it('pasa ref, valor y manejadores al input, y deshabilitado se respeta', () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    render(<TextField ref={ref} label="U" value="ana" onChange={onChange} disabled />);
    expect(ref.current).toBe(screen.getByLabelText('U'));
    expect(screen.getByLabelText('U')).toBeDisabled();
    expect(screen.getByLabelText('U')).toHaveValue('ana');
  });

  it('el contenedor recibe sus clases', () => {
    const { container } = render(<TextField label="U" wrapperClassName="w-52" />);
    expect(container.firstChild).toHaveClass('w-52');
  });
});

describe('PasswordInput', () => {
  it('el ojo queda fuera del orden de Tab, no envía el formulario y dice qué va a hacer', () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <PasswordInput aria-label="Clave" />
      </form>,
    );
    const eye = screen.getByRole('button', { name: 'Mostrar contraseña' });
    expect(eye).toHaveAttribute('tabindex', '-1');
    expect(eye).toHaveAttribute('type', 'button');
    fireEvent.click(eye);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Clave')).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(screen.getByLabelText('Clave')).toHaveAttribute('type', 'password');
  });

  it('conserva lo escrito al alternar y el contenedor recibe sus clases', () => {
    const { container } = render(<PasswordInput aria-label="Clave" defaultValue="abc" wrapperClassName="w-40" />);
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(screen.getByLabelText('Clave')).toHaveValue('abc');
    expect(container.firstChild).toHaveClass('w-40');
  });
});

describe('SearchField', () => {
  it('es un buscador con nombre, escribe y avisa, y pasa atributos nativos', () => {
    const onChange = vi.fn();
    render(<SearchField label="Buscar paciente" placeholder="Apellido" value="" onChange={onChange} />);
    const field = screen.getByRole('searchbox', { name: 'Buscar paciente' });
    expect(field).toHaveAttribute('placeholder', 'Apellido');
    fireEvent.change(field, { target: { value: 'go' } });
    expect(onChange).toHaveBeenCalledWith('go');
  });

  it('«Borrar» usa la etiqueta que se le dé, vacía el texto y no se ve sin texto', () => {
    const onChange = vi.fn();
    const { rerender } = render(<SearchField label="B" value="x" onChange={onChange} clearLabel="Limpiar" />);
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar' }));
    expect(onChange).toHaveBeenCalledWith('');
    rerender(<SearchField label="B" value="" onChange={onChange} clearLabel="Limpiar" />);
    expect(screen.queryByRole('button', { name: 'Limpiar' })).toBeNull();
  });

  it('«Borrar» no envía un formulario que lo contenga', () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <SearchField label="B" value="x" onChange={vi.fn()} />
      </form>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Borrar búsqueda' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('pasa ref al input y el contenedor recibe sus clases', () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <SearchField ref={ref} label="B" value="" onChange={vi.fn()} wrapperClassName="max-w-xs" />,
    );
    expect(ref.current).toBe(screen.getByRole('searchbox'));
    expect(container.firstChild).toHaveClass('max-w-xs');
  });
});

describe('SegmentedControl (ToggleButtonGroup exclusivo de MUI)', () => {
  const options = [
    { value: 'a', label: 'Todos' },
    { value: 'b', label: 'Internados' },
  ] as const;

  it('tocar la opción que ya está elegida no avisa (no hay deselección ni repetición)', () => {
    const onChange = vi.fn();
    render(<SegmentedControl label="Estado" value="a" options={options} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Todos' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('tocar otra avisa con su valor, una sola vez', () => {
    const onChange = vi.fn();
    render(<SegmentedControl label="Estado" value="a" options={options} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Internados' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('las opciones no envían un formulario que las contenga y el grupo se llama como se pide', () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <SegmentedControl label="Estado" value="a" options={options} onChange={vi.fn()} />
      </form>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Internados' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('group', { name: 'Estado' })).toBeInTheDocument();
  });

  it('muestra exactamente una opción elegida y sigue al valor del padre', () => {
    const { rerender } = render(<SegmentedControl label="E" value="a" options={options} onChange={vi.fn()} />);
    expect(screen.getAllByRole('button').filter((b) => b.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
    rerender(<SegmentedControl label="E" value="b" options={options} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Internados' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('StatusDot', () => {
  it('el punto es decorativo, el estado va en texto y el color sigue al tono', () => {
    const { container } = render(<StatusDot tone="ok">Internado</StatusDot>);
    const dot = container.querySelector('[aria-hidden]');
    expect(dot).toHaveClass('bg-deva-ok');
    expect(screen.getByText('Internado')).toBeInTheDocument();
  });

  it('cada tono tiene su color y sin tono es gris; acepta className', () => {
    const { container, rerender } = render(<StatusDot tone="danger">x</StatusDot>);
    expect(container.querySelector('[aria-hidden]')).toHaveClass('bg-deva-danger');
    rerender(<StatusDot tone="warn">x</StatusDot>);
    expect(container.querySelector('[aria-hidden]')).toHaveClass('bg-deva-warn');
    rerender(<StatusDot className="ml-2">x</StatusDot>);
    expect(container.querySelector('[aria-hidden]')).toHaveClass('bg-deva-ink-soft/50');
    expect(container.firstChild).toHaveClass('ml-2');
  });
});

describe('FileDropzone (PdfDropzone de DEVA)', () => {
  const pdf = () => new File(['x'], 'listado.pdf', { type: 'application/pdf' });
  const setup = (props: Partial<React.ComponentProps<typeof FileDropzone>> = {}) => {
    const onFile = vi.fn();
    const onReject = vi.fn();
    render(
      <FileDropzone
        label="Listado"
        accept="application/pdf"
        extension=".pdf"
        onFile={onFile}
        onReject={onReject}
        {...props}
      />,
    );
    return { onFile, onReject, input: screen.getByLabelText('Listado') as HTMLInputElement };
  };

  it('el input sólo acepta el tipo pedido y está escondido; toda la zona es un botón que lo abre', () => {
    const { input } = setup();
    expect(input).toHaveAttribute('accept', 'application/pdf');
    expect(input).toHaveAttribute('hidden');
    const click = vi.spyOn(input, 'click');
    fireEvent.click(screen.getByRole('button'));
    expect(click).toHaveBeenCalled();
  });

  it('un PDF que el sistema informa sin tipo (pasa en Windows) se acepta por la extensión, sin importar mayúsculas', () => {
    const { onFile, input } = setup();
    const file = new File(['x'], 'LISTADO.PDF', { type: '' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onFile).toHaveBeenCalledWith(file);
  });

  it('sin extensión configurada un archivo sin tipo se rechaza', () => {
    const { onFile, onReject, input } = setup({ extension: undefined });
    fireEvent.change(input, { target: { files: [new File(['x'], 'listado.pdf', { type: '' })] } });
    expect(onFile).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalled();
  });

  it('rechazar usa el mensaje que se pide (y uno por defecto) y no falla sin onReject', () => {
    const { onReject, input } = setup({ rejectMessage: 'Subí el PDF' });
    fireEvent.change(input, { target: { files: [new File(['x'], 'foto.png', { type: 'image/png' })] } });
    expect(onReject).toHaveBeenCalledWith('Subí el PDF');
    cleanup();
    const second = setup({ onReject: undefined });
    expect(() =>
      fireEvent.change(second.input, { target: { files: [new File(['x'], 'a.png', { type: 'image/png' })] } }),
    ).not.toThrow();
  });

  it('elegir el mismo archivo dos veces lo vuelve a avisar (el input se vacía)', () => {
    const { onFile, input } = setup();
    const file = pdf();
    // El navegador sólo vuelve a avisar el mismo archivo si el valor del input se vació.
    const assigned: string[] = [];
    Object.defineProperty(input, 'value', { configurable: true, get: () => '', set: (v: string) => assigned.push(v) });
    fireEvent.change(input, { target: { files: [file] } });
    expect(assigned).toEqual(['']);
    fireEvent.change(input, { target: { files: [file] } });
    expect(onFile).toHaveBeenCalledTimes(2);
  });

  it('ocupado: el botón y el input quedan bloqueados y soltar un archivo no hace nada', () => {
    const { onFile, input } = setup({ busy: true, busyTitle: 'Leyendo…' });
    expect(input).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
    fireEvent.drop(screen.getByRole('button'), { dataTransfer: { files: [pdf()] } });
    expect(onFile).not.toHaveBeenCalled();
    expect(screen.getByText('Leyendo…')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Leyendo…' })).toBeInTheDocument();
  });

  it('arrastrar encima marca la zona y salir la desmarca; soltar la desmarca y frena el navegador', () => {
    setup();
    const zone = screen.getByRole('button');
    expect(zone).not.toHaveClass('bg-deva-surface-2');
    fireEvent.dragOver(zone);
    expect(zone).toHaveClass('border-deva-action');
    fireEvent.dragLeave(zone);
    expect(zone).not.toHaveClass('border-deva-action');
    fireEvent.dragOver(zone);
    const notPrevented = fireEvent.drop(zone, { dataTransfer: { files: [pdf()] } });
    expect(notPrevented).toBe(false);
    expect(zone).not.toHaveClass('border-deva-action');
  });

  it('arrastrar encima no marca la zona si está ocupada', () => {
    setup({ busy: true });
    const zone = screen.getByRole('button');
    fireEvent.dragOver(zone);
    expect(zone).not.toHaveClass('border-deva-action');
  });

  it('soltar sin archivos no avisa nada ni rechaza', () => {
    const { onFile, onReject } = setup();
    fireEvent.drop(screen.getByRole('button'), { dataTransfer: { files: [] } });
    expect(onFile).not.toHaveBeenCalled();
    expect(onReject).not.toHaveBeenCalled();
  });

  it('el título y la ayuda se pueden cambiar y la zona no envía un formulario que la contenga', () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <FileDropzone
          label="L"
          accept="application/pdf"
          onFile={vi.fn()}
          title="Arrastrá el PDF acá"
          hint="o elegilo"
        />
      </form>,
    );
    expect(screen.getByText('Arrastrá el PDF acá')).toBeInTheDocument();
    expect(screen.getByText('o elegilo')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('Tip', () => {
  it('con el mouse encima el texto aparece (hover) y por teclado al enfocar', () => {
    render(<Tip content="ayuda">Dato</Tip>);
    const tooltip = screen.getByRole('tooltip');
    // Oculto por defecto; se muestra con hover/focus-within por CSS y al tocar.
    expect(tooltip).toHaveClass('hidden');
    expect(tooltip).toHaveClass('group-hover:block');
    expect(tooltip).toHaveClass('group-focus-within:block');
    expect(screen.getByRole('button', { name: 'Dato' })).toHaveAccessibleDescription('ayuda');
  });

  it('tocar lo fija abierto y tocar otra vez lo cierra', () => {
    render(<Tip content="ayuda">Dato</Tip>);
    const button = screen.getByRole('button', { name: 'Dato' });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('tooltip')).toHaveClass('block');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('otras teclas no lo cierran', () => {
    render(<Tip content="ayuda">Dato</Tip>);
    const button = screen.getByRole('button', { name: 'Dato' });
    fireEvent.click(button);
    fireEvent.keyDown(button, { key: 'a' });
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('ColorModeSwitch', () => {
  it('es un switch con la etiqueta pedida y refleja el modo', () => {
    const { rerender } = render(<ColorModeSwitch mode="light" onChange={vi.fn()} label="Tema oscuro" />);
    expect(screen.getByRole('switch', { name: 'Tema oscuro' })).toHaveAttribute('aria-checked', 'false');
    rerender(<ColorModeSwitch mode="dark" onChange={vi.fn()} label="Tema oscuro" />);
    expect(screen.getByRole('switch', { name: 'Tema oscuro' })).toHaveAttribute('aria-checked', 'true');
  });

  it('pide el modo contrario y no envía un formulario', () => {
    const onChange = vi.fn();
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    const { rerender } = render(
      <form onSubmit={onSubmit}>
        <ColorModeSwitch mode="light" onChange={onChange} />
      </form>,
    );
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenLastCalledWith('dark');
    rerender(
      <form onSubmit={onSubmit}>
        <ColorModeSwitch mode="dark" onChange={onChange} />
      </form>,
    );
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenLastCalledWith('light');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('sin etiqueta visible el título dice lo que va a pasar al tocarlo; con etiqueta no hay título', () => {
    const { rerender } = render(<ColorModeSwitch mode="light" onChange={vi.fn()} hideLabel />);
    expect(screen.getByRole('switch')).toHaveAttribute('title', 'Modo oscuro');
    rerender(<ColorModeSwitch mode="dark" onChange={vi.fn()} hideLabel />);
    expect(screen.getByRole('switch')).toHaveAttribute('title', 'Modo claro');
    rerender(<ColorModeSwitch mode="dark" onChange={vi.fn()} />);
    expect(screen.getByRole('switch')).not.toHaveAttribute('title');
  });
});

describe('BrandLockup', () => {
  const logos = { blue: '/azul.png', white: '/blanco.png' };

  it('el logo se llama DEVA y su versión sigue al tono', () => {
    const { rerender } = render(<BrandLockup product="Pedidos" tone="white" logos={logos} />);
    expect(screen.getByAltText('DEVA')).toHaveAttribute('src', '/blanco.png');
    rerender(<BrandLockup product="Pedidos" tone="blue" logos={logos} />);
    expect(screen.getByAltText('DEVA')).toHaveAttribute('src', '/azul.png');
  });

  it('sin nombre de producto queda sólo el logo, sin separador', () => {
    const { container } = render(<BrandLockup tone="blue" logos={logos} />);
    expect(container.querySelector('[aria-hidden]')).toBeNull();
    expect(screen.queryByText('Pedidos')).toBeNull();
  });

  it('con nombre y sin apilar lleva separador decorativo; apilado no', () => {
    const { container, rerender } = render(<BrandLockup product="Nexus" tone="blue" logos={logos} />);
    expect(container.querySelector('[aria-hidden]')).not.toBeNull();
    rerender(<BrandLockup product="Nexus" tone="blue" logos={logos} stacked />);
    expect(container.querySelector('[aria-hidden]')).toBeNull();
    expect(screen.getByText('Nexus')).toBeInTheDocument();
  });

  it('los tamaños del logo y del texto se pueden pasar', () => {
    render(
      <BrandLockup product="Nexus" tone="blue" logos={logos} logoClassName="h-auto w-28" textClassName="text-2xl" />,
    );
    expect(screen.getByAltText('DEVA')).toHaveClass('w-28');
    expect(screen.getByText('Nexus')).toHaveClass('text-2xl');
  });
});

describe('Íconos', () => {
  it('son decorativos y aceptan clases y atributos', () => {
    const { container } = render(<EyeIcon off className="size-4" data-x="1" />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveClass('size-4');
    expect(svg).toHaveAttribute('data-x', '1');
  });

  it('el ojo tachado dibuja la raya y el abierto no', () => {
    const { container, rerender } = render(<EyeIcon off />);
    const off = container.querySelectorAll('path').length;
    rerender(<EyeIcon />);
    expect(container.querySelectorAll('path').length).toBe(off - 1);
  });
});
