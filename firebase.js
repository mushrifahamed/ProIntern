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
  apiKey: "AIzaSyDn3PekZtUEcPdcltkso5uaxi4Grfa1ohI",
  authDomain: "prointern3.firebaseapp.com",
  projectId: "prointern3",
  storageBucket: "prointern3.appspot.com",
  messagingSenderId: "606850542242",
  appId: "1:606850542242:web:7b1ede97e35dc49e6a45fb",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, app };
