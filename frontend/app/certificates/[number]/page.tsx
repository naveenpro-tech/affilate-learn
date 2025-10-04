'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface CertificateData {
  id: number;
  user_id: number;
  course_id: number;
  certificate_number: string;
  issued_at: string;
  user_name?: string;
  course_title?: string;
  username?: string;
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
      // TODO: Add API endpoint to verify and get certificate details
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

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Certificate link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Certificate Not Found</h2>
            <p className="text-neutral-600 mb-6">
              The certificate number you entered is invalid or does not exist.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Action Buttons (hidden when printing) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex gap-3 justify-end print:hidden"
        >
          <Button variant="outline" onClick={handleShare}>
            📤 Share
          </Button>
          <Button onClick={handlePrint}>
            🖨️ Print / Download PDF
          </Button>
        </motion.div>

        {/* Certificate */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="bg-white shadow-2xl rounded-lg overflow-hidden border-8 border-primary-600 print:border-4">
            <div className="p-12 md:p-16 text-center">
              {/* Header */}
              <div className="mb-8">
                <div className="text-6xl mb-4">🏆</div>
                <h1 className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                  Certificate of Completion
                </h1>
                <div className="w-32 h-1 bg-primary-600 mx-auto"></div>
              </div>

              {/* Body */}
              <div className="mb-8 space-y-6">
                <p className="text-lg text-neutral-600">This is to certify that</p>
                
                <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
                  {certificate.username || certificate.user_name || 'Student'}
                </h2>

                <p className="text-lg text-neutral-600">has successfully completed the course</p>

                <h3 className="text-2xl md:text-3xl font-semibold text-primary-700">
                  {certificate.course_title || 'Course'}
                </h3>

                <p className="text-lg text-neutral-600">
                  on {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t-2 border-neutral-200">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <div className="border-t-2 border-neutral-900 w-48 mx-auto mb-2"></div>
                    <p className="text-sm font-semibold text-neutral-900">Platform Administrator</p>
                    <p className="text-xs text-neutral-600">MLM Affiliate Learning Platform</p>
                  </div>
                  <div>
                    <div className="border-t-2 border-neutral-900 w-48 mx-auto mb-2"></div>
                    <p className="text-sm font-semibold text-neutral-900">Certificate Number</p>
                    <p className="text-xs font-mono text-neutral-600">{certificate.certificate_number}</p>
                  </div>
                </div>
              </div>

              {/* Verification Note */}
              <div className="mt-8 p-4 bg-neutral-50 rounded-lg print:hidden">
                <p className="text-xs text-neutral-600">
                  This certificate can be verified at: {window.location.origin}/certificates/{certificate.certificate_number}
                </p>
              </div>
            </div>

            {/* Decorative Border */}
            <div className="h-4 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400"></div>
          </div>
        </motion.div>

        {/* Verification Info (hidden when printing) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 print:hidden"
        >
          <Card className="bg-success-50 border-success-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <h3 className="font-semibold text-success-900 mb-1">Verified Certificate</h3>
                  <p className="text-sm text-success-800">
                    This certificate has been verified and is authentic. It was issued by MLM Affiliate Learning Platform.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:border-4 {
            border-width: 4px !important;
          }
        }
      `}</style>
    </div>
  );
}

