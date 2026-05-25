import { useState, useEffect, useCallback } from 'react';

type Listener<T> = (state: T) => void;

type StateCreator<T> = (set: StoreApi<T>['setState'], get: StoreApi<T>['getState']) => T;

interface StoreApi<T> {
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: Listener<T>) => () => void;
}

export function create<T extends object>(initializer: StateCreator<T>) {
  let state: T;
  const listeners = new Set<Listener<T>>();

  const getState: StoreApi<T>['getState'] = () => state;

  const setState: StoreApi<T>['setState'] = (partial) => {
    const nextState = typeof partial === 'function' ? (partial as (s: T) => Partial<T>)(state) : partial;
    state = { ...state, ...nextState };
    listeners.forEach((listener) => listener(state));
  };

  state = initializer(setState, getState);

  const api: StoreApi<T> = {
    getState,
    setState,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };

  function useStore(): T;
  function useStore<U>(selector: (state: T) => U): U;
  function useStore<U>(selector?: (state: T) => U): T | U {
    const [, forceUpdate] = useState({});

    useEffect(() => {
      const listener: Listener<T> = () => forceUpdate({});
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }, []);

    if (selector) {
      return selector(state);
    }
    return state;
  }

  Object.assign(useStore, api);

  return useStore as typeof useStore & StoreApi<T>;
}
