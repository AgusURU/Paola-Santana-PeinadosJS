// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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