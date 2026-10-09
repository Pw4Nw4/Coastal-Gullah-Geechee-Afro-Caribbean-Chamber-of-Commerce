import type { Transition, Variants } from "motion/react";

// How each state moves a flat PNG. The art isn't rigged, so the moves are whole-image transforms (hops, sways,
// squash and stretch), anchored at the bird's feet. The CSS adds the breathing and the occasional idle hop.

const loop = (duration: number, extra: Transition = {}): Transition => ({ duration, repeat: Infinity, ease: "easeInOut", ...extra });
const settle: Transition = { type: "spring", stiffness: 220, damping: 18 };

export const poses: Variants = {
  idle: { x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1, transition: settle },
  // A double hop with a wiggle, like a wave hello
  welcome: {
    x: 0,
    y: [0, -18, 0, -8, 0],
    rotate: [0, -7, 5, -2, 0],
    scaleX: [1, 0.96, 1.06, 0.99, 1],
    scaleY: [1, 1.06, 0.92, 1.02, 1],
    transition: { duration: 1.15, times: [0, 0.3, 0.55, 0.75, 1], ease: "easeOut", repeat: 1, repeatDelay: 0.6 },
  },
  // Leans in toward the chat and nods
  listening: {
    x: -2,
    y: -2,
    rotate: [-5, -2.5, -5],
    scaleX: 1,
    scaleY: 1,
    transition: { rotate: loop(2.4), default: settle },
  },
  // A slow sway while it works something out
  thinking: { x: 0, y: [0, -3, 0], rotate: [-3, 3, -3], scaleX: 1, scaleY: 1, transition: loop(3.2) },
  // Quick little bobs, the closest a still image gets to talking
  speaking: {
    x: 0,
    rotate: 0,
    y: [0, -3, 0, -1.5, 0],
    scaleX: [1, 0.985, 1.01, 0.99, 1],
    scaleY: [1, 1.035, 0.985, 1.02, 1],
    transition: loop(0.8),
  },
  // A big jump and a shimmy
  happy: {
    x: 0,
    y: [0, -30, 0, -12, 0],
    rotate: [0, -10, 9, -4, 0],
    scaleX: [1, 0.92, 1.1, 0.97, 1],
    scaleY: [1, 1.1, 0.88, 1.04, 1],
    transition: { duration: 0.95, times: [0, 0.32, 0.58, 0.78, 1], ease: "easeOut", repeat: 1, repeatDelay: 0.25 },
  },
  // Perks up under the pointer
  hover: { x: 0, y: -5, rotate: -4, scaleX: 1.04, scaleY: 1.04, transition: { type: "spring", stiffness: 320, damping: 16 } },
  still: { x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1, transition: { duration: 0 } },
};

// The gentle float of the whole mascot, and its ground shadow shrinking as it rises
export const floats: Variants = {
  calm: { y: [0, -6, 0], transition: loop(4.2) },
  busy: { y: [0, -4, 0], transition: loop(2.2) },
  rest: { y: 0, transition: { duration: 0.3 } },
};

export const shadows: Variants = {
  calm: { scaleX: [1, 0.86, 1], opacity: [0.32, 0.2, 0.32], transition: loop(4.2) },
  busy: { scaleX: [1, 0.9, 1], opacity: [0.32, 0.24, 0.32], transition: loop(2.2) },
  rest: { scaleX: 1, opacity: 0.32, transition: { duration: 0.3 } },
};
