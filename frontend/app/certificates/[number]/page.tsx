'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import ProfessionalCertificate from '@/components/ProfessionalCertificate';
import GradientBackground from '@/components/GradientBackground';
import EnhancedNavbar from '@/components/EnhancedNavbar';

interface CertificateData {
  id: number;
  user_id: number;
  course_id: number;
  certificate_number: string;
  issued_at: string;
  user_name: string;
  course_title: string;
  user_email?: string;
}

export default function CertificateViewerPage() {
  const params = useParams();
  const certificateNumber = params.number as string;
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (certificateNumber) {
      loadCertificate();
    }
  }, [certificateNumber]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/api/certificates/verify/${certificateNumber}`);
      setCertificate(response.data);
    } catch (error: any) {
      console.error('Error loading certificate:', error);
      setError('Certificate not found or invalid');
      toast.error('Certificate not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <EnhancedNavbar />
        <GradientBackground variant="default" showGrid showOrbs>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </GradientBackground>
      </>
    );
  }

  if (error || !certificate) {
    return (
      <>
        <EnhancedNavbar />
        <GradientBackground variant="default" showGrid showOrbs>
          <div className="min-h-screen flex items-center justify-center px-4">
            <Card className="max-w-md w-full bg-white/80 backdrop-blur-xl">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h2>
                <p className="text-gray-600 mb-6">
                  The certificate number you entered is invalid or does not exist.
                </p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Go to Homepage
                </button>
              </CardContent>
            </Card>
          </div>
        </GradientBackground>
      </>
    );
  }

  return (
    <>
      <EnhancedNavbar />
      <GradientBackground variant="default" showGrid showOrbs>
        <div className="min-h-screen py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            {/* Professional Certificate Component with Auto-Download */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ProfessionalCertificate
                studentName={certificate.user_name}
                courseName={certificate.course_title}
                completionDate={certificate.issued_at}
                certificateId={certificate.certificate_number}
                instructorName="Dr. Sarah Johnson"
                duration="40 hours"
              />
            </motion.div>

            {/* Verification Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-8 max-w-2xl mx-auto"
            >
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">✅</div>
                    <div>
                      <h3 className="font-semibold text-green-900 mb-1">Verified Certificate</h3>
                      <p className="text-sm text-green-800">
                        This certificate has been verified and is authentic. It was issued by MLM Learning Platform.
                      </p>
                      <p className="text-xs text-green-700 mt-2">
                        Certificate ID: <span className="font-mono font-semibold">{certificate.certificate_number}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </GradientBackground>
    </>
  );
}

