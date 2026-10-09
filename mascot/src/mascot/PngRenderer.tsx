import * as m from "motion/react-m";
import { poses } from "./poses";
import type { MascotRendererProps } from "./types";

/**
 * The default renderer: a transparent PNG (or WebP) moved as a whole. Swap it for a Rive or Three.js renderer
 * with the same props when rigged art exists.
 */
export function PngRenderer({ state, hovered, reducedMotion, src, alt = "" }: MascotRendererProps) {
  if (!src) return null;
  const pose = reducedMotion ? "still" : hovered && (state === "idle" || state === "listening") ? "hover" : state;
  return (
    <m.span className="sm-pose" variants={poses} initial={false} animate={pose}>
      <span className="sm-hop">
        <span className="sm-breathe">
          <img className="sm-art" src={src} alt={alt} draggable={false} decoding="async" />
        </span>
      </span>
    </m.span>
  );
}
