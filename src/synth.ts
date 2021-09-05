import { Synth, LowLevelSynth, AudioState, SequenceOscillator } from "./types";
import { Audio } from "./audioContext";

export const createLowLevelSynth = (
  synth: Synth,
  audio: Audio
): LowLevelSynth => {
  const oscillator = audio.createOscillator(synth.shape);
  const filter = audio.createFilter(synth.filter.q);
  const amp = audio.createAmp();
  oscillator.connect(filter).connect(amp).connect(audio.out);
  oscillator.start();
  return { oscillator, filter, amp };
};

export const getOscillators = (state: AudioState, audio: Audio) => {
  const oscillators: SequenceOscillator[] = state.sequences.map((sequence) => ({
    lowLevelSynth: createLowLevelSynth(sequence.synth, audio),
    sequence,
  }));
  return oscillators;
};
