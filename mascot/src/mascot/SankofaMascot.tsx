import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useState, type CSSProperties, type ReactNode, type Ref } from "react";
import { PngRenderer } from "./PngRenderer";
import { floats, shadows } from "./poses";
import { SpeechBubble } from "./SpeechBubble";
import { StateEffects } from "./StateEffects";
import type { MascotAction, MascotPlacement, MascotRenderer, MascotState, ReducedMotionSetting } from "./types";

export interface SankofaMascotProps {
  /** What the mascot shows (default "idle"). Drive it from your chatbot, for example with useMascotState. */
  state?: MascotState;
  /** Called when the mascot is clicked or activated from the keyboard: open your chat here */
  onClick?: () => void;
  /** Whether the chat it opens is open (sets aria-expanded) */
  open?: boolean;
  /** id of the chat panel it opens (aria-controls) */
  controls?: string;
  /** Accessible name. If you show a `tag`, include its words. */
  label?: string;
  /** A short visible label beside the bird, such as "Ask us" */
  tag?: string;
  /** The art for the default PNG renderer, or the asset file for a custom renderer */
  src?: string;
  alt?: string;
  /** Draws the character. Defaults to the PNG renderer; pass a Rive or Three.js renderer later. */
  renderer?: MascotRenderer;
  /** Something for the mascot to say in a speech bubble. Leave it out to hide the bubble. */
  message?: ReactNode;
  messageActions?: MascotAction[];
  /** Shows a close button on the bubble (Escape works too) */
  onDismissMessage?: () => void;
  /** Fixed in a corner of the window (default bottom-right), or "inline" in a container you position */
  placement?: MascotPlacement;
  /** Width of the bird: px or any CSS length. By default it scales from 72px on phones to 112px. */
  size?: number | string;
  /** "user" (default) follows the visitor's reduce-motion setting */
  reducedMotion?: ReducedMotionSetting;
  /** The rings, bubbles and sparkles that show each state (default on) */
  effects?: boolean;
  onHoverChange?: (hovered: boolean) => void;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * The Sankofa bird, floating in a corner as the button that opens your chatbot. It breathes and bobs while idle,
 * perks up on hover, and shows whatever state your chatbot gives it: idle, welcome, listening, thinking,
 * speaking or happy.
 */
export function SankofaMascot({
  state = "idle",
  onClick,
  open,
  controls,
  label = "Open the chat assistant",
  tag,
  src,
  alt = "",
  renderer: Renderer = PngRenderer,
  message,
  messageActions,
  onDismissMessage,
  placement = "bottom-right",
  size,
  reducedMotion = "user",
  effects = true,
  onHoverChange,
  className,
  style,
  ref,
}: SankofaMascotProps) {
  const systemReduced = useReducedMotion();
  const reduced = reducedMotion === "always" || (reducedMotion === "user" && Boolean(systemReduced));
  const [pointerOver, setPointerOver] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const hovered = pointerOver || keyboardFocus;
  const hover = (pointer: boolean, keyboard: boolean) => {
    setPointerOver(pointer);
    setKeyboardFocus(keyboard);
    if ((pointer || keyboard) !== hovered) onHoverChange?.(pointer || keyboard);
  };

  // Hops and sways come from the pose; the float settles while the bird jumps
  const float = reduced ? "rest" : state === "thinking" || state === "speaking" ? "busy" : state === "welcome" || state === "happy" ? "rest" : "calm";
  const sizeVar = size === undefined ? undefined : typeof size === "number" ? `${size}px` : size;

  // LazyMotion with domAnimation loads only what the mascot uses (animations, variants, exit, hover and tap),
  // about half of Motion. Renderers using Motion should use `m` components from "motion/react-m" too.
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion={reduced ? "always" : "never"}>
        <div
          // Motion reads the reduced-motion setting when an element is created, so a change (the visitor's system
          // setting, or the prop) remounts the animated parts
          key={reduced ? "still" : "moving"}
          className={["sm-root", `sm-${placement}`, className].filter(Boolean).join(" ")}
          data-state={state}
          data-reduced-motion={reduced}
          style={{ ...(sizeVar && { "--sankofa-mascot-size": sizeVar }), ...style } as CSSProperties}
        >
          <AnimatePresence>
            {message != null && message !== false && (
              <SpeechBubble key="bubble" actions={messageActions} onDismiss={onDismissMessage}>
                {message}
              </SpeechBubble>
            )}
          </AnimatePresence>
          <m.button
            ref={ref}
            type="button"
            className="sm-button"
            aria-label={label}
            aria-expanded={open}
            aria-controls={controls}
            onClick={onClick}
            // Touch has no hover: a tap shouldn't leave the bird stuck in its hover pose
            onPointerEnter={(e) => e.pointerType === "mouse" && hover(true, keyboardFocus)}
            onPointerLeave={() => hover(false, keyboardFocus)}
            onFocus={(e) => e.currentTarget.matches(":focus-visible") && hover(pointerOver, true)}
            onBlur={() => hover(pointerOver, false)}
            initial={{ opacity: 0, y: 24, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {tag && <span className="sm-tag">{tag}</span>}
            <span className="sm-stage">
              <m.span className="sm-shadow" variants={shadows} initial={false} animate={float} />
              <m.span className="sm-float" variants={floats} initial={false} animate={float}>
                {effects && <StateEffects state={state} reducedMotion={reduced} />}
                <Renderer state={state} hovered={hovered} reducedMotion={reduced} src={src} alt={alt} />
              </m.span>
            </span>
          </m.button>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
