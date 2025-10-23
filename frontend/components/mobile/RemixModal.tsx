'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { X, Camera, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CameraCapture from './CameraCapture';
import ImagePreview from './ImagePreview';
import toast from 'react-hot-toast';

interface RemixModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalImageUrl: string;
  postId: number;
  onPhotoSelected?: (file: File, sourceImageUrl: string) => void;
}

export default function RemixModal({
  isOpen,
  onClose,
  originalImageUrl,
  postId,
  onPhotoSelected,
}: RemixModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !showCamera && !showPreview) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, showCamera, showPreview]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = (file: File): boolean => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG and PNG images are supported');
      return false;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(`File size must be less than 10MB (current: ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      return false;
    }

    return true;
  };

  const handleFileSelected = (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowPreview(true);
  };

  const handleTakePhoto = () => {
    setShowCamera(true);
  };

  const handleCameraCapture = (file: File) => {
    setShowCamera(false);
    handleFileSelected(file);
  };

  const handleChooseFromGallery = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const handlePreviewConfirm = async () => {
    if (!selectedFile || !onPhotoSelected) return;

    setIsUploading(true);

    try {
      // Upload to backend
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/studio/upload-source-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const data = await response.json();

      // Call parent callback with file and uploaded URL
      onPhotoSelected(selectedFile, data.url);

      // Close all modals
      setShowPreview(false);
      setSelectedFile(null);
      setPreviewUrl('');
      onClose();

      toast.success('Photo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePreviewClose = () => {
    if (!isUploading) {
      setShowPreview(false);
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Hidden file input for gallery picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Main remix modal */}
      <AnimatePresence>
        {isOpen && !showCamera && !showPreview && (
          <motion.div
            className="remix-modal fixed inset-0 z-[1000] flex flex-col items-center justify-center p-6 bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
          >
            <motion.div
              className="remix-modal__content w-full max-w-md"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-10"
                aria-label="Close"
              >
                <X size={24} />
              </button>

              {/* Blurred preview image */}
              <div className="remix-modal__preview w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden relative">
                <Image
                  src={originalImageUrl.startsWith('http') ? originalImageUrl : `http://localhost:8000${originalImageUrl}`}
                  alt="Style preview"
                  fill
                  className="object-cover"
                  style={{ filter: 'blur(8px)' }}
                />
              </div>

              {/* Title */}
              <div className="remix-modal__title text-center mb-8">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Remix this style
                </h2>
                <p className="text-base text-gray-300">
                  with your photo
                </p>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                {/* Primary button - Take Photo */}
                <button
                  onClick={handleTakePhoto}
                  className="remix-modal__button w-full py-4 px-6 bg-[#667eea] text-white rounded-xl text-base font-semibold flex items-center justify-center gap-3 transition-transform active:scale-95"
                >
                  <Camera size={24} />
                  <span>Take Photo</span>
                </button>

                {/* Secondary button - Choose from Gallery */}
                <button
                  onClick={handleChooseFromGallery}
                  className="remix-modal__button remix-modal__button--secondary w-full py-4 px-6 bg-[#f9fafb] text-[#111827] rounded-xl text-base font-semibold flex items-center justify-center gap-3 transition-transform active:scale-95"
                >
                  <ImageIcon size={24} />
                  <span>Choose from Gallery</span>
                </button>
              </div>

              {/* Helper text */}
              <p className="text-center text-sm text-gray-400 mt-6">
                Your photo will be transformed using this AI style
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera capture modal */}
      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
      />

      {/* Image preview modal */}
      <ImagePreview
        isOpen={showPreview}
        imageUrl={previewUrl}
        onClose={handlePreviewClose}
        onConfirm={handlePreviewConfirm}
        isUploading={isUploading}
      />
    </>
  );
}

