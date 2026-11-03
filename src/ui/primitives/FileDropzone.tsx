import { useRef, useState, type DragEvent, type ReactNode } from 'react';
import { cx } from './cx';
import { Spinner } from './Spinner';
import { UploadIcon } from './icons';

export interface FileDropzoneProps {
  /** Nombre para lectores de pantalla (el del input de archivo). */
  label: string;
  /** Tipo MIME aceptado, por ejemplo `application/pdf`. */
  accept: string;
  /** Extensión aceptada si el sistema no informa el tipo, por ejemplo `.pdf`. */
  extension?: string;
  /** Se llama con el archivo elegido o soltado. */
  onFile: (file: File) => void;
  /** Se llama si lo soltado no es del tipo aceptado. */
  onReject?: (message: string) => void;
  rejectMessage?: string;
  /** Leyendo el archivo: se ve el progreso y no se acepta otro. */
  busy?: boolean;
  title?: string;
  hint?: ReactNode;
  busyTitle?: string;
  className?: string;
}

/**
 * Zona para elegir o arrastrar un archivo. Toda la zona es un botón (clic,
 * Enter o Espacio abren el selector del sistema) y también acepta que se
 * suelte el archivo encima.
 */
export function FileDropzone({
  label,
  accept,
  extension,
  onFile,
  onReject,
  rejectMessage = 'Ese tipo de archivo no se puede leer.',
  busy = false,
  title = 'Arrastrá el archivo acá',
  hint = (
    <>
      o <b className="font-semibold text-deva-ink">elegilo desde tu computadora</b>
    </>
  ),
  busyTitle = 'Leyendo el archivo…',
  className,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const accepts = (file: File) =>
    file.type === accept || (extension ? file.name.toLowerCase().endsWith(extension.toLowerCase()) : false);

  const take = (file?: File) => {
    if (!file) return;
    if (!accepts(file)) {
      onReject?.(rejectMessage);
      return;
    }
    onFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!busy) take(event.dataTransfer.files?.[0]);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        hidden
        aria-label={label}
        accept={accept}
        disabled={busy}
        onChange={(event) => {
          take(event.target.files?.[0]);
          // El mismo archivo otra vez (tras un error, por ejemplo) vuelve a disparar el cambio.
          event.target.value = '';
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cx(
          'flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deva-action disabled:cursor-progress',
          dragging
            ? 'border-deva-action bg-deva-surface-2'
            : 'border-deva-line hover:border-deva-action hover:bg-deva-surface-2',
          className,
        )}
      >
        {busy ? (
          <Spinner label={busyTitle} className="size-9 text-deva-action" />
        ) : (
          <span className="flex size-14 items-center justify-center rounded-full bg-deva-surface-2 text-deva-action">
            <UploadIcon className="size-7" />
          </span>
        )}
        <span className="text-base font-semibold text-deva-ink">{busy ? busyTitle : title}</span>
        {!busy && <span className="text-sm text-deva-ink-soft">{hint}</span>}
      </button>
    </>
  );
}
