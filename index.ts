import { AudioCtx, Audio } from "./audio";
import {
  Synth,
  LowLevelSynth,
  AudioState,
  SequenceOscillator,
  Sequence,
} from "./types";

const createLowLevelSynth = (synth: Synth, audio: Audio): LowLevelSynth => {
  const oscillator = audio.createOscillator(synth.shape);
  const filter = audio.createFilter(synth.filter.q);
  const amp = audio.createAmp();
  oscillator.connect(filter).connect(amp).connect(audio.out);
  oscillator.start();
  return { oscillator, filter, amp };
};

const getOscillatorScheduler = (
  note: number,
  lowLevelSynth: LowLevelSynth,
  sequence: Sequence
) => {
  return (when: number) => {
    lowLevelSynth.oscillator.frequency.setValueAtTime(note, when);
    lowLevelSynth.filter.frequency.setValueAtTime(0, when);
    lowLevelSynth.amp.gain.setValueAtTime(0, when);
    lowLevelSynth.filter.frequency.linearRampToValueAtTime(
      sequence.synth.filter.frequency,
      when + sequence.synth.envelope.attack
    );
    lowLevelSynth.amp.gain.linearRampToValueAtTime(
      0.3,
      when + sequence.synth.envelope.attack
    );
    lowLevelSynth.filter.frequency.setValueAtTime(
      sequence.synth.filter.frequency,
      when + sequence.synth.envelope.attack + sequence.synth.envelope.sustain
    );
    lowLevelSynth.amp.gain.setValueAtTime(
      0.3,
      when + sequence.synth.envelope.attack + sequence.synth.envelope.sustain
    );
    lowLevelSynth.filter.frequency.linearRampToValueAtTime(
      0,
      when +
        sequence.synth.envelope.attack +
        sequence.synth.envelope.sustain +
        sequence.synth.envelope.release
    );
    lowLevelSynth.amp.gain.linearRampToValueAtTime(
      0,
      when +
        sequence.synth.envelope.attack +
        sequence.synth.envelope.sustain +
        sequence.synth.envelope.release
    );
  };
};

const getSequence = (
  sequenceOscillator: SequenceOscillator,
  state: AudioState,
  audio: Audio
): (() => void) => {
  const { bpm, bars } = state;
  const { sequence, lowLevelSynth } = sequenceOscillator;
  const secondsPerBar = bpm / 60;
  const totalSequenceTime = secondsPerBar * bars;
  const sequenceLength = sequence.notes.length;
  const secondsPerNote = totalSequenceTime / sequenceLength;
  const oscillatorSchedulers = sequence.notes.map((note) => {
    return getOscillatorScheduler(note, lowLevelSynth, sequence);
  });
  const playSequence = () => {
    oscillatorSchedulers.forEach((scheduler, i) =>
      scheduler(audio.now() + i * secondsPerNote)
    );
  };
  return playSequence;
};

const getOfflineAudioContext = (state: AudioState): OfflineAudioContext => {
  const secondsPerBar = state.bpm / 60;
  const totalSequenceTime = secondsPerBar * state.bars;
  return new window.OfflineAudioContext(2, 44100 * totalSequenceTime, 44100);
};

export const Sequencer = (state: AudioState) => {
  const playbackAudioContext = new window.AudioContext();
  const audioContext = getOfflineAudioContext(state);
  const audio = AudioCtx(audioContext);
  const oscillators: SequenceOscillator[] = state.sequences.map((sequence) => ({
    lowLevelSynth: createLowLevelSynth(sequence.synth, audio),
    sequence,
  }));
  const writeBuffer = () => {
    const playSequences = oscillators.map((osc) => {
      return getSequence(osc, state, audio);
    });
    playSequences.forEach((playSequence) => playSequence());
  };
  const start = () => {
    writeBuffer();
    audioContext.startRendering().then((buffer) => {
      const bufferSource = playbackAudioContext.createBufferSource();
      bufferSource.buffer = buffer;
      bufferSource.connect(playbackAudioContext.destination);
      bufferSource.loop = state.loop;
      bufferSource.start(playbackAudioContext.currentTime);
    });
  };
  const pause = () => {
    playbackAudioContext.suspend();
  };
  const resume = () => {
    playbackAudioContext.resume();
  };
  return { start, pause, resume };
};
