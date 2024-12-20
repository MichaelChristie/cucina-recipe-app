import { toBlobURL, fetchFile } from '@ffmpeg/util';
import type { FFmpeg } from '@ffmpeg/ffmpeg';

let ffmpeg: FFmpeg | null = null;

export const getFFmpeg = async () => {
  if (!ffmpeg) {
    try {
      const FFmpeg = (await import('@ffmpeg/ffmpeg')).FFmpeg;
      ffmpeg = new FFmpeg();
      
      // Initialize FFmpeg immediately after creation
      const baseURL = import.meta.env.PROD 
        ? 'https://cucina.app/ffmpeg'
        : '/ffmpeg';
      
      console.log('Loading FFmpeg from:', baseURL);
      
      try {
        await ffmpeg.load({
          coreURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.js`,
            'text/javascript'
          ),
          wasmURL: await toBlobURL(
            `${baseURL}/ffmpeg-core.wasm`,
            'application/wasm'
          )
        });
      } catch (e) {
        console.log('Failed to load from app directory, trying CDN...', e);
        
        await ffmpeg.load({
          coreURL: await toBlobURL(
            'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js',
            'text/javascript'
          ),
          wasmURL: await toBlobURL(
            'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.wasm',
            'application/wasm'
          )
        });
      }
      
      console.log('FFmpeg initialized successfully');
    } catch (error) {
      console.error('Error initializing FFmpeg:', error);
      throw error;
    }
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