'use client';

import { useEffect, useState } from 'use';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { coursesAPI, coursePurchasesAPI } from '@/lib/api';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Course {
  id: number;
  title: string;
  description: string;
  package_name: string;
  thumbnail_url?: string;
  video_count: number;
  individual_price?: number;
}

export default function CoursePurchasePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params.id as string);
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [accessStatus, setAccessStatus] = useState<any>(null);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const [courseRes, accessRes] = await Promise.all([
        coursesAPI.getById(courseId),
        coursePurchasesAPI.checkAccess(courseId)
      ]);
      
      setCourse(courseRes.data);
      setAccessStatus(accessRes.data);
      
      // If user already has access, redirect to course
      if (accessRes.data.has_access) {
        toast.success('You already have access to this course!');
        router.push(`/courses/${courseId}`);
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course details');
      router.push('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setPurchasing(true);
      
      // Initiate purchase
      const response = await coursePurchasesAPI.initiate(courseId);
      const { order_id, amount, currency, course_title, razorpay_key } = response.data;
      
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        const options = {
          key: razorpay_key,
          amount: amount * 100,
          currency: currency,
          name: 'MLM Learning Platform',
          description: `Purchase: ${course_title}`,
          order_id: order_id,
          handler: async function (response: any) {
            try {
              // Verify payment
              await coursePurchasesAPI.verify(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature,
                courseId
              );
              
              toast.success('Course purchased successfully!');
              router.push(`/courses/${courseId}`);
            } catch (error) {
              console.error('Payment verification failed:', error);
              toast.error('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: '',
            email: '',
            contact: ''
          },
          theme: {
            color: '#667eea'
          },
          modal: {
            ondismiss: function() {
              setPurchasing(false);
              toast.error('Payment cancelled');
            }
          }
        };
        
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
    } catch (error: any) {
      console.error('Error initiating purchase:', error);
      toast.error(error.response?.data?.detail || 'Failed to initiate purchase');
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 pt-20 px-4">
          <div className="max-w-4xl mx-auto py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-neutral-600">Loading course details...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 pt-20 px-4">
        <div className="max-w-4xl mx-auto py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Purchase Course</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Course Details */}
                  <div>
                    {course.thumbnail_url && (
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                      {course.title}
                    </h2>
                    <p className="text-neutral-600 mb-4">
                      {course.description}
                    </p>
                    <div className="space-y-2 text-sm text-neutral-600">
                      <div className="flex items-center">
                        <span className="font-semibold mr-2">📹 Videos:</span>
                        {course.video_count} lessons
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold mr-2">📦 Package:</span>
                        {course.package_name}
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold mr-2">⏰ Access:</span>
                        Lifetime
                      </div>
                    </div>
                  </div>

                  {/* Purchase Summary */}
                  <div>
                    <div className="bg-neutral-50 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold mb-4">Purchase Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Course Price</span>
                          <span className="font-semibold">₹{course.individual_price || 199}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Tax</span>
                          <span className="font-semibold">₹0</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between text-lg">
                          <span className="font-bold">Total</span>
                          <span className="font-bold text-primary-600">
                            ₹{course.individual_price || 199}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button
                        onClick={handlePurchase}
                        disabled={purchasing}
                        className="w-full"
                        size="lg"
                      >
                        {purchasing ? 'Processing...' : '🛒 Purchase Now'}
                      </Button>
                      
                      <Button
                        onClick={() => router.push('/courses')}
                        variant="outline"
                        className="w-full"
                      >
                        ← Back to Courses
                      </Button>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">✓ What you'll get:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Lifetime access to all course videos</li>
                        <li>• Learn at your own pace</li>
                        <li>• Certificate upon completion</li>
                        <li>• Mobile and desktop access</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

