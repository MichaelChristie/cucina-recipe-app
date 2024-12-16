import { FC, useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { PlusIcon, TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getTags, createTag, updateTag, deleteTag } from '../../services/tagService';
import { toast } from 'react-hot-toast';
import { Tag } from '../../types/admin';

interface NewTag extends Omit<Tag, 'id'> {}

interface EditingTag extends Tag {}

const TagManager: FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState<NewTag>({ name: '', emoji: '', category: '' });
  const [editingTag, setEditingTag] = useState<EditingTag | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async (): Promise<void> => {
    try {
      const fetchedTags = await getTags();
      setTags(fetchedTags as Tag[]);
    } catch (error) {
      toast.error('Failed to load tags');
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      await createTag(newTag);
      setNewTag({ name: '', emoji: '', category: '' });
      loadTags();
      toast.success('Tag created successfully');
    } catch (error) {
      toast.error('Failed to create tag');
    }
  };

  const handleDelete = async (tagId: string): Promise<void> => {
    try {
      await deleteTag(tagId);
      loadTags();
      toast.success('Tag deleted successfully');
    } catch (error) {
      toast.error('Failed to delete tag');
    }
  };

  const handleEdit = (tag: Tag): void => {
    setEditingTag({ ...tag });
    setIsModalOpen(true);
  };

  const handleSaveEdit = async (): Promise<void> => {
    if (!editingTag) return;
    
    try {
      await updateTag(editingTag.id, editingTag);
      setIsModalOpen(false);
      setEditingTag(null);
      loadTags();
      toast.success('Tag updated successfully');
    } catch (error) {
      toast.error('Failed to update tag');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Manage Tags</h1>

        {/* Add new tag form */}
        <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Emoji</label>
              <input
                type="text"
                value={newTag.emoji}
                onChange={(e) => setNewTag({ ...newTag, emoji: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={newTag.category}
                onChange={(e) => setNewTag({ ...newTag, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select category</option>
                <option value="cuisine">Cuisine</option>
                <option value="meal">Meal Type</option>
                <option value="diet">Dietary</option>
                <option value="style">Style</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5" />
            Add Tag
          </button>
        </form>

        {/* Tags list */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emoji</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tags.map((tag) => (
                <tr key={tag.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-2xl">{tag.emoji}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{tag.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">{tag.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(tag)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {isModalOpen && editingTag && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Tag</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={editingTag.name}
                    onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Emoji</label>
                  <input
                    type="text"
                    value={editingTag.emoji}
                    onChange={(e) => setEditingTag({ ...editingTag, emoji: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={editingTag.category}
                    onChange={(e) => setEditingTag({ ...editingTag, category: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="cuisine">Cuisine</option>
                    <option value="meal">Meal Type</option>
                    <option value="diet">Dietary</option>
                    <option value="style">Style</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TagManager; 