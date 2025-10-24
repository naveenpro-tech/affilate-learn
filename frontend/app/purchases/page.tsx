'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Download, Package, BookOpen, Calendar, DollarSign, FileText, Filter } from 'lucide-react';

interface Purchase {
  id: number;
  purchase_type: string;
  item_name: string;
  item_description: string | null;
  amount_paid: number;
  payment_status: string;
  purchase_date: string;
  payment_id: number | null;
  invoice_id: number | null;
  invoice_number: string | null;
  has_invoice: boolean;
}

interface PurchaseHistory {
  total_purchases: number;
  total_spent: number;
  purchases: Purchase[];
}

export default function PurchasesPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<PurchaseHistory | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPurchaseHistory();
  }, [filterType]);

  const fetchPurchaseHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/purchases/history`;
      if (filterType !== 'all') {
        url += `?purchase_type=${filterType}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch purchase history');
      }

      const data = await response.json();
      setHistory(data);
    } catch (error: any) {
      console.error('Error fetching purchase history:', error);
      toast.error('Failed to load purchase history');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (invoiceId: number, invoiceNumber: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${invoiceId}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Invoice downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const filteredPurchases = history?.purchases.filter(purchase =>
    purchase.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading purchase history...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Purchase History</h1>
            <p className="text-gray-600 text-lg">View all your package and course purchases</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Purchases</p>
                      <p className="text-3xl font-bold text-gray-900">{history?.total_purchases || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Spent</p>
                      <p className="text-3xl font-bold text-gray-900">₹{history?.total_spent.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search purchases..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filterType === 'all' ? 'default' : 'outline'}
                      onClick={() => setFilterType('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={filterType === 'package' ? 'default' : 'outline'}
                      onClick={() => setFilterType('package')}
                    >
                      Packages
                    </Button>
                    <Button
                      variant={filterType === 'course' ? 'default' : 'outline'}
                      onClick={() => setFilterType('course')}
                    >
                      Courses
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Purchase List */}
          <div className="space-y-4">
            {filteredPurchases.length === 0 ? (
              <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 shadow-lg">
                <CardContent className="py-12 text-center">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No purchases found</p>
                  <p className="text-gray-500 mt-2">Start learning by purchasing a package or course!</p>
                </CardContent>
              </Card>
            ) : (
              filteredPurchases.map((purchase, index) => (
                <motion.div
                  key={purchase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 hover:shadow-xl transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            purchase.purchase_type === 'package'
                              ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                              : 'bg-gradient-to-br from-orange-500 to-red-500'
                          }`}>
                            {purchase.purchase_type === 'package' ? (
                              <Package className="w-6 h-6 text-white" />
                            ) : (
                              <BookOpen className="w-6 h-6 text-white" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-900">{purchase.item_name}</h3>
                              <Badge variant={purchase.payment_status === 'success' ? 'success' : 'secondary'}>
                                {purchase.payment_status}
                              </Badge>
                            </div>
                            
                            {purchase.item_description && (
                              <p className="text-gray-600 text-sm mb-2">{purchase.item_description}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(purchase.purchase_date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                ₹{purchase.amount_paid.toFixed(2)}
                              </div>
                              {purchase.has_invoice && (
                                <div className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  {purchase.invoice_number}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {purchase.has_invoice && purchase.invoice_id && (
                          <Button
                            onClick={() => downloadInvoice(purchase.invoice_id!, purchase.invoice_number!)}
                            className="flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Download Invoice
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

