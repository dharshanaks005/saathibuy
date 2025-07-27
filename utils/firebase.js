// utils/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAu3nDD8UFrek5ifdiv5u-KlBzNiyGS_z0",
  authDomain: "sathibuy-1a0e2.firebaseapp.com",
  projectId: "sathibuy-1a0e2",
  storageBucket: "sathibuy-1a0e2.appspot.com",
  messagingSenderId: "558012325015",
  appId: "1:558012325015:web:59776a8f40957b53b79dd2",
  measurementId: "G-6L06VEWJC7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics should only be initialized on the client side
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;