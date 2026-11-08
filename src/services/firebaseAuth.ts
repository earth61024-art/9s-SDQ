import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.setCustomParameters({
  prompt: 'select_account',
});

import { AppUser } from '../types';

let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedUser: AppUser | User | null = null;

const STORAGE_KEY = 'wma_auth_user';

export const getStoredUser = (): AppUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(e);
  }
  return null;
};

export const initAuth = (
  onAuthSuccess?: (user: AppUser | User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  // First check if an active session is already stored locally for instant recovery
  const localUser = getStoredUser();
  if (localUser && onAuthSuccess) {
    cachedUser = localUser;
    onAuthSuccess(localUser, cachedAccessToken);
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      cachedUser = user;
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0],
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
          })
        );
      } catch (e) {
        console.error(e);
      }

      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      // If Firebase Auth has no user, check if we have a locally stored email user
      const stored = getStoredUser();
      if (stored) {
        cachedUser = stored;
        if (onAuthSuccess) onAuthSuccess(stored, null);
      } else {
        cachedUser = null;
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const googleSignIn = async (): Promise<{ user: AppUser | User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('ไม่สามารถดึง Access Token จาก Google ได้');
    }

    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified,
      })
    );

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (error?.code === 'auth/popup-blocked') {
      throw new Error('เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป กรุณาอนุญาตป๊อปอัป หรือเข้าสู่ระบบด้วยอีเมลด้านล่าง');
    }
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      throw new Error('การเข้าสู่ระบบถูกยกเลิก');
    }
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Direct email login (e.g. for teachers or admin without requiring Google popup)
 */
export const emailSignIn = (email: string, displayName?: string): AppUser => {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('กรุณาระบุอีเมลที่ถูกต้อง');
  }

  // Create deterministic UID based on email
  const safeId = cleanEmail.replace(/[^a-zA-Z0-9_]/g, '_');
  const uid = `user_${safeId}`;
  const name = displayName?.trim() || cleanEmail.split('@')[0];

  const appUser: AppUser = {
    uid,
    email: cleanEmail,
    displayName: name,
    emailVerified: true,
  };

  cachedUser = appUser;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appUser));
  return appUser;
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const hasAccessToken = (): boolean => {
  return !!cachedAccessToken;
};

export const ensureAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }
  try {
    const res = await googleSignIn();
    return res?.accessToken || null;
  } catch (err: any) {
    return null;
  }
};

export const getCurrentUser = (): AppUser | User | null => {
  return cachedUser;
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.error(e);
  }
  cachedAccessToken = null;
  cachedUser = null;
  localStorage.removeItem(STORAGE_KEY);
};
