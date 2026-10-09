// Entry for js/sankofa-mascot.js: the mascot for pages without React, such as the chamber's static site.
// The build defines window.SankofaMascot; mount() renders the mascot into an element and returns a controller
// a plain-JavaScript chatbot uses to change its state:
//
//   const mascot = SankofaMascot.mount(el, { src: "images/sankofa-mascot.webp", onClick: openChat });
//   mascot.setState("thinking");
//
// The mascot also fires "sankofa-mascot:state" and "sankofa-mascot:click" events (they bubble from the element).
import { StrictMode, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import css from "./mascot/SankofaMascot.css?inline";
import { SankofaMascot, type SankofaMascotProps } from "./mascot/SankofaMascot";
import { createMascotStore, type MascotStoreOptions } from "./mascot/store";
import { MASCOT_STATES, type MascotState } from "./mascot/types";

export type MountOptions = Omit<SankofaMascotProps, "state" | "ref"> & MascotStoreOptions;

export interface MascotController {
  /** Show a state. "idle" and "listening" last; welcome and happy settle on their own. */
  setState(state: MascotState): void;
  getState(): MascotState;
  /** Where passing states settle, e.g. "listening" while your chat waits for input */
  setRest(state: MascotState): void;
  /** Back to the resting state now */
  settle(): void;
  /** Show a state for `ms`, then settle */
  flash(state: MascotState, ms: number): void;
  /** Tell the mascot whether your chat is open (aria-expanded) */
  setOpen(open: boolean): void;
  /** Change any mount option */
  update(options: Partial<MountOptions>): void;
  focus(): void;
  destroy(): void;
}

function injectStyles() {
  if (document.getElementById("sankofa-mascot-styles")) return;
  const style = document.createElement("style");
  style.id = "sankofa-mascot-styles";
  style.textContent = css;
  document.head.appendChild(style);
}

export function mount(container: Element, options: MountOptions = {}): MascotController {
  injectStyles();
  const { initial, autoReturn, onStateChange, ...rest } = options;
  const emit = (type: string, detail?: unknown) => container.dispatchEvent(new CustomEvent(`sankofa-mascot:${type}`, { bubbles: true, detail }));
  const store = createMascotStore({
    initial,
    autoReturn,
    onStateChange: (state, previous) => {
      onStateChange?.(state, previous);
      emit("state", { state, previous });
    },
  });

  let props: Omit<SankofaMascotProps, "state" | "ref"> = rest;
  let button: HTMLButtonElement | null = null;
  const onClick = () => {
    props.onClick?.();
    emit("click");
  };

  function Bridge() {
    const state = useSyncExternalStore(store.subscribe, store.getState);
    return <SankofaMascot {...props} state={state} onClick={onClick} ref={(el) => void (button = el)} />;
  }
  const root = createRoot(container);
  const render = () =>
    root.render(
      <StrictMode>
        <Bridge />
      </StrictMode>,
    );
  render();

  return {
    setState: store.setState,
    getState: store.getState,
    setRest: store.setRest,
    settle: store.settle,
    flash: store.flash,
    setOpen: (open) => {
      props = { ...props, open };
      render();
    },
    update: (next) => {
      props = { ...props, ...next };
      render();
    },
    focus: () => button?.focus(),
    destroy: () => {
      store.dispose();
      root.unmount();
    },
  };
}

export const states = MASCOT_STATES;
