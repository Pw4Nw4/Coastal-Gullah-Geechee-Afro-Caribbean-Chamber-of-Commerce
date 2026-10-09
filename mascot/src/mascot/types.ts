import type { ComponentType } from "react";

/** What the mascot is doing. Your chatbot decides; the mascot only shows it. */
export type MascotState = "idle" | "welcome" | "listening" | "thinking" | "speaking" | "happy";

export const MASCOT_STATES: readonly MascotState[] = ["idle", "welcome", "listening", "thinking", "speaking", "happy"];

/** "user" follows the visitor's system setting; "always" and "never" override it (for demos and tests). */
export type ReducedMotionSetting = "user" | "always" | "never";

/** Fixed in a corner of the window, or "inline" inside a container you position yourself. */
export type MascotPlacement = "bottom-right" | "bottom-left" | "inline";

/**
 * What every renderer receives. The PNG renderer moves a flat image; a Rive or Three.js renderer takes the same
 * props and maps `state` to its own animations (see "Replacing the PNG" in the README).
 */
export interface MascotRendererProps {
  state: MascotState;
  /** The pointer is over the mascot, or it has keyboard focus */
  hovered: boolean;
  /** Keep still: no loops, hops or sways */
  reducedMotion: boolean;
  /** The asset: an image for the PNG renderer, a .riv or .glb file for other renderers.
   *  (Fill the box you're given; the mascot sizes it, and mirrors it with CSS for the bottom-left placement.) */
  src?: string;
  alt?: string;
}

export type MascotRenderer = ComponentType<MascotRendererProps>;

/** A button in the speech bubble */
export interface MascotAction {
  label: string;
  onSelect: () => void;
  /** Styled as the main choice */
  primary?: boolean;
}
