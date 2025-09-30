'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
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

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.referral_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">User Management</h1>
            <div className="text-gray-600">
              Total Users: <span className="font-bold">{users.length}</span>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <input
              type="text"
              placeholder="Search by email, name, or referral code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">User</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Referral Code</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Package</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Referrals</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Earnings</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-semibold">{user.full_name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                          <div className="text-xs text-gray-500">{user.phone}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {user.referral_code}
                        </code>
                      </td>
                      <td className="py-4 px-6">
                        {user.current_package ? (
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                            {user.current_package}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">None</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold">{user.direct_referrals}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-green-600">
                          ₹{user.total_earnings.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          {user.is_admin && (
                            <div>
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                Admin
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleUserActive(user.id)}
                            className={`px-3 py-1 text-xs rounded ${
                              user.is_active
                                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => toggleUserAdmin(user.id)}
                            className={`px-3 py-1 text-xs rounded ${
                              user.is_admin
                                ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                            }`}
                          >
                            {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No users found matching your search.
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

