declare module '@ffmpeg/ffmpeg' {
  export class FFmpeg {
    load(options?: { coreURL?: string; wasmURL?: string }): Promise<void>;
    writeFile(name: string, data: Uint8Array): Promise<void>;
    readFile(name: string): Promise<Uint8Array>;
    // Add other methods as needed
  }
}

declare module '@ffmpeg/util' {
  export function toBlobURL(url: string, type: string): Promise<string>;
} 