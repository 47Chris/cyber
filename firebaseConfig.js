// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBsObAwkI8m9Lg6rFNvPpkUq68p_Yuw5nQ",
  authDomain: "bpa-f1ef1.firebaseapp.com",
  projectId: "bpa-f1ef1",
  storageBucket: "bpa-f1ef1.appspot.com",
  messagingSenderId: "578300290012",
  appId: "1:578300290012:web:9616802df0ed378171a519",
  measurementId: "G-QN6XDCME24",
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
const auth = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_AUTH = auth;
