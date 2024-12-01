// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDyyjzMdzHZWTd8FKGp7MTLXpVPpx-dMGA",
  authDomain: "cucina-recipe-app.firebaseapp.com",
  projectId: "cucina-recipe-app",
  storageBucket: "cucina-recipe-app.firebasestorage.app",
  messagingSenderId: "571686975523",
  appId: "1:571686975523:web:b708392d5a100969765996"
};


// const firebaseConfig = {
//   apiKey: "AIzaSyCinNok0vp-2IgFyOPFUmRNhi3WCxQL9wE",
//   authDomain: "my-recipe-app-6325e.firebaseapp.com",
//   projectId: "my-recipe-app-6325e",
//   storageBucket: "my-recipe-app-6325e.firebasestorage.app",
//   messagingSenderId: "873391643353",
//   appId: "1:873391643353:web:b6f17e9c70770a9cbffcc8",
//   measurementId: "G-39H9VPYYJF"
// };


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);