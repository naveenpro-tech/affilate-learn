'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adminAPI, packagesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Module {
  tempId: string;
  title: string;
  description: string;
  display_order: number;
  is_published: boolean;
  topics: Topic[];
}

interface Topic {
  tempId: string;
  title: string;
  description: string;
  video_source_type: 'cloudinary' | 'youtube' | 'vimeo' | 'external';
  external_video_url: string;
  video_file?: File;
  duration: number;
  display_order: number;
  is_published: boolean;
}

interface Package {
  id: number;
  name: string;
  price: number;
}

export default function CreateCoursePage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [saving, setSaving] = useState(false);

  // Course data
  const [courseData, setCourseData] = useState({
    title: '',
    slug: '',
    description: '',
    package_id: 1,
    individual_price: 199,
    available_for_individual_purchase: true,
    is_published: false,
  });

  // Modules and topics
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const response = await packagesAPI.getAll();
      setPackages(response.data);
    } catch (error) {
      console.error('Error loading packages:', error);
      toast.error('Failed to load packages');
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setCourseData({
      ...courseData,
      title,
      slug: generateSlug(title),
    });
  };

  const addModule = () => {
    const newModule: Module = {
      tempId: `module-${Date.now()}`,
      title: '',
      description: '',
      display_order: modules.length,
      is_published: true,
      topics: [],
    };
    setModules([...modules, newModule]);
    setExpandedModule(newModule.tempId);
  };

  const updateModule = (tempId: string, field: keyof Module, value: any) => {
    setModules(modules.map(m =>
      m.tempId === tempId ? { ...m, [field]: value } : m
    ));
  };

  const deleteModule = (tempId: string) => {
    setModules(modules.filter(m => m.tempId !== tempId));
  };

  const addTopic = (moduleTempId: string) => {
    const newTopic: Topic = {
      tempId: `topic-${Date.now()}`,
      title: '',
      description: '',
      video_source_type: 'youtube',
      external_video_url: '',
      duration: 0,
      display_order: 0,
      is_published: true,
    };

    setModules(modules.map(m => {
      if (m.tempId === moduleTempId) {
        return {
          ...m,
          topics: [...m.topics, { ...newTopic, display_order: m.topics.length }],
        };
      }
      return m;
    }));
  };

  const updateTopic = (moduleTempId: string, topicTempId: string, field: keyof Topic, value: any) => {
    setModules(modules.map(m => {
      if (m.tempId === moduleTempId) {
        return {
          ...m,
          topics: m.topics.map(t =>
            t.tempId === topicTempId ? { ...t, [field]: value } : t
          ),
        };
      }
      return m;
    }));
  };

  const deleteTopic = (moduleTempId: string, topicTempId: string) => {
    setModules(modules.map(m => {
      if (m.tempId === moduleTempId) {
        return {
          ...m,
          topics: m.topics.filter(t => t.tempId !== topicTempId),
        };
      }
      return m;
    }));
  };

  const handleVideoFileChange = (moduleTempId: string, topicTempId: string, file: File) => {
    setModules(modules.map(m => {
      if (m.tempId === moduleTempId) {
        return {
          ...m,
          topics: m.topics.map(t =>
            t.tempId === topicTempId ? { ...t, video_file: file } : t
          ),
        };
      }
      return m;
    }));
  };

  const validateCourse = () => {
    if (!courseData.title.trim()) {
      toast.error('Course title is required');
      return false;
    }
    if (!courseData.description.trim()) {
      toast.error('Course description is required');
      return false;
    }
    return true;
  };

  const handleSaveCourse = async () => {
    if (!validateCourse()) return;

    setSaving(true);
    try {
      // Step 1: Create the course
      const courseResponse = await adminAPI.createCourse(courseData);
      const courseId = courseResponse.data.id;
      toast.success('Course created!');

      // Step 2: Create modules and topics
      for (const module of modules) {
        if (!module.title.trim()) continue;

        const moduleResponse = await adminAPI.createModule({
          course_id: courseId,
          title: module.title,
          description: module.description,
          display_order: module.display_order,
          is_published: module.is_published,
        });
        const moduleId = moduleResponse.data.id;

        // Step 3: Create topics for this module
        for (const topic of module.topics) {
          if (!topic.title.trim()) continue;

          if (topic.video_source_type === 'cloudinary' && topic.video_file) {
            // Upload video file
            const formData = new FormData();
            formData.append('video', topic.video_file);
            formData.append('title', topic.title);
            formData.append('description', topic.description || '');
            formData.append('duration', topic.duration.toString());
            formData.append('display_order', topic.display_order.toString());
            formData.append('is_published', topic.is_published.toString());

            await adminAPI.uploadTopicVideo(moduleId, formData);
          } else {
            // Create topic with external URL
            await adminAPI.createTopic(moduleId, {
              module_id: moduleId,  // Add module_id to fix 422 error
              title: topic.title,
              description: topic.description,
              video_source_type: topic.video_source_type,
              external_video_url: topic.external_video_url,
              duration: topic.duration,
              display_order: topic.display_order,
              is_published: topic.is_published,
            });
          }
        }
      }

      toast.success('Course with modules and topics created successfully!');
      router.push('/admin/courses');
    } catch (error: any) {
      console.error('Error saving course:', error);

      // Handle validation errors (422) properly
      if (error.response?.status === 422 && error.response?.data?.detail) {
        const detail = error.response.data.detail;

        // If detail is an array of validation errors, format them
        if (Array.isArray(detail)) {
          const errorMessages = detail.map((err: any) => {
            const field = err.loc?.join('.') || 'field';
            return `${field}: ${err.msg}`;
          }).join(', ');
          toast.error(`Validation error: ${errorMessages}`);
        } else if (typeof detail === 'string') {
          toast.error(detail);
        } else {
          toast.error('Validation error occurred');
        }
      } else {
        toast.error(error.response?.data?.detail || error.message || 'Failed to save course');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute requireAdmin>      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Create New Course</h1>
            <p className="text-neutral-600">Add course details, modules, and topics all in one place</p>
          </div>

          {/* Course Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Course Title *
                </label>
                <Input
                  value={courseData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g., Digital Marketing Mastery"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Slug (auto-generated)
                </label>
                <Input
                  value={courseData.slug}
                  onChange={(e) => setCourseData({ ...courseData, slug: e.target.value })}
                  placeholder="digital-marketing-mastery"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={courseData.description}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                  placeholder="Describe what students will learn..."
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Package Tier *
                </label>
                <select
                  value={courseData.package_id}
                  onChange={(e) => setCourseData({ ...courseData, package_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>{pkg.name} - ₹{pkg.price}</option>
                  ))}
                </select>
                <p className="text-xs text-neutral-500 mt-1">
                  Users with this package tier will have access to this course
                </p>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="available_for_individual_purchase"
                    checked={courseData.available_for_individual_purchase}
                    onChange={(e) => setCourseData({ ...courseData, available_for_individual_purchase: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="available_for_individual_purchase" className="text-sm font-medium text-neutral-700">
                    Available for individual purchase
                  </label>
                </div>

                {courseData.available_for_individual_purchase && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Individual Purchase Price (₹)
                    </label>
                    <Input
                      type="number"
                      value={courseData.individual_price}
                      onChange={(e) => setCourseData({ ...courseData, individual_price: parseFloat(e.target.value) || 0 })}
                      placeholder="199"
                      min="0"
                      step="1"
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      Users can purchase this course individually for this price
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={courseData.is_published}
                  onChange={(e) => setCourseData({ ...courseData, is_published: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_published" className="text-sm font-medium text-neutral-700">
                  Publish course immediately
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Modules Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Modules & Topics</CardTitle>
                <Button onClick={addModule} size="sm">+ Add Module</Button>
              </div>
            </CardHeader>
            <CardContent>
              {modules.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <p>No modules yet. Click "Add Module" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((module, moduleIndex) => (
                    <ModuleCard
                      key={module.tempId}
                      module={module}
                      moduleIndex={moduleIndex}
                      expanded={expandedModule === module.tempId}
                      onToggleExpand={() => setExpandedModule(expandedModule === module.tempId ? null : module.tempId)}
                      onUpdateModule={updateModule}
                      onDeleteModule={deleteModule}
                      onAddTopic={addTopic}
                      onUpdateTopic={updateTopic}
                      onDeleteTopic={deleteTopic}
                      onVideoFileChange={handleVideoFileChange}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/admin/courses')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCourse}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Course'}
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Module Card Component
function ModuleCard({ module, moduleIndex, expanded, onToggleExpand, onUpdateModule, onDeleteModule, onAddTopic, onUpdateTopic, onDeleteTopic, onVideoFileChange }: any) {
  return (
    <div className="border border-neutral-300 rounded-lg overflow-hidden">
      {/* Module Header */}
      <div className="bg-neutral-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <button
              onClick={onToggleExpand}
              className="text-neutral-600 hover:text-neutral-900"
            >
              {expanded ? '▼' : '▶'}
            </button>
            <div className="flex-1">
              <Input
                value={module.title}
                onChange={(e) => onUpdateModule(module.tempId, 'title', e.target.value)}
                placeholder={`Module ${moduleIndex + 1} Title`}
                className="font-semibold"
              />
            </div>
            <span className="text-sm text-neutral-500">{module.topics.length} topics</span>
          </div>
          <button
            onClick={() => onDeleteModule(module.tempId)}
            className="ml-4 text-red-600 hover:text-red-800"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Module Content (Expanded) */}
      {expanded && (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Module Description
            </label>
            <textarea
              value={module.description}
              onChange={(e) => onUpdateModule(module.tempId, 'description', e.target.value)}
              placeholder="Describe what this module covers..."
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={module.is_published}
                onChange={(e) => onUpdateModule(module.tempId, 'is_published', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Published</span>
            </label>
          </div>

          {/* Topics */}
          <div className="border-t border-neutral-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-neutral-900">Topics</h4>
              <Button onClick={() => onAddTopic(module.tempId)} size="sm" variant="outline">
                + Add Topic
              </Button>
            </div>

            {module.topics.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-4">No topics yet</p>
            ) : (
              <div className="space-y-3">
                {module.topics.map((topic: Topic, topicIndex: number) => (
                  <TopicCard
                    key={topic.tempId}
                    topic={topic}
                    topicIndex={topicIndex}
                    moduleTempId={module.tempId}
                    onUpdateTopic={onUpdateTopic}
                    onDeleteTopic={onDeleteTopic}
                    onVideoFileChange={onVideoFileChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Topic Card Component
function TopicCard({ topic, topicIndex, moduleTempId, onUpdateTopic, onDeleteTopic, onVideoFileChange }: any) {
  const videoSourceIcons: Record<string, string> = {
    cloudinary: '📹',
    youtube: '▶️',
    vimeo: '🎬',
    external: '🔗',
  };

  return (
    <div className="border border-neutral-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Input
            value={topic.title}
            onChange={(e) => onUpdateTopic(moduleTempId, topic.tempId, 'title', e.target.value)}
            placeholder={`Topic ${topicIndex + 1} Title`}
            className="mb-2"
          />
          <textarea
            value={topic.description}
            onChange={(e) => onUpdateTopic(moduleTempId, topic.tempId, 'description', e.target.value)}
            placeholder="Topic description..."
            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={2}
          />
        </div>
        <button
          onClick={() => onDeleteTopic(moduleTempId, topic.tempId)}
          className="ml-3 text-red-600 hover:text-red-800"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Video Source {videoSourceIcons[topic.video_source_type]}
          </label>
          <select
            value={topic.video_source_type}
            onChange={(e) => onUpdateTopic(moduleTempId, topic.tempId, 'video_source_type', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
            <option value="cloudinary">Upload Video</option>
            <option value="external">External URL</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Duration (seconds)
          </label>
          <Input
            type="number"
            value={topic.duration}
            onChange={(e) => onUpdateTopic(moduleTempId, topic.tempId, 'duration', parseInt(e.target.value) || 0)}
            placeholder="600"
            className="text-sm"
          />
        </div>
      </div>

      {topic.video_source_type === 'cloudinary' ? (
        <div className="mt-3">
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Upload Video File
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onVideoFileChange(moduleTempId, topic.tempId, file);
            }}
            className="w-full text-sm"
          />
          {topic.video_file && (
            <p className="text-xs text-green-600 mt-1">✓ {topic.video_file.name}</p>
          )}
        </div>
      ) : (
        <div className="mt-3">
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Video URL
          </label>
          <Input
            value={topic.external_video_url}
            onChange={(e) => onUpdateTopic(moduleTempId, topic.tempId, 'external_video_url', e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="text-sm"
          />
        </div>
      )}

      <div className="mt-3 flex items-center">
        <input
          type="checkbox"
          checked={topic.is_published}
          onChange={(e) => onUpdateTopic(moduleTempId, topic.tempId, 'is_published', e.target.checked)}
          className="mr-2"
        />
        <label className="text-xs">Published</label>
      </div>
    </div>
  );
}

