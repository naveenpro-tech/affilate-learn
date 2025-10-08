'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
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

  const handleVideoProgress = async (topicId: number, currentTime: number, duration: number) => {
    try {
      const completed = currentTime >= duration * 0.9; // 90% watched = completed
      await videoProgressAPI.updateProgress({
        topic_id: topicId,
        watched_seconds: currentTime,
        last_position: currentTime,
        completed,
      });

      // Update local progress
      await loadTopicProgress(topicId);

      // Reload course progress if completed
      if (completed) {
        const progressResponse = await videoProgressAPI.getCourseProgress(parseInt(courseId));
        setCourseProgress(progressResponse.data);
      }
    } catch (error) {
      console.error('Error updating video progress:', error);
    }
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

  const handleGenerateCertificate = async () => {
    try {
      const response = await coursesAPI.issueCertificate(parseInt(courseId));
      toast.success('Certificate generated successfully!');
      router.push(`/certificates/${response.data.certificate_number}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to generate certificate';
      toast.error(errorMessage);
    }
  };

  const getVideoEmbedUrl = (topic: any) => {
    if (!topic.external_video_url) return null;

    const url = topic.external_video_url;
    const topicProgress = progress[topic.id];
    const startTime = topicProgress?.last_position || 0;

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be')
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];

      // Add start time parameter if there's progress
      const timeParam = startTime > 0 ? `&start=${Math.floor(startTime)}` : '';
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1${timeParam}`;
    }

    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      // Vimeo uses #t= for start time
      const timeParam = startTime > 0 ? `#t=${Math.floor(startTime)}s` : '';
      return `https://player.vimeo.com/video/${videoId}${timeParam}`;
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
      <ProtectedRoute>        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return (
      <ProtectedRoute>        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <ProtectedRoute>      <div className="min-h-screen bg-gray-50">
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
              <div className="flex items-center gap-3">
                {courseProgress && courseProgress.progress_percentage === 100 && (
                  <button
                    onClick={handleGenerateCertificate}
                    className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg flex items-center gap-2 font-semibold"
                  >
                    🏆 Generate Certificate
                  </button>
                )}
                <button
                  onClick={() => router.push('/courses')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  ← Back to Courses
                </button>
              </div>
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
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold mb-2">{selectedTopic.title}</h2>
                          <p className="text-gray-600">{selectedTopic.description}</p>

                          {/* Resume indicator */}
                          {progress[selectedTopic.id]?.last_position > 0 && !progress[selectedTopic.id]?.completed && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Resuming from {formatDuration(Math.floor(progress[selectedTopic.id].last_position))}</span>
                            </div>
                          )}

                          {/* Completed indicator */}
                          {progress[selectedTopic.id]?.completed && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Completed</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleMarkComplete(selectedTopic.id)}
                          disabled={progress[selectedTopic.id]?.completed}
                          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                            progress[selectedTopic.id]?.completed
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {progress[selectedTopic.id]?.completed ? '✓ Completed' : '✓ Mark Complete'}
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

