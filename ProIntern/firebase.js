// Import necessary Firebase SDK functions
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIFNOYMZ1bP5KWmXv9Rw05DDY8Qrb2Yas",
  authDomain: "pro-intern.firebaseapp.com",
  projectId: "pro-intern",
  storageBucket: "pro-intern.appspot.com",
  messagingSenderId: "694603024829",
  appId: "1:694603024829:web:5fab2756cebf925db5aad4",
  measurementId: "G-7XFPW5BQRB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication, Firestore, and Storage
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, app };
