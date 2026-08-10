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
  beep(660, 0.15, "sine", 0.13);
  setTimeout(() => beep(880, 0.18, "sine", 0.13), 160);
}

/** Cheerful ascending chime for a successful submit. */
export function playSuccessDing() {
  beep(523.25, 0.15, "sine", 0.12); // C5
  setTimeout(() => beep(659.25, 0.15, "sine", 0.12), 120); // E5
  setTimeout(() => beep(783.99, 0.3, "sine", 0.12), 240); // G5
}
