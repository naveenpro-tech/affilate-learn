'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { coursesAPI, videoProgressAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail_url?: string;
  package_tier?: string;
  package_name?: string;
  video_count: number;
  progress?: number;
  has_access: boolean;
  access_type?: string;
  is_locked: boolean;
  individual_price?: number;
  available_for_individual_purchase?: boolean;
}

const CardSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="animate-pulse">
      <div className="w-full h-48 bg-neutral-200" />
      <CardContent className="p-6">
        <div className="h-6 bg-neutral-200 rounded mb-2" />
        <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4" />
        <div className="flex justify-between items-center">
          <div className="h-4 bg-neutral-200 rounded w-1/4" />
          <div className="h-8 bg-neutral-200 rounded w-1/3" />
        </div>
      </CardContent>
    </div>
  </Card>
);

export default function BrowseCoursesPage() {
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

      // Load ALL courses with access info (for browsing)
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
                          (course.package_name && course.package_name.toLowerCase() === filterPackage);
    return matchesSearch && matchesPackage;
  });

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-neutral-50 py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse All Courses</h1>
              <p className="text-gray-600">Loading courses...</p>
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
        <div className="min-h-screen bg-neutral-50 py-8">
          <div className="container mx-auto px-4">
            <Card>
              <CardContent className="py-16 text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Error Loading Courses</h2>
                <p className="text-neutral-600 mb-4">{error}</p>
                <button
                  onClick={loadCourses}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Try Again
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Browse All Courses</h1>
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
                {' '}• Showing all courses (locked and unlocked)
              </div>
            ) : (
              <p className="text-neutral-600">
                Browse all available courses. Purchase a package or buy individual courses to get access.
              </p>
            )}
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-6 flex flex-col md:flex-row gap-4"
          >
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterPackage} onValueChange={(value: any) => setFilterPackage(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by package" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packages</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
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
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="text-4xl mb-2">🔒</div>
                            <p className="text-sm font-semibold">Locked</p>
                          </div>
                        </div>
                      )}

                      {/* Package Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge variant={
                          course.package_name === 'Platinum' ? 'default' :
                          course.package_name === 'Gold' ? 'warning' :
                          'secondary'
                        }>
                          {course.package_name || 'Unknown'}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-neutral-900 mb-2 line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
                        <span>📹 {course.video_count} lessons</span>
                        {course.has_access && course.progress !== undefined && course.progress > 0 && (
                          <span className="text-primary-600 font-semibold">{course.progress}% complete</span>
                        )}
                      </div>

                      {/* Action Button */}
                      {course.is_locked ? (
                        <div className="space-y-3">
                          {/* Individual Purchase Option */}
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-gray-700">Individual Purchase</span>
                              <span className="text-lg font-bold text-primary-600">₹199</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/courses/${course.id}/purchase`);
                              }}
                              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                            >
                              Purchase Course - ₹199
                            </button>
                          </div>

                          {/* Package Requirement Info */}
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Or unlock with package:</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push('/packages');
                              }}
                              className="text-xs text-primary-600 hover:text-primary-700 font-medium underline"
                            >
                              View {course.package_tier} Package
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/courses/${course.id}/learn`);
                          }}
                          className="w-full px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                        >
                          {course.progress && course.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                        </button>
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

