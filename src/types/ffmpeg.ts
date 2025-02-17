import { Dispatch, SetStateAction } from 'react';

export interface FFmpegProgress {
  ratio: number;
  time: number;
}

export type FFmpegProgressCallback = (progress: FFmpegProgress) => void;

export interface FFmpeg {
  load: () => Promise<void>;
  exec: (command: string[]) => Promise<void>;
  on: (event: string, callback: FFmpegProgressCallback) => void;
  off: (event: string, callback: FFmpegProgressCallback) => void;
  terminate: () => Promise<void>;
  writeFile: (name: string, data: Uint8Array) => Promise<void>;
  readFile: (name: string) => Promise<Uint8Array>;
  isLoaded?: () => boolean;
}

export interface FFmpegContext {
  ffmpeg: FFmpeg | null;
  isLoaded: boolean;
  isLoading: boolean;
  loadFFmpeg: () => Promise<void>;
  progress: number;
  setProgress: Dispatch<SetStateAction<number>>;
} 