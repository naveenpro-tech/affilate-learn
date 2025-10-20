'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import axios from 'axios';
import {
  Sparkles,
  Image as ImageIcon,
  Folder,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';

interface StudioStats {
  total_images: number;
  succeeded_images: number;
  failed_images: number;
  templates: number;
  categories: number;
  recent_generations: any[];
}

interface Category {
  id: number;
  name: string;
  description: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface Template {
  id: number;
  title: string;
  category_id: number;
  prompt_text: string;
  description: string;
  thumbnail_url: string | null;
  is_active: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  category_name: string | null;
}

export default function AdminStudioPage() {
  const [stats, setStats] = useState<StudioStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'templates'>('overview');

  // Category form state
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    display_order: 0,
  });

  // Template form state
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateForm, setTemplateForm] = useState({
    title: '',
    category_id: 1, // Default to first category
    prompt_text: '',
    description: '',
    thumbnail_url: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, categoriesRes, templatesRes] = await Promise.all([
        axios.get('http://localhost:8000/api/admin/studio/stats', { headers }),
        axios.get('http://localhost:8000/api/studio/categories'),
        axios.get('http://localhost:8000/api/studio/templates'),
      ]);

      setStats(statsRes.data);
      setCategories(categoriesRes.data.items || []);
      setTemplates(templatesRes.data.items || []);
    } catch (error: any) {
      console.error('Failed to load studio data:', error);
      toast.error('Failed to load studio data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8000/api/admin/studio/categories',
        categoryForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Category created successfully');
      setShowCategoryForm(false);
      setCategoryForm({ name: '', description: '', display_order: 0 });
      loadData();
    } catch (error: any) {
      console.error('Failed to create category:', error);
      toast.error(error.response?.data?.detail || 'Failed to create category');
    }
  };

  const handleUpdateCategory = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/api/admin/studio/categories/${id}`,
        categoryForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Category updated successfully');
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', display_order: 0 });
      loadData();
    } catch (error: any) {
      console.error('Failed to update category:', error);
      toast.error(error.response?.data?.detail || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this category?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/admin/studio/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Category deactivated successfully');
      loadData();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete category');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/api/admin/studio/upload-thumbnail',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setTemplateForm({ ...templateForm, thumbnail_url: response.data.url });
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateTemplate = async () => {
    // Validation
    if (!templateForm.title || templateForm.title.length < 5) {
      toast.error('Title must be at least 5 characters');
      return;
    }
    if (!templateForm.prompt_text || templateForm.prompt_text.length < 20) {
      toast.error('Prompt must be at least 20 characters');
      return;
    }
    if (!templateForm.category_id || templateForm.category_id === 0) {
      toast.error('Please select a category');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8000/api/admin/studio/templates',
        templateForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Template created successfully');
      setShowTemplateForm(false);
      setTemplateForm({ title: '', category_id: 1, prompt_text: '', description: '', thumbnail_url: '' });
      loadData();
    } catch (error: any) {
      console.error('Failed to create template:', error);
      toast.error(error.response?.data?.detail || 'Failed to create template');
    }
  };

  const handleUpdateTemplate = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/api/admin/studio/templates/${id}`,
        templateForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Template updated successfully');
      setEditingTemplate(null);
      setTemplateForm({ title: '', category_id: 0, prompt_text: '', description: '', thumbnail_url: '' });
      loadData();
    } catch (error: any) {
      console.error('Failed to update template:', error);
      toast.error(error.response?.data?.detail || 'Failed to update template');
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (!confirm('Are you sure you want to deactivate this template?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/admin/studio/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Template deactivated successfully');
      loadData();
    } catch (error: any) {
      console.error('Failed to delete template:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete template');
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      display_order: category.display_order,
    });
  };

  const startEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setTemplateForm({
      title: template.title,
      category_id: template.category_id,
      prompt_text: template.prompt_text,
      description: template.description || '',
      thumbnail_url: template.thumbnail_url || '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-primary-500" />
            Studio Management
          </h1>
          <p className="text-slate-600 mt-2">
            Manage templates, categories, and monitor studio usage
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab('overview')}
            variant={activeTab === 'overview' ? 'default' : 'outline'}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Overview
          </Button>
          <Button
            onClick={() => setActiveTab('categories')}
            variant={activeTab === 'categories' ? 'default' : 'outline'}
          >
            <Folder className="w-4 h-4 mr-2" />
            Categories ({categories.length})
          </Button>
          <Button
            onClick={() => setActiveTab('templates')}
            variant={activeTab === 'templates' ? 'default' : 'outline'}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Templates ({templates.length})
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {stats.total_images}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-green-600">
                  Succeeded
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6" />
                  {stats.succeeded_images}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-red-600">
                  Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 flex items-center gap-2">
                  <XCircle className="w-6 h-6" />
                  {stats.failed_images}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-blue-600">
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.total_images > 0
                    ? Math.round((stats.succeeded_images / stats.total_images) * 100)
                    : 0}
                  %
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Categories</h2>
              <Button onClick={() => setShowCategoryForm(!showCategoryForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            {/* Category Form */}
            {(showCategoryForm || editingCategory) && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingCategory ? 'Edit Category' : 'New Category'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      placeholder="Category name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Input
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      placeholder="Category description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Display Order</label>
                    <Input
                      type="number"
                      value={categoryForm.display_order}
                      onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => editingCategory ? handleUpdateCategory(editingCategory.id) : handleCreateCategory()}
                    >
                      {editingCategory ? 'Update' : 'Create'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCategoryForm(false);
                        setEditingCategory(null);
                        setCategoryForm({ name: '', description: '', display_order: 0 });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Categories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center text-gray-500">
                    <Folder className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No categories yet. Create your first category!</p>
                  </CardContent>
                </Card>
              ) : (
                categories.map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{category.name}</span>
                        {category.is_active ? (
                          <Badge variant="default" className="bg-green-500">
                            <Eye className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">{category.description}</p>
                      <div className="text-xs text-gray-500">
                        Order: {category.display_order}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditCategory(category)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Deactivate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Templates</h2>
              <Button onClick={() => setShowTemplateForm(!showTemplateForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Template
              </Button>
            </div>

            {/* Template Form */}
            {(showTemplateForm || editingTemplate) && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingTemplate ? 'Edit Template' : 'New Template'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Title <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({templateForm.title.length}/255)
                      </span>
                    </label>
                    <Input
                      value={templateForm.title}
                      onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                      placeholder="e.g., Cyberpunk Portrait"
                      maxLength={255}
                      className={templateForm.title.length > 0 && templateForm.title.length < 5 ? 'border-red-500' : ''}
                    />
                    {templateForm.title.length > 0 && templateForm.title.length < 5 && (
                      <p className="text-xs text-red-500 mt-1">Title must be at least 5 characters</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={templateForm.category_id}
                      onChange={(e) => setTemplateForm({ ...templateForm, category_id: parseInt(e.target.value) })}
                      className={`w-full p-2 border rounded-lg ${templateForm.category_id === 0 ? 'border-red-500' : ''}`}
                    >
                      <option value={0}>Select category</option>
                      {categories.filter(c => c.is_active).map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {templateForm.category_id === 0 && (
                      <p className="text-xs text-red-500 mt-1">Please select a category</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Prompt Text <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({templateForm.prompt_text.length}/1000)
                      </span>
                    </label>
                    <textarea
                      value={templateForm.prompt_text}
                      onChange={(e) => setTemplateForm({ ...templateForm, prompt_text: e.target.value })}
                      placeholder="e.g., A futuristic cyberpunk portrait with neon lights, detailed face, high quality, 4k"
                      className={`w-full p-2 border rounded-lg h-24 ${templateForm.prompt_text.length > 0 && templateForm.prompt_text.length < 20 ? 'border-red-500' : ''}`}
                      maxLength={1000}
                    />
                    {templateForm.prompt_text.length > 0 && templateForm.prompt_text.length < 20 && (
                      <p className="text-xs text-red-500 mt-1">Prompt must be at least 20 characters</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description (optional)
                      <span className="text-xs text-gray-500 ml-2">
                        ({templateForm.description.length}/500)
                      </span>
                    </label>
                    <Input
                      value={templateForm.description}
                      onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                      placeholder="Brief description of this template"
                      maxLength={500}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Thumbnail Image (optional)
                    </label>
                    <div className="space-y-2">
                      {templateForm.thumbnail_url && (
                        <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                          <img
                            src={templateForm.thumbnail_url}
                            alt="Thumbnail preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => setTemplateForm({ ...templateForm, thumbnail_url: '' })}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                          <div className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 inline-flex items-center">
                            {uploadingImage ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <ImageIcon className="w-4 h-4 mr-2" />
                                Upload Image
                              </>
                            )}
                          </div>
                        </label>
                        <Input
                          value={templateForm.thumbnail_url}
                          onChange={(e) => setTemplateForm({ ...templateForm, thumbnail_url: e.target.value })}
                          placeholder="Or paste image URL"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Upload an image (max 5MB) or paste a URL
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => editingTemplate ? handleUpdateTemplate(editingTemplate.id) : handleCreateTemplate()}
                      disabled={uploadingImage}
                    >
                      {editingTemplate ? 'Update' : 'Create'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowTemplateForm(false);
                        setEditingTemplate(null);
                        setTemplateForm({ title: '', category_id: 1, prompt_text: '', description: '', thumbnail_url: '' });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Templates List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center text-gray-500">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No templates yet. Create your first template!</p>
                  </CardContent>
                </Card>
              ) : (
                templates.map((template) => (
                  <Card key={template.id} className="overflow-hidden">
                    {template.thumbnail_url && (
                      <div className="relative h-48 bg-gray-100">
                        <img
                          src={template.thumbnail_url.startsWith('http') ? template.thumbnail_url : `http://localhost:8000${template.thumbnail_url}`}
                          alt={template.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="line-clamp-1">{template.title}</span>
                        {template.is_active ? (
                          <Badge variant="default" className="bg-green-500">
                            <Eye className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {template.category_name && (
                        <Badge variant="outline">{template.category_name}</Badge>
                      )}
                      {template.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                      )}
                      <p className="text-xs text-gray-500 italic line-clamp-2">
                        "{template.prompt_text}"
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditTemplate(template)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Deactivate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

