'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { adminAPI, referralsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  referral_code: string;
  current_package: string | null;
  direct_referrals: number;
  total_earnings: number;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterPackage, setFilterPackage] = useState<'all' | 'silver' | 'gold' | 'platinum' | 'none'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [userReferrals, setUserReferrals] = useState<any[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserActive = async (userId: number) => {
    try {
      await adminAPI.toggleUserActive(userId);
      toast.success('User status updated');
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const toggleUserAdmin = async (userId: number) => {
    try {
      await adminAPI.toggleUserAdmin(userId);
      toast.success('Admin status updated');
      loadUsers();
    } catch (error) {
      toast.error('Failed to update admin status');
    }
  };

  const openUserDetails = async (user: User) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
    // Note: We can't load other user's referrals from admin API
    // This would need a new admin endpoint
  };

  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.referral_code.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active);

    // Package filter
    const matchesPackage =
      filterPackage === 'all' ||
      (filterPackage === 'none' && !user.current_package) ||
      (user.current_package && user.current_package.toLowerCase().includes(filterPackage));

    return matchesSearch && matchesStatus && matchesPackage;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    withPackage: users.filter(u => u.current_package).length,
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">User Management</h1>
            <p className="text-neutral-600">Manage all platform users and their permissions</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="grid md:grid-cols-4 gap-6 mb-8"
          >
            <Card className="border-l-4 border-primary-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary-600">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-success-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success-600">{stats.active}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-danger-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600">Inactive Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-danger-600">{stats.inactive}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-warning-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600">With Package</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning-600">{stats.withPackage}</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Search Users
                    </label>
                    <Input
                      type="text"
                      placeholder="Email, name, or referral code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active Only</option>
                      <option value="inactive">Inactive Only</option>
                    </select>
                  </div>

                  {/* Package Filter */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Package
                    </label>
                    <select
                      value={filterPackage}
                      onChange={(e) => setFilterPackage(e.target.value as any)}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="all">All Packages</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                      <option value="none">No Package</option>
                    </select>
                  </div>
                </div>

                {/* Results Count */}
                <div className="mt-4 text-sm text-neutral-600">
                  Showing <span className="font-semibold">{filteredUsers.length}</span> of{' '}
                  <span className="font-semibold">{users.length}</span> users
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card>
              <CardContent className="p-0">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Users Found</h3>
                    <p className="text-neutral-600">
                      {searchTerm || filterStatus !== 'all' || filterPackage !== 'all'
                        ? 'Try adjusting your filters'
                        : 'No users registered yet'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50">
                          <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-700">User</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-700">Referral Code</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-700">Package</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-700">Referrals</th>
                          <th className="text-right py-4 px-6 text-sm font-semibold text-neutral-700">Earnings</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-700">Status</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-neutral-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user, index) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <div>
                                <div className="font-semibold text-neutral-900">{user.full_name}</div>
                                <div className="text-sm text-neutral-600">{user.email}</div>
                                {user.phone && (
                                  <div className="text-xs text-neutral-500">{user.phone}</div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <code className="bg-neutral-100 px-2 py-1 rounded text-sm font-mono text-primary-600">
                                {user.referral_code}
                              </code>
                            </td>
                            <td className="py-4 px-6">
                              {user.current_package ? (
                                <Badge
                                  variant={
                                    user.current_package === 'Platinum' ? 'default' :
                                    user.current_package === 'Gold' ? 'warning' :
                                    'secondary'
                                  }
                                >
                                  {user.current_package}
                                </Badge>
                              ) : (
                                <span className="text-neutral-400 text-sm">None</span>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-semibold text-neutral-900">{user.direct_referrals}</span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className="font-semibold text-success-600">
                                ₹{user.total_earnings.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex flex-col gap-1">
                                <Badge variant={user.is_active ? 'default' : 'secondary'}>
                                  {user.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                {user.is_admin && (
                                  <Badge variant="warning">Admin</Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openUserDetails(user)}
                                >
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant={user.is_active ? 'outline' : 'default'}
                                  onClick={() => toggleUserActive(user.id)}
                                  className={user.is_active ? 'text-danger-600 hover:bg-danger-50' : 'bg-success-600 hover:bg-success-700'}
                                >
                                  {user.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleUserAdmin(user.id)}
                                  className={user.is_admin ? '' : 'text-warning-600 hover:bg-warning-50'}
                                >
                                  {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* User Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-neutral-600">Full Name</label>
                    <div className="font-semibold text-neutral-900">{selectedUser.full_name}</div>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Email</label>
                    <div className="font-semibold text-neutral-900">{selectedUser.email}</div>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Phone</label>
                    <div className="font-semibold text-neutral-900">{selectedUser.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Referral Code</label>
                    <div className="font-mono font-semibold text-primary-600">{selectedUser.referral_code}</div>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Joined Date</label>
                    <div className="font-semibold text-neutral-900">
                      {new Date(selectedUser.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Status</label>
                    <div className="flex gap-2">
                      <Badge variant={selectedUser.is_active ? 'default' : 'secondary'}>
                        {selectedUser.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {selectedUser.is_admin && (
                        <Badge variant="warning">Admin</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Info */}
              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">Package Information</h3>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  {selectedUser.current_package ? (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-600">Current Package:</span>
                      <Badge
                        variant={
                          selectedUser.current_package === 'Platinum' ? 'default' :
                          selectedUser.current_package === 'Gold' ? 'warning' :
                          'secondary'
                        }
                        className="text-lg px-4 py-2"
                      >
                        {selectedUser.current_package}
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-center text-neutral-500">
                      No package purchased yet
                    </div>
                  )}
                </div>
              </div>

              {/* Earnings Info */}
              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">Earnings & Referrals</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-success-50 p-4 rounded-lg border border-success-200">
                    <div className="text-sm text-success-700 mb-1">Total Earnings</div>
                    <div className="text-2xl font-bold text-success-600">
                      ₹{selectedUser.total_earnings.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                    <div className="text-sm text-primary-700 mb-1">Direct Referrals</div>
                    <div className="text-2xl font-bold text-primary-600">
                      {selectedUser.direct_referrals}
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Link */}
              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">Referral Link</h3>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="text-sm text-neutral-600 mb-2">User's Referral Link:</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${selectedUser.referral_code}`}
                      className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/register?ref=${selectedUser.referral_code}`
                        );
                        toast.success('Link copied!');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-neutral-200 pt-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">Quick Actions</h3>
                <div className="flex gap-3">
                  <Button
                    variant={selectedUser.is_active ? 'outline' : 'default'}
                    onClick={() => {
                      toggleUserActive(selectedUser.id);
                      setIsDetailsModalOpen(false);
                    }}
                    className={selectedUser.is_active ? 'text-danger-600 hover:bg-danger-50' : 'bg-success-600 hover:bg-success-700'}
                  >
                    {selectedUser.is_active ? 'Deactivate User' : 'Activate User'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toggleUserAdmin(selectedUser.id);
                      setIsDetailsModalOpen(false);
                    }}
                    className={selectedUser.is_admin ? '' : 'text-warning-600 hover:bg-warning-50'}
                  >
                    {selectedUser.is_admin ? 'Remove Admin Rights' : 'Grant Admin Rights'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
