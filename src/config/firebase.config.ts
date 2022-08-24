// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    // apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    // authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    // projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    // storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    // messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    // appId: process.env.REACT_APP_FIREBASE_API_ID,
    apiKey: 'AIzaSyBiNVCCHTfb24nQrY8DJ4USXrM6Jtz3Nzc',
    authDomain: 'online-shop-c6693.firebaseapp.com',
    projectId: 'online-shop-c6693',
    storageBucket: 'online-shop-c6693.appspot.com',
    messagingSenderId: '953594994902',
    appId: '1:953594994902:web:9d1e423b963b385d5ea977',
};

// Initialize Firebase
initializeApp(firebaseConfig);
const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
export default auth;
