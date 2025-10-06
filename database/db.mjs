// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAmIZSqAQ_kDNDO5Kxnhk-rUiPMKZWlbc4",
    authDomain: "financeiro-c7756.firebaseapp.com",
    projectId: "financeiro-c7756",
    storageBucket: "financeiro-c7756.firebasestorage.app",
    messagingSenderId: "331363051599",
    appId: "1:331363051599:web:e59b79b334bfd1160d623a",
    measurementId: "G-VRC8QKS75D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);