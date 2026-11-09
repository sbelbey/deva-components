import { describe, expect, it, vi } from 'vitest';
import type React from 'react';
import { createExactCodeKeyDown } from '../src/core/exactCodeKeyDown';

function makeEvent(
  key: string,
  opts: {
    value?: string;
    shiftKey?: boolean;
    active?: string | null;
    isComposing?: boolean;
  } = {},
) {
  const preventDefault = vi.fn();
  const event = {
    key,
    shiftKey: Boolean(opts.shiftKey),
    nativeEvent: { isComposing: Boolean(opts.isComposing) },
    target: {
      value: opts.value ?? '',
      getAttribute: (name: string) =>
        name === 'aria-activedescendant' ? (opts.active ?? null) : null,
    },
    preventDefault,
  } as unknown as React.KeyboardEvent<HTMLElement>;
  return { event, preventDefault };
}

describe('createExactCodeKeyDown (DEVA-148)', () => {
  const item = { id: 'a' };
  const setup = (withMatch = true) => {
    const onSelect = vi.fn();
    const findMatch = vi.fn(() => (withMatch ? item : undefined));
    return {
      onSelect,
      findMatch,
      handler: createExactCodeKeyDown({ findMatch, onSelect }),
    };
  };

  it('Enter con match: llama onSelect(item) y preventDefault', () => {
    const { handler, onSelect, findMatch } = setup();
    const { event, preventDefault } = makeEvent('Enter', { value: '1' });
    handler(event);
    expect(findMatch).toHaveBeenCalledWith('1');
    expect(onSelect).toHaveBeenCalledWith(item);
    expect(preventDefault).toHaveBeenCalled();
  });

  it('Tab con match: llama onSelect(item) y NO llama preventDefault', () => {
    const { handler, onSelect } = setup();
    const { event, preventDefault } = makeEvent('Tab', { value: '1' });
    handler(event);
    expect(onSelect).toHaveBeenCalledWith(item);
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('Shift+Tab no selecciona', () => {
    const { handler, onSelect } = setup();
    const { event } = makeEvent('Tab', { value: '1', shiftKey: true });
    handler(event);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('sin match: no llama onSelect ni preventDefault', () => {
    const { handler, onSelect } = setup(false);
    ['Enter', 'Tab'].forEach((key) => {
      const { event, preventDefault } = makeEvent(key, { value: 'zzz' });
      handler(event);
      expect(preventDefault).not.toHaveBeenCalled();
    });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('con aria-activedescendant no hace nada', () => {
    const { handler, onSelect, findMatch } = setup();
    const { event, preventDefault } = makeEvent('Enter', {
      value: '1',
      active: 'opt-1',
    });
    handler(event);
    expect(findMatch).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it('otras teclas se ignoran', () => {
    const { handler, onSelect, findMatch } = setup();
    ['a', 'ArrowDown'].forEach((key) =>
      handler(makeEvent(key, { value: '1' }).event),
    );
    expect(findMatch).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('isComposing se ignora', () => {
    const { handler, onSelect } = setup();
    handler(makeEvent('Enter', { value: '1', isComposing: true }).event);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
