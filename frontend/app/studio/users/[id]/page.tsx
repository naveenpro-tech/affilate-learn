'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Heart, Sparkles, Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { studioAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { ImageGridSkeleton } from '@/components/studio/SkeletonLoaders';

interface UserProfile {
  user_id: number;
  user_name: string;
  total_posts: number;
  total_likes_received: number;
  total_remixes: number;
  member_since: string;
}

interface Post {
  id: number;
  image_url: string;
  title: string;
  author_name: string;
  category_name: string;
  likes_count: number;
  reuse_count: number;
  created_at: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = parseInt(params.id as string);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    loadPosts();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await studioAPI.getUserProfile(userId);
      setProfile(response.data);
    } catch (error: any) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await studioAPI.getUserPosts(userId);
      setPosts(response.data.items);
    } catch (error: any) {
      console.error('Failed to load posts:', error);
      toast.error('Failed to load user posts');
    } finally {
      setPostsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-slate-600">User not found</p>
            <Button onClick={() => router.back()} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {profile.user_name}
                  </h1>
                  {profile.member_since && (
                    <p className="text-slate-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Member since {new Date(profile.member_since).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">
                    {profile.total_posts}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {profile.total_likes_received}
                  </div>
                  <div className="text-sm text-slate-600 mt-1 flex items-center justify-center gap-1">
                    <Heart className="w-4 h-4" />
                    Likes Received
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {profile.total_remixes}
                  </div>
                  <div className="text-sm text-slate-600 mt-1 flex items-center justify-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Times Remixed
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Posts */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            {profile.user_name}'s Posts
          </h2>

          {postsLoading ? (
            <ImageGridSkeleton count={12} />
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-600">
                No posts yet
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer"
                  onClick={() => router.push(`/studio/community/${post.id}`)}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-square">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                        <p className="text-white font-medium text-sm">
                          View Details
                        </p>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      {post.category_name && (
                        <span className="inline-block px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded mb-2">
                          {post.category_name}
                        </span>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {post.likes_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-4 h-4" />
                          {post.reuse_count}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

