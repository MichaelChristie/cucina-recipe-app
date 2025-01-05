import { adminDb } from '../config/firebase-admin';
import { Tag, DEFAULT_TAGS } from '../types/admin';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const initializeTags = async () => {
  try {
    console.log('Starting tag initialization...');
    console.log('Checking for existing tags...');
    const tagsCollection = adminDb.collection('tags');
    const existingTagsSnapshot = await tagsCollection.get();
    const existingTags = existingTagsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Existing tags count:', existingTags.length);
    
    if (existingTags.length === 0) {
      console.log('No tags found. Initializing default tags...');
      console.log('Default tags to create:', DEFAULT_TAGS);
      
      const createdTags: Tag[] = [];
      
      for (const tag of DEFAULT_TAGS) {
        try {
          console.log('Creating tag:', tag);
          const docRef = await tagsCollection.add({
            ...tag,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          const createdTag = { id: docRef.id, ...tag } as Tag;
          console.log('Successfully created tag:', createdTag);
          createdTags.push(createdTag);
          // Add a small delay between creations to avoid overwhelming Firestore
          await delay(500);
        } catch (error) {
          console.error('Error creating tag:', tag, error);
          // Continue with other tags even if one fails
          continue;
        }
      }
      
      // Wait a moment before verification
      await delay(1000);
      
      // Verify tags were created
      const verifyTagsSnapshot = await tagsCollection.get();
      const verifyTags = verifyTagsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Verification - Number of tags in database:', verifyTags.length);
      console.log('Verification - Tags in database:', verifyTags);
      
      if (verifyTags.length === 0) {
        throw new Error('Tags were not created successfully. Database is still empty.');
      }
      
      if (verifyTags.length !== DEFAULT_TAGS.length) {
        console.warn(`Warning: Only ${verifyTags.length} out of ${DEFAULT_TAGS.length} tags were created.`);
      }
      
      console.log('Default tags initialized successfully!');
      return verifyTags;
    } else {
      console.log('Tags already exist in the database:', existingTags);
      console.log('Skipping initialization.');
      return existingTags;
    }
  } catch (error) {
    console.error('Error in tag initialization:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}; 