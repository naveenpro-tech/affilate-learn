'use client';

import { useState, useEffect } from 'react';
import { studioAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Trash2, Edit2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  user_name: string;
  text: string;
  created_at: string;
  updated_at?: string;
  is_own: boolean;
}

interface CommentsSectionProps {
  postId: number;
  initialCount?: number;
}

export default function CommentsSection({ postId, initialCount = 0 }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [total, setTotal] = useState(initialCount);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await studioAPI.getComments(postId, 0, 50);
      setComments(response.data.items);
      setTotal(response.data.total);
    } catch (error: any) {
      console.error('Failed to load comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || newComment.length > 500) return;

    try {
      setSubmitting(true);
      const response = await studioAPI.createComment(postId, newComment.trim());
      
      // Add new comment to the top
      setComments([response.data, ...comments]);
      setTotal(total + 1);
      setNewComment('');
      toast.success('Comment posted!');
    } catch (error: any) {
      console.error('Failed to post comment:', error);
      toast.error(error.response?.data?.detail || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (commentId: number) => {
    if (!editText.trim() || editText.length > 500) return;

    try {
      const response = await studioAPI.updateComment(commentId, editText.trim());
      
      // Update comment in list
      setComments(comments.map(c => c.id === commentId ? response.data : c));
      setEditingId(null);
      setEditText('');
      toast.success('Comment updated!');
    } catch (error: any) {
      console.error('Failed to update comment:', error);
      toast.error(error.response?.data?.detail || 'Failed to update comment');
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await studioAPI.deleteComment(commentId);
      
      // Remove comment from list
      setComments(comments.filter(c => c.id !== commentId));
      setTotal(total - 1);
      toast.success('Comment deleted');
    } catch (error: any) {
      console.error('Failed to delete comment:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete comment');
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold">
          Comments {total > 0 && <span className="text-gray-500">({total})</span>}
        </h3>
      </div>

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 resize-none"
          rows={3}
          maxLength={500}
          disabled={submitting}
        />
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {newComment.length}/500 characters
          </span>
          <Button
            type="submit"
            disabled={!newComment.trim() || newComment.length > 500 || submitting}
            size="sm"
          >
            <Send className="w-4 h-4 mr-2" />
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                {comment.user_name.charAt(0).toUpperCase()}
              </div>

              {/* Comment Content */}
              <div className="flex-1 min-w-0">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{comment.user_name}</span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                      {comment.updated_at && (
                        <span className="text-xs text-gray-400">(edited)</span>
                      )}
                    </div>

                    {/* Actions (only for own comments) */}
                    {comment.is_own && editingId !== comment.id && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(comment)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comment Text or Edit Form */}
                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-sm resize-none"
                        rows={2}
                        maxLength={500}
                        autoFocus
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {editText.length}/500
                        </span>
                        <div className="flex gap-2">
                          <Button
                            onClick={cancelEdit}
                            variant="ghost"
                            size="sm"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleEdit(comment.id)}
                            disabled={!editText.trim() || editText.length > 500}
                            size="sm"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                      {comment.text}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

