import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Tag } from '../types/admin';

const COLLECTION_NAME = 'tags';

export const getTags = async (): Promise<Tag[]> => {
  try {
    console.log('Fetching tags from Firebase...');
    if (!db) {
      throw new Error('Firebase database instance is not initialized');
    }
    console.log('Database instance:', db);
    
    const tagsCollection = collection(db, COLLECTION_NAME);
    console.log('Tags collection reference:', tagsCollection);
    
    const snapshot = await getDocs(tagsCollection);
    console.log('Snapshot exists:', !snapshot.empty);
    console.log('Number of documents:', snapshot.size);
    console.log('Raw tags data:', snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    
    if (snapshot.empty) {
      console.log('No tags found in the database. Running initialization...');
      try {
        // Re-run initialization if no tags exist
        const { initializeTags } = await import('../utils/initializeTags');
        const initializedTags = await initializeTags();
        console.log('Tags initialized successfully:', initializedTags);
        return initializedTags;
      } catch (initError) {
        console.error('Error during tag initialization:', initError);
        throw initError;
      }
    }
    
    const tags = snapshot.docs.map(doc => {
      const data = doc.data();
      const tag = {
        id: doc.id,
        ...data,
        active: data.active ?? true
      } as Tag;
      console.log('Processed tag:', tag);
      return tag;
    });
    
    console.log('Final tags array:', tags);
    return tags;
  } catch (error) {
    console.error('Error fetching tags:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

export const createTag = async (tag: Omit<Tag, 'id'>): Promise<Tag> => {
  try {
    console.log('Creating new tag:', tag);
    if (!db) {
      throw new Error('Firebase database instance is not initialized');
    }
    
    const tagWithActive = {
      ...tag,
      active: tag.active ?? true
    };
    
    const tagsCollection = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(tagsCollection, tagWithActive);
    const createdTag = { id: docRef.id, ...tagWithActive };
    console.log('Created tag:', createdTag);
    return createdTag;
  } catch (error) {
    console.error('Error creating tag:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

export const updateTag = async (id: string, tag: Partial<Tag>): Promise<void> => {
  try {
    console.log('Updating tag:', id, tag);
    if (!db) {
      throw new Error('Firebase database instance is not initialized');
    }
    
    const tagRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(tagRef, tag);
  } catch (error) {
    console.error('Error updating tag:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

export const deleteTag = async (id: string): Promise<void> => {
  try {
    console.log('Deleting tag:', id);
    if (!db) {
      throw new Error('Firebase database instance is not initialized');
    }
    
    const tagRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(tagRef);
  } catch (error) {
    console.error('Error deleting tag:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}; 