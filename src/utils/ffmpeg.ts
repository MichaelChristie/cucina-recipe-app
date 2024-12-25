import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export const getFFmpeg = () => ffmpeg;

export const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();

  // Load FFmpeg with the correct paths to core files
  try {
    await ffmpeg.load({
      coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
      wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm'),
    });
    
    console.log('FFmpeg loaded successfully');
    return ffmpeg;
  } catch (error) {
    console.error('Error loading FFmpeg:', error);
    throw error;
  }
};

export const writeFileToFFmpeg = async (fileName: string, data: Uint8Array) => {
  if (!ffmpeg) throw new Error('FFmpeg not loaded');
  await ffmpeg.writeFile(fileName, data);
};

export const readFileFromFFmpeg = async (fileName: string) => {
  if (!ffmpeg) throw new Error('FFmpeg not loaded');
  return await ffmpeg.readFile(fileName);
};