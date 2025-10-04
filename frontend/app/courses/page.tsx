'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { coursesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Course {
  id: number;
  title: string;
  description: string;
  package_tier: string;
  package_name: string;
  thumbnail_url?: string;
  video_count: number;
  is_published: boolean;
}

export default function CoursesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPackage, setFilterPackage] = useState<'all' | 'silver' | 'gold' | 'platinum'>('all');

  useEffect(() => {
    loadCourses();

    // Add loading timeout
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        toast.error('Loading timeout. Please refresh the page.');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(false); // Show UI immediately
      const response = await coursesAPI.getAll();
      // Filter only published courses
      const publishedCourses = response.data.filter((course: Course) => course.is_published);
      setCourses(publishedCourses);
    } catch (error: any) {
      console.error('Error loading courses:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. Please purchase a package first.');
      } else {
        toast.error('Failed to load courses. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPackage = filterPackage === 'all' ||
                          course.package_tier.toLowerCase() === filterPackage;
    return matchesSearch && matchesPackage;
  });

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
            <p className="mt-6 text-lg font-medium text-gray-900">Loading Courses...</p>
            <p className="mt-2 text-sm text-gray-600">Please wait while we fetch your courses</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!user?.current_package) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md"
          >
            <Card>
              <CardContent className="pt-12 pb-12">
                <div className="text-6xl mb-4">📚</div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">No Package Yet</h2>
                <p className="text-neutral-600 mb-6">
                  You need to purchase a package to access courses.
                </p>
                <Button onClick={() => router.push('/packages')}>
                  View Packages
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
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
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">My Courses</h1>
            <p className="text-neutral-600">
              Your current package:{' '}
              <Badge variant={
                user.current_package === 'Platinum' ? 'default' :
                user.current_package === 'Gold' ? 'warning' :
                'secondary'
              }>
                {user.current_package}
              </Badge>
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Search Courses
                    </label>
                    <Input
                      type="text"
                      placeholder="Search by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Filter by Package
                    </label>
                    <select
                      value={filterPackage}
                      onChange={(e) => setFilterPackage(e.target.value as any)}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="all">All Packages</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 text-sm text-neutral-600">
                  Showing <span className="font-semibold">{filteredCourses.length}</span> of{' '}
                  <span className="font-semibold">{courses.length}</span> courses
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="text-6xl mb-4">🎓</div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    {courses.length === 0 ? 'No Courses Available' : 'No Courses Found'}
                  </h2>
                  <p className="text-neutral-600">
                    {courses.length === 0
                      ? 'Courses will be added soon!'
                      : 'Try adjusting your search or filters'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card
                    className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => router.push(`/courses/${course.id}`)}
                  >
                    {/* Thumbnail */}
                    <div className="relative overflow-hidden">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                          <span className="text-6xl">🎓</span>
                        </div>
                      )}
                      {/* Package Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge
                          variant={
                            course.package_tier === 'platinum' ? 'default' :
                            course.package_tier === 'gold' ? 'warning' :
                            'secondary'
                          }
                        >
                          {course.package_name}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="pt-4">
                      <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                        {course.title}
                      </h3>

                      <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                        {course.description || 'No description available'}
                      </p>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">📹 {course.video_count} videos</span>
                        <span className="text-primary-600 font-semibold group-hover:translate-x-1 transition-transform">
                          Start Learning →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

