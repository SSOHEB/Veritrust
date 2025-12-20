import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { app } from "./firebase";

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
  await updateDoc(userRef, { role });
}
