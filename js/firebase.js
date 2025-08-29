import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // 🔹 Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyBlv2_ly2BPTKTTgMujCQsK4i_LwiWfPvs",
  authDomain: "paola-santana-peluqueria.firebaseapp.com",
  projectId: "paola-santana-peluqueria",
  storageBucket: "paola-santana-peluqueria.firebasestorage.app",
  messagingSenderId: "956120172923",
  appId: "1:956120172923:web:ff349d624dd1ffc48395de",
  measurementId: "G-2EEBHTQPT5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app); // 🔹 Export Firestore
