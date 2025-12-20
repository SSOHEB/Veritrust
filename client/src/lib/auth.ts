import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { createUserIfNotExists } from "./db";
import { auth, googleProvider } from "./firebase";

export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserIfNotExists(result.user);
    return result.user;
  } catch (error: unknown) {
    const err = error as { code?: unknown; message?: unknown };
    console.error("Firebase Google sign-in error:", {
      code: err?.code,
      message: err?.message,
      error,
    });
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
