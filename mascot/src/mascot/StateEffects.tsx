import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import type { MascotState } from "./types";

// Cues drawn around the character, so every state reads at a glance with any renderer: rings while listening,
// a thought bubble while thinking, a voice meter while speaking, gold sparkles for welcome and happy.
// With reduced motion they still appear, just without moving (sparkles only fade).

const pop = {
  initial: { opacity: 0, scale: 0.6 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.18 } },
  transition: { type: "spring", stiffness: 420, damping: 24 },
} as const;

export function StateEffects({ state, reducedMotion }: { state: MascotState; reducedMotion: boolean }) {
  return (
    <AnimatePresence>
      {state === "listening" && (
        <m.span key="listening" className="sm-fx sm-rings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <i />
          <i />
        </m.span>
      )}
      {state === "thinking" && (
        <m.span key="thinking" className="sm-fx sm-thought" {...pop}>
          <i />
          <i />
          <i />
        </m.span>
      )}
      {state === "speaking" && (
        <m.span key="speaking" className="sm-fx sm-voice" {...pop}>
          <i />
          <i />
          <i />
          <i />
        </m.span>
      )}
      {(state === "welcome" || state === "happy") && <Sparkles key={state} burst={state === "happy"} reducedMotion={reducedMotion} />}
    </AnimatePresence>
  );
}

const STAR = "M12 0c1.2 6.2 5.8 10.8 12 12-6.2 1.2-10.8 5.8-12 12-1.2-6.2-5.8-10.8-12-12C6.2 10.8 10.8 6.2 12 0z";

/** Sparkles fly out from the bird (happy) or twinkle around its head (welcome) */
function Sparkles({ burst, reducedMotion }: { burst: boolean; reducedMotion: boolean }) {
  const count = burst ? 7 : 4;
  return (
    <m.span className="sm-fx sm-sparkles" exit={{ opacity: 0 }}>
      {Array.from({ length: count }, (_, i) => {
        // Spread over the upper arc; distances are in sparkle widths (each sparkle is a sixth of the mascot)
        const angle = (burst ? -200 + (220 / (count - 1)) * i : -170 + (130 / (count - 1)) * i) * (Math.PI / 180);
        const reach = burst ? 3.4 + (i % 2) * 0.6 : 2.4 + (i % 2) * 0.5;
        const x = `${Math.cos(angle) * reach * 100}%`;
        const y = `${Math.sin(angle) * reach * 100}%`;
        return (
          <m.svg
            key={i}
            className="sm-sparkle"
            viewBox="0 0 24 24"
            aria-hidden="true"
            initial={reducedMotion ? { x, y, opacity: 0, scale: 0.8 } : { x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={reducedMotion ? { opacity: [0, 1, 0] } : { x, y, opacity: [0, 1, 1, 0], scale: [0, 1.1, 0.8, 0.4], rotate: [0, 45, 90] }}
            transition={{
              duration: burst ? 0.9 : 1.4,
              delay: i * (burst ? 0.035 : 0.12),
              ease: "easeOut",
              repeat: burst ? 1 : Infinity,
              repeatDelay: burst ? 0.3 : 0.8,
            }}
          >
            <path d={STAR} />
          </m.svg>
        );
      })}
    </m.span>
  );
}
