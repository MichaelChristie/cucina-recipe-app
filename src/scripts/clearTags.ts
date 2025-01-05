import 'dotenv/config';
import { adminDb } from '../config/firebase-admin';
import { fileURLToPath } from 'url';

const clearTags = async () => {
  try {
    console.log('Starting tag cleanup...');
    const tagsCollection = adminDb.collection('tags');
    const tagsSnapshot = await tagsCollection.get();
    
    console.log(`Found ${tagsSnapshot.size} tags to delete.`);
    
    const batch = adminDb.batch();
    tagsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('All tags deleted successfully!');
  } catch (error) {
    console.error('Error clearing tags:', error);
    process.exit(1);
  }
};

// Run the cleanup if this script is executed directly
if (import.meta.url === fileURLToPath(import.meta.url)) {
  clearTags()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
} 