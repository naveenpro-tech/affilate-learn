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
import { ProgressRing } from '@/components/ui/ProgressRing';
import { LoadingSpinner, CardSkeleton } from '@/components/ui/LoadingSpinner';
import { ErrorMessage, EmptyState } from '@/components/ui/ErrorMessage';
import { useAuthStore } from '@/store/authStore';
import { coursesAPI, videoProgressAPI } from '@/lib/api';
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
  individual_price?: number;
  available_for_individual_purchase?: boolean;
  has_access?: boolean;
  access_type?: string | null;
  is_locked?: boolean;
  progress?: number; // Progress percentage
}

export default function CoursesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPackage, setFilterPackage] = useState<'all' | 'silver' | 'gold' | 'platinum'>('all');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load courses with access info
      const coursesResponse = await coursesAPI.getAllWithAccess();
      const coursesData = coursesResponse.data;

      // Load progress for all courses
      try {
        const progressResponse = await videoProgressAPI.getMyProgress();
        const progressMap = new Map(
          progressResponse.data.map((p: any) => [p.course_id, p.progress_percentage])
        );

        // Merge progress data with courses
        const coursesWithProgress = coursesData.map((course: Course) => ({
          ...course,
          progress: progressMap.get(course.id) || 0,
        }));

        setCourses(coursesWithProgress);
      } catch (progressError) {
        // If progress fails, just show courses without progress
        console.warn('Failed to load progress:', progressError);
        setCourses(coursesData);
      }
    } catch (error: any) {
      console.error('Error loading courses:', error);
      setError(error.response?.data?.detail || 'Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPackage = filterPackage === 'all' ||
                          (course.package_tier && course.package_tier.toLowerCase() === filterPackage);
    return matchesSearch && matchesPackage;
  });

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-neutral-50 py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Courses</h1>
              <p className="text-gray-600">Loading your courses...</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-neutral-50 py-8">
          <div className="container mx-auto px-4">
            <ErrorMessage
              variant="card"
              title="Failed to Load Courses"
              message={error}
              onRetry={loadCourses}
              retryText="Try Again"
            />
          </div>
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
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">All Courses</h1>
            {user?.current_package ? (
              <div className="text-neutral-600">
                Your current package:{' '}
                <Badge variant={
                  user.current_package === 'Platinum' ? 'default' :
                  user.current_package === 'Gold' ? 'warning' :
                  'secondary'
                }>
                  {user.current_package}
                </Badge>
              </div>
            ) : (
              <p className="text-neutral-600">
                Browse all courses. Purchase a package or buy individual courses to get access.
              </p>
            )}
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
                    className={`overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                      course.is_locked ? 'opacity-75' : ''
                    }`}
                    onClick={() => !course.is_locked && router.push(`/courses/${course.id}/learn`)}
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

                      {/* Lock Overlay */}
                      {course.is_locked && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-6xl mb-2">🔒</div>
                            <p className="text-white font-semibold">Locked</p>
                          </div>
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

                      {/* Access Type Badge */}
                      {course.has_access && course.access_type && (
                        <div className="absolute top-3 left-3">
                          <Badge variant="success">
                            {course.access_type === 'package' ? '✓ Package' : '✓ Purchased'}
                          </Badge>
                        </div>
                      )}

                      {/* Progress Ring */}
                      {course.has_access && course.progress !== undefined && course.progress > 0 && (
                        <div className="absolute bottom-3 right-3">
                          <ProgressRing progress={course.progress} size={50} strokeWidth={4} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-neutral-900 group-hover:text-primary-600 transition-colors flex-1">
                          {course.title}
                        </h3>
                      </div>

                      <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                        {course.description || 'No description available'}
                      </p>

                      {/* Progress Bar for courses with access */}
                      {course.has_access && course.progress !== undefined && (
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600">Progress</span>
                            <span className="text-xs font-bold text-gray-900">{Math.round(course.progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${
                                course.progress === 100 ? 'bg-green-500' :
                                course.progress >= 75 ? 'bg-blue-500' :
                                course.progress >= 50 ? 'bg-yellow-500' :
                                course.progress >= 25 ? 'bg-orange-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-neutral-500">📹 {course.video_count} videos</span>
                        {course.is_locked && course.individual_price && (
                          <span className="text-success-600 font-bold">
                            ₹{course.individual_price}
                          </span>
                        )}
                      </div>

                      {course.is_locked && course.available_for_individual_purchase ? (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/courses/${course.id}/purchase`);
                          }}
                          className="w-full"
                          variant="primary"
                        >
                          🛒 Buy This Course
                        </Button>
                      ) : course.is_locked ? (
                        <div className="text-center text-sm text-neutral-500">
                          Requires {course.package_name} package
                        </div>
                      ) : (
                        <div className="text-primary-600 font-semibold group-hover:translate-x-1 transition-transform text-center">
                          Start Learning →
                        </div>
                      )}
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

