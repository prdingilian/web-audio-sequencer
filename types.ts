type Shape = "sine" | "sawtooth" | "square" | "triangle";

type Filter = {
  frequency: number;
  q: number;
};

type Envelope = {
  attack: number;
  sustain: number;
  release: number;
};

type Synth = {
  shape: Shape;
  filter: Filter;
  envelope: Envelope;
};

type Sequence = {
  synth: Synth;
  notes: number[];
};

type LowLevelSynth = {
  oscillator: OscillatorNode;
  filter: BiquadFilterNode;
  amp: GainNode;
};

type AudioState = {
  bpm: number;
  bars: number;
  sequences: Sequence[];
  loop: boolean;
};

type SequenceOscillator = {
  lowLevelSynth: LowLevelSynth;
  sequence: Sequence;
};

export {
  Shape,
  Filter,
  Envelope,
  Synth,
  Sequence,
  LowLevelSynth,
  AudioState,
  SequenceOscillator,
};
