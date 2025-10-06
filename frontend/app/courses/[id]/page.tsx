'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { coursesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      // Use getAllWithAccess to get course with access info
      const response = await coursesAPI.getAllWithAccess();
      const foundCourse = response.data.find((c: any) => c.id === parseInt(courseId));

      if (!foundCourse) {
        toast.error('Course not found');
        router.push('/courses');
        return;
      }

      setCourse(foundCourse);

      // If user doesn't have access, redirect to purchase page
      if (!foundCourse.has_access) {
        toast.error('You don\'t have access to this course');
        router.push(`/courses/${courseId}/purchase`);
      }
    } catch (error: any) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
      router.push('/courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
            <button
              onClick={() => router.push('/courses')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Course Header */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                  {course.package_name}
                </span>
              </div>
              <button
                onClick={() => router.push('/courses')}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back to Courses
              </button>
            </div>
            
            {course.description && (
              <p className="text-gray-600 mt-4">{course.description}</p>
            )}
            
            <div className="mt-4 text-sm text-gray-500">
              📹 {course.video_count || 0} lessons
            </div>
          </div>

          {/* Start Learning Button */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Ready to Learn?</h2>

            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">
                You have access to this course! Click below to start learning.
              </p>
              <button
                onClick={() => router.push(`/courses/${courseId}/learn`)}
                className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-lg transition"
              >
                Start Learning →
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

