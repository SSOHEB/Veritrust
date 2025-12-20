import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCz3k5ndz7LiiKLp1xyZFTUiE01QdlPFZA",
  authDomain: "veritrust-hackathon.firebaseapp.com",
  projectId: "veritrust-hackathon",
  storageBucket: "veritrust-hackathon.firebasestorage.app",
  messagingSenderId: "843843366406",
  appId: "1:843843366406:web:0862c0a86335bf56235d87",
  measurementId: "G-GZPBFQXJTS",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
