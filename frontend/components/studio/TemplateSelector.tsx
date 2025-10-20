'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { studioAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { TemplateGridSkeleton, CategoryTabsSkeleton } from './SkeletonLoaders';
import { NoTemplatesEmpty, ErrorState } from './EmptyStates';

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

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template) => void;
  selectedTemplateId?: number | null;
}

export default function TemplateSelector({ onSelectTemplate, selectedTemplateId }: TemplateSelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load templates when category changes
  useEffect(() => {
    if (selectedCategory !== null) {
      loadTemplates(selectedCategory);
    } else {
      loadTemplates();
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      setError(null);
      const response = await studioAPI.getCategories();
      setCategories(response.data.items || []);
    } catch (error: any) {
      const errorMsg = 'Failed to load categories';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async (categoryId?: number) => {
    setTemplatesLoading(true);
    try {
      setError(null);
      const response = await studioAPI.getTemplates(categoryId);
      setTemplates(response.data.items || []);
    } catch (error: any) {
      const errorMsg = 'Failed to load templates';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: number) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null); // Deselect to show all
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const handleTemplateClick = (template: Template) => {
    onSelectTemplate(template);
    toast.success(`Template "${template.title}" selected`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <CategoryTabsSkeleton />
        <TemplateGridSkeleton count={6} />
      </div>
    );
  }

  if (error) {
    return <ErrorState description={error} onRetry={loadCategories} />;
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedCategory === null
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Templates
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {templatesLoading ? (
        <TemplateGridSkeleton count={6} />
      ) : templates.length === 0 ? (
        <NoTemplatesEmpty onRefresh={() => loadTemplates(selectedCategory || undefined)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleTemplateClick(template)}
                className={`cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-lg ${
                  selectedTemplateId === template.id
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                {/* Template Thumbnail */}
                <div className="aspect-video rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 mb-3 flex items-center justify-center overflow-hidden">
                  {template.thumbnail_url ? (
                    <img
                      src={template.thumbnail_url.startsWith('http') ? template.thumbnail_url : `http://localhost:8000${template.thumbnail_url}`}
                      alt={template.title}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="text-center p-4">
                              <svg class="w-12 h-12 mx-auto text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p class="text-xs text-gray-500">Template Preview</p>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <svg
                        className="w-12 h-12 mx-auto text-blue-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-xs text-gray-500">Template Preview</p>
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {template.title}
                    </h3>
                    {selectedTemplateId === template.id && (
                      <svg
                        className="w-5 h-5 text-blue-600 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>

                  {template.category_name && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {template.category_name}
                    </span>
                  )}

                  {template.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 line-clamp-2 italic">
                    "{template.prompt_text.substring(0, 100)}..."
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

