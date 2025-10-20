'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Download, Sparkles, Flag, ArrowLeft, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { studioAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import CommentsSection from '@/components/studio/CommentsSection';

interface PostDetail {
  id: number;
  user_id: number;
  title: string;
  description: string;
  image_url: string;
  user_name: string;
  category_name: string;
  tags: string[];
  likes_count: number;
  reuse_count: number;
  is_liked_by_me: boolean;
  prompt_text: string;
  enhanced_prompt: string;
  tier: string;
  provider: string;
  created_at: string;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = parseInt(params.id as string);
  
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const response = await studioAPI.getPostDetails(postId);
      setPost(response.data);
    } catch (error) {
      console.error('Failed to load post:', error);
      toast.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;

    try {
      const response = await studioAPI.likePost(postId);
      setPost({
        ...post,
        is_liked_by_me: response.data.liked,
        likes_count: response.data.likes_count
      });
      toast.success(response.data.liked ? 'Liked!' : 'Unliked');
    } catch (error) {
      console.error('Failed to like post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleRemix = async () => {
    try {
      const response = await studioAPI.getRemixPrompt(postId);
      // Navigate to studio with the prompt pre-filled
      router.push(`/studio?prompt=${encodeURIComponent(response.data.enhanced_prompt)}&source_post=${postId}`);
    } catch (error) {
      console.error('Failed to get remix prompt:', error);
      toast.error('Failed to remix');
    }
  };

  const handleDownload = () => {
    if (!post) return;
    
    const link = document.createElement('a');
    link.href = post.image_url;
    link.download = `${post.title.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  const handleCopyPrompt = () => {
    if (!post) return;
    
    navigator.clipboard.writeText(post.enhanced_prompt || post.prompt_text);
    setCopiedPrompt(true);
    toast.success('Prompt copied!');
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleReport = async () => {
    const reason = prompt('Why are you reporting this post?');
    if (!reason) return;
    
    try {
      await api.studio.reportPost(postId, reason);
      toast.success('Post reported. Thank you for helping keep our community safe.');
    } catch (error) {
      console.error('Failed to report post:', error);
      toast.error('Failed to report post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
          <Button onClick={() => router.push('/studio/community')}>
            Back to Gallery
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/studio/community')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Gallery
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="overflow-hidden">
              <img
                src={post.image_url.startsWith('http') ? post.image_url : `http://localhost:8000${post.image_url}`}
                alt={post.title}
                className="w-full h-auto"
                onError={(e) => {
                  console.error('Failed to load image:', post.image_url);
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23f0f0f0" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999" font-size="24"%3EImage not found%3C/text%3E%3C/svg%3E';
                }}
              />
            </Card>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Title & Author */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
              <div className="flex items-center gap-3">
                <p className="text-gray-600 dark:text-gray-400">
                  by <span className="font-semibold">{post.user_name}</span>
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/studio/users/${post.user_id}`)}
                >
                  View Profile
                </Button>
              </div>
            </div>

            {/* Description */}
            {post.description && (
              <Card className="p-4">
                <p className="text-gray-700 dark:text-gray-300">{post.description}</p>
              </Card>
            )}

            {/* Category & Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm font-medium">
                {post.category_name}
              </span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Heart className={`w-5 h-5 ${post.is_liked_by_me ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="font-semibold">{post.likes_count}</span>
                <span className="text-gray-600 dark:text-gray-400">likes</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">{post.reuse_count}</span>
                <span className="text-gray-600 dark:text-gray-400">remixes</span>
              </div>
            </div>

            {/* Prompt */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Prompt</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyPrompt}
                >
                  {copiedPrompt ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {post.enhanced_prompt || post.prompt_text}
              </p>
            </Card>

            {/* Generation Info */}
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Generation Details</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600 dark:text-gray-400">Quality:</span> {post.tier}</p>
                <p><span className="text-gray-600 dark:text-gray-400">Provider:</span> {post.provider}</p>
                <p><span className="text-gray-600 dark:text-gray-400">Created:</span> {new Date(post.created_at).toLocaleDateString()}</p>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleLike}
                variant={post.is_liked_by_me ? 'default' : 'outline'}
                className="flex-1"
              >
                <Heart className={`w-4 h-4 mr-2 ${post.is_liked_by_me ? 'fill-current' : ''}`} />
                {post.is_liked_by_me ? 'Liked' : 'Like'}
              </Button>
              
              <Button
                onClick={handleRemix}
                variant="outline"
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Remix
              </Button>
              
              <Button
                onClick={handleDownload}
                variant="outline"
              >
                <Download className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={handleReport}
                variant="ghost"
                size="icon"
              >
                <Flag className="w-4 h-4" />
              </Button>
            </div>

            {/* Comments Section */}
            <Card className="p-6 mt-6">
              <CommentsSection postId={postId} />
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

