import { FC, useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { PlusIcon, TrashIcon, PencilIcon, XMarkIcon, SparklesIcon, WrenchIcon } from '@heroicons/react/24/outline';
import { getTags, createTag, updateTag, deleteTag, cleanupBrokenTags } from '../../services/tagService';
import { cleanupInactiveTags } from '../../services/recipeService';
import { toast } from 'react-hot-toast';
import { Tag, TAG_CATEGORIES } from '../../types/admin';

interface NewTag extends Omit<Tag, 'id' | 'createdAt' | 'updatedAt'> {}
interface EditingTag extends Tag {}

const TagManager: FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState<NewTag>({ 
    name: '', 
    emoji: '', 
    category: 'diet', 
    active: true 
  });
  const [editingTag, setEditingTag] = useState<EditingTag | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const fetchedTags = await getTags();
      setTags(fetchedTags);
    } catch (error) {
      toast.error('Failed to load tags');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTag(newTag);
      setNewTag({ name: '', emoji: '', category: 'diet', active: true });
      loadTags();
      toast.success('Tag created successfully');
    } catch (error) {
      toast.error('Failed to create tag');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag) return;
    
    try {
      await updateTag(editingTag.id, editingTag);
      setEditingTag(null);
      setIsModalOpen(false);
      loadTags();
      toast.success('Tag updated successfully');
    } catch (error) {
      toast.error('Failed to update tag');
    }
  };

  const handleDelete = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;
    
    try {
      await deleteTag(tagId);
      loadTags();
      toast.success('Tag deleted successfully');
    } catch (error) {
      toast.error('Failed to delete tag');
    }
  };

  const handleToggleActive = async (tag: Tag) => {
    try {
      await updateTag(tag.id, { active: !tag.active });
      loadTags();
      const { updated, total } = await cleanupInactiveTags();
      toast.success(`Tag ${tag.active ? 'deactivated' : 'activated'} successfully. Updated ${updated} out of ${total} recipes.`);
    } catch (error) {
      toast.error('Failed to update tag status');
    }
  };

  const handleCleanupInactiveTags = async () => {
    try {
      const { updated, total } = await cleanupInactiveTags();
      toast.success(`Updated ${updated} out of ${total} recipes`);
    } catch (error) {
      console.error('Error cleaning up inactive tags:', error);
      toast.error('Failed to clean up inactive tags');
    }
  };

  const handleCleanupBrokenTags = async () => {
    try {
      const { fixed, total } = await cleanupBrokenTags();
      toast.success(`Fixed ${fixed} broken tags out of ${total} total tags`);
      loadTags(); // Reload tags to show updates
    } catch (error) {
      console.error('Error cleaning up broken tags:', error);
      toast.error('Failed to clean up broken tags');
    }
  };

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Tag Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage recipe tags, their categories, and emojis.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-4">
            <button
              type="button"
              onClick={handleCleanupBrokenTags}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-yellow-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 sm:w-auto"
            >
              <WrenchIcon className="-ml-1 mr-2 h-5 w-5" />
              Fix Broken Tags
            </button>
            <button
              type="button"
              onClick={handleCleanupInactiveTags}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:w-auto"
            >
              <SparklesIcon className="-ml-1 mr-2 h-5 w-5" />
              Clean Up Tags
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-tasty-green px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-tasty-green-dark focus:outline-none focus:ring-2 focus:ring-tasty-green focus:ring-offset-2 sm:w-auto"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Tag
            </button>
          </div>
        </div>

        {/* Tag Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TAG_CATEGORIES.map(category => (
            <div key={category} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 capitalize mb-4">
                  {category}
                </h3>
                <div className="space-y-4">
                  {tags
                    .filter(tag => tag.category === category)
                    .map(tag => (
                      <div
                        key={tag.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          tag.active ? 'bg-gray-50' : 'bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{tag.emoji}</span>
                          <span className={`${!tag.active && 'text-gray-500'}`}>
                            {tag.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleActive(tag)}
                            className={`p-1 rounded-full ${
                              tag.active
                                ? 'text-green-600 hover:bg-green-100'
                                : 'text-gray-400 hover:bg-gray-200'
                            }`}
                          >
                            <span className="sr-only">
                              {tag.active ? 'Deactivate' : 'Activate'}
                            </span>
                            {tag.active ? '✓' : '○'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingTag(tag);
                              setIsModalOpen(true);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tag.id)}
                            className="p-1 text-red-400 hover:text-red-500 hover:bg-red-100 rounded-full"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <form onSubmit={editingTag ? handleUpdate : handleSubmit}>
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingTag ? 'Edit Tag' : 'Add New Tag'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingTag(null);
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editingTag ? editingTag.name : newTag.name}
                        onChange={(e) => {
                          if (editingTag) {
                            setEditingTag({ ...editingTag, name: e.target.value });
                          } else {
                            setNewTag({ ...newTag, name: e.target.value });
                          }
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasty-green focus:ring-tasty-green sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Emoji
                      </label>
                      <input
                        type="text"
                        value={editingTag ? editingTag.emoji : newTag.emoji}
                        onChange={(e) => {
                          if (editingTag) {
                            setEditingTag({ ...editingTag, emoji: e.target.value });
                          } else {
                            setNewTag({ ...newTag, emoji: e.target.value });
                          }
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasty-green focus:ring-tasty-green sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <select
                        value={editingTag ? editingTag.category : newTag.category}
                        onChange={(e) => {
                          if (editingTag) {
                            setEditingTag({
                              ...editingTag,
                              category: e.target.value as Tag['category']
                            });
                          } else {
                            setNewTag({
                              ...newTag,
                              category: e.target.value as Tag['category']
                            });
                          }
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-tasty-green focus:ring-tasty-green sm:text-sm"
                      >
                        {TAG_CATEGORIES.map(category => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingTag ? editingTag.active : newTag.active}
                        onChange={(e) => {
                          if (editingTag) {
                            setEditingTag({
                              ...editingTag,
                              active: e.target.checked
                            });
                          } else {
                            setNewTag({ ...newTag, active: e.target.checked });
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-tasty-green focus:ring-tasty-green"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Active
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-tasty-green text-base font-medium text-white hover:bg-tasty-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tasty-green sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingTag ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingTag(null);
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tasty-green sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TagManager; 