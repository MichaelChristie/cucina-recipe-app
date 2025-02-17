import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Set admin claim for a user
export const setAdminClaim = functions.https.onCall(async (data, context) => {
  // Check if the caller is an admin
  if (!context.auth?.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can set admin claims'
    );
  }

  const { uid } = data;
  if (!uid) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with a uid'
    );
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    return { success: true };
  } catch (error) {
    console.error('Error setting admin claim:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error setting admin claim'
    );
  }
}); 