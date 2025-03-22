// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBeFbyyfdAqBltPSaHae-ygjUpY4CJRyow",
    authDomain: "online-healthcare-system-ffa39.firebaseapp.com",
    projectId: "online-healthcare-system-ffa39",
    storageBucket: "online-healthcare-system-ffa39.firebasestorage.app",
    messagingSenderId: "518884031112",
    appId: "1:518884031112:web:1a2d193e88de1914b37d3d" ,
    measurementId: "G-VW8T5G4VY9"

};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 