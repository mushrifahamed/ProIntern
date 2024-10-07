import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAIFNOYMZ1bP5KWmXv9Rw05DDY8Qrb2Yas",
  authDomain: "pro-intern.firebaseapp.com",
  projectId: "pro-intern",
  storageBucket: "pro-intern.appspot.com",
  messagingSenderId: "694603024829",
  appId: "1:694603024829:web:5fab2756cebf925db5aad4",
  measurementId: "G-7XFPW5BQRB"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, app };
