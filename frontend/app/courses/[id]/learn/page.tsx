'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { coursesAPI, videoProgressAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function CourseLearnPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>({});
  const [courseProgress, setCourseProgress] = useState<any>(null);

  useEffect(() => {
    if (courseId) {
      loadCourseData();
    }
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      
      // Load course with modules
      const courseResponse = await coursesAPI.getWithModules(parseInt(courseId));
      setCourse(courseResponse.data);
      setModules(courseResponse.data.modules || []);
      
      // Select first topic by default
      if (courseResponse.data.modules && courseResponse.data.modules.length > 0) {
        const firstModule = courseResponse.data.modules[0];
        if (firstModule.topics && firstModule.topics.length > 0) {
          setSelectedTopic(firstModule.topics[0]);
        }
      }
      
      // Load course progress
      const progressResponse = await videoProgressAPI.getCourseProgress(parseInt(courseId));
      setCourseProgress(progressResponse.data);
      
    } catch (error: any) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
      router.push('/courses');
    } finally {
      setLoading(false);
    }
  };

  const loadTopicProgress = async (topicId: number) => {
    try {
      const response = await videoProgressAPI.getTopicProgress(topicId);
      setProgress((prev: any) => ({
        ...prev,
        [topicId]: response.data
      }));
    } catch (error) {
      console.error('Error loading topic progress:', error);
    }
  };

  const handleTopicSelect = async (topic: any) => {
    setSelectedTopic(topic);
    await loadTopicProgress(topic.id);
  };

  const handleMarkComplete = async (topicId: number) => {
    try {
      await videoProgressAPI.markComplete(topicId);
      toast.success('Topic marked as complete!');
      
      // Reload progress
      const progressResponse = await videoProgressAPI.getCourseProgress(parseInt(courseId));
      setCourseProgress(progressResponse.data);
      await loadTopicProgress(topicId);
    } catch (error) {
      console.error('Error marking complete:', error);
      toast.error('Failed to mark topic as complete');
    }
  };

  const getVideoEmbedUrl = (topic: any) => {
    if (!topic.external_video_url) return null;
    
    const url = topic.external_video_url;
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    return url;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
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
      <div className="min-h-screen bg-gray-50">
        {/* Course Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{course.title}</h1>
                {courseProgress && (
                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-sm text-gray-600">
                      {courseProgress.completed_topics} / {courseProgress.total_topics} topics completed
                    </div>
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${courseProgress.progress_percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm font-semibold text-green-600">
                      {courseProgress.progress_percentage}%
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => router.push('/courses')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Courses
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {selectedTopic ? (
                  <>
                    {/* Video */}
                    <div className="aspect-video bg-black">
                      {getVideoEmbedUrl(selectedTopic) ? (
                        <iframe
                          src={getVideoEmbedUrl(selectedTopic)}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <div className="text-center">
                            <p className="text-xl mb-2">No video available</p>
                            <p className="text-sm text-gray-400">This topic doesn't have a video yet</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Topic Info */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold mb-2">{selectedTopic.title}</h2>
                          <p className="text-gray-600">{selectedTopic.description}</p>
                        </div>
                        <button
                          onClick={() => handleMarkComplete(selectedTopic.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap"
                        >
                          ✓ Mark Complete
                        </button>
                      </div>
                      
                      {selectedTopic.duration && (
                        <div className="text-sm text-gray-500">
                          Duration: {formatDuration(selectedTopic.duration)}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <p className="text-xl mb-2">Select a topic to start learning</p>
                      <p className="text-sm">Choose from the curriculum on the right</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Curriculum Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Course Curriculum</h3>
                
                <div className="space-y-4">
                  {modules.map((module: any, moduleIndex: number) => (
                    <div key={module.id} className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4">
                        <h4 className="font-semibold">
                          Module {moduleIndex + 1}: {module.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      </div>
                      
                      <div className="divide-y">
                        {module.topics && module.topics.map((topic: any, topicIndex: number) => {
                          const isSelected = selectedTopic?.id === topic.id;
                          const topicProgress = progress[topic.id];
                          const isCompleted = topicProgress?.completed;
                          
                          return (
                            <button
                              key={topic.id}
                              onClick={() => handleTopicSelect(topic)}
                              className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                                isSelected ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                    isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {isCompleted ? '✓' : topicIndex + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{topic.title}</div>
                                    {topic.duration && (
                                      <div className="text-xs text-gray-500">
                                        {formatDuration(topic.duration)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="text-indigo-600">▶</div>
                                )}
                              </div>
                            </button>
                          );
                        })}
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

