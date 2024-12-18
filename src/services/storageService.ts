import { storage } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface UploadProgress {
  progress: number;
  downloadUrl?: string;
  error?: Error;
}

export const uploadMedia = (
  file: File,
  path: string,
  onProgress: (progress: UploadProgress) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `${path}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress({ progress });
      },
      (error) => {
        onProgress({ progress: 0, error });
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        onProgress({ progress: 100, downloadUrl });
        resolve(downloadUrl);
      }
    );
  });
};