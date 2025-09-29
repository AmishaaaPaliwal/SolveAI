// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxbTb4iwXKnmafltuO5DfCui1yX4P-bLk",
  authDomain: "ayurtrack.firebaseapp.com",
  projectId: "ayurtrack",
  storageBucket: "ayurtrack.firebasestorage.app",
  messagingSenderId: "557785461789",
  appId: "1:557785461789:web:85692d9bd244e2f45f42f4",
  measurementId: "G-MLGVGWB0KE"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
