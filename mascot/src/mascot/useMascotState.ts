import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createMascotStore, type MascotStoreOptions } from "./store";

/**
 * Mascot state for a React chatbot:
 *
 *   const mascot = useMascotState();
 *   <SankofaMascot state={mascot.state} onClick={openChat} />
 *   mascot.setState("thinking");   // while waiting for an answer
 *   mascot.setState("speaking");   // while the answer appears, then mascot.settle()
 */
export function useMascotState(options: MascotStoreOptions = {}) {
  const onStateChange = useRef(options.onStateChange);
  useLayoutEffect(() => {
    onStateChange.current = options.onStateChange;
  });
  // Options are read once, like useState's initial value
  const [store] = useState(() =>
    createMascotStore({ ...options, onStateChange: (state, previous) => onStateChange.current?.(state, previous) }),
  );
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState);
  useEffect(() => () => store.dispose(), [store]);

  return { state, setState: store.setState, setRest: store.setRest, settle: store.settle, flash: store.flash, store };
}
