'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import FeedCard from '@/components/mobile/FeedCard';
import RemixModal from '@/components/mobile/RemixModal';
import { studioAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface CommunityPost {
  id: number;
  image_url: string;
  title: string;
  author_name: string;
  category_name: string;
  likes_count: number;
  reuse_count: number;
  comments_count?: number;
  user_liked: boolean;
  created_at: string;
}

interface FeedPost {
  id: number;
  image_url: string;
  title: string;
  author: {
    username: string;
    avatar_url?: string;
  };
  likes_count: number;
  comments_count: number;
  remixes_count: number;
  is_liked: boolean;
}

export default function MobileFeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isRemixModalOpen, setIsRemixModalOpen] = useState(false);
  const [selectedPostForRemix, setSelectedPostForRemix] = useState<FeedPost | null>(null);

  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Transform API response to FeedPost format
  const transformPost = (post: CommunityPost): FeedPost => ({
    id: post.id,
    image_url: post.image_url,
    title: post.title,
    author: {
      username: post.author_name,
      avatar_url: undefined, // TODO: Add avatar_url to backend response
    },
    likes_count: post.likes_count,
    comments_count: post.comments_count || 0,
    remixes_count: post.reuse_count,
    is_liked: post.user_liked,
  });

  // Load initial posts
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await studioAPI.getCommunityFeed(
        loadMore ? cursor : 0,
        20,
        undefined,
        undefined,
        undefined,
        undefined,
        'newest'
      );

      const transformedPosts = response.data.items.map(transformPost);

      if (loadMore) {
        setPosts(prev => [...prev, ...transformedPosts]);
      } else {
        setPosts(transformedPosts);
      }

      // Update cursor for next page
      if (response.data.next_cursor) {
        setCursor(parseInt(response.data.next_cursor));
        setHasMore(true);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
      setError('Failed to load posts. Please try again.');
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  // Swipe navigation
  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = useCallback((newDirection: number) => {
    const newIndex = currentIndex + newDirection;

    // Boundary checks
    if (newIndex < 0 || newIndex >= posts.length) {
      return;
    }

    setDirection(newDirection);
    setCurrentIndex(newIndex);

    // Load more posts when approaching the end
    if (newIndex >= posts.length - 3 && hasMore && !loading) {
      loadPosts(true);
    }
  }, [currentIndex, posts.length, hasMore, loading]);

  // Keyboard navigation (for desktop testing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        paginate(1);
      } else if (e.key === 'ArrowDown') {
        paginate(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paginate]);

  // Handlers
  const handleLike = async (postId: number) => {
    try {
      const response = await studioAPI.likePost(postId);

      // Update posts array
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, is_liked: response.data.liked, likes_count: response.data.likes_count }
          : post
      ));
    } catch (err) {
      console.error('Failed to like post:', err);
      toast.error('Failed to like post');
    }
  };

  const handleDoubleTap = (postId: number) => {
    handleLike(postId);
  };

  const handleRemix = (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPostForRemix(post);
      setIsRemixModalOpen(true);
    }
  };

  const handleShare = async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const shareUrl = `${window.location.origin}/studio/feed?post=${postId}`;
    const shareText = `Check out "${post.title}" on Community AI Studio!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  // Framer Motion variants
  const variants = {
    enter: (direction: number) => ({
      y: direction > 0 ? '100vh' : '-100vh',
    }),
    center: {
      y: 0,
    },
    exit: (direction: number) => ({
      y: direction < 0 ? '100vh' : '-100vh',
    }),
  };

  if (loading && posts.length === 0) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading feed...</p>
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center p-6">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => loadPosts()}
            className="px-6 py-3 bg-[#667eea] rounded-lg font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        <p>No posts available</p>
      </div>
    );
  }

  const currentPost = posts[currentIndex];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Vertical feed with swipe navigation */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
          drag={isMobile ? 'y' : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }: PanInfo) => {
            const swipe = swipePower(offset.y, velocity.y);
            if (swipe < -swipeConfidenceThreshold) {
              paginate(1); // Swipe up -> next
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1); // Swipe down -> previous
            }
          }}
          className="absolute inset-0"
          style={{ willChange: 'transform' }}
        >
          <FeedCard
            post={currentPost}
            onLike={handleLike}
            onRemix={handleRemix}
            onShare={handleShare}
            onDoubleTap={handleDoubleTap}
          />
        </motion.div>
      </AnimatePresence>

      {/* Post counter (optional) */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
        {currentIndex + 1} / {posts.length}
      </div>

      {/* Remix Modal */}
      {selectedPostForRemix && (
        <RemixModal
          isOpen={isRemixModalOpen}
          onClose={() => setIsRemixModalOpen(false)}
          originalImageUrl={selectedPostForRemix.image_url}
          postId={selectedPostForRemix.id}
        />
      )}
    </div>
  );
}

