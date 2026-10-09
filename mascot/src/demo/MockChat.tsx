import { useEffect, useRef, useState, type FormEvent } from "react";
import type { useMascotState } from "../mascot";

interface Message {
  who: "bot" | "you";
  text: string;
}

const REPLY = "Thanks for asking! This is a pretend answer. Your real chatbot would reply here, and the mascot speaks while it does.";

/**
 * A pretend chatbot showing how a real one drives the mascot:
 * listening while the visitor can type, thinking while it waits, speaking while the reply appears, happy on success.
 */
export function MockChat({ mascot, onClose }: { mascot: ReturnType<typeof useMascotState>; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([{ who: "bot", text: "Hi! Ask me anything." }]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  useEffect(() => {
    input.current?.focus();
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;
    setDraft("");
    setBusy(true);
    setMessages((m) => [...m, { who: "you", text }]);
    input.current?.focus(); // a click on Send moved focus away; when the reply is done the bird goes back to listening
    mascot.setState("thinking");
    later(() => {
      // Type the reply out word by word while the mascot speaks
      mascot.setState("speaking");
      setMessages((m) => [...m, { who: "bot", text: "" }]);
      const words = REPLY.split(" ");
      words.forEach((_, i) =>
        later(() => {
          setMessages((m) => [...m.slice(0, -1), { who: "bot", text: words.slice(0, i + 1).join(" ") }]);
          if (i === words.length - 1) {
            setBusy(false);
            mascot.settle(); // back to listening
          }
        }, 70 * (i + 1)),
      );
    }, 900);
  };

  return (
    <section className="demo-chat" id="demo-chat" aria-label="Pretend chat">
      <header>
        <b>Pretend chatbot</b>
        <button type="button" aria-label="Close chat" onClick={onClose}>
          ×
        </button>
      </header>
      <div className="demo-log" aria-live="polite">
        {messages.map((m, i) => (
          <p key={i} className={m.who}>
            {m.text}
          </p>
        ))}
      </div>
      <form onSubmit={send}>
        <label className="sr-only" htmlFor="demo-in">
          Your message
        </label>
        <input
          id="demo-in"
          ref={input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => mascot.setRest("listening")}
          onBlur={() => mascot.setRest("idle")}
          placeholder="Type a message…"
          autoComplete="off"
        />
        <button type="submit" disabled={busy}>
          Send
        </button>
      </form>
      <button type="button" className="celebrate" onClick={() => mascot.setState("happy")}>
        Pretend a sign-up worked (happy)
      </button>
    </section>
  );
}
