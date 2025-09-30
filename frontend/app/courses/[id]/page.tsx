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
      const response = await coursesAPI.getById(parseInt(courseId));
      setCourse(response.data);
    } catch (error: any) {
      console.error('Error loading course:', error);
      if (error.response?.status === 403) {
        toast.error('You don\'t have access to this course');
        router.push('/packages');
      } else {
        toast.error('Failed to load course');
      }
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
              📹 {course.videos?.length || 0} videos
            </div>
          </div>

          {/* Video List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Course Content</h2>
            
            {!course.videos || course.videos.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No videos available yet. Check back soon!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {course.videos.map((video: any, index: number) => (
                  <div
                    key={video.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => router.push(`/courses/${courseId}/videos/${video.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-32 h-20 object-cover rounded"
                        />
                      ) : (
                        <div className="w-32 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center">
                          <span className="text-2xl">▶️</span>
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-500">
                            {index + 1}.
                          </span>
                          <h3 className="text-lg font-semibold">{video.title}</h3>
                        </div>
                        
                        {video.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {video.duration && (
                            <span>⏱️ {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
                          )}
                          <span className="text-indigo-600 font-semibold">Watch Now →</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

