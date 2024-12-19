import { FFmpeg } from '@ffmpeg/ffmpeg';

let ffmpegInstance: FFmpeg | null = null;

export const getFFmpeg = (): FFmpeg => {
  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg();
  }
  return ffmpegInstance;
};

export const loadFFmpeg = async (): Promise<void> => {
  const ffmpeg = getFFmpeg();
  if (!ffmpeg.loaded) {
    try {
      const baseURL = window.location.origin;
      await ffmpeg.load({
        coreURL: `${baseURL}/ffmpeg/ffmpeg-core.js`,
        wasmURL: `${baseURL}/ffmpeg/ffmpeg-core.wasm`,
        workerURL: `${baseURL}/ffmpeg/ffmpeg-core.worker.js`
      });
    } catch (error) {
      console.error('Error loading FFmpeg:', error);
      throw error;
    }
  }
}; 