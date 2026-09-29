import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  update, 
  remove, 
  onValue, 
  push, 
  query, 
  orderByChild, 
  equalTo, 
  serverTimestamp,
  runTransaction
} from 'firebase/database';

export const firebaseConfig = {
  apiKey: "AIzaSyCyPaoJTsyVCmlwL5KbE9KgzP6yI_R9hpo",
  authDomain: "ebookbazar-95586.firebaseapp.com",
  databaseURL: "https://ebookbazar-95586-default-rtdb.firebaseio.com",
  projectId: "ebookbazar-95586",
  storageBucket: "ebookbazar-95586.firebasestorage.app",
  messagingSenderId: "542732089623",
  appId: "1:542732089623:web:9b8b2d2cbff5bee4701f52",
  measurementId: "G-KYEK6Y4RRE"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getDatabase(app);

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  push,
  query,
  orderByChild,
  equalTo,
  serverTimestamp,
  runTransaction
};
export type { User };
