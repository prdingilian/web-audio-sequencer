import { Shape } from "./types";

// Thin wrapper around the Audio Context
const AudioCtx = (audioCtx: OfflineAudioContext) => ({
  now: () => audioCtx.currentTime,
  out: audioCtx.destination,
  createOscillator: (shape: Shape, frequency?: number) => {
    const oscillator = audioCtx.createOscillator();
    oscillator.type = shape;
    oscillator.frequency.value = frequency || 440;
    return oscillator;
  },
  createAmp: () => audioCtx.createGain(),
  createFilter: (q: number) => {
    const filter = audioCtx.createBiquadFilter();
    filter.frequency.value = 0;
    filter.Q.value = q;
    return filter;
  },
});

type Audio = ReturnType<typeof AudioCtx>;

export { AudioCtx, Audio };
