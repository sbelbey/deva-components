import type React from 'react';

/**
 * DEVA-148: onKeyDown que elige por código exacto con Enter o Tab.
 *
 * - Enter selecciona y frena el evento (no se envía el formulario).
 * - Tab selecciona y deja seguir el evento: el foco pasa al campo siguiente.
 * - Shift+Tab, otras teclas, composición IME y una opción resaltada con las
 *   flechas (`aria-activedescendant`, la elige MUI) se ignoran.
 * - Sin coincidencia no hace nada: el campo se comporta como siempre.
 */
export function createExactCodeKeyDown<T>(args: {
  findMatch: (text: string) => T | undefined;
  onSelect: (item: T) => void;
}): (event: React.KeyboardEvent<HTMLElement>) => void {
  return (event) => {
    const isEnter = event.key === 'Enter';
    const isTab = event.key === 'Tab' && !event.shiftKey;
    if (!isEnter && !isTab) return;
    if (event.nativeEvent?.isComposing) return;
    const input = event.target as HTMLInputElement;
    if (input.getAttribute?.('aria-activedescendant')) return;
    const match = args.findMatch(input.value ?? '');
    if (match === undefined) return;
    args.onSelect(match);
    if (isEnter) event.preventDefault();
  };
}
