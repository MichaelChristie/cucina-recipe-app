import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Tag } from '../types/admin';

const tagsCollection = collection(db, 'tags');

export const getTags = async (): Promise<Tag[]> => {
  const snapshot = await getDocs(tagsCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Tag[];
};

export const createTag = async (tag: Omit<Tag, 'id'>): Promise<void> => {
  await addDoc(tagsCollection, tag);
};

export const updateTag = async (id: string, tag: Omit<Tag, 'id'>): Promise<void> => {
  const tagRef = doc(tagsCollection, id);
  await updateDoc(tagRef, tag);
};

export const deleteTag = async (id: string): Promise<void> => {
  const tagRef = doc(tagsCollection, id);
  await deleteDoc(tagRef);
}; 