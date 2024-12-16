import { Tag } from '../types/admin';

export function getTags(): Promise<Tag[]>;
export function createTag(tag: Omit<Tag, 'id'>): Promise<void>;
export function updateTag(id: string, tag: Partial<Tag>): Promise<void>;
export function deleteTag(id: string): Promise<void>; 