'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { useAuthStore } from '@/store/authStore';
import { adminAPI, coursesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Course {
  id: number;
  title: string;
  package_tier: number;
}

interface Module {
  id: number;
  course_id: number;
  title: string;
  description: string;
  display_order: number;
  is_published: boolean;
  topics?: Topic[];
}

interface Topic {
  id: number;
  module_id: number;
  title: string;
  description: string;
  video_source_type: string;
  cloudinary_public_id?: string;
  cloudinary_url?: string;
  external_video_url?: string;
  duration: number;
  display_order: number;
  is_published: boolean;
}

export default function AdminModulesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [moduleFormData, setModuleFormData] = useState({
    title: '',
    description: '',
    display_order: 0,
    is_published: true,
  });
  const [topicFormData, setTopicFormData] = useState({
    title: '',
    description: '',
    video_source_type: 'cloudinary',
    external_video_url: '',
    duration: 0,
    display_order: 0,
    is_published: true,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user?.is_admin) {
      router.push('/dashboard');
      return;
    }
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCourses();
      setCourses(response.data);
    } catch (error: any) {
      console.error('Error loading courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const loadModules = async (courseId: number) => {
    try {
      setLoading(true);
      const response = await coursesAPI.getWithModules(courseId);
      setModules(response.data.modules || []);
    } catch (error: any) {
      console.error('Error loading modules:', error);
      toast.error('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    loadModules(course.id);
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      setLoading(true);
      await adminAPI.createModule({
        course_id: selectedCourse.id,
        ...moduleFormData,
      });
      toast.success('Module created successfully!');
      setIsModuleModalOpen(false);
      setModuleFormData({ title: '', description: '', display_order: 0, is_published: true });
      loadModules(selectedCourse.id);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create module');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;

    try {
      setLoading(true);
      await adminAPI.updateModule(selectedModule.id, moduleFormData);
      toast.success('Module updated successfully!');
      setIsModuleModalOpen(false);
      setSelectedModule(null);
      if (selectedCourse) loadModules(selectedCourse.id);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update module');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm('Are you sure you want to delete this module? All topics will be deleted.')) return;

    try {
      setLoading(true);
      await adminAPI.deleteModule(moduleId);
      toast.success('Module deleted successfully!');
      if (selectedCourse) loadModules(selectedCourse.id);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete module');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;

    try {
      setLoading(true);

      if (topicFormData.video_source_type === 'cloudinary' && videoFile) {
        // Upload video
        const formData = new FormData();
        formData.append('file', videoFile);
        formData.append('title', topicFormData.title);
        formData.append('description', topicFormData.description);
        formData.append('display_order', topicFormData.display_order.toString());
        formData.append('is_published', topicFormData.is_published.toString());
        if (topicFormData.duration) formData.append('duration', topicFormData.duration.toString());

        await adminAPI.uploadTopicVideo(selectedModule.id, formData);
      } else {
        // Create topic with external URL
        await adminAPI.createTopic(selectedModule.id, {
          ...topicFormData,
          module_id: selectedModule.id,
        });
      }

      toast.success('Topic created successfully!');
      setIsTopicModalOpen(false);
      setTopicFormData({
        title: '',
        description: '',
        video_source_type: 'cloudinary',
        external_video_url: '',
        duration: 0,
        display_order: 0,
        is_published: true,
      });
      setVideoFile(null);
      if (selectedCourse) loadModules(selectedCourse.id);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create topic');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTopic = async (moduleId: number, topicId: number) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;

    try {
      setLoading(true);
      await adminAPI.deleteTopic(moduleId, topicId);
      toast.success('Topic deleted successfully!');
      if (selectedCourse) loadModules(selectedCourse.id);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete topic');
    } finally {
      setLoading(false);
    }
  };

  const openEditModuleModal = (module: Module) => {
    setSelectedModule(module);
    setModuleFormData({
      title: module.title,
      description: module.description,
      display_order: module.display_order,
      is_published: module.is_published,
    });
    setIsModuleModalOpen(true);
  };

  const openCreateModuleModal = () => {
    setSelectedModule(null);
    setModuleFormData({ title: '', description: '', display_order: modules.length + 1, is_published: true });
    setIsModuleModalOpen(true);
  };

  const openCreateTopicModal = (module: Module) => {
    setSelectedModule(module);
    setTopicFormData({
      title: '',
      description: '',
      video_source_type: 'cloudinary',
      external_video_url: '',
      duration: 0,
      display_order: (module.topics?.length || 0) + 1,
      is_published: true,
    });
    setIsTopicModalOpen(true);
  };

  if (!user?.is_admin) {
    return null;
  }

  return (
    <ProtectedRoute requireAdmin>      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Manage Modules & Topics</h1>
            <p className="text-neutral-600">Create and organize course content hierarchy</p>
          </motion.div>

          {/* Course Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Select Course</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => handleCourseSelect(course)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedCourse?.id === course.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-neutral-200 hover:border-primary-300'
                      }`}
                    >
                      <h3 className="font-semibold text-neutral-900">{course.title}</h3>
                      <Badge className="mt-2">
                        {course.package_tier === 1 ? 'Silver' : course.package_tier === 2 ? 'Gold' : 'Platinum'}
                      </Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Modules List */}
          {selectedCourse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Modules for {selectedCourse.title}</CardTitle>
                    <Button onClick={openCreateModuleModal}>+ Add Module</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                  ) : modules.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📚</div>
                      <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Modules Yet</h3>
                      <p className="text-neutral-600 mb-6">Create your first module to organize course content</p>
                      <Button onClick={openCreateModuleModal}>Create Module</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {modules.map((module, index) => (
                        <div key={module.id} className="border border-neutral-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-neutral-500">Module {index + 1}</span>
                                <Badge variant={module.is_published ? 'success' : 'secondary'}>
                                  {module.is_published ? 'Published' : 'Draft'}
                                </Badge>
                              </div>
                              <h3 className="text-lg font-semibold text-neutral-900">{module.title}</h3>
                              <p className="text-sm text-neutral-600 mt-1">{module.description}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => openEditModuleModal(module)}>
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => openCreateTopicModal(module)}>
                                + Topic
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteModule(module.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>

                          {/* Topics */}
                          {module.topics && module.topics.length > 0 && (
                            <div className="mt-4 pl-4 border-l-2 border-neutral-200 space-y-2">
                              {module.topics.map((topic, topicIndex) => (
                                <div key={topic.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-neutral-500">Topic {topicIndex + 1}</span>
                                      <Badge size="sm">{topic.video_source_type}</Badge>
                                      {topic.is_published && <Badge size="sm" variant="success">Published</Badge>}
                                    </div>
                                    <h4 className="font-medium text-neutral-900 mt-1">{topic.title}</h4>
                                    <p className="text-xs text-neutral-600 mt-1">{topic.description}</p>
                                    {topic.duration > 0 && (
                                      <span className="text-xs text-neutral-500">Duration: {Math.floor(topic.duration / 60)}m {topic.duration % 60}s</span>
                                    )}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:bg-red-50"
                                    onClick={() => handleDeleteTopic(module.id, topic.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Module Modal */}
      <Dialog open={isModuleModalOpen} onOpenChange={setIsModuleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedModule ? 'Edit Module' : 'Create Module'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={selectedModule ? handleUpdateModule : handleCreateModule} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
              <Input
                type="text"
                value={moduleFormData.title}
                onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                value={moduleFormData.description}
                onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Display Order</label>
              <Input
                type="number"
                value={moduleFormData.display_order}
                onChange={(e) => setModuleFormData({ ...moduleFormData, display_order: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="module-published"
                checked={moduleFormData.is_published}
                onChange={(e) => setModuleFormData({ ...moduleFormData, is_published: e.target.checked })}
              />
              <label htmlFor="module-published" className="text-sm font-medium text-neutral-700">Published</label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsModuleModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : selectedModule ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Topic Modal */}
      <Dialog open={isTopicModalOpen} onOpenChange={setIsTopicModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Topic</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTopic} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
              <Input
                type="text"
                value={topicFormData.title}
                onChange={(e) => setTopicFormData({ ...topicFormData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={2}
                value={topicFormData.description}
                onChange={(e) => setTopicFormData({ ...topicFormData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Video Source Type</label>
              <select
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={topicFormData.video_source_type}
                onChange={(e) => setTopicFormData({ ...topicFormData, video_source_type: e.target.value })}
              >
                <option value="cloudinary">Cloudinary (Upload)</option>
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="external">External URL</option>
              </select>
            </div>

            {topicFormData.video_source_type === 'cloudinary' ? (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Upload Video</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Video URL</label>
                <Input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={topicFormData.external_video_url}
                  onChange={(e) => setTopicFormData({ ...topicFormData, external_video_url: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Duration (seconds)</label>
                <Input
                  type="number"
                  value={topicFormData.duration}
                  onChange={(e) => setTopicFormData({ ...topicFormData, duration: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Display Order</label>
                <Input
                  type="number"
                  value={topicFormData.display_order}
                  onChange={(e) => setTopicFormData({ ...topicFormData, display_order: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="topic-published"
                checked={topicFormData.is_published}
                onChange={(e) => setTopicFormData({ ...topicFormData, is_published: e.target.checked })}
              />
              <label htmlFor="topic-published" className="text-sm font-medium text-neutral-700">Published</label>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsTopicModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Topic'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}

