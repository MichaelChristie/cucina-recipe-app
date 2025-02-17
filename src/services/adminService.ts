import { auth } from '../config/firebase';
import { getIdTokenResult } from 'firebase/auth';

export const checkAdminStatus = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return false;
    }

    const tokenResult = await getIdTokenResult(user, true);
    return tokenResult.claims.admin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Force token refresh to get updated claims
export const refreshUserToken = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (user) {
      await user.getIdToken(true);
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}; 