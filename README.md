# Web Audio Sequencer

Web Audio Sequencer is a library for writing music on the web in a declarative style. It abstracts away the complexity of the Web Audio API and lets you make music by simply describing what it should sound like.

## Things the library handles for you

- Creating and connecting Audio Nodes such as oscillators, filters, and amps.
- Automating envelopes
- Scheduling notes to play at the correct time
- Looping

## Example Usage

Install the package:

```
npm i web-audio-sequencer
```

Create an object that describes your music:

```
import { Sequencer, AudioState } from "web-audio-sequencer"
...
const state: AudioState = {
  bpm: 120,
  bars: 1,
  sequences: [
    {
      synth: {
        shape: "sawtooth",
        filter: { q: 2, frequency: 10000 },
        envelope: { attack: 0.03, sustain: 0.1, release: 0.1 },
      },
      notes: [130, 196, 174, 155, 196, 233, 196, 261],
    },
    {
      synth: {
        shape: "square",
        filter: { q: 2, frequency: 10000 },
        envelope: { attack: 0, sustain: 0.1, release: 0.1 },
      },
      notes: [130, 233],
    },
  ],
  loop: true,
};
```

Then create a sequence from your object:

```
const seq = Sequencer(state);
```

Now you can start, pause and resume your sequence:

```
seq.start();
seq.pause();
seq.resume();
```

You can update your sequence while it is playing. Your updates will reflect in the next loop. To update your sequence, just pass a new state (or a partial new state):

```
seq.update({bpm: 110})
```

That's it!

### Roadmap

This library is a work in progress and not ready to be released on NPM yet. Remaining work includes:

- ~~Updating the sequencer state in place~~
- Assigning a relative gain to oscillators dependent upon the total number of sequences
- Supporting note names in sequences, rather than just frequencies
