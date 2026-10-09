import type { MascotState } from "./types";

// The mascot's state, without React: the React hook (useMascotState) and the plain-JavaScript bridge (embed.tsx)
// both wrap this, so any chatbot can drive the mascot the same way.

export interface MascotStoreOptions {
  /** Starting state (default "idle") */
  initial?: MascotState;
  /** Passing states and how long they last, in ms, before the mascot settles. Default: welcome 4000, happy 2400. */
  autoReturn?: Partial<Record<MascotState, number>>;
  /** Called on every change, including when a passing state settles on its own */
  onStateChange?: (state: MascotState, previous: MascotState) => void;
}

export interface MascotStore {
  getState(): MascotState;
  /** Show a state. "idle" and "listening" last until changed and become the resting state; others pass. */
  setState(state: MascotState): void;
  /** Change where passing states settle, without interrupting one that is showing */
  setRest(state: MascotState): void;
  getRest(): MascotState;
  /** Return to the resting state now */
  settle(): void;
  /** Show a state for `ms`, then settle */
  flash(state: MascotState, ms: number): void;
  subscribe(listener: () => void): () => void;
  /** Cancel a pending settle (call when the mascot goes away) */
  dispose(): void;
}

export const DEFAULT_AUTO_RETURN: Partial<Record<MascotState, number>> = { welcome: 4000, happy: 2400 };
const RESTING: ReadonlySet<MascotState> = new Set(["idle", "listening"]);

export function createMascotStore({ initial = "idle", autoReturn = DEFAULT_AUTO_RETURN, onStateChange }: MascotStoreOptions = {}): MascotStore {
  let state = initial;
  let rest: MascotState = RESTING.has(initial) ? initial : "idle";
  let timer: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<() => void>();

  const apply = (next: MascotState) => {
    if (next === state) return;
    const previous = state;
    state = next;
    listeners.forEach((listener) => listener());
    onStateChange?.(next, previous);
  };
  const show = (next: MascotState, ms = autoReturn[next]) => {
    clearTimeout(timer);
    apply(next);
    if (ms) timer = setTimeout(() => apply(rest), ms);
  };

  return {
    getState: () => state,
    setState: (next) => {
      if (RESTING.has(next)) rest = next;
      show(next);
    },
    setRest: (next) => {
      rest = next;
      if (RESTING.has(state)) show(next);
    },
    getRest: () => rest,
    settle: () => show(rest),
    flash: (next, ms) => show(next, ms),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose: () => clearTimeout(timer),
  };
}
