'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import VideoPlayer from '@/components/VideoPlayer';
import { coursesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function VideoPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const videoId = params.videoId as string;
  
  const [course, setCourse] = useState<any>(null);
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId && videoId) {
      loadData();
    }
  }, [courseId, videoId]);

  const loadData = async () => {
    try {
      const [courseRes, videoRes] = await Promise.all([
        coursesAPI.getById(parseInt(courseId)),
        coursesAPI.getVideo(parseInt(courseId), parseInt(videoId)),
      ]);
      
      setCourse(courseRes.data);
      setCurrentVideo(videoRes.data);
    } catch (error: any) {
      console.error('Error loading video:', error);
      if (error.response?.status === 403) {
        toast.error('You don\'t have access to this video');
        router.push('/packages');
      } else {
        toast.error('Failed to load video');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVideoEnd = () => {
    // Find next video
    if (course?.videos) {
      const currentIndex = course.videos.findIndex((v: any) => v.id === parseInt(videoId));
      if (currentIndex < course.videos.length - 1) {
        const nextVideo = course.videos[currentIndex + 1];
        router.push(`/courses/${courseId}/videos/${nextVideo.id}`);
      }
    }
  };

  const navigateToVideo = (newVideoId: number) => {
    router.push(`/courses/${courseId}/videos/${newVideoId}`);
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

  if (!currentVideo) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Video Not Found</h2>
            <button
              onClick={() => router.push(`/courses/${courseId}`)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Back to Course
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <VideoPlayer
                publicId={currentVideo.cloudinary_public_id}
                onEnded={handleVideoEnd}
              />
              
              <div className="bg-gray-800 text-white p-6 rounded-b-lg">
                <h1 className="text-2xl font-bold mb-2">{currentVideo.title}</h1>
                {currentVideo.description && (
                  <p className="text-gray-300 mb-4">{currentVideo.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>Course: {course?.title}</span>
                  {currentVideo.duration && (
                    <span>⏱️ {Math.floor(currentVideo.duration / 60)}:{(currentVideo.duration % 60).toString().padStart(2, '0')}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Playlist */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold">Course Content</h2>
                  <button
                    onClick={() => router.push(`/courses/${courseId}`)}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    ← Back
                  </button>
                </div>
                
                <div className="space-y-2">
                  {course?.videos?.map((video: any, index: number) => (
                    <div
                      key={video.id}
                      onClick={() => navigateToVideo(video.id)}
                      className={`p-3 rounded cursor-pointer transition ${
                        video.id === parseInt(videoId)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-semibold">{index + 1}.</span>
                        <div className="flex-1">
                          <div className="font-semibold text-sm mb-1">{video.title}</div>
                          {video.duration && (
                            <div className="text-xs opacity-75">
                              {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                            </div>
                          )}
                        </div>
                        {video.id === parseInt(videoId) && (
                          <span className="text-xs">▶️</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

