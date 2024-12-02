import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDyyjzMdzHZWTd8FKGp7MTLXpVPpx-dMGA",
  authDomain: "cucina-recipe-app.firebaseapp.com",
  projectId: "cucina-recipe-app",
  storageBucket: "cucina-recipe-app.firebasestorage.app",
  messagingSenderId: "571686975523",
  appId: "1:571686975523:web:b708392d5a100969765996"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);