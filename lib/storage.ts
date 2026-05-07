// Firebase Storage utilities
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadToFirebase(file: File, folder: string = 'projects'): Promise<string> {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${folder}/${timestamp}_${file.name}`;

    // Create a reference to the file location
    const storageRef = ref(storage, filename);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error('Firebase upload error:', error);
    throw new Error('Failed to upload file');
  }
}

export default {
  uploadToFirebase,
};