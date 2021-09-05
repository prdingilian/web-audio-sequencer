import {
  LowLevelSynth,
  Sequence,
  SequenceOscillator,
  AudioState,
} from "./types";
import { Audio } from "./audioContext";

export const getOscillatorScheduler = (
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

export const getSequence = (
  sequenceOscillator: SequenceOscillator,
  state: AudioState,
  audio: Audio
) => {
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
