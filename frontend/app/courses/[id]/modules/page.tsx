'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { coursesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Topic {
  id: number;
  title: string;
  description: string;
  video_source_type: string;
  duration: number;
  display_order: number;
  is_published: boolean;
}

interface Module {
  id: number;
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
  package_name: string;
  total_topics: number;
  modules: Module[];
}

export default function CourseModulesPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getWithModules(parseInt(courseId));
      setCourse(response.data);
      // Expand first module by default
      if (response.data.modules && response.data.modules.length > 0) {
        setExpandedModules(new Set([response.data.modules[0].id]));
      }
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

  const toggleModule = (moduleId: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleIssueCertificate = async () => {
    try {
      const response = await coursesAPI.issueCertificate(parseInt(courseId));
      toast.success('Certificate issued successfully!');
      router.push(`/certificates/${response.data.certificate_number}`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to issue certificate');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return (
      <ProtectedRoute>        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
            <Button onClick={() => router.push('/courses')}>
              Back to Courses
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Course Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="pt-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">{course.title}</h1>
                    <Badge className="mb-3">{course.package_name}</Badge>
                    {course.description && (
                      <p className="text-neutral-600 mt-3">{course.description}</p>
                    )}
                    <div className="mt-4 flex items-center gap-4 text-sm text-neutral-600">
                      <span>📚 {course.modules?.length || 0} modules</span>
                      <span>📹 {course.total_topics || 0} topics</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" onClick={() => router.push('/courses')}>
                      ← Back
                    </Button>
                    <Button onClick={handleIssueCertificate}>
                      🏆 Get Certificate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Modules List */}
          {!course.modules || course.modules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Modules Yet</h3>
                <p className="text-neutral-600">Course content is being prepared. Check back soon!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {course.modules.map((module, moduleIndex) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: moduleIndex * 0.1, duration: 0.5 }}
                >
                  <Card>
                    <CardHeader
                      className="cursor-pointer hover:bg-neutral-50 transition-colors"
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-neutral-500">
                              Module {moduleIndex + 1}
                            </span>
                            {module.is_published && <Badge size="sm" variant="success">Published</Badge>}
                          </div>
                          <CardTitle className="text-xl">{module.title}</CardTitle>
                          {module.description && (
                            <p className="text-sm text-neutral-600 mt-1">{module.description}</p>
                          )}
                          <div className="text-xs text-neutral-500 mt-2">
                            {module.topics?.length || 0} topics
                          </div>
                        </div>
                        <div className="text-2xl transition-transform" style={{
                          transform: expandedModules.has(module.id) ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                          ▼
                        </div>
                      </div>
                    </CardHeader>

                    {expandedModules.has(module.id) && module.topics && module.topics.length > 0 && (
                      <CardContent>
                        <div className="space-y-3">
                          {module.topics.map((topic, topicIndex) => (
                            <div
                              key={topic.id}
                              className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 cursor-pointer transition-colors"
                              onClick={() => router.push(`/courses/${courseId}/topics/${topic.id}`)}
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-2xl">
                                  {topic.video_source_type === 'youtube' ? '▶️' :
                                   topic.video_source_type === 'vimeo' ? '🎬' :
                                   topic.video_source_type === 'external' ? '🔗' : '📹'}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-neutral-500">
                                      Topic {topicIndex + 1}
                                    </span>
                                    <Badge size="sm">{topic.video_source_type}</Badge>
                                    {topic.is_published && <Badge size="sm" variant="success">Published</Badge>}
                                  </div>
                                  <h4 className="font-semibold text-neutral-900">{topic.title}</h4>
                                  {topic.description && (
                                    <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{topic.description}</p>
                                  )}
                                  <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                                    {topic.duration > 0 && (
                                      <span>⏱️ {Math.floor(topic.duration / 60)}m {topic.duration % 60}s</span>
                                    )}
                                    <span className="text-primary-600 font-semibold">Watch Now →</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
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

