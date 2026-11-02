/** Une clases ignorando los valores vacíos. `className` va al final, pero para layout (margen, ancho), no para pisar estilos. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
