import { Synth, LowLevelSynth, AudioState, SequenceOscillator } from "./types";
import { Audio } from "./audioContext";

export const createLowLevelSynth = (
  synth: Synth,
  audio: Audio,
  numberOfSequences: number
): LowLevelSynth => {
  const oscillator = audio.createOscillator(synth.shape);
  const filter = audio.createFilter(synth.filter.q);
  const amp = audio.createAmp();
  amp.gain.value = 1 / numberOfSequences;
  // paranoid check so that speakers don't get blown
  if (amp.gain.value > 1) amp.gain.value = 1
  oscillator.connect(filter).connect(amp).connect(audio.out);
  oscillator.start();
  return { oscillator, filter, amp };
};

export const getOscillators = (state: AudioState, audio: Audio) => {
  const numberOfSequences = state.sequences.length;
  const oscillators: SequenceOscillator[] = state.sequences.map((sequence) => ({
    lowLevelSynth: createLowLevelSynth(sequence.synth, audio, numberOfSequences),
    sequence,
  }));
  return oscillators;
};
