'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { notificationsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
  read_at: string | null;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAll(0, 100, filter === 'unread');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read
      if (!notification.is_read) {
        await notificationsAPI.markAsRead(notification.id);
        loadNotifications();
      }

      // Navigate to link if exists
      if (notification.link) {
        router.push(notification.link);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsAPI.markAsRead(id);
      toast.success('Marked as read');
      loadNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAsUnread = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsAPI.markAsUnread(id);
      toast.success('Marked as unread');
      loadNotifications();
    } catch (error) {
      console.error('Error marking as unread:', error);
      toast.error('Failed to mark as unread');
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      await notificationsAPI.delete(id);
      toast.success('Notification deleted');
      loadNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      toast.success('All notifications marked as read');
      loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'referral':
        return '👥';
      case 'commission':
        return '💰';
      case 'payout':
        return '💸';
      case 'course':
        return '📚';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'referral':
        return 'bg-blue-100 text-blue-800';
      case 'commission':
        return 'bg-green-100 text-green-800';
      case 'payout':
        return 'bg-purple-100 text-purple-800';
      case 'course':
        return 'bg-orange-100 text-orange-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ProtectedRoute>      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Notifications</h1>
            <p className="text-neutral-600">Stay updated with your latest activities</p>
          </div>

          {/* Filters and Actions */}
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'unread' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('unread')}
                  >
                    Unread
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllRead}
                >
                  Mark all as read
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              </CardContent>
            </Card>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-6xl mb-4">🔔</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </h3>
                <p className="text-neutral-600">
                  {filter === 'unread'
                    ? 'You\'re all caught up!'
                    : 'We\'ll notify you when something important happens'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !notification.is_read ? 'border-l-4 border-l-primary-600 bg-primary-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="text-3xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-neutral-900">
                            {notification.title}
                          </h3>
                          <Badge
                            variant="default"
                            className={getNotificationColor(notification.type)}
                          >
                            {notification.type}
                          </Badge>
                        </div>
                        <p className="text-neutral-600 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                          <span>{formatDate(notification.created_at)}</span>
                          {notification.is_read && notification.read_at && (
                            <span className="text-xs">Read {formatDate(notification.read_at)}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {notification.is_read ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleMarkAsUnread(notification.id, e)}
                          >
                            Mark unread
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                          >
                            Mark read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDelete(notification.id, e)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

