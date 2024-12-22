import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export const getFFmpeg = async () => {
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
    
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.js`,
        'text/javascript',
      ),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        'application/wasm',
      ),
    });
  }
  return ffmpeg;
};

export const loadFFmpeg = async () => {
  return await getFFmpeg();
};

// Helper function to write file to FFmpeg
export const writeFileToFFmpeg = async (
  ffmpeg: FFmpeg,
  fileName: string,
  data: ArrayBuffer
) => {
  try {
    const uint8Array = new Uint8Array(data);
    await ffmpeg.writeFile(fileName, uint8Array);
  } catch (error) {
    console.error('Error writing file to FFmpeg:', error);
    throw error;
  }
};

// Helper function to read file from FFmpeg
export const readFileFromFFmpeg = async (
  ffmpeg: FFmpeg,
  fileName: string
): Promise<Uint8Array> => {
  try {
    return await ffmpeg.readFile(fileName);
  } catch (error) {
    console.error('Error reading file from FFmpeg:', error);
    throw error;
  }
};