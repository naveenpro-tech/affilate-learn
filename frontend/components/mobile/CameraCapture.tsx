'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X, Camera, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export default function CameraCapture({ isOpen, onClose, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check permissions.');
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) return;

      // Create file from blob
      const file = new File([blob], `photo-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      // Stop camera and call callback
      stopCamera();
      onCapture(file);
      onClose();
    }, 'image/jpeg', 0.9);
  };

  const handleFlipCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[1100] bg-black flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          aria-label="Close camera"
        >
          <X size={24} />
        </button>

        <button
          onClick={handleFlipCamera}
          className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          aria-label="Flip camera"
        >
          <RotateCw size={24} />
        </button>
      </div>

      {/* Video preview */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Loading state */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
              <p className="text-white text-sm">Starting camera...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center px-6">
              <p className="text-white text-base mb-4">{error}</p>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-white text-black rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Capture button */}
      {!isLoading && !error && (
        <div className="absolute bottom-0 left-0 right-0 pb-8 pt-6 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center justify-center">
            <button
              onClick={handleCapture}
              className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 flex items-center justify-center transition-transform active:scale-90"
              aria-label="Capture photo"
            >
              <div className="w-16 h-16 rounded-full bg-white"></div>
            </button>
          </div>

          <p className="text-white text-center text-sm mt-4">
            Tap to capture
          </p>
        </div>
      )}
    </motion.div>
  );
}

