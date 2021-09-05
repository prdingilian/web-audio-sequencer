import { AudioCtx, Audio } from "./audioContext";
import { getSequence } from "./scheduler";
import { getOscillators } from "./synth";
import { SequenceOscillator, AudioState } from "./types";

export const getOfflineAudioContext = (
  state: AudioState
): OfflineAudioContext => {
  const secondsPerBar = state.bpm / 60;
  const totalSequenceTime = secondsPerBar * state.bars;
  return new window.OfflineAudioContext(2, 44100 * totalSequenceTime, 44100);
};

export const writeBuffer = (
  oscillators: SequenceOscillator[],
  state: AudioState,
  audio: Audio
) => {
  const playSequences = oscillators.map((osc) => {
    return getSequence(osc, state, audio);
  });
  playSequences.forEach((playSequence) => playSequence());
};

export const getNextBuffer = (state: AudioState): Promise<AudioBuffer> => {
  let audioContext = getOfflineAudioContext(state);
  const audio = AudioCtx(audioContext);
  const oscillators = getOscillators(state, audio);
  writeBuffer(oscillators, state, audio);
  return audioContext.startRendering();
};
