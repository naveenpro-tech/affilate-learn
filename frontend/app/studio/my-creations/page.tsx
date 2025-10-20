'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { studioAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  Share2,
  Download,
  Loader,
  Image as ImageIcon,
  ArrowLeft,
  Sparkles,
  Upload,
} from 'lucide-react';
import { ImageGridSkeleton } from '@/components/studio/SkeletonLoaders';
import { NoCreationsEmpty, ErrorState } from '@/components/studio/EmptyStates';
import PublishDialog from '@/components/studio/PublishDialog';

interface GeneratedImage {
  id: number;
  image_url: string;
  prompt: string;
  tier: string;
  created_at: string;
  watermark: boolean;
}

export default function MyCreationsPage() {
  const router = useRouter();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    loadCreations();
  }, []);

  const loadCreations = async () => {
    try {
      setError(null);
      const response = await studioAPI.getMyCreations(0, 50);
      const items = response.data.items || [];
      const mapped = items.map((it: any) => ({
        id: it.id,
        image_url: it.image_url,
        prompt: it.enhanced_prompt || it.prompt_text,
        tier: it.tier,
        created_at: it.created_at,
        watermark: false,
      }));
      setImages(mapped);
    } catch (error: any) {
      const errorMsg = 'Failed to load your creations';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    setDeleting(imageId);
    try {
      await studioAPI.deleteImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success('Image deleted');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete image');
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = (imageUrl: string, imageName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${imageName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  const handleShare = (imageUrl: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out my AI-generated image!',
        text: 'I created this amazing image using Creative Studio',
        url: imageUrl,
      });
    } else {
      navigator.clipboard.writeText(imageUrl);
      toast.success('Image URL copied to clipboard');
    }
  };

  const handlePublish = (image: GeneratedImage) => {
    setSelectedImage(image);
    setPublishDialogOpen(true);
  };

  const handlePublishSuccess = () => {
    toast.success('Published to community!');
    router.push('/studio/community');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                <Sparkles className="w-10 h-10 text-primary-500" />
                My Creations
              </h1>
            </div>
            <ImageGridSkeleton count={9} />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                <Sparkles className="w-10 h-10 text-primary-500" />
                My Creations
              </h1>
            </div>
            <ErrorState description={error} onRetry={loadCreations} />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
                    <Sparkles className="w-10 h-10 text-primary-500" />
                    My Creations
                  </h1>
                  <p className="text-slate-600 mt-2">
                    {images.length} image{images.length !== 1 ? 's' : ''} created
                  </p>
                </div>
              </div>
              <Button
                onClick={() => router.push('/studio')}
                className="bg-primary-600 hover:bg-primary-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create New
              </Button>
            </div>
          </motion.div>

          {/* Gallery */}
          {images.length === 0 ? (
            <NoCreationsEmpty onCreateClick={() => router.push('/studio')} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="relative bg-slate-100 aspect-square overflow-hidden">
                      <img
                        src={image.image_url.startsWith('http') ? image.image_url : `http://localhost:8000${image.image_url}`}
                        alt={image.prompt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          console.error('Failed to load image:', image.image_url);
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999" font-size="18"%3EImage not found%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      {image.watermark && (
                        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          Watermarked
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {image.prompt}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                            {image.tier}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(image.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          onClick={() => handlePublish(image)}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Publish to Community
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() =>
                              handleDownload(image.image_url, `creation-${image.id}`)
                            }
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleShare(image.image_url)}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(image.id)}
                            disabled={deleting === image.id}
                          >
                            {deleting === image.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Publish Dialog */}
      {selectedImage && (
        <PublishDialog
          isOpen={publishDialogOpen}
          onClose={() => setPublishDialogOpen(false)}
          imageId={selectedImage.id}
          imageUrl={selectedImage.image_url}
          defaultPrompt={selectedImage.prompt}
          onSuccess={handlePublishSuccess}
        />
      )}
    </ProtectedRoute>
  );
}

