import { useEffect, useState } from "react";
import { MASCOT_STATES, SankofaMascot, useMascotState, type MascotPlacement, type ReducedMotionSetting } from "../mascot";
import { MockChat } from "./MockChat";

const SIZES = { Auto: undefined, "72px": 72, "96px": 96, "128px": 128 } as const;
type SizeName = keyof typeof SIZES;

/** A playground for the mascot: switch states by hand, or use the pretend chatbot to see them driven for real. */
export function App() {
  const [log, setLog] = useState<string[]>([]);
  const note = (line: string) => setLog((lines) => [`${new Date().toLocaleTimeString()}  ${line}`, ...lines].slice(0, 14));
  const mascot = useMascotState({ onStateChange: (state, previous) => note(`onStateChange: ${previous} → ${state}`) });

  const [chatOpen, setChatOpen] = useState(false);
  const [greeting, setGreeting] = useState(false);
  const [motion, setMotion] = useState<ReducedMotionSetting>("user");
  const [size, setSize] = useState<SizeName>("Auto");
  const [placement, setPlacement] = useState<MascotPlacement>("bottom-right");
  const [effects, setEffects] = useState(true);
  const [tag, setTag] = useState(true);

  // Greet a moment after the page loads, the way a site would
  useEffect(() => {
    const t = setTimeout(() => {
      setGreeting(true);
      mascot.setState("welcome");
    }, 1200);
    return () => clearTimeout(t);
  }, [mascot.setState]);

  const openChat = (open: boolean) => {
    setChatOpen(open);
    setGreeting(false);
    mascot.setState(open ? "listening" : "idle");
  };

  return (
    <main className="demo">
      <header>
        <h1>Sankofa mascot</h1>
        <p>
          The bird in the corner opens the chat. Switch its state here, or open the chat and send a message to see a chatbot
          drive it: <b>listening</b> while you type, <b>thinking</b>, then <b>speaking</b> while the answer appears.
        </p>
      </header>

      <section className="panel" aria-labelledby="state-title">
        <h2 id="state-title">State</h2>
        <div className="seg" role="radiogroup" aria-labelledby="state-title">
          {MASCOT_STATES.map((s) => (
            <button key={s} type="button" role="radio" aria-checked={mascot.state === s} onClick={() => mascot.setState(s)}>
              {s}
            </button>
          ))}
        </div>
        <p className="hint">Welcome and happy settle back on their own; the others last until changed.</p>
      </section>

      <section className="panel" aria-labelledby="look-title">
        <h2 id="look-title">Options</h2>
        <label>
          Motion
          <select value={motion} onChange={(e) => setMotion(e.target.value as ReducedMotionSetting)}>
            <option value="user">Follow the system setting</option>
            <option value="always">Reduced (always)</option>
            <option value="never">Full motion (never reduce)</option>
          </select>
        </label>
        <label>
          Size
          <select value={size} onChange={(e) => setSize(e.target.value as SizeName)}>
            {Object.keys(SIZES).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Placement
          <select value={placement} onChange={(e) => setPlacement(e.target.value as MascotPlacement)}>
            <option value="bottom-right">Bottom right</option>
            <option value="bottom-left">Bottom left</option>
          </select>
        </label>
        <label className="check">
          <input type="checkbox" checked={effects} onChange={(e) => setEffects(e.target.checked)} /> State effects
        </label>
        <label className="check">
          <input type="checkbox" checked={tag} onChange={(e) => setTag(e.target.checked)} /> "Ask us" tag
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={greeting}
            onChange={(e) => {
              setGreeting(e.target.checked);
              if (e.target.checked) mascot.setState("welcome");
            }}
          />{" "}
          Greeting bubble
        </label>
      </section>

      <section className="panel" aria-labelledby="log-title">
        <h2 id="log-title">Callbacks</h2>
        <ol className="log">{log.length ? log.map((line, i) => <li key={i}>{line}</li>) : <li>Nothing yet</li>}</ol>
      </section>

      {chatOpen && <MockChat mascot={mascot} onClose={() => openChat(false)} />}

      <SankofaMascot
        state={mascot.state}
        src="/sankofa-mascot.webp"
        label="Ask us: open the chat assistant"
        tag={tag ? "Ask us" : undefined}
        open={chatOpen}
        controls="demo-chat"
        onClick={() => {
          note("onClick");
          openChat(!chatOpen);
        }}
        onHoverChange={(hovered) => note(`onHoverChange: ${hovered}`)}
        message={
          greeting && !chatOpen ? (
            <p>
              <b>Welcome to the chamber!</b> How can I help you today?
            </p>
          ) : undefined
        }
        messageActions={[
          { label: "How do I join?", primary: true, onSelect: () => openChat(true) },
          { label: "Something else", onSelect: () => openChat(true) },
        ]}
        onDismissMessage={() => {
          setGreeting(false);
          mascot.settle();
        }}
        placement={placement}
        size={SIZES[size]}
        reducedMotion={motion}
        effects={effects}
      />
    </main>
  );
}
