# Sankofa mascot

An animated Sankofa bird that floats in the corner of the page and opens your chatbot. It breathes, floats and hops
now and then while idle, perks up on hover, and shows six states your chatbot sets: **idle, welcome, listening,
thinking, speaking, happy**.

The art is a flat transparent image (`assets/sankofa-source.webp`), so the animation moves the whole picture: hops,
sways, squash and stretch, plus cues drawn around it (rings, a thought cloud, a voice meter, sparkles). It is not a
rigged character. When rigged art exists (Rive or Three.js), swap the renderer and keep everything else; see
[Replacing the PNG](#replacing-the-png).

Built with React 19, [Motion for React](https://motion.dev) (`motion/react`) and CSS animations. TypeScript.

## Install and run

Needs Node 20.19 or newer.

```bash
cd mascot
npm install
npm run dev
```

Open http://localhost:5174. The demo has buttons for every state, options for motion, size and placement, a
pretend chatbot that drives the states for real, and a log of the callbacks.

| Command | What it does |
|---|---|
| `npm run dev` | Demo with hot reload on port 5174 |
| `npm run build` | Type-check, then build the demo into `dist/` |
| `npm run build:embed` | Type-check, then build `../js/sankofa-mascot.js` for the chamber site |
| `npm run image` | Trim and resize `assets/sankofa-source.webp` into `public/` and `../images/` |
| `npm run typecheck` | TypeScript only |

## What's where

```
mascot/
  assets/sankofa-source.webp   your original art (1254px, transparent)
  scripts/prepare-image.mjs    makes the 384px web copy (36 KB) the mascot uses
  src/mascot/                  the reusable component: copy this folder into any React app
    SankofaMascot.tsx          the floating button: placement, hover, tap, bubble, reduced motion
    PngRenderer.tsx            draws the bird (swap this for Rive or Three.js)
    poses.ts                   how each state moves the image
    StateEffects.tsx           rings, thought cloud, voice meter, sparkles
    SpeechBubble.tsx           optional message with buttons
    store.ts                   the state, without React (timers for states that pass)
    useMascotState.ts          the React hook around the store
    SankofaMascot.css          styles and the CSS loops
    index.ts                   public entry (imports the CSS)
  src/embed.tsx                window.SankofaMascot for pages without React
  src/demo/                    the demo app
```

## Use it in a React app

Copy `src/mascot/` into your app, install Motion, and put the image in your public folder.

```bash
npm install motion
```

```tsx
import { SankofaMascot, useMascotState } from "./mascot";

export function ChatLauncher() {
  const mascot = useMascotState();
  const [open, setOpen] = useState(false);

  async function ask(question: string) {
    mascot.setState("thinking");
    const answer = await myChatbot.ask(question);
    mascot.setState("speaking");
    await showAnswer(answer);
    mascot.settle(); // back to listening or idle
  }

  return (
    <>
      {open && <ChatPanel id="chat" onAsk={ask} onInputFocus={() => mascot.setRest("listening")} onInputBlur={() => mascot.setRest("idle")} />}
      <SankofaMascot
        state={mascot.state}
        src="/sankofa-mascot.webp"
        label="Ask us: open the chat assistant"
        tag="Ask us"
        open={open}
        controls="chat"
        onClick={() => setOpen(!open)}
      />
    </>
  );
}
```

### States

| State | Looks like | Set it when |
|---|---|---|
| `idle` | Breathes, floats, hops now and then | Nothing is happening |
| `welcome` | Double hop with a wiggle, sparkles near the head | Greeting a visitor (settles after 4 s) |
| `listening` | Leans in and nods, teal rings ripple out | Your chat is waiting for input |
| `thinking` | Slow sway, thought cloud with bouncing dots | Waiting for an answer |
| `speaking` | Quick little bobs, voice meter | The answer is appearing |
| `happy` | Big jump and shimmy, gold sparkles burst | Something worked: a sign-up, a thank-you (settles after 2.4 s) |

`idle` and `listening` last until changed and become the *resting* state. The others pass: `welcome` and `happy`
settle on their own, and you call `settle()` after `thinking` and `speaking`. Change the timings with
`useMascotState({ autoReturn: { happy: 3000 } })`.

### `useMascotState(options)`

Returns `{ state, setState, setRest, settle, flash, store }`.

- `setState(state)`: show a state.
- `setRest(state)`: where passing states settle. It switches right away only if the mascot is resting.
- `settle()`: go back to the resting state now.
- `flash(state, ms)`: show a state for a while, then settle.
- Options: `initial`, `autoReturn`, and `onStateChange(state, previous)`, which runs for every change, including automatic ones.

### Props

| Prop | Default | |
|---|---|---|
| `state` | `"idle"` | What to show |
| `onClick` | | Open your chat here (click, Enter or Space) |
| `open`, `controls` | | Set `aria-expanded` and `aria-controls` for the chat it opens |
| `label` | `"Open the chat assistant"` | Accessible name; include the `tag` words if you show a tag |
| `tag` | | A short visible label beside the bird, such as "Ask us" |
| `src`, `alt` | | The image (or the asset for a custom renderer). `alt` is empty by default: the button's label names it |
| `message` | | Show a speech bubble with this content |
| `messageActions` | | Buttons in the bubble: `{ label, onSelect, primary? }[]` |
| `onDismissMessage` | | Adds a close button to the bubble (Escape works too) |
| `placement` | `"bottom-right"` | `"bottom-left"` mirrors the bird; `"inline"` sits in a container you position |
| `size` | 72px on phones to 112px | Number of px or any CSS length |
| `reducedMotion` | `"user"` | `"always"` or `"never"` override the visitor's setting (for demos and tests) |
| `effects` | `true` | The rings, cloud, meter and sparkles |
| `renderer` | `PngRenderer` | Draws the character; see below |
| `onHoverChange` | | Pointer over the bird, or keyboard focus on it |
| `ref` | | The `<button>` |

### Theming

Set these on any ancestor: `--sankofa-mascot-size`, `--sankofa-gold`, `--sankofa-teal`, `--sankofa-ink`,
`--sankofa-paper` (bubble background), `--sankofa-focus` (focus ring), `--sankofa-outline` (the light rim that keeps
a dark bird visible on dark backgrounds), `--sankofa-z`.

## Accessibility

- The whole mascot is one `<button>` with an accessible name, `aria-expanded` and `aria-controls`. The art is
  decorative (`alt=""`).
- **Reduced motion**: with the visitor's "reduce motion" setting on, nothing loops, hops or sways. Each state still
  shows a still cue: a ring for listening, the cloud for thinking, the meter for speaking, sparkles that fade.
  Changing the setting mid-visit takes effect right away.
- Hover poses only follow a mouse. Keyboard focus gets the same pose and a visible focus ring. A tap never leaves
  the bird stuck in its hover pose.
- New bubble text is announced politely to screen readers. Your chat log should announce the answers itself.
- It sits above the iOS home bar (`env(safe-area-inset-*)`) and is hidden when printing.

## Chatbots without React: the site bundle

`npm run build:embed` writes **`../js/sankofa-mascot.js`**. It's one file with React, Motion and the styles
included, and it defines `window.SankofaMascot`. The chamber site loads it from `js/chat.js`.
**Rebuild it after changing anything in `src/`**: the site serves that file as is and has no build step.

```js
const mascot = SankofaMascot.mount(document.querySelector("#mascot"), {
  src: "images/sankofa-mascot.webp",
  label: "Ask us: chat with the chamber assistant",
  tag: "Ask us",
  controls: "chat-panel",
  placement: "inline", // or "bottom-right" to let it float on its own
  onClick: () => toggleChat(),
});

mascot.setState("thinking");   // also: getState, setRest, settle, flash
mascot.setOpen(true);          // aria-expanded
mascot.update({ tag: "Hi!" });  // change any option
mascot.focus();
mascot.destroy();
```

It also fires events that bubble up from the element, for code that shouldn't hold a reference:

```js
document.addEventListener("sankofa-mascot:state", (e) => console.log(e.detail.previous, "→", e.detail.state));
document.addEventListener("sankofa-mascot:click", () => console.log("mascot clicked"));
```

The bundle is about 100 KB gzipped, mostly React itself. The chamber site loads it after the page and skips it
when the visitor has asked to save data, showing a plain "Ask us" button instead.

## Replacing the PNG

The mascot doesn't care how the bird is drawn. A renderer is any React component that takes
`MascotRendererProps` and fills the square it's given:

```ts
interface MascotRendererProps {
  state: MascotState;      // idle | welcome | listening | thinking | speaking | happy
  hovered: boolean;        // pointer over it, or keyboard focus
  reducedMotion: boolean;  // stay still
  src?: string;            // your asset: .riv, .glb, ...
  alt?: string;
}
```

The float, shadow, hover lift, tap, bubble, cues and accessibility stay the same. The new renderer only replaces
`PngRenderer` and its whole-image poses. Turn the cues off with `effects={false}` if the new art acts the states
out itself. A renderer that uses Motion should use `m` components from `"motion/react-m"`: the mascot loads only
Motion's light feature set (`LazyMotion` in strict mode).

### Rive

Build one state machine in the Rive editor, named `Mascot` here, with a number input `mood` (0–5, in the order of
the states) and a boolean input `hover`.

```bash
npm install @rive-app/react-canvas
```

```tsx
import { useEffect } from "react";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { MASCOT_STATES, type MascotRendererProps } from "./mascot";

export function RiveRenderer({ state, hovered, reducedMotion, src }: MascotRendererProps) {
  const { rive, RiveComponent } = useRive({ src, stateMachines: "Mascot", autoplay: true });
  const mood = useStateMachineInput(rive, "Mascot", "mood");
  const hover = useStateMachineInput(rive, "Mascot", "hover");
  useEffect(() => { if (mood) mood.value = MASCOT_STATES.indexOf(state); }, [mood, state]);
  useEffect(() => { if (hover) hover.value = hovered; }, [hover, hovered]);
  useEffect(() => { if (reducedMotion) rive?.pause(); else rive?.play(); }, [rive, reducedMotion]);
  return <RiveComponent className="sm-art" />;
}

// <SankofaMascot renderer={RiveRenderer} src="/sankofa.riv" ... />
```

### Three.js

Export a glTF (`.glb`) with animation clips named after the states (`idle`, `welcome`, ...).

```bash
npm install three @react-three/fiber @react-three/drei
```

```tsx
import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import type { MascotRendererProps, MascotState } from "./mascot";

function Bird({ state, src }: { state: MascotState; src: string }) {
  const { scene, animations } = useGLTF(src);
  const { actions } = useAnimations(animations, scene);
  useEffect(() => {
    const clip = actions[state] ?? actions.idle;
    clip?.reset().fadeIn(0.25).play();
    return () => void clip?.fadeOut(0.25);
  }, [actions, state]);
  return <primitive object={scene} />;
}

export function ThreeRenderer({ state, reducedMotion, src }: MascotRendererProps) {
  return (
    <Canvas className="sm-art" frameloop={reducedMotion ? "demand" : "always"} gl={{ alpha: true }} camera={{ position: [0, 0.8, 3], fov: 35 }}>
      <ambientLight intensity={1.2} />
      <directionalLight position={[2, 3, 4]} />
      <Suspense fallback={null}>{src && <Bird state={state} src={src} />}</Suspense>
    </Canvas>
  );
}
```

Both add real weight (Rive's runtime ships WebAssembly, and Three.js is large), so check the bundle size and load
them only where the mascot is used.
