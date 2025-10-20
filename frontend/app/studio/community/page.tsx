'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Eye, Sparkles, Filter, Search, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { studioAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ImageGridSkeleton } from '@/components/studio/SkeletonLoaders';
import { EmptyState } from '@/components/studio/EmptyStates';
import SearchBar from '@/components/studio/SearchBar';
import FilterSidebar from '@/components/studio/FilterSidebar';

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

export default function CommunityGalleryPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [providerFilter, setProviderFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [selectedCategory, searchQuery, sortBy, tierFilter, providerFilter]);

  const loadCategories = async () => {
    try {
      const response = await studioAPI.getCategories();
      setCategories(response.data.items);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params: any = {
        cursor: 0,
        limit: 20,
      };

      if (selectedCategory) params.category_id = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      if (sortBy) params.sort_by = sortBy;
      if (tierFilter) params.tier = tierFilter;
      if (providerFilter) params.provider = providerFilter;

      const response = await studioAPI.getCommunityFeed(
        params.cursor,
        params.limit,
        params.category_id,
        params.search,
        params.tier,
        params.provider,
        params.sort_by
      );

      setPosts(response.data.items);
    } catch (error) {
      console.error('Failed to load community posts:', error);
      toast.error('Failed to load community posts');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSortBy('newest');
    setTierFilter(null);
    setProviderFilter(null);
    setSelectedCategory(null);
  };

  const handleLike = async (postId: number) => {
    try {
      const response = await studioAPI.likePost(postId);

      // Update local state
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, user_liked: response.data.liked, likes_count: response.data.likes_count }
          : post
      ));

      toast.success(response.data.liked ? 'Liked!' : 'Unliked');
    } catch (error) {
      console.error('Failed to like post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleViewPost = (postId: number) => {
    router.push(`/studio/community/${postId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Community Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore amazing AI-generated images from our community
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search posts by title or description..."
          />
        </div>

        {/* Category Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}

          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden ml-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>

        {/* Main Content with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar
              sortBy={sortBy}
              onSortChange={setSortBy}
              tier={tierFilter}
              onTierChange={setTierFilter}
              provider={providerFilter}
              onProviderChange={setProviderFilter}
              onClearAll={handleClearFilters}
              isOpen={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
            />
          </div>

          {/* Posts Grid */}
          <div className="lg:col-span-3">{/* Posts Grid */}
        {loading ? (
          <ImageGridSkeleton count={12} />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="w-16 h-16" />}
            title="No posts yet"
            description="Be the first to share your creation with the community!"
            action={{
              label: 'Create Image',
              onClick: () => router.push('/studio')
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
                  {/* Image */}
                  <div
                    className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer"
                    onClick={() => handleViewPost(post.id)}
                  >
                    <img
                      src={post.image_url.startsWith('http') ? post.image_url : `http://localhost:8000${post.image_url}`}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.error('Failed to load image:', post.image_url);
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999" font-size="18"%3EImage not found%3C/text%3E%3C/svg%3E';
                      }}
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 truncate">{post.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      by {post.author_name}
                    </p>

                    {/* Category Badge */}
                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                        {post.category_name}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(post.id);
                          }}
                          className={post.user_liked ? 'text-red-500' : ''}
                        >
                          <Heart
                            className={`w-4 h-4 mr-1 ${post.user_liked ? 'fill-current' : ''}`}
                          />
                          {post.likes_count}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewPost(post.id);
                          }}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {post.comments_count || 0}
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/studio/community/${post.id}/remix`);
                        }}
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        {post.reuse_count}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

            {/* Load More */}
            {!loading && posts.length > 0 && (
              <div className="mt-8 text-center">
                <Button variant="outline" onClick={loadPosts}>
                  Load More
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

