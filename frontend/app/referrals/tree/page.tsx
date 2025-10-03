'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { referralsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface TreeNode {
  id: number;
  full_name: string;
  email: string;
  referral_code: string;
  current_package: string | null;
  level: number;
  children: TreeNode[];
}

export default function ReferralTreePage() {
  const router = useRouter();
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_nodes: 0,
    level1_count: 0,
    level2_count: 0,
  });

  useEffect(() => {
    loadTree();
  }, []);

  const loadTree = async () => {
    try {
      setLoading(true);
      const response = await referralsAPI.getTree();
      const treeData = response.data;
      setTree(treeData);

      // Calculate stats
      const level1 = treeData.children?.length || 0;
      const level2 = treeData.children?.reduce((sum: number, child: TreeNode) => 
        sum + (child.children?.length || 0), 0) || 0;
      
      setStats({
        total_nodes: level1 + level2,
        level1_count: level1,
        level2_count: level2,
      });
    } catch (error: any) {
      console.error('Error loading referral tree:', error);
      toast.error('Failed to load referral tree');
    } finally {
      setLoading(false);
    }
  };

  const renderNode = (node: TreeNode, isRoot: boolean = false) => {
    return (
      <div key={node.id} className={`${isRoot ? '' : 'ml-8 mt-4'}`}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`${
            isRoot 
              ? 'border-4 border-primary-500 bg-primary-50' 
              : node.level === 1 
              ? 'border-2 border-blue-400 bg-blue-50' 
              : 'border-2 border-purple-400 bg-purple-50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-neutral-900">
                      {node.full_name}
                      {isRoot && <span className="ml-2 text-sm text-primary-600">(You)</span>}
                    </h3>
                    {!isRoot && (
                      <Badge variant={node.level === 1 ? 'default' : 'warning'}>
                        Level {node.level}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-neutral-600 space-y-1">
                    <div>📧 {node.email}</div>
                    <div>🔗 {node.referral_code}</div>
                    {node.current_package && (
                      <div className="mt-2">
                        <Badge variant={
                          node.current_package === 'Platinum' ? 'default' :
                          node.current_package === 'Gold' ? 'warning' :
                          'secondary'
                        }>
                          {node.current_package} Package
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                {!isRoot && (
                  <div className="text-4xl">
                    {node.level === 1 ? '👤' : '👥'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Render children */}
        {node.children && node.children.length > 0 && (
          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-300"></div>
            
            <div className="space-y-4">
              {node.children.map((child) => renderNode(child))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading referral tree...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <button
              onClick={() => router.push('/referrals')}
              className="text-primary-600 hover:text-primary-700 font-medium mb-4 flex items-center"
            >
              ← Back to Referrals
            </button>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Referral Network Tree</h1>
            <p className="text-neutral-600">Visualize your complete referral network</p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="grid md:grid-cols-3 gap-6 mb-8"
          >
            <Card className="border-l-4 border-primary-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600">Total Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary-600">
                  {stats.total_nodes}
                </div>
                <div className="text-xs text-neutral-500 mt-1">People in your network</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600">Level 1 (Direct)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.level1_count}
                </div>
                <div className="text-xs text-neutral-500 mt-1">Direct referrals</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-600">Level 2 (Indirect)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.level2_count}
                </div>
                <div className="text-xs text-neutral-500 mt-1">Indirect referrals</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tree Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {tree ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-neutral-900">Network Structure</h2>
                {renderNode(tree, true)}
                
                {stats.total_nodes === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🌳</div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Start Building Your Network
                    </h3>
                    <p className="text-neutral-600 mb-6">
                      Share your referral link to grow your network and earn commissions
                    </p>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
                    >
                      View Referral Link
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="text-6xl mb-4">❌</div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    Unable to Load Tree
                  </h3>
                  <p className="text-neutral-600 mb-6">
                    There was an error loading your referral tree
                  </p>
                  <button
                    onClick={loadTree}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
                  >
                    Try Again
                  </button>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Legend */}
          {stats.total_nodes > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-6"
            >
              <Card className="bg-neutral-100">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-neutral-900 mb-3">Legend</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary-500 rounded"></div>
                      <span>You (Root)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-400 rounded"></div>
                      <span>Level 1 (Direct Referrals)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-purple-400 rounded"></div>
                      <span>Level 2 (Indirect Referrals)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

