'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Share2, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

interface CertificateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  certificateId: string;
  instructorName?: string;
  duration?: string;
}

export default function ProfessionalCertificate({
  studentName,
  courseName,
  completionDate,
  certificateId,
  instructorName = 'Dr. Sarah Johnson',
  duration = '40 hours',
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    try {
      toast.loading('Generating certificate...', { id: 'cert-download' });

      // Create canvas from certificate
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Auto-download
      pdf.save(`Certificate-${studentName.replace(/\s+/g, '-')}-${certificateId}.pdf`);

      toast.success('Certificate downloaded successfully!', { id: 'cert-download' });
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Failed to download certificate', { id: 'cert-download' });
    }
  };

  const shareCertificate = () => {
    if (navigator.share) {
      navigator.share({
        title: `Certificate of Completion - ${courseName}`,
        text: `I've completed ${courseName} and earned my certificate!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Certificate link copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadCertificate}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Download className="w-5 h-5" />
          Download Certificate
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={shareCertificate}
          className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all border border-gray-200"
        >
          <Share2 className="w-5 h-5" />
          Share
        </motion.button>
      </div>

      {/* Certificate */}
      <div className="flex justify-center">
        <div
          ref={certificateRef}
          className="relative w-[1056px] h-[816px] bg-white shadow-2xl"
          style={{ aspectRatio: '1.294' }}
        >
          {/* Decorative Border */}
          <div className="absolute inset-4 border-8 border-double border-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg">
            <div className="absolute inset-2 border-2 border-gray-300 rounded-lg" />
          </div>

          {/* Watermark Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <Award className="w-96 h-96 text-gray-900" />
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-16 text-center">
            {/* Logo/Badge */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                <Award className="w-14 h-14 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl font-serif font-bold text-gray-900 mb-4">
              Certificate of Completion
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-600 mb-12">
              This is to certify that
            </p>

            {/* Student Name */}
            <h2 className="text-6xl font-serif font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-12">
              {studentName}
            </h2>

            {/* Achievement Text */}
            <p className="text-xl text-gray-700 mb-4 max-w-2xl">
              has successfully completed the course
            </p>

            {/* Course Name */}
            <h3 className="text-4xl font-serif font-bold text-gray-900 mb-12">
              {courseName}
            </h3>

            {/* Details */}
            <div className="flex items-center justify-center gap-12 mb-12 text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-lg">Duration: {duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-lg">Completed: {new Date(completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end w-full max-w-3xl mt-auto">
              {/* Instructor Signature */}
              <div className="text-center">
                <div className="mb-2">
                  <div className="w-48 h-16 flex items-center justify-center">
                    <div className="text-3xl font-signature text-gray-700" style={{ fontFamily: 'cursive' }}>
                      {instructorName}
                    </div>
                  </div>
                  <div className="w-48 h-px bg-gray-900" />
                </div>
                <p className="text-sm text-gray-600 font-semibold">Instructor</p>
                <p className="text-xs text-gray-500">{instructorName}</p>
              </div>

              {/* Seal */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-4 border-blue-600 flex items-center justify-center bg-blue-50 shadow-lg">
                  <div className="text-center">
                    <Award className="w-10 h-10 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs font-bold text-blue-600">VERIFIED</p>
                  </div>
                </div>
              </div>

              {/* Director Signature */}
              <div className="text-center">
                <div className="mb-2">
                  <div className="w-48 h-16 flex items-center justify-center">
                    <div className="text-3xl font-signature text-gray-700" style={{ fontFamily: 'cursive' }}>
                      John Smith
                    </div>
                  </div>
                  <div className="w-48 h-px bg-gray-900" />
                </div>
                <p className="text-sm text-gray-600 font-semibold">Director</p>
                <p className="text-xs text-gray-500">Affiliate Learning Platform</p>
              </div>
            </div>

            {/* Certificate ID */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <p className="text-xs text-gray-400">
                Certificate ID: {certificateId}
              </p>
            </div>

            {/* Decorative Corner Elements */}
            <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-gradient-to-br from-blue-500 to-purple-500 rounded-tl-lg" />
            <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-gradient-to-bl from-purple-500 to-pink-500 rounded-tr-lg" />
            <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-gradient-to-tr from-blue-500 to-purple-500 rounded-bl-lg" />
            <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-gradient-to-tl from-purple-500 to-pink-500 rounded-br-lg" />
          </div>
        </div>
      </div>

      {/* Certificate Info */}
      <div className="text-center text-sm text-gray-600 max-w-2xl mx-auto">
        <p>
          This certificate verifies that {studentName} has successfully completed {courseName}.
          The certificate can be verified using the certificate ID: <span className="font-mono font-semibold">{certificateId}</span>
        </p>
      </div>
    </div>
  );
}

