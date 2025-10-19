'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { notificationsAPI } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  read: number;
}

export default function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0, read: 0 });
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadStats();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadStats = async () => {
    try {
      const response = await notificationsAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAll(0, 10);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    if (!isOpen) {
      loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read
      if (!notification.is_read) {
        await notificationsAPI.markAsRead(notification.id);
        loadStats();
        loadNotifications();
      }

      // Navigate to link if exists
      if (notification.link) {
        router.push(notification.link);
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      toast.success('All notifications marked as read');
      loadStats();
      loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleViewAll = () => {
    router.push('/notifications');
    setIsOpen(false);
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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-neutral-600 hover:text-primary-600 transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {stats.unread > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {stats.unread > 99 ? '99+' : stats.unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-neutral-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900">Notifications</h3>
            {stats.unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-neutral-500">
                <div className="text-4xl mb-2">🔔</div>
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors ${
                      !notification.is_read ? 'bg-primary-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-neutral-900 truncate">
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <span className="ml-2 w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-neutral-400 mt-1">
                          {getTimeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-neutral-200">
              <button
                onClick={handleViewAll}
                className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

