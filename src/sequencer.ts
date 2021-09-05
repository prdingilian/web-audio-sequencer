import { getNextBuffer } from "./buffer";
import { AudioState } from "./types";

const Sequencer = (state: AudioState) => {
  const playbackAudioContext = new window.AudioContext();
  let nextBuffer: AudioBuffer | null = null;

  const updateBuffer = (buffer: AudioBuffer) => (nextBuffer = buffer);

  getNextBuffer(state).then(updateBuffer);

  const start = () => {
    const bufferSource = playbackAudioContext.createBufferSource();
    bufferSource.buffer = nextBuffer;
    bufferSource.connect(playbackAudioContext.destination);
    bufferSource.start(playbackAudioContext.currentTime);
    if (state.loop) {
      bufferSource.onended = () => start();
      getNextBuffer(state).then(updateBuffer);
    }
  };

  const pause = () => {
    playbackAudioContext.suspend();
  };

  const resume = () => {
    playbackAudioContext.resume();
  };

  const update = (newState: Partial<AudioState>) => {
    state = { ...state, ...newState };
    getNextBuffer(state).then(updateBuffer);
  };

  return { start, pause, resume, update };
};

export { Sequencer, AudioState };
