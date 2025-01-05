import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Check if we have the service account key
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
}

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  
  // Verify required fields
  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    throw new Error('Service account key is missing required fields (project_id, private_key, or client_email)');
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('SyntaxError')) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON');
    } else {
      console.error('Error initializing Firebase Admin:', error.message);
    }
    throw error;
  } else {
    console.error('Unknown error initializing Firebase Admin:', error);
    throw error;
  }
}

export const adminDb = getFirestore();
export default admin; 