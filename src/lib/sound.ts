// Tiny, dependency-free sound effects generated with the Web Audio API -
// no external audio files to host or download. Safe to call from
// anywhere; silently no-ops if AudioContext isn't available (SSR, old
// browsers, or before any user gesture has unlocked audio).

type AudioContextCtor = typeof AudioContext;

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor: AudioContextCtor | undefined =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

function beep(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  const audio = getCtx();
  if (!audio) return;
  try {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + duration);
  } catch {
    /* ignore - never let a sound effect break the app */
  }
}

/** Two-tone alert used for the 5-minute and 1-minute exam warnings. */
export function playTimeWarning() {
  beep(660, 0.22, "sine", 0.22);
  setTimeout(() => beep(880, 0.26, "sine", 0.22), 170);
}

/** Cheerful ascending chime for a successful submit. */
export function playSuccessDing() {
  beep(523.25, 0.2, "sine", 0.18); // C5
  setTimeout(() => beep(659.25, 0.2, "sine", 0.18), 130); // E5
  setTimeout(() => beep(783.99, 0.36, "sine", 0.18), 260); // G5
}

/** Soft, brief tap heard on ordinary clicks (buttons, links) across the
 * whole site. Deliberately much quieter/shorter than the other cues so
 * dozens of clicks per minute never feel noisy. As a side effect, the
 * very first click anywhere in the app unlocks the AudioContext under a
 * genuine user gesture, so later timer-triggered cues (like the exam
 * warnings, which fire from a setInterval with no gesture of their own)
 * are reliably audible on strict browsers instead of silently no-oping. */
export function playClickTick() {
  beep(720, 0.05, "triangle", 0.07);
}

/** Explicitly warms up / unlocks the AudioContext. Safe to call from any
 * real user-gesture handler (click, keydown, touchstart). */
export function unlockAudio() {
  getCtx();
}
