'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Certificate {
  id: number;
  user_id: number;
  course_id: number;
  certificate_number: string;
  issued_at: string;
  course_title?: string;
}

export default function CertificatesPage() {
  const { user } = useAuthStore();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      // TODO: Add API endpoint to get user's certificates
      // For now, this is a placeholder
      const response = await api.get('/api/certificates/my-certificates');
      setCertificates(response.data);
    } catch (error: any) {
      console.error('Error loading certificates:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load certificates');
      }
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certificateNumber: string) => {
    // Open certificate viewer in new tab
    window.open(`/certificates/${certificateNumber}`, '_blank');
  };

  return (
    <ProtectedRoute>      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">My Certificates</h1>
            <p className="text-neutral-600">View and download your course completion certificates</p>
          </motion.div>

          {/* Certificates Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : certificates.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎓</div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Certificates Yet</h3>
                    <p className="text-neutral-600 mb-6">
                      Complete courses to earn certificates
                    </p>
                    <Button onClick={() => window.location.href = '/courses'}>
                      Browse Courses
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Badge className="mb-2">Certificate</Badge>
                            <CardTitle className="text-lg">{cert.course_title || 'Course'}</CardTitle>
                          </div>
                          <div className="text-4xl">🏆</div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-neutral-600">Certificate Number</label>
                            <div className="font-mono text-sm font-semibold text-neutral-900">
                              {cert.certificate_number}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-neutral-600">Issued On</label>
                            <div className="text-sm text-neutral-900">
                              {new Date(cert.issued_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                          </div>
                          <div className="pt-3 border-t border-neutral-200">
                            <Button
                              className="w-full"
                              onClick={() => handleDownload(cert.certificate_number)}
                            >
                              View Certificate
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info Card */}
          {certificates.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-8"
            >
              <Card className="bg-primary-50 border-primary-200">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-primary-900 mb-2">About Certificates</h3>
                  <ul className="text-sm text-primary-800 space-y-1">
                    <li>• Certificates are issued automatically upon course completion</li>
                    <li>• Each certificate has a unique verification number</li>
                    <li>• You can share your certificates on social media</li>
                    <li>• Certificates can be verified by anyone using the certificate number</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

