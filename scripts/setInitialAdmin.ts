import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
let serviceAccount;
try {
  // Try to read from environment variable first
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } else {
    // Use the existing service account file
    const serviceAccountPath = join(__dirname, '..', 'config', 'cucina-recipe-app-firebase-adminsdk-70386-7ca86b4daf.json');
    serviceAccount = await import(serviceAccountPath, { assert: { type: 'json' } });
  }
} catch (error) {
  console.error('Error loading service account:', error);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const setInitialAdmin = async (email: string) => {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Set admin claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    
    console.log(`Successfully set admin claim for user: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error setting admin claim:', error);
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address as an argument');
  process.exit(1);
}

setInitialAdmin(email); 