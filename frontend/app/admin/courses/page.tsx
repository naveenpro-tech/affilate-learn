'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { adminAPI, packagesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  package_id: number;
  package_name?: string;
  is_published: boolean;
  created_at: string;
  video_count?: number;
}

interface Package {
  id: number;
  name: string;
  price: number;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPackage, setFilterPackage] = useState<string>('all');

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    package_id: 1,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, packagesRes] = await Promise.all([
        adminAPI.getCourses(),
        packagesAPI.getAll()
      ]);
      setCourses(coursesRes.data);
      setPackages(packagesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!formData.title || !formData.slug || !formData.description) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await adminAPI.createCourse(formData);
      toast.success('Course created successfully');
      setIsCreateDialogOpen(false);
      setFormData({ title: '', slug: '', description: '', package_id: 1 });
      loadData();
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast.error(error.response?.data?.detail || 'Failed to create course');
    }
  };

  const handleUpdateCourse = async () => {
    if (!selectedCourse || !formData.title) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      // Only send fields that can be updated
      const updateData: any = {};
      if (formData.title) updateData.title = formData.title;
      if (formData.description) updateData.description = formData.description;

      await adminAPI.updateCourse(selectedCourse.id, updateData);
      toast.success('Course updated successfully');
      setIsEditDialogOpen(false);
      setSelectedCourse(null);
      setFormData({ title: '', slug: '', description: '', package_id: 1 });
      loadData();
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast.error(error.response?.data?.detail || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    try {
      await adminAPI.deleteCourse(selectedCourse.id);
      toast.success('Course deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedCourse(null);
      loadData();
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete course');
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      await adminAPI.updateCourse(course.id, {
        is_published: !course.is_published,
      });
      toast.success(`Course ${!course.is_published ? 'published' : 'unpublished'} successfully`);
      loadData();
    } catch (error: any) {
      console.error('Error toggling publish status:', error);
      toast.error(error.response?.data?.detail || 'Failed to update course status');
    }
  };

  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description || '',
      package_id: course.package_id,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPackage = filterPackage === 'all' || course.package_id.toString() === filterPackage;
    return matchesSearch && matchesPackage;
  });

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-neutral-900 mb-2">Course Management</h1>
                <p className="text-neutral-600">Create and manage platform courses</p>
              </div>
              <Button onClick={() => router.push('/admin/courses/new')}>
                + Create Course with Modules
              </Button>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select
                    value={filterPackage}
                    onChange={(e) => setFilterPackage(e.target.value)}
                    className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Packages</option>
                    {packages.map(pkg => (
                      <option key={pkg.id} value={pkg.id.toString()}>{pkg.name}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Courses Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Card className="h-full hover:shadow-medium transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={(course.package_name?.toLowerCase() || 'default') as any}>
                          {course.package_name?.toUpperCase() || 'N/A'}
                        </Badge>
                        <Badge variant={course.is_published ? 'success' : 'warning'}>
                          {course.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
                        {course.description || 'No description'}
                      </p>
                      <div className="text-xs text-neutral-500 mb-2">
                        {course.video_count || 0} videos
                      </div>
                      <div className="text-xs text-neutral-500 mb-4">
                        Created: {new Date(course.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePublish(course)}
                          className="flex-1"
                        >
                          {course.is_published ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(course)}
                          className="text-danger-600 hover:bg-danger-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-neutral-500 text-lg">No courses found</p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                  Create Your First Course
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Create Course Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>Add a new course to the platform</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Title *</label>
              <Input
                placeholder="Course title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Slug *</label>
              <Input
                placeholder="course-slug (URL-friendly)"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Description *</label>
              <textarea
                placeholder="Course description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Package *</label>
              <select
                value={formData.package_id}
                onChange={(e) => setFormData({ ...formData, package_id: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {packages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>{pkg.name} - ₹{pkg.price}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCourse}>Create Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update course details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
              <Input
                placeholder="Course title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Slug (read-only)</label>
              <Input
                placeholder="course-slug"
                value={formData.slug}
                disabled
                className="bg-neutral-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
              <textarea
                placeholder="Course description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Package (read-only)</label>
              <select
                value={formData.package_id}
                disabled
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-100"
              >
                {packages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCourse}>Update Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedCourse?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeleteCourse} className="bg-danger-600 hover:bg-danger-700">
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}

