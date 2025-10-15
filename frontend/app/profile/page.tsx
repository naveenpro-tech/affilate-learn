'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { useAuthStore } from '@/store/authStore';
import { authAPI, profileAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, fetchUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [editFormData, setEditFormData] = useState({
    full_name: '',
    phone: '',
    username: '',
    bio: '',
    instagram_url: '',
    twitter_url: '',
    linkedin_url: '',
  });

  const [passwordFormData, setPasswordFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    if (user) {
      setEditFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        username: (user as any).username || '',
        bio: (user as any).bio || '',
        instagram_url: (user as any).instagram_url || '',
        twitter_url: (user as any).twitter_url || '',
        linkedin_url: (user as any).linkedin_url || '',
      });
    }
  }, [user]);
  useEffect(() => {
    (async () => {
      try {
        const res = await profileAPI.getMe();
        setProfile(res.data);
      } catch {}
    })();
  }, []);


  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await authAPI.updateProfile(editFormData);
      await fetchUser(); // Refresh user data
      toast.success('Profile updated successfully!');
      setIsEditModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordFormData.new_password !== passwordFormData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordFormData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      await authAPI.changePassword(
        passwordFormData.current_password,
        passwordFormData.new_password
      );
      toast.success('Password changed successfully!');
      setIsPasswordModalOpen(false);
      setPasswordFormData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${user?.referral_code}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied!');
  };

  if (!user) {
    return (
      <ProtectedRoute>        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">My Profile</h1>
            <p className="text-neutral-600">Manage your account information</p>
          </motion.div>

          {/* Profile Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-6"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={profile?.avatar_url || '/avatar-placeholder.png'}
                      alt="avatar"
                      className="w-14 h-14 rounded-full object-cover border"
                    />
                    <CardTitle>Personal Information</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setLoading(true);
                          await profileAPI.uploadAvatar(file);
                          const res = await profileAPI.getMe();
                          setProfile(res.data);
                          toast.success('Avatar updated');
                        } catch (err: any) {
                          toast.error(err.response?.data?.detail || 'Failed to upload');
                        } finally {
                          setLoading(false);
                        }
                      }} />
                      <span className="px-3 py-2 border rounded-md text-sm">{loading ? 'Uploading...' : 'Upload Avatar'}</span>
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-neutral-600">Full Name</label>
                    <div className="font-semibold text-neutral-900 text-lg">{user.full_name}</div>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Email</label>
                    <div className="font-semibold text-neutral-900 text-lg">{user.email}</div>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Phone</label>
                    <div className="font-semibold text-neutral-900 text-lg">{user.phone || 'Not provided'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Username</label>
                    <div className="font-semibold text-neutral-900 text-lg">{(user as any).username || 'Not set'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-neutral-600">Bio</label>
                    <div className="text-neutral-900">{(user as any).bio || 'No bio added yet'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Social Links</label>
                    <div className="flex gap-2 mt-1">
                      {(user as any).instagram_url && (
                        <a href={(user as any).instagram_url} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-700">
                          📷 Instagram
                        </a>
                      )}
                      {(user as any).twitter_url && (
                        <a href={(user as any).twitter_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 ml-3">
                          🐦 Twitter
                        </a>
                      )}
                      {(user as any).linkedin_url && (
                        <a href={(user as any).linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-800 ml-3">
                          💼 LinkedIn
                        </a>
                      )}
                      {!(user as any).instagram_url && !(user as any).twitter_url && !(user as any).linkedin_url && (
                        <span className="text-neutral-500">No social links added</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-600">Account Status</label>
                    <div>
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {user.is_admin && (
                        <Badge variant="warning" className="ml-2">Admin</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Package Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Package Information</CardTitle>
              </CardHeader>
              <CardContent>
                {user.current_package ? (
                  <div className="flex items-center justify-between bg-neutral-50 p-6 rounded-lg">
                    <div>
                      <div className="text-sm text-neutral-600 mb-1">Current Package</div>
                      <Badge
                        variant={
                          user.current_package === 'Platinum' ? 'default' :
                          user.current_package === 'Gold' ? 'warning' :
                          'secondary'
                        }
                        className="text-lg px-4 py-2"
                      >
                        {user.current_package}
                      </Badge>
                    </div>
                    <Button variant="outline" onClick={() => window.location.href = '/packages'}>
                      Upgrade Package
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-neutral-600 mb-4">You haven't purchased a package yet</p>
                    <Button onClick={() => window.location.href = '/packages'}>
                      View Packages
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Referral Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Referral Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-neutral-600 mb-2 block">Your Referral Code</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-neutral-50 px-4 py-3 rounded-lg border border-neutral-200">
                        <code className="text-2xl font-bold text-primary-600">{user.referral_code}</code>
                      </div>
                      <Button onClick={copyReferralLink}>
                        Copy Link
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                      <div className="text-sm text-primary-700 mb-1">Direct Referrals</div>
                      <div className="text-2xl font-bold text-primary-600">
                        {user.direct_referrals || 0}
                      </div>
                    </div>
                    <div className="bg-success-50 p-4 rounded-lg border border-success-200">
                      <div className="text-sm text-success-700 mb-1">Total Earnings</div>
                      <div className="text-2xl font-bold text-success-600">
                        ₹{user.total_earnings?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-neutral-900">Password</div>
                    <div className="text-sm text-neutral-600">••••••••</div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditProfile} className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Full Name
              </label>
              <Input
                type="text"
                required
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Phone
              </label>
              <Input
                type="tel"
                required
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Username (Display Name)
              </label>
              <Input
                type="text"
                placeholder="johndoe123"
                value={editFormData.username}
                onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
              />
              <p className="text-xs text-neutral-500 mt-1">This will be shown on leaderboard and certificates</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Bio
              </label>
              <textarea
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
                maxLength={500}
                placeholder="Tell us about yourself..."
                value={editFormData.bio}
                onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
              />
              <p className="text-xs text-neutral-500 mt-1">{editFormData.bio.length}/500 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Instagram URL
              </label>
              <Input
                type="url"
                placeholder="https://instagram.com/yourusername"
                value={editFormData.instagram_url}
                onChange={(e) => setEditFormData({ ...editFormData, instagram_url: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Twitter/X URL
              </label>
              <Input
                type="url"
                placeholder="https://twitter.com/yourusername"
                value={editFormData.twitter_url}
                onChange={(e) => setEditFormData({ ...editFormData, twitter_url: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                LinkedIn URL
              </label>
              <Input
                type="url"
                placeholder="https://linkedin.com/in/yourusername"
                value={editFormData.linkedin_url}
                onChange={(e) => setEditFormData({ ...editFormData, linkedin_url: e.target.value })}
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Current Password
              </label>
              <Input
                type="password"
                required
                value={passwordFormData.current_password}
                onChange={(e) => setPasswordFormData({ ...passwordFormData, current_password: e.target.value })}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                New Password
              </label>
              <Input
                type="password"
                required
                value={passwordFormData.new_password}
                onChange={(e) => setPasswordFormData({ ...passwordFormData, new_password: e.target.value })}
                placeholder="Enter new password"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Must be at least 8 characters
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Confirm New Password
              </label>
              <Input
                type="password"
                required
                value={passwordFormData.confirm_password}
                onChange={(e) => setPasswordFormData({ ...passwordFormData, confirm_password: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordFormData({
                    current_password: '',
                    new_password: '',
                    confirm_password: '',
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}

