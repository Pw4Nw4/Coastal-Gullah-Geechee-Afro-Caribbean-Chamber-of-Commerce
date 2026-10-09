// Public entry for React apps: import from here and the styles come along.
import "./SankofaMascot.css";

export { SankofaMascot, type SankofaMascotProps } from "./SankofaMascot";
export { PngRenderer } from "./PngRenderer";
export { useMascotState } from "./useMascotState";
export { createMascotStore, DEFAULT_AUTO_RETURN, type MascotStore, type MascotStoreOptions } from "./store";
export {
  MASCOT_STATES,
  type MascotAction,
  type MascotPlacement,
  type MascotRenderer,
  type MascotRendererProps,
  type MascotState,
  type ReducedMotionSetting,
} from "./types";
