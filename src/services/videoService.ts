import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import { getAuth } from 'firebase/auth';

export const uploadVideo = async (file: File) => {
  const auth = getAuth();
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to upload videos');
  }

  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.name}`;
  const storageRef = ref(storage, `recipe-videos/${fileName}`);

  try {
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error starting upload:', error);
    throw error;
  }
};

export const deleteVideo = async (videoUrl: string) => {
  try {
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to delete videos');
    }

    // Extract the path from the full URL
    const decodedUrl = decodeURIComponent(videoUrl);
    const urlObj = new URL(decodedUrl);
    const pathRegex = /\/o\/(.+?)\?/;
    const match = urlObj.pathname.match(pathRegex);
    
    if (!match) {
      throw new Error('Invalid video URL format');
    }

    const storagePath = match[1].replace(/%2F/g, '/');
    console.log('Attempting to delete video at path:', storagePath);

    const videoRef = ref(storage, storagePath);
    await deleteObject(videoRef);
    console.log('Video deleted successfully');
  } catch (error) {
    console.error('Error deleting video:', error);
    if (error.code === 'storage/object-not-found') {
      console.log('Video already deleted or not found');
      return; // Don't throw error if video is already gone
    }
    throw error;
  }
}; 