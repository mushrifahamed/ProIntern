import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCrwd5T37Bi3Nz6AoQSLuuJCIGNW-baqxA",
  authDomain: "prointern2.firebaseapp.com",
  projectId: "prointern2",
  storageBucket: "prointern2.appspot.com",
  messagingSenderId: "255879532394",
  appId: "1:255879532394:web:454307f1a2789b73f85f13",
  measurementId: "G-Z5RYR14FYP",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, app };
