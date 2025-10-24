'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, FileText, Shield, AlertCircle } from 'lucide-react';
import EnhancedNavbar from '@/components/EnhancedNavbar';

export default function TermsPage() {
  return (
    <>
      <EnhancedNavbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Terms & Conditions
              </h1>
            </div>
            <p className="text-gray-600">
              Last Updated: October 24, 2025
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8"
          >
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Affiliate Learning Platform ("we," "our," or "us"). By accessing or using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By creating an account, accessing, or using the Affiliate Learning Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, as well as our Privacy Policy.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you do not agree to these terms, you must not use our platform.
              </p>
            </section>

            {/* Eligibility */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Eligibility</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To use our platform, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Be at least 18 years of age</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Account Registration</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you create an account, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            {/* Course Access and Packages */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Course Access and Packages</h2>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  <strong>5.1 Package Tiers:</strong> We offer three package tiers (Silver, Gold, Platinum), each providing access to different course levels and earning potential.
                </p>
                <p className="leading-relaxed">
                  <strong>5.2 Course Access:</strong> Upon successful payment, you will receive immediate access to courses included in your purchased package.
                </p>
                <p className="leading-relaxed">
                  <strong>5.3 License:</strong> We grant you a limited, non-exclusive, non-transferable license to access and use the courses for personal, non-commercial purposes only.
                </p>
                <p className="leading-relaxed">
                  <strong>5.4 Restrictions:</strong> You may not copy, distribute, modify, or create derivative works from our course content without explicit written permission.
                </p>
              </div>
            </section>

            {/* Referral Program */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Referral Program</h2>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  <strong>6.1 Commission Structure:</strong> Our 2-level referral system allows you to earn commissions on direct referrals (Level 1) and their referrals (Level 2).
                </p>
                <p className="leading-relaxed">
                  <strong>6.2 Eligibility:</strong> To participate in the referral program, you must have an active package subscription.
                </p>
                <p className="leading-relaxed">
                  <strong>6.3 Prohibited Activities:</strong> You may not engage in spam, false advertising, or any deceptive practices to generate referrals.
                </p>
                <p className="leading-relaxed">
                  <strong>6.4 Commission Payments:</strong> Commissions are paid weekly to your registered bank account or UPI, subject to minimum payout thresholds.
                </p>
              </div>
            </section>

            {/* Payment Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Payment Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  <strong>7.1 Pricing:</strong> All prices are listed in Indian Rupees (₹) and are subject to change with prior notice.
                </p>
                <p className="leading-relaxed">
                  <strong>7.2 Payment Methods:</strong> We accept payments via Razorpay, including credit/debit cards, UPI, net banking, and wallets.
                </p>
                <p className="leading-relaxed">
                  <strong>7.3 Refunds:</strong> Refund requests must be submitted within 7 days of purchase. Refunds are processed within 7-10 business days.
                </p>
                <p className="leading-relaxed">
                  <strong>7.4 Failed Transactions:</strong> If a payment fails, your access may be suspended until payment is successfully completed.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content on the Affiliate Learning Platform, including but not limited to text, graphics, logos, videos, and software, is the property of Affiliate Learning Platform or its licensors and is protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You may not reproduce, distribute, modify, or create derivative works without our explicit written permission.
              </p>
            </section>

            {/* User Conduct */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. User Conduct</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>Upload malicious code or viruses</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Engage in any activity that disrupts or interferes with our services</li>
                <li>Use automated systems (bots) to access the platform</li>
                <li>Share your account credentials with others</li>
              </ul>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to suspend or terminate your account at any time, with or without notice, for any reason, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Violation of these Terms and Conditions</li>
                <li>Fraudulent or illegal activity</li>
                <li>Non-payment of fees</li>
                <li>Abuse of the referral program</li>
              </ul>
            </section>

            {/* Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Disclaimer of Warranties</h2>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-gray-700 leading-relaxed">
                    THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
                  </p>
                </div>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, AFFILIATE LEARNING PLATFORM SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE PLATFORM.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms and Conditions at any time. We will notify you of any material changes by posting the updated terms on our platform. Your continued use of the platform after such changes constitutes your acceptance of the new terms.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the courts in [Your City], India.
              </p>
            </section>

            {/* Contact Information */}
            <section className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="bg-blue-50 rounded-lg p-6 space-y-2">
                <p className="text-gray-700"><strong>Email:</strong> support@affiliatelearning.com</p>
                <p className="text-gray-700"><strong>Phone:</strong> +91 XXXXX XXXXX</p>
                <p className="text-gray-700"><strong>Address:</strong> [Your Business Address]</p>
              </div>
            </section>
          </motion.div>

          {/* Footer Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-center"
          >
            <Link
              href="/privacy"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              View Privacy Policy →
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}

