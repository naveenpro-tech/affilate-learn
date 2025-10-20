'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flag, Eye, EyeOff, Trash2, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Report {
  id: number;
  post_id: number;
  post_title: string;
  post_image_url: string;
  post_is_hidden: boolean;
  reporter_id: number;
  reporter_name: string;
  reason: string;
  description: string;
  status: string;
  action_taken: string;
  acted_by_name: string;
  created_at: string;
  updated_at: string;
}

interface ModerationStats {
  total_reports: number;
  open_reports: number;
  closed_reports: number;
  resolved_reports: number;
  hidden_posts: number;
}

export default function ModerationPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const [actioningReport, setActioningReport] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsRes, statsRes] = await Promise.all([
        adminAPI.getModerationReports(statusFilter === 'all' ? undefined : statusFilter),
        adminAPI.getModerationStats()
      ]);
      setReports(reportsRes.data.items);
      setStats(statsRes.data);
    } catch (error: any) {
      console.error('Failed to load moderation data:', error);
      toast.error('Failed to load moderation data');
    } finally {
      setLoading(false);
    }
  };

  const handleHidePost = async (postId: number) => {
    try {
      setActioningReport(postId);
      await adminAPI.hidePost(postId);
      toast.success('Post hidden successfully');
      loadData();
    } catch (error: any) {
      console.error('Failed to hide post:', error);
      toast.error('Failed to hide post');
    } finally {
      setActioningReport(null);
    }
  };

  const handleUnhidePost = async (postId: number) => {
    try {
      setActioningReport(postId);
      await adminAPI.unhidePost(postId);
      toast.success('Post unhidden successfully');
      loadData();
    } catch (error: any) {
      console.error('Failed to unhide post:', error);
      toast.error('Failed to unhide post');
    } finally {
      setActioningReport(null);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Are you sure you want to permanently delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setActioningReport(postId);
      await adminAPI.deletePost(postId);
      toast.success('Post deleted successfully');
      loadData();
    } catch (error: any) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    } finally {
      setActioningReport(null);
    }
  };

  const handleResolveReport = async (reportId: number, actionTaken: string) => {
    try {
      setActioningReport(reportId);
      await adminAPI.resolveReport(reportId, actionTaken);
      toast.success('Report resolved successfully');
      loadData();
    } catch (error: any) {
      console.error('Failed to resolve report:', error);
      toast.error('Failed to resolve report');
    } finally {
      setActioningReport(null);
    }
  };

  const handleCloseReport = async (reportId: number) => {
    try {
      setActioningReport(reportId);
      await adminAPI.closeReport(reportId);
      toast.success('Report closed successfully');
      loadData();
    } catch (error: any) {
      console.error('Failed to close report:', error);
      toast.error('Failed to close report');
    } finally {
      setActioningReport(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      open: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-gray-100 text-gray-800',
      resolved: 'bg-green-100 text-green-800',
    };
    return <Badge className={variants[status] || ''}>{status.toUpperCase()}</Badge>;
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <Flag className="w-10 h-10 text-red-500" />
              Content Moderation
            </h1>
            <p className="text-slate-600 mt-2">Review and manage reported community posts</p>
          </motion.div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900">{stats.total_reports}</div>
                    <div className="text-sm text-slate-600 mt-1">Total Reports</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">{stats.open_reports}</div>
                    <div className="text-sm text-slate-600 mt-1">Open</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{stats.resolved_reports}</div>
                    <div className="text-sm text-slate-600 mt-1">Resolved</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-600">{stats.closed_reports}</div>
                    <div className="text-sm text-slate-600 mt-1">Closed</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{stats.hidden_posts}</div>
                    <div className="text-sm text-slate-600 mt-1">Hidden Posts</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {['all', 'open', 'resolved', 'closed'].map((filter) => (
              <Button
                key={filter}
                variant={statusFilter === filter ? 'default' : 'outline'}
                onClick={() => setStatusFilter(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>

          {/* Reports List */}
          <Card>
            <CardHeader>
              <CardTitle>Reported Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-primary-500" />
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12 text-slate-600">
                  No {statusFilter !== 'all' ? statusFilter : ''} reports found
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        {/* Post Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={report.post_image_url}
                            alt={report.post_title}
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          {report.post_is_hidden && (
                            <Badge className="mt-2 bg-red-100 text-red-800">HIDDEN</Badge>
                          )}
                        </div>

                        {/* Report Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{report.post_title}</h3>
                              <p className="text-sm text-slate-600">
                                Reported by: {report.reporter_name} • {new Date(report.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            {getStatusBadge(report.status)}
                          </div>

                          <div className="mb-3">
                            <p className="text-sm font-medium text-slate-700">Reason: {report.reason}</p>
                            {report.description && (
                              <p className="text-sm text-slate-600 mt-1">{report.description}</p>
                            )}
                          </div>

                          {report.action_taken && (
                            <div className="mb-3 p-2 bg-green-50 rounded">
                              <p className="text-sm text-green-800">
                                Action: {report.action_taken} by {report.acted_by_name}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          {report.status === 'open' && (
                            <div className="flex gap-2 flex-wrap">
                              {report.post_is_hidden ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUnhidePost(report.post_id)}
                                  disabled={actioningReport === report.post_id}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Unhide Post
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleHidePost(report.post_id)}
                                  disabled={actioningReport === report.post_id}
                                >
                                  <EyeOff className="w-4 h-4 mr-1" />
                                  Hide Post
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeletePost(report.post_id)}
                                disabled={actioningReport === report.post_id}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete Post
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleResolveReport(report.id, 'reviewed')}
                                disabled={actioningReport === report.id}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Resolve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCloseReport(report.id)}
                                disabled={actioningReport === report.id}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Close
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

