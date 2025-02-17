import { adminDb } from '../config/firebase-admin';
import { fileURLToPath } from 'url';
import { Tag } from '../types/admin';

export const updateExistingTags = async () => {
  try {
    console.log('Fetching all tags...');
    const tagsCollection = adminDb.collection('tags');
    const tagsSnapshot = await tagsCollection.get();
    const tags = tagsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`Found ${tags.length} tags. Updating...`);
    
    for (const tag of tags) {
      if ((tag as Tag).active === undefined) {
        console.log(`Updating tag: ${(tag as Tag).name}`);
        const tagRef = tagsCollection.doc(tag.id);
        await tagRef.update({ active: true });
      }
    }
    
    console.log('All tags updated successfully!');
  } catch (error) {
    console.error('Error updating tags:', error);
    throw error;
  }
};

// Run the update if this script is executed directly
if (import.meta.url === fileURLToPath(import.meta.url)) {
  updateExistingTags()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} 