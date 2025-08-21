// firebase-config.js

// Import Firebase functions from CDN (no npm install needed)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtJ9Zbw414U5_21g3uC1YWTVX0ClGaD20",
  authDomain: "karibubnb.firebaseapp.com",
  projectId: "karibubnb",
  storageBucket: "karibubnb.firebasestorage.app",
  messagingSenderId: "552053964240",
  appId: "1:552053964240:web:352e1d659ecd2332eecdd5",
  measurementId: "G-TF8QRH3KEJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
