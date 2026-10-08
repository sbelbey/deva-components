import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocalSearch, useRemoteSearch, useSearch, type SearchOption } from '../src';

type Item = { id: string; name: string };
const toOption = (item: Item): SearchOption<Item> => ({ id: item.id, label: item.name, raw: item });

const items: Item[] = [
  { id: '1', name: 'Gómez Juan' },
  { id: '2', name: 'Pérez Ana' },
  { id: '3', name: 'Gómez Ana' },
];

/** Promesa que el test resuelve a mano, para simular respuestas que llegan en otro orden. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('useLocalSearch', () => {
  it('muestra todo vacío y filtra multi-término sin acentos', () => {
    const { result } = renderHook(() => useLocalSearch({ items, toOption }));
    expect(result.current.options.map((o) => o.id)).toEqual(['1', '2', '3']);
    act(() => result.current.setInputValue('ana gomez'));
    expect(result.current.options.map((o) => o.id)).toEqual(['3']);
    expect(result.current.empty).toBe(false);
    act(() => result.current.setInputValue('zzz'));
    expect(result.current.options).toEqual([]);
    expect(result.current.empty).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    act(() => result.current.reset());
    expect(result.current.inputValue).toBe('');
  });

  it('getOptionById, excludeIds, limit, minChars y showAllWhenEmpty', () => {
    const { result, rerender } = renderHook(
      (props: { exclude: string[] }) =>
        useLocalSearch({ items, toOption, excludeIds: props.exclude, limit: 1 }),
      { initialProps: { exclude: [] as string[] } },
    );
    expect(result.current.options.map((o) => o.id)).toEqual(['1']);
    rerender({ exclude: ['1'] });
    expect(result.current.options.map((o) => o.id)).toEqual(['2']);
    // Los excluidos se siguen resolviendo por id (para mostrar el valor elegido).
    expect(result.current.getOptionById('1')?.label).toBe('Gómez Juan');
    expect(result.current.getOptionById('99')).toBeUndefined();
    expect(result.current.getOptionById(null)).toBeUndefined();

    const min = renderHook(() =>
      useLocalSearch({ items, toOption, minChars: 3, showAllWhenEmpty: false }),
    );
    expect(min.result.current.options).toEqual([]);
    act(() => min.result.current.setInputValue('go'));
    expect(min.result.current.options).toEqual([]);
    expect(min.result.current.empty).toBe(false);
    act(() => min.result.current.setInputValue('gom'));
    expect(min.result.current.options.map((o) => o.id)).toEqual(['1', '3']);
  });

  it('lista todavía no cargada (undefined) y lista que llega después', () => {
    const { result, rerender } = renderHook(
      (props: { list?: Item[] }) => useLocalSearch({ items: props.list, toOption }),
      { initialProps: {} as { list?: Item[] } },
    );
    expect(result.current.options).toEqual([]);
    rerender({ list: items });
    expect(result.current.options).toHaveLength(3);
  });

  it('modo controlado', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSearch({ source: { items }, toOption, inputValue: 'perez', onInputValueChange: onChange }),
    );
    expect(result.current.options.map((o) => o.id)).toEqual(['2']);
    act(() => result.current.setInputValue('x'));
    expect(onChange).toHaveBeenCalledWith('x');
    expect(result.current.inputValue).toBe('perez');
  });
});

describe('useRemoteSearch', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('debounce, loading y resultado', async () => {
    const search = vi.fn(async (q: string, _signal?: AbortSignal) => items.filter((i) => i.name.toLowerCase().includes(q)));
    const { result } = renderHook(() => useRemoteSearch({ search, toOption }));

    expect(result.current.options).toEqual([]);
    act(() => result.current.setInputValue('ana'));
    expect(result.current.loading).toBe(true);
    expect(search).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(search).toHaveBeenCalledTimes(1);
    expect(search.mock.calls[0][0]).toBe('ana');
    expect(search.mock.calls[0][1]).toBeInstanceOf(AbortSignal);
    expect(result.current.loading).toBe(false);
    expect(result.current.options.map((o) => o.id)).toEqual(['2', '3']);
    expect(result.current.getOptionById('3')?.label).toBe('Gómez Ana');
  });

  it('tipear rápido manda una sola consulta', async () => {
    const search = vi.fn(async () => [] as Item[]);
    const { result } = renderHook(() => useRemoteSearch({ search, toOption, debounceMs: 200 }));
    act(() => result.current.setInputValue('g'));
    act(() => vi.advanceTimersByTime(100));
    act(() => result.current.setInputValue('go'));
    act(() => vi.advanceTimersByTime(100));
    act(() => result.current.setInputValue('gom'));
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith('gom', expect.any(AbortSignal));
    expect(result.current.empty).toBe(true);
  });

  it('descarta la respuesta vieja que llega tarde y aborta la consulta anterior', async () => {
    const calls: Array<{ q: string; signal: AbortSignal; d: ReturnType<typeof deferred<Item[]>> }> = [];
    const search = (q: string, signal: AbortSignal) => {
      const d = deferred<Item[]>();
      calls.push({ q, signal, d });
      return d.promise;
    };
    const { result } = renderHook(() => useRemoteSearch({ search, toOption }));

    act(() => result.current.setInputValue('go'));
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    act(() => result.current.setInputValue('gomez a'));
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(calls.map((c) => c.q)).toEqual(['go', 'gomez a']);
    expect(calls[0].signal.aborted).toBe(true);
    expect(calls[1].signal.aborted).toBe(false);

    // Llega primero la nueva y después la vieja: tiene que quedar la nueva.
    await act(async () => {
      calls[1].d.resolve([items[2]]);
    });
    await act(async () => {
      calls[0].d.resolve([items[0], items[2]]);
    });
    expect(result.current.options.map((o) => o.id)).toEqual(['3']);
    expect(result.current.loading).toBe(false);
  });

  it('error: lo expone, sin opciones y sin "sin resultados"', async () => {
    const search = vi.fn(async () => {
      throw new Error('500');
    });
    const { result } = renderHook(() => useRemoteSearch({ search, toOption }));
    act(() => result.current.setInputValue('x'));
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect((result.current.error as Error).message).toBe('500');
    expect(result.current.options).toEqual([]);
    expect(result.current.empty).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('no busca con la caja vacía ni bajo minChars; vaciar limpia', async () => {
    const search = vi.fn(async () => items);
    const { result } = renderHook(() => useRemoteSearch({ search, toOption, minChars: 3 }));
    act(() => result.current.setInputValue('ab'));
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(search).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    act(() => result.current.setInputValue('abc'));
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.options).toHaveLength(3);
    act(() => result.current.setInputValue(''));
    expect(result.current.options).toEqual([]);
    // Lo que ya vino se sigue resolviendo por id.
    expect(result.current.getOptionById('1')?.label).toBe('Gómez Juan');
  });

  it('knownItems resuelve el valor guardado sin buscar, y filter/excludeIds aplican', async () => {
    const search = vi.fn(async () => items);
    const { result } = renderHook(() =>
      useRemoteSearch({
        search,
        toOption,
        knownItems: [{ id: '9', name: 'Guardado' }],
        filter: (i) => i.id !== '2',
        excludeIds: ['3'],
      }),
    );
    expect(result.current.getOptionById('9')?.label).toBe('Guardado');
    act(() => result.current.setInputValue('a'));
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.options.map((o) => o.id)).toEqual(['1']);
  });

  it('remoteQuery + refineRemote', async () => {
    const search = vi.fn(async () => items);
    const { result } = renderHook(() =>
      useRemoteSearch({ search, toOption, remoteQuery: (q) => q.split(' ')[0], refineRemote: true }),
    );
    act(() => result.current.setInputValue('gomez ana'));
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(search).toHaveBeenCalledWith('gomez', expect.any(AbortSignal));
    expect(result.current.options.map((o) => o.id)).toEqual(['3']);
  });

  it('al desmontar aborta la consulta en curso', async () => {
    let signal: AbortSignal | undefined;
    const search = (_q: string, s: AbortSignal) => {
      signal = s;
      return new Promise<Item[]>(() => {});
    };
    const { result, unmount } = renderHook(() => useRemoteSearch({ search, toOption }));
    act(() => result.current.setInputValue('x'));
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    unmount();
    expect(signal?.aborted).toBe(true);
  });
});
