import 'dotenv/config';
import { initializeTags } from '../utils/initializeTags';
import { updateExistingTags } from './updateTags';
import { adminDb } from '../config/firebase-admin';

const initDb = async () => {
  try {
    console.log('Starting database initialization...');
    
    // Initialize tags if needed
    console.log('Initializing tags...');
    await initializeTags();
    
    // Update existing tags to ensure they have the active property
    console.log('Updating existing tags...');
    await updateExistingTags();
    
    // Verify the tags after initialization
    console.log('Verifying tags...');
    const tagsCollection = adminDb.collection('tags');
    const tagsSnapshot = await tagsCollection.get();
    const tags = tagsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Current tags in database:', tags);
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initDb(); 