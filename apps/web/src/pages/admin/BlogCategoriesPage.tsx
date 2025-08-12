import React, { useState } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/admin/AdminLayout';
import { useBlogCategories, useCategoryMutations } from '../../hooks/useBlog';
import { CreateBlogCategoryInput } from '../../services/blogService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

const BlogCategoriesPage: React.FC = () => {
  const { t } = useTranslation();
  const { categories, loading, error, refetch } = useBlogCategories();
  const { createCategory, updateCategory, deleteCategory } = useCategoryMutations();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
      } else {
        await createCategory(formData as CreateBlogCategoryInput);
      }
      
      setIsModalOpen(false);
      setEditingCategory(null);
      resetForm();
      refetch();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      color: category.color || '#3B82F6',
    });
    setIsModalOpen(true);
  };

  const [confirm, setConfirm] = useState<{ id?: string; name?: string } | null>(null);
  const handleDelete = async (id: string, name: string) => {
    setConfirm({ id, name });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#3B82F6',
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  return (
    <AdminLayout
      title={t('adminCategories.title')}
      subtitle={t('adminCategories.subtitle')}
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-medium text-gray-900">
              {t('adminCategories.count', { count: categories.length })}
            </h2>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('adminCategories.newCategory')}
          </button>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">{t('loading.loadingCategories')}</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-red-600">{t('errors.loadingCategoriesError')}</p>
            <button
              onClick={refetch}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center">
            <Tag className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-4 text-gray-600">{t('blog.noArticlesFound')}</p>
            <button
              onClick={() => {
                resetForm();
                setEditingCategory(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('adminCategories.createFirst')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center">
                    <div
                      className="mr-3 h-4 w-4 rounded-full"
                      style={{ backgroundColor: category.color || '#3B82F6' }}
                    ></div>
                    <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
                      title={t('common.edit')}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                      title={t('common.delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="mb-2 text-sm text-gray-600">
                  Slug: <code className="rounded bg-gray-100 px-2 py-1 text-xs">{category.slug}</code>
                </p>
                
                {category.description && (
                  <p className="text-sm text-gray-600">{category.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) { setIsModalOpen(false); setEditingCategory(null); resetForm(); } }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? t('adminCategories.editCategory') : t('adminCategories.newCategory')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                    {t('forms.name')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder={t('adminCategories.namePlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="slug" className="mb-2 block text-sm font-medium text-gray-700">
                    Slug *
                  </label>
                  <input
                    type="text"
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder="slug-de-la-categorie"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
                    {t('forms.description')}
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    placeholder={t('adminCategories.descriptionPlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="color" className="mb-2 block text-sm font-medium text-gray-700">
                    {t('adminCategories.color')}
                  </label>
                  <input
                    type="color"
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingCategory(null);
                      resetForm();
                    }}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                  >
                    {editingCategory ? t('common.update') : t('common.create')}
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete confirmation */}
        {confirm && (
          <Dialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('common.delete')}</DialogTitle>
                <DialogDescription>{t('adminCategories.confirmDelete', { name: confirm.name })}</DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <button onClick={() => setConfirm(null)} className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200">
                  {t('common.cancel')}
                </button>
                <button
                  onClick={async () => {
                    if (confirm?.id) {
                      await deleteCategory(confirm.id);
                      setConfirm(null);
                      refetch();
                    }
                  }}
                  className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  {t('common.confirm')}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

export default BlogCategoriesPage; 