'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { adminAPI, coursesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface Topic {
  id: number;
  module_id: number;
  title: string;
  description: string;
  video_source_type: 'cloudinary' | 'youtube' | 'vimeo' | 'external';
  cloudinary_public_id: string | null;
  external_video_url: string | null;
  duration: number;
  display_order: number;
  is_published: boolean;
}

interface Module {
  id: number;
  course_id: number;
  title: string;
  description: string;
  display_order: number;
  is_published: boolean;
  topics: Topic[];
}

interface Course {
  id: number;
  title: string;
  description: string;
  modules: Module[];
}

export default function TopicPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = parseInt(params.id as string);
  const topicId = parseInt(params.topicId as string);

  const [course, setCourse] = useState<Course | null>(null);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [watchedSeconds, setWatchedSeconds] = useState(0);

  useEffect(() => {
    loadCourseData();
  }, [courseId, topicId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getWithModules(courseId);
      const courseData = response.data;
      setCourse(courseData);

      // Find current topic and module
      let foundTopic: Topic | null = null;
      let foundModule: Module | null = null;

      for (const module of courseData.modules) {
        const topic = module.topics.find((t: Topic) => t.id === topicId);
        if (topic) {
          foundTopic = topic;
          foundModule = module;
          break;
        }
      }

      if (foundTopic && foundModule) {
        setCurrentTopic(foundTopic);
        setCurrentModule(foundModule);
      } else {
        toast.error('Topic not found');
        router.push(`/courses/${courseId}/modules`);
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
      router.push('/courses');
    } finally {
      setLoading(false);
    }
  };

  const getVideoUrl = () => {
    if (!currentTopic) return '';

    switch (currentTopic.video_source_type) {
      case 'cloudinary':
        return `https://res.cloudinary.com/dihv0v8hr/video/upload/${currentTopic.cloudinary_public_id}`;
      case 'youtube':
      case 'vimeo':
      case 'external':
        return currentTopic.external_video_url || '';
      default:
        return '';
    }
  };

  const handleProgress = (state: any) => {
    setProgress(state.played * 100);
    setWatchedSeconds(Math.floor(state.playedSeconds));
  };

  const handleEnded = () => {
    // Mark as completed
    toast.success('Topic completed!');
    // Auto-navigate to next topic
    navigateToNextTopic();
  };

  const getNextTopic = (): { moduleId: number; topicId: number } | null => {
    if (!course || !currentModule || !currentTopic) return null;

    const currentModuleIndex = course.modules.findIndex(m => m.id === currentModule.id);
    const currentTopicIndex = currentModule.topics.findIndex(t => t.id === currentTopic.id);

    // Try next topic in current module
    if (currentTopicIndex < currentModule.topics.length - 1) {
      const nextTopic = currentModule.topics[currentTopicIndex + 1];
      return { moduleId: currentModule.id, topicId: nextTopic.id };
    }

    // Try first topic of next module
    if (currentModuleIndex < course.modules.length - 1) {
      const nextModule = course.modules[currentModuleIndex + 1];
      if (nextModule.topics.length > 0) {
        return { moduleId: nextModule.id, topicId: nextModule.topics[0].id };
      }
    }

    return null;
  };

  const getPreviousTopic = (): { moduleId: number; topicId: number } | null => {
    if (!course || !currentModule || !currentTopic) return null;

    const currentModuleIndex = course.modules.findIndex(m => m.id === currentModule.id);
    const currentTopicIndex = currentModule.topics.findIndex(t => t.id === currentTopic.id);

    // Try previous topic in current module
    if (currentTopicIndex > 0) {
      const prevTopic = currentModule.topics[currentTopicIndex - 1];
      return { moduleId: currentModule.id, topicId: prevTopic.id };
    }

    // Try last topic of previous module
    if (currentModuleIndex > 0) {
      const prevModule = course.modules[currentModuleIndex - 1];
      if (prevModule.topics.length > 0) {
        const lastTopic = prevModule.topics[prevModule.topics.length - 1];
        return { moduleId: prevModule.id, topicId: lastTopic.id };
      }
    }

    return null;
  };

  const navigateToNextTopic = () => {
    const next = getNextTopic();
    if (next) {
      router.push(`/courses/${courseId}/topics/${next.topicId}`);
    } else {
      toast.success('Course completed! 🎉');
      router.push(`/courses/${courseId}/modules`);
    }
  };

  const navigateToPreviousTopic = () => {
    const prev = getPreviousTopic();
    if (prev) {
      router.push(`/courses/${courseId}/topics/${prev.topicId}`);
    }
  };

  const renderVideoPlayer = () => {
    if (!currentTopic) return null;

    const videoUrl = getVideoUrl();
    const videoSourceIcons: Record<string, string> = {
      cloudinary: '📹',
      youtube: '▶️',
      vimeo: '🎬',
      external: '🔗',
    };

    return (
      <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingTop: '56.25%' }}>
        <div className="absolute top-0 left-0 w-full h-full">
          {currentTopic.video_source_type === 'cloudinary' ? (
            // Cloudinary Video Player
            <video
              controls
              className="w-full h-full"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={handleEnded}
              onTimeUpdate={(e) => {
                const video = e.target as HTMLVideoElement;
                setWatchedSeconds(Math.floor(video.currentTime));
                setProgress((video.currentTime / video.duration) * 100);
              }}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            // YouTube, Vimeo, External - Use ReactPlayer
            <ReactPlayer
              url={videoUrl}
              width="100%"
              height="100%"
              controls
              playing={playing}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onProgress={handleProgress}
              onEnded={handleEnded}
              config={{
                youtube: {
                  playerVars: { showinfo: 1 }
                },
                vimeo: {
                  playerOptions: { byline: false }
                }
              }}
            />
          )}
        </div>
        
        {/* Video Source Badge */}
        <div className="absolute top-4 right-4">
          <Badge variant="default" className="bg-black bg-opacity-70">
            {videoSourceIcons[currentTopic.video_source_type]} {currentTopic.video_source_type.toUpperCase()}
          </Badge>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!currentTopic || !currentModule || !course) {
    return null;
  }

  const nextTopic = getNextTopic();
  const prevTopic = getPreviousTopic();

  return (
    <ProtectedRoute>      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center text-sm text-neutral-600">
            <button
              onClick={() => router.push('/courses')}
              className="hover:text-primary-600"
            >
              Courses
            </button>
            <span className="mx-2">/</span>
            <button
              onClick={() => router.push(`/courses/${courseId}/modules`)}
              className="hover:text-primary-600"
            >
              {course.title}
            </button>
            <span className="mx-2">/</span>
            <span className="text-neutral-900">{currentModule.title}</span>
            <span className="mx-2">/</span>
            <span className="text-neutral-900 font-semibold">{currentTopic.title}</span>
          </div>

          {/* Video Player */}
          <Card className="mb-6">
            <CardContent className="p-0">
              {renderVideoPlayer()}
            </CardContent>
          </Card>

          {/* Topic Info */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{currentTopic.title}</CardTitle>
                  <p className="text-neutral-600">{currentTopic.description}</p>
                </div>
                <div className="ml-4">
                  <Badge variant="default">
                    {Math.floor(currentTopic.duration / 60)}:{(currentTopic.duration % 60).toString().padStart(2, '0')} min
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-neutral-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.floor(progress)}%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={navigateToPreviousTopic}
                  disabled={!prevTopic}
                >
                  ← Previous Topic
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push(`/courses/${courseId}/modules`)}
                >
                  📚 Back to Modules
                </Button>

                <Button
                  onClick={navigateToNextTopic}
                  disabled={!nextTopic}
                >
                  Next Topic →
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Module Topics List */}
          <Card>
            <CardHeader>
              <CardTitle>Topics in {currentModule.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentModule.topics.map((topic, index) => (
                  <button
                    key={topic.id}
                    onClick={() => router.push(`/courses/${courseId}/topics/${topic.id}`)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      topic.id === currentTopic.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-neutral-500 font-semibold">{index + 1}</span>
                        <div>
                          <h4 className="font-semibold text-neutral-900">{topic.title}</h4>
                          <p className="text-sm text-neutral-600">{topic.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-neutral-500">
                          {Math.floor(topic.duration / 60)}:{(topic.duration % 60).toString().padStart(2, '0')}
                        </span>
                        {topic.id === currentTopic.id && (
                          <Badge variant="default">Playing</Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

