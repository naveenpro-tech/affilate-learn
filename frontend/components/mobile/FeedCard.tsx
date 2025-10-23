'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Repeat2, Share2, Bookmark, MoreVertical } from 'lucide-react';

interface FeedCardProps {
  post: {
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
  };
  onLike: (postId: number) => void;
  onRemix: (postId: number) => void;
  onShare: (postId: number) => void;
  onDoubleTap: (postId: number) => void;
}

export default function FeedCard({ post, onLike, onRemix, onShare, onDoubleTap }: FeedCardProps) {
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const lastTapRef = useRef<number>(0);
  const imageRef = useRef<HTMLDivElement>(null);

  // Double-tap detection
  const handleTap = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Double-tap detected
      handleDoubleTap();
    }

    lastTapRef.current = now;
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
      onDoubleTap(post.id);
    }

    // Show heart animation
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 800);
  };

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike(post.id);
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Prevent default zoom on double-tap
  useEffect(() => {
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const imageElement = imageRef.current;
    if (imageElement) {
      imageElement.addEventListener('touchstart', preventZoom, { passive: false });
    }

    return () => {
      if (imageElement) {
        imageElement.removeEventListener('touchstart', preventZoom);
      }
    };
  }, []);

  return (
    <div className="feed-card relative w-screen h-screen overflow-hidden bg-black">
      {/* Full-screen image */}
      <div
        ref={imageRef}
        className="absolute inset-0 flex items-center justify-center"
        onClick={handleTap}
        style={{ touchAction: 'manipulation' }}
      >
        <Image
          src={post.image_url.startsWith('http') ? post.image_url : `http://localhost:8000${post.image_url}`}
          alt={post.title}
          fill
          className="object-contain"
          priority
          sizes="100vw"
          quality={90}
        />

        {/* Double-tap heart animation */}
        {showHeartAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Heart
              className="text-white animate-heart-pop"
              size={120}
              fill="white"
              strokeWidth={0}
            />
          </div>
        )}
      </div>

      {/* Overlay gradient with content */}
      <div className="feed-card__overlay absolute bottom-0 left-0 right-0 p-6 pb-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
        {/* Safe area for iOS home indicator */}
        <div className="pb-safe">
          {/* Author info */}
          <div className="feed-card__author flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
              {post.author.avatar_url ? (
                <Image
                  src={post.author.avatar_url}
                  alt={post.author.username}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold">
                  {post.author.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-sm font-medium">@{post.author.username}</span>
          </div>

          {/* Title */}
          <h2 className="feed-card__title text-lg font-semibold mb-3 line-clamp-2">
            {post.title}
          </h2>

          {/* Engagement stats */}
          <div className="feed-card__stats flex items-center gap-4 mb-4 text-sm">
            <button
              onClick={handleLikeClick}
              className="flex items-center gap-1 transition-transform active:scale-95"
            >
              <Heart
                size={20}
                className={isLiked ? 'fill-red-500 text-red-500' : 'text-white'}
              />
              <span>{formatCount(likesCount)}</span>
            </button>

            <div className="flex items-center gap-1">
              <MessageCircle size={20} />
              <span>{formatCount(post.comments_count)}</span>
            </div>

            <div className="flex items-center gap-1">
              <Repeat2 size={20} />
              <span>{formatCount(post.remixes_count)}</span>
            </div>
          </div>

          {/* Primary CTA - Remix button */}
          <button
            onClick={() => onRemix(post.id)}
            className="feed-card__remix-btn w-full py-4 px-6 bg-[#667eea] text-white rounded-xl text-base font-semibold transition-transform active:scale-95 mb-3 flex items-center justify-center gap-2"
          >
            <span className="text-xl">🎨</span>
            <span>Remix</span>
          </button>

          {/* Secondary actions */}
          <div className="flex items-center justify-center gap-6 text-white">
            <button
              onClick={() => {/* Save functionality */}}
              className="p-2 transition-transform active:scale-95"
              aria-label="Save"
            >
              <Bookmark size={24} />
            </button>

            <button
              onClick={() => onShare(post.id)}
              className="p-2 transition-transform active:scale-95"
              aria-label="Share"
            >
              <Share2 size={24} />
            </button>

            <button
              onClick={() => {/* More options */}}
              className="p-2 transition-transform active:scale-95"
              aria-label="More options"
            >
              <MoreVertical size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* CSS for heart animation */}
      <style jsx>{`
        @keyframes heart-pop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        .animate-heart-pop {
          animation: heart-pop 0.8s ease-out;
        }

        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

