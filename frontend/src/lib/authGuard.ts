import { onAuthStateChanged } from "firebase/auth";
import type { Auth, User } from "firebase/auth";

let initialized = new WeakMap<Auth, Promise<User | null>>();

export function ensureAuthInitialized(auth: Auth, timeoutMs = 5000): Promise<User | null> {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  let p = initialized.get(auth);
  if (p) return p;

  p = new Promise<User | null>((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      try {
        unsub();
      } catch (e) {}
      resolve(user);
    });

    // safety timeout: resolve with currentUser (may be null)
    const t = setTimeout(() => {
      try {
        unsub();
      } catch (e) {}
      resolve(auth.currentUser || null);
    }, timeoutMs);

    // clear timeout when resolved
    p!.then(() => clearTimeout(t)).catch(() => clearTimeout(t));
  });

  initialized.set(auth, p);
  return p;
}

export default ensureAuthInitialized;
