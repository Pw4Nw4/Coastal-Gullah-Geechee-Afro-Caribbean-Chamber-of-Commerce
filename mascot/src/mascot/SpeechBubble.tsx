import * as m from "motion/react-m";
import type { ReactNode } from "react";
import type { MascotAction } from "./types";

interface SpeechBubbleProps {
  children: ReactNode;
  actions?: MascotAction[];
  /** Shows a close button, and Escape closes too */
  onDismiss?: () => void;
}

/** What the mascot says: a greeting, a hint, a status. New text is announced politely to screen readers. */
export function SpeechBubble({ children, actions, onDismiss }: SpeechBubbleProps) {
  return (
    <m.div
      className="sm-bubble"
      initial={{ opacity: 0, y: 10, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && onDismiss) onDismiss();
      }}
    >
      {onDismiss && (
        <button type="button" className="sm-bubble-close" aria-label="Close message" onClick={onDismiss}>
          ×
        </button>
      )}
      <div className="sm-bubble-text" aria-live="polite">
        {children}
      </div>
      {actions && actions.length > 0 && (
        <div className="sm-bubble-actions">
          {actions.map((action) => (
            <button key={action.label} type="button" className={action.primary ? "sm-primary" : undefined} onClick={action.onSelect}>
              {action.label}
            </button>
          ))}
        </div>
      )}
    </m.div>
  );
}
