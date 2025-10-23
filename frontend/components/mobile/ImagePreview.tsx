'use client';

import React from 'react';
import Image from 'next/image';
import { X, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImagePreviewProps {
  isOpen: boolean;
  imageUrl: string;
  onClose: () => void;
  onConfirm: () => void;
  isUploading?: boolean;
}

export default function ImagePreview({
  isOpen,
  imageUrl,
  onClose,
  onConfirm,
  isUploading = false,
}: ImagePreviewProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[1200] bg-black flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <button
          onClick={onClose}
          disabled={isUploading}
          className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors disabled:opacity-50"
          aria-label="Cancel"
        >
          <X size={24} />
        </button>

        <h2 className="text-white font-semibold text-lg">Preview</h2>

        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Image preview */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
        <div className="relative w-full h-full max-w-2xl">
          <Image
            src={imageUrl}
            alt="Preview"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Uploading overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
              <p className="text-white text-sm">Uploading...</p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex gap-4">
          {/* Cancel button */}
          <button
            onClick={onClose}
            disabled={isUploading}
            className="flex-1 py-4 px-6 bg-white/20 text-white rounded-xl text-base font-semibold transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            Cancel
          </button>

          {/* Confirm button */}
          <button
            onClick={onConfirm}
            disabled={isUploading}
            className="flex-1 py-4 px-6 bg-[#667eea] text-white rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Check size={20} />
                <span>Use This Photo</span>
              </>
            )}
          </button>
        </div>

        <p className="text-white/80 text-center text-sm mt-4">
          This photo will be remixed with the AI style
        </p>
      </div>
    </motion.div>
  );
}

