'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { studioAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface PublishDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageId: number;
  imageUrl: string;
  defaultPrompt: string;
  onSuccess?: () => void;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function PublishDialog({
  isOpen,
  onClose,
  imageId,
  imageUrl,
  defaultPrompt,
  onSuccess
}: PublishDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      // Set default title from prompt
      setTitle(defaultPrompt.substring(0, 100));
    }
  }, [isOpen, defaultPrompt]);

  const loadCategories = async () => {
    try {
      const response = await studioAPI.getCategories();
      setCategories(response.data.items);
      if (response.data.items.length > 0) {
        setCategoryId(response.data.items[0].id);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (description && description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const tagArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await studioAPI.publishPost(
        imageId,
        title,
        description,
        categoryId,
        tagArray,
        visibility
      );

      toast.success('Published to community!');
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error('Failed to publish:', error);
      toast.error(error.response?.data?.detail || 'Failed to publish');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setTags('');
    setVisibility('public');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-6 h-6 text-primary-500" />
              Publish to Community
            </h2>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Image Preview */}
            <div className="flex justify-center">
              <img
                src={imageUrl}
                alt="Preview"
                className="max-h-64 rounded-lg shadow-md"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your creation a catchy title..."
                className={errors.title ? 'border-red-500' : ''}
                maxLength={255}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
              <p className="text-slate-500 text-xs mt-1">
                {title.length}/255 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell the community about your creation..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.description ? 'border-red-500' : 'border-slate-300'
                }`}
                rows={4}
                maxLength={1000}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
              <p className="text-slate-500 text-xs mt-1">
                {description.length}/1000 characters
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tags (Optional)
              </label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="art, fantasy, landscape (comma-separated)"
              />
              <p className="text-slate-500 text-xs mt-1">
                Separate tags with commas
              </p>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Visibility
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="public"
                    checked={visibility === 'public'}
                    onChange={(e) => setVisibility(e.target.value as 'public')}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm text-slate-700">Public</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="private"
                    checked={visibility === 'private'}
                    onChange={(e) => setVisibility(e.target.value as 'private')}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm text-slate-700">Private</span>
                </label>
              </div>
              <p className="text-slate-500 text-xs mt-1">
                {visibility === 'public'
                  ? 'Everyone can see this post'
                  : 'Only you can see this post'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Publish
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

