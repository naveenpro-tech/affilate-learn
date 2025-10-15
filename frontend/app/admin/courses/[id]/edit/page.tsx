'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminAPI, coursesAPI, packagesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    loadCourseData();
    loadPackages();
  }, [courseId]);

  const loadPackages = async () => {
    try {
      const response = await packagesAPI.getAll();
      setPackages(response.data);
    } catch (error) {
      console.error('Error loading packages:', error);
    }
  };

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getWithModules(courseId);
      setCourse(response.data);
      setModules(response.data.modules || []);
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
      router.push('/admin/courses');
    } finally {
      setLoading(false);
    }
  };

  const addModule = async () => {
    try {
      const response = await adminAPI.createModule({
        course_id: courseId,
        title: 'New Module',
        description: '',
        display_order: modules.length,
        is_published: false,
      });
      toast.success('Module added');
      loadCourseData();
    } catch (error) {
      console.error('Error adding module:', error);
      toast.error('Failed to add module');
    }
  };

  const updateModule = async (moduleId: number, data: any) => {
    try {
      await adminAPI.updateModule(moduleId, data);
      toast.success('Module updated');
      loadCourseData();
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Failed to update module');
    }
  };

  const deleteModule = async (moduleId: number) => {
    if (!confirm('Delete this module and all its topics?')) return;

    try {
      await adminAPI.deleteModule(moduleId);
      toast.success('Module deleted');
      loadCourseData();
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
    }
  };

  const addTopic = async (moduleId: number) => {
    try {
      await adminAPI.createTopic(moduleId, {
        title: 'New Topic',
        description: '',
        video_source_type: 'youtube',
        external_video_url: '',
        duration: 0,
        display_order: 0,
        is_published: false,
      });
      toast.success('Topic added');
      loadCourseData();
    } catch (error) {
      console.error('Error adding topic:', error);
      toast.error('Failed to add topic');
    }
  };

  const updateTopic = async (moduleId: number, topicId: number, data: any) => {
    try {
      await adminAPI.updateTopic(moduleId, topicId, data);
      toast.success('Topic updated');
      loadCourseData();
    } catch (error) {
      console.error('Error updating topic:', error);
      toast.error('Failed to update topic');
    }
  };

  const deleteTopic = async (moduleId: number, topicId: number) => {
    if (!confirm('Delete this topic?')) return;

    try {
      await adminAPI.deleteTopic(moduleId, topicId);
      toast.success('Topic deleted');
      loadCourseData();
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast.error('Failed to delete topic');
    }
  };

  const updateCourse = async () => {
    if (!course.title || !course.description) {
      toast.error('Title and description are required');
      return;
    }

    setSaving(true);
    try {
      await adminAPI.updateCourse(courseId, {
        title: course.title,
        description: course.description,
        is_published: course.is_published,
        package_id: course.package_id,
        individual_price: course.individual_price,
        available_for_individual_purchase: course.available_for_individual_purchase,
      });
      toast.success('Course updated successfully');
      router.push('/admin/courses');
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast.error(error.response?.data?.detail || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <ProtectedRoute requireAdmin>      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Edit Course</h1>
            <p className="text-neutral-600">Update course details, modules, and topics</p>
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
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  placeholder="Course title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  placeholder="Course description"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Package Tier *
                  </label>
                  <select
                    value={course.package_id}
                    onChange={(e) => setCourse({ ...course, package_id: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} - ₹{pkg.final_price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Individual Price (₹)
                  </label>
                  <Input
                    type="number"
                    value={course.individual_price || 199}
                    onChange={(e) => setCourse({ ...course, individual_price: parseFloat(e.target.value) || 199 })}
                    placeholder="199"
                    min="0"
                    step="1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="available_for_individual_purchase"
                    checked={course.available_for_individual_purchase}
                    onChange={(e) => setCourse({ ...course, available_for_individual_purchase: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="available_for_individual_purchase" className="text-sm font-medium text-neutral-700">
                    Available for Individual Purchase
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={course.is_published}
                    onChange={(e) => setCourse({ ...course, is_published: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="is_published" className="text-sm font-medium text-neutral-700">
                    Published
                  </label>
                </div>
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
                  {modules.map((module) => (
                    <EditModuleCard
                      key={module.id}
                      module={module}
                      expanded={expandedModule === module.id}
                      onToggleExpand={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                      onUpdateModule={updateModule}
                      onDeleteModule={deleteModule}
                      onAddTopic={addTopic}
                      onUpdateTopic={updateTopic}
                      onDeleteTopic={deleteTopic}
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
              onClick={updateCourse}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Edit Module Card Component
function EditModuleCard({ module, expanded, onToggleExpand, onUpdateModule, onDeleteModule, onAddTopic, onUpdateTopic, onDeleteTopic }: any) {
  const [editedModule, setEditedModule] = useState(module);

  const handleSaveModule = () => {
    onUpdateModule(module.id, {
      title: editedModule.title,
      description: editedModule.description,
      is_published: editedModule.is_published,
    });
  };

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
              <h3 className="font-semibold text-neutral-900">{module.title}</h3>
              <p className="text-sm text-neutral-500">{module.topics?.length || 0} topics</p>
            </div>
          </div>
          <button
            onClick={() => onDeleteModule(module.id)}
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
              Module Title
            </label>
            <Input
              value={editedModule.title}
              onChange={(e) => setEditedModule({ ...editedModule, title: e.target.value })}
              onBlur={handleSaveModule}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Module Description
            </label>
            <textarea
              value={editedModule.description}
              onChange={(e) => setEditedModule({ ...editedModule, description: e.target.value })}
              onBlur={handleSaveModule}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={editedModule.is_published}
              onChange={(e) => {
                setEditedModule({ ...editedModule, is_published: e.target.checked });
                onUpdateModule(module.id, { is_published: e.target.checked });
              }}
              className="mr-2"
            />
            <label className="text-sm">Published</label>
          </div>

          {/* Topics */}
          <div className="border-t border-neutral-200 pt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-neutral-900">Topics</h4>
              <Button onClick={() => onAddTopic(module.id)} size="sm" variant="outline">
                + Add Topic
              </Button>
            </div>

            {(!module.topics || module.topics.length === 0) ? (
              <p className="text-sm text-neutral-500 text-center py-4">No topics yet</p>
            ) : (
              <div className="space-y-3">
                {module.topics.map((topic: any) => (
                  <EditTopicCard
                    key={topic.id}
                    topic={topic}
                    moduleId={module.id}
                    onUpdateTopic={onUpdateTopic}
                    onDeleteTopic={onDeleteTopic}
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

// Edit Topic Card Component
function EditTopicCard({ topic, moduleId, onUpdateTopic, onDeleteTopic }: any) {
  const [editedTopic, setEditedTopic] = useState(topic);

  const videoSourceIcons: Record<string, string> = {
    cloudinary: '📹',
    youtube: '▶️',
    vimeo: '🎬',
    external: '🔗',
  };

  const handleSaveTopic = () => {
    onUpdateTopic(moduleId, topic.id, {
      title: editedTopic.title,
      description: editedTopic.description,
      video_source_type: editedTopic.video_source_type,
      external_video_url: editedTopic.external_video_url,
      duration: editedTopic.duration,
      is_published: editedTopic.is_published,
    });
  };

  return (
    <div className="border border-neutral-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Input
            value={editedTopic.title}
            onChange={(e) => setEditedTopic({ ...editedTopic, title: e.target.value })}
            onBlur={handleSaveTopic}
            placeholder="Topic title"
            className="mb-2"
          />
          <textarea
            value={editedTopic.description}
            onChange={(e) => setEditedTopic({ ...editedTopic, description: e.target.value })}
            onBlur={handleSaveTopic}
            placeholder="Topic description..."
            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={2}
          />
        </div>
        <button
          onClick={() => onDeleteTopic(moduleId, topic.id)}
          className="ml-3 text-red-600 hover:text-red-800"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Video Source {videoSourceIcons[editedTopic.video_source_type]}
          </label>
          <select
            value={editedTopic.video_source_type}
            onChange={(e) => {
              setEditedTopic({ ...editedTopic, video_source_type: e.target.value });
              onUpdateTopic(moduleId, topic.id, { video_source_type: e.target.value });
            }}
            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="youtube">YouTube</option>
            <option value="vimeo">Vimeo</option>
            <option value="cloudinary">Cloudinary</option>
            <option value="external">External URL</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Duration (seconds)
          </label>
          <Input
            type="number"
            value={editedTopic.duration}
            onChange={(e) => setEditedTopic({ ...editedTopic, duration: parseInt(e.target.value) || 0 })}
            onBlur={handleSaveTopic}
            placeholder="600"
            className="text-sm"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="block text-xs font-medium text-neutral-700 mb-1">
          Video URL
        </label>
        <Input
          value={editedTopic.external_video_url}
          onChange={(e) => setEditedTopic({ ...editedTopic, external_video_url: e.target.value })}
          onBlur={handleSaveTopic}
          placeholder="https://www.youtube.com/watch?v=..."
          className="text-sm"
        />
      </div>

      <div className="mt-3 flex items-center">
        <input
          type="checkbox"
          checked={editedTopic.is_published}
          onChange={(e) => {
            setEditedTopic({ ...editedTopic, is_published: e.target.checked });
            onUpdateTopic(moduleId, topic.id, { is_published: e.target.checked });
          }}
          className="mr-2"
        />
        <label className="text-xs">Published</label>
      </div>
    </div>
  );
}

