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
      console.log(`Processing tag ${doc.id}:`, {
        raw: data,
        emoji: data.emoji,
        emojiLength: data.emoji?.length,
        emojiCodePoints: Array.from(data.emoji || '').map(c => c.codePointAt(0).toString(16))
      });
      
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
      ...doc.data()
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