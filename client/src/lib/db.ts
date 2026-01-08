import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { app, auth } from "./firebase";

export const db = getFirestore(app);

type UserDoc = {
  uid: string;
  email: string | null;
  name: string | null;
  role: null;
  createdAt: ReturnType<typeof serverTimestamp>;
};

export async function createUserIfNotExists(user: User): Promise<void> {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    return;
  }

  const data: UserDoc = {
    uid: user.uid,
    email: user.email ?? null,
    name: user.displayName ?? null,
    role: null,
    createdAt: serverTimestamp(),
  };

  await setDoc(userRef, data);
}

export async function updateUserRole(
  uid: string,
  role: "student" | "recruiter"
): Promise<void> {
  const userRef = doc(db, "users", uid);

  // Prepare data payload
  // SYNC: We must also update 'type' because GlobalContext prioritizes 'type' over 'role'.
  const type = role === "recruiter" ? "company" : "candidate";
  const data: any = { role, type };

  // If we have the current user in auth context, backfill basic info 
  // in case the document is being created for the first time
  if (auth.currentUser && auth.currentUser.uid === uid) {
    data.uid = uid;
    data.email = auth.currentUser.email || null;
    data.name = auth.currentUser.displayName || null;
    // Note: We don't set createdAt here to avoid overwriting it if it exists, 
    // and because we don't want to read-before-write if we can avoid it.
  }

  await setDoc(userRef, data, { merge: true });
}
