// import { db } from '../config/firebase';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc,
  doc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';

const COLLECTION_NAME = 'ingredients';

export async function getIngredients() {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function addIngredient(ingredient) {
  return await addDoc(collection(db, COLLECTION_NAME), ingredient);
}

export async function updateIngredient(id, ingredient) {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, ingredient);
}

export async function deleteIngredient(id) {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

export async function searchIngredients(searchTerm) {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('name', '>=', searchTerm),
    where('name', '<=', searchTerm + '\uf8ff')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
} 