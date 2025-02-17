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
    
    const tagsCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(tagsCollection);
    
    if (snapshot.empty) {
      console.log('No tags found in the database. Running initialization...');
      try {
        const { initializeTags } = await import('../utils/initializeTags');
        const initializedTags = await initializeTags();
        return initializedTags as Tag[];
      } catch (initError) {
        console.error('Error during tag initialization:', initError);
        throw initError;
      }
    }
    
    const tags = snapshot.docs.map(doc => {
      const data = doc.data();
      const emoji = data.emoji as string || '';
      const emojiPoints = Array.from(emoji).map(c => c.codePointAt(0)?.toString(16) || '');
      
      return {
        id: doc.id,
        name: data.name || '',
        emoji: emoji,
        category: data.category || '',
        active: data.active ?? true,
        emojiCodePoints: emojiPoints
      } as Tag;
    });
    
    return tags;
  } catch (error) {
    console.error('Error fetching tags:', error);
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

export const updateTag = async (id: string, updates: Partial<Tag>): Promise<void> => {
  try {
    console.log('Updating tag:', id, updates);
    if (!db) {
      throw new Error('Firebase database instance is not initialized');
    }
    
    const tagRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(tagRef, {
      ...updates,
      updatedAt: new Date()
    });
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

// New function to clean up broken tags
export const cleanupBrokenTags = async (): Promise<{ fixed: number, total: number }> => {
  try {
    console.log('Starting tag cleanup process...');
    if (!db) {
      throw new Error('Firebase database instance is not initialized');
    }

    // Get all tags
    const tagsCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(tagsCollection);
    const existingTags = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || '',
      emoji: doc.data().emoji || '',
      category: doc.data().category || '',
      active: doc.data().active ?? true
    } as Tag));

    console.log(`Found ${existingTags.length} tags to process`);

    let fixedCount = 0;
    for (const tag of existingTags) {
      try {
        // Check if tag has required fields
        if (!tag.name || !tag.category) {
          console.log(`Found broken tag: ${tag.id}`);
          
          // Try to extract a readable name from the ID
          const formattedId = tag.id.split('-')[0] || tag.id;
          const updatedTag: Partial<Tag> = {
            name: tag.name || `Tag ${formattedId}`,
            category: tag.category || 'style',
            emoji: tag.emoji || '🏷️'  // Default emoji for tags
          };

          console.log(`Fixing tag ${tag.id} with:`, updatedTag);
          
          const tagRef = doc(db, COLLECTION_NAME, tag.id);
          await updateDoc(tagRef, updatedTag);
          fixedCount++;
        }
      } catch (error) {
        console.error(`Error processing tag ${tag.id}:`, error);
        // Continue with other tags even if one fails
        continue;
      }
    }

    console.log(`Tag cleanup complete. Fixed ${fixedCount} of ${existingTags.length} tags`);
    return { fixed: fixedCount, total: existingTags.length };
  } catch (error) {
    console.error('Error during tag cleanup:', error);
    throw error;
  }
};

export const addTag = async (tag: Omit<Tag, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...tag,
    createdAt: new Date(),
    updatedAt: new Date(),
    emojiCodePoints: Array.from(tag.emoji || '').map(c => c.codePointAt(0)?.toString(16))
  });
  return docRef.id;
}; 