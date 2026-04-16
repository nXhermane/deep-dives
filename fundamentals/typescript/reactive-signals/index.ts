export type Listener = () => void;
export type OnChangeListener = <T>(context: { prev: T; next: T }) => void;

export interface ReadonlySignal<T> {
  get(): T;
  peek(): T;
  getListeners(): Set<Listener>;
  removeListener(listener: Listener): void;
  addListener(listener: Listener): void;
  onChange(listener: OnChangeListener): void;
  removeChangeListener(listener: OnChangeListener): void;
}

export interface WritableSignal<T> extends ReadonlySignal<T> {
  set(value: T): void;
  setValue(value: T): void;
}

type ActiveEffect = {
  run: Listener;
  deps: Set<ReadonlySignal<unknown>>;
};

let currentEffect: ActiveEffect | null = null;
const pendingEffects = new Set<Listener>();
let flushing = false;
let batchCount = 0;

class ReadonlySignalImpl<T> implements ReadonlySignal<T> {
  protected listeners: Set<Listener> = new Set();
  protected onChangeListeners: Set<OnChangeListener> = new Set();
  constructor(protected value: T) {}

  get() {
    if (currentEffect) {
      currentEffect.deps.add(this);
      this.listeners.add(currentEffect.run);
    }
    return this.value;
  }
  peek() {
    return this.value;
  }
  getListeners() {
    return this.listeners;
  }
  onChange(listener: OnChangeListener) {
    this.onChangeListeners.add(listener);
  }
  removeChangeListener(listener: OnChangeListener) {
    this.onChangeListeners.delete(listener);
  }

  removeListener(listener: Listener) {
    this.listeners.delete(listener);
  }

  addListener(listener: Listener): void {
    this.listeners.add(listener);
  }
}

class WritableSignalImpl<T>
  extends ReadonlySignalImpl<T>
  implements WritableSignal<T>
{
  setValue(value: T) {
    this.value = value;
  }
  set(value: T) {
    if (_isEqual(this.value, value)) return;
    const prevValue = this.value;
    this.value = value;
    this.onChangeListeners.forEach((l) => l({ prev: prevValue, next: value }));
    this.listeners.forEach((listener) => pendingEffects.add(listener));

    if (batchCount === 0) {
      _flushEffects();
    }
  }
}

// internals functions
function _flushEffects() {
  if (flushing) return;
  flushing = true;
  const runEffects = new Set<Listener>();

  while (pendingEffects.size > 0) {
    const effectToRun = [...pendingEffects];
    pendingEffects.clear();
    effectToRun
      .filter((fn) => !runEffects.has(fn))
      .forEach((fn) => {
        runEffects.add(fn);
        fn();
      });
  }

  flushing = false;
}

function _arrayEqual(a: unknown[], b: unknown[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function _shallowEqual(a: object, b: object): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => (a as any)[k] === (b as any)[k]);
}

function _isEqual(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) return _arrayEqual(a, b);
  if (typeof a === "object" && typeof b === "object") {
    if (a === null || b === null) return a === b;
    return _shallowEqual(a, b);
  }
  return a === b;
}
// external functions
export function signal<T>(initialValue: T): WritableSignal<T> {
  return new WritableSignalImpl(initialValue);
}

export function effect(fn: () => void | (() => void)): () => void {
  let cleanup: (() => void) | null | void = null;
  const context: ActiveEffect = {
    run: () => {},
    deps: new Set<ReadonlySignal<unknown>>(),
  };
  context.run = () => {
    if (cleanup && typeof cleanup === "function") cleanup();
    context.deps.forEach((dep) => dep.removeListener(context.run));
    context.deps.clear();
    const previousEffect = currentEffect;
    currentEffect = context;
    try {
      cleanup = fn();
    } finally {
      currentEffect = previousEffect;
    }
  };
  context.run();
  return () => {
    if (cleanup && typeof cleanup === "function") cleanup();
    context.deps.forEach((dep) => dep.removeListener(context.run));
    context.deps.clear();
  };
}

export function computed<T>(fn: () => T): ReadonlySignal<T> {
  const signal = new WritableSignalImpl(undefined as T);
  effect(() => signal.set(fn()));
  return signal;
}

export function batch(fn: () => void) {
  const run = () => {
    batchCount++;
    try {
      fn();
    } finally {
      batchCount--;
      if (batchCount === 0) _flushEffects();
    }
  };
  run();
}

export function lazyComputed<T>(fn: () => T): ReadonlySignal<T> {
  let cachedValue: T | undefined;
  let isDirty = true;
  const deps = new Set<ReadonlySignal<unknown>>();
  let listener: Listener = () => {
    isDirty = true;
    // to maintains computed value effect execution order
    signal.getListeners().forEach((listener) => pendingEffects.add(listener));
  };

  const signal = new WritableSignalImpl(undefined as T);
  const _get = signal.get.bind(signal);

  const recompute = () => {
    deps.forEach((dep) => dep.removeChangeListener(listener));
    deps.clear();
    const previousEffect = currentEffect;
    const trackingContext: ActiveEffect = {
      run: listener,
      deps,
    };
    currentEffect = trackingContext;

    try {
      cachedValue = fn();
      signal.setValue(cachedValue);
    } finally {
      currentEffect = previousEffect;
      isDirty = false;
    }

    trackingContext.deps.forEach((dep) => {
      dep.removeListener(listener); // remove push based
      dep.onChange(listener);
    });
  };

  const get = () => {
    if (isDirty) {
      recompute();
    }
    return _get();
  };

  const peek = () => {
    return cachedValue;
  };

  return Object.assign(signal, { get, peek });
}

// Test Zone

console.log("Démarrage du système réactif...");

const count = signal(0);
const double = lazyComputed(() => {
  console.log("[COMPUTED]: call heavy function");
  return count.get() * 2;
});

effect(() => {
  console.log(`[EFFECT] count: ${count.get()} `);
});

effect(() => {
  console.log(`[EFFECT] double: ${double.get()}`);
});

effect(() => {
  console.log(`[EFFECT] count and double: ${count.get()} ${double.get()}`);
});
console.log("-- Update: count = 3 ---");
count.set(3);

console.log("-- Update: count = 5 ---");
count.set(5);
console.log("-- Get LazyComputed Value: ", double.get());

console.log("-- Update: count = 5 (no change) ---");
count.set(5);

batch(() => {
  console.log("-- Update: count = 10 ---");
  count.set(10);
  console.log("-- Update: count = 15 ---");
  count.set(15);
});
