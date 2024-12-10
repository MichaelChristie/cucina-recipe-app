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
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date()
    };
  });
}

export const addIngredient = async (ingredientData) => {
  try {
    console.log('Adding ingredient with data:', ingredientData);

    // Add document to Firestore and get the reference
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...ingredientData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Verify we have a document reference
    if (!docRef) {
      throw new Error('Failed to create document');
    }

    console.log('Document added with ID:', docRef.id);
    
    // Create and return the complete ingredient object with proper date objects
    const returnData = {
      id: docRef.id,
      ...ingredientData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Returning data:', returnData);
    return returnData;
  } catch (error) {
    console.error('Error in addIngredient:', error);
    throw error;
  }
};

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

export async function removeDuplicateIngredients() {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  const ingredients = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Group by lowercase name
  const groupedByName = ingredients.reduce((acc, curr) => {
    const name = curr.name.toLowerCase();
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(curr);
    return acc;
  }, {});

  // Find duplicates and delete newer ones
  const batch = db.batch();
  
  Object.values(groupedByName).forEach(group => {
    if (group.length > 1) {
      // Sort by createdAt (oldest first)
      group.sort((a, b) => a.createdAt - b.createdAt);
      
      // Keep the oldest, delete the rest
      group.slice(1).forEach(duplicate => {
        const docRef = doc(db, COLLECTION_NAME, duplicate.id);
        batch.delete(docRef);
        console.log(`Marking duplicate for deletion: ${duplicate.name} (${duplicate.id})`);
      });
    }
  });

  // Commit the batch
  await batch.commit();
  console.log('Duplicate cleanup completed');
} 