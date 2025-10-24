'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';
import EnhancedNavbar from '@/components/EnhancedNavbar';

export default function PrivacyPage() {
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
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Privacy Policy
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
                At Affiliate Learning Platform, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our platform.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-blue-600" />
                2. Information We Collect
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    When you register for an account, we collect:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Phone number</li>
                    <li>Password (encrypted)</li>
                    <li>Referral code (if applicable)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Financial Information</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    For payments and payouts, we collect:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Bank account details (account number, IFSC code, account holder name)</li>
                    <li>UPI ID</li>
                    <li>Payment transaction history</li>
                  </ul>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-4">
                    <div className="flex items-start">
                      <Lock className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-gray-700 text-sm">
                        <strong>Note:</strong> Payment card details are processed securely through Razorpay. We do not store your complete card information on our servers.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Usage Information</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We automatically collect information about how you use our platform:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Course enrollment and progress</li>
                    <li>Login history and session data</li>
                    <li>IP address and device information</li>
                    <li>Browser type and operating system</li>
                    <li>Pages visited and time spent on platform</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">2.4 Referral Information</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    For our referral program, we track:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Your unique referral code</li>
                    <li>Referrals you've made (Level 1 and Level 2)</li>
                    <li>Commission earnings and payout history</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-blue-600" />
                3. How We Use Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Account Management:</strong> To create and manage your account</li>
                <li><strong>Course Delivery:</strong> To provide access to courses and track your progress</li>
                <li><strong>Payment Processing:</strong> To process payments and distribute commissions</li>
                <li><strong>Communication:</strong> To send important updates, notifications, and support messages</li>
                <li><strong>Platform Improvement:</strong> To analyze usage patterns and improve our services</li>
                <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security incidents</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  We do not sell, rent, or trade your personal information to third parties. We may share your information only in the following circumstances:
                </p>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">4.1 Service Providers</h3>
                  <p className="leading-relaxed">
                    We share information with trusted third-party service providers who assist us in operating our platform:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                    <li>Razorpay (payment processing)</li>
                    <li>Email service providers (notifications)</li>
                    <li>Cloud hosting providers (data storage)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">4.2 Legal Requirements</h3>
                  <p className="leading-relaxed">
                    We may disclose your information if required by law, court order, or government regulation.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">4.3 Business Transfers</h3>
                  <p className="leading-relaxed">
                    In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-blue-600" />
                5. Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Encryption:</strong> All data transmitted between your device and our servers is encrypted using SSL/TLS</li>
                <li><strong>Password Protection:</strong> Passwords are hashed using bcrypt before storage</li>
                <li><strong>Access Controls:</strong> Strict access controls limit who can view your personal information</li>
                <li><strong>Regular Audits:</strong> We conduct regular security audits and vulnerability assessments</li>
                <li><strong>Secure Servers:</strong> Our servers are hosted in secure, monitored data centers</li>
              </ul>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
                <p className="text-gray-700 text-sm">
                  <strong>Important:</strong> While we implement robust security measures, no method of transmission over the internet is 100% secure. You are responsible for maintaining the confidentiality of your account credentials.
                </p>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-blue-600" />
                6. Your Rights
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Access:</strong> You can request a copy of your personal data</li>
                <li><strong>Correction:</strong> You can update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> You can request deletion of your account and data</li>
                <li><strong>Portability:</strong> You can request your data in a portable format</li>
                <li><strong>Opt-Out:</strong> You can opt out of marketing communications</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise these rights, please contact us at <a href="mailto:privacy@affiliatelearning.com" className="text-blue-600 hover:text-blue-700">privacy@affiliatelearning.com</a>
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Maintain your login session</li>
                <li>Remember your preferences</li>
                <li>Analyze platform usage and performance</li>
                <li>Improve user experience</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                You can control cookies through your browser settings, but disabling cookies may affect platform functionality.
              </p>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain information for legal, tax, or regulatory purposes for up to 7 years.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our platform is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on our platform and updating the "Last Updated" date. Your continued use of the platform after such changes constitutes your acceptance of the updated policy.
              </p>
            </section>

            {/* Contact Information */}
            <section className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-blue-50 rounded-lg p-6 space-y-2">
                <p className="text-gray-700"><strong>Email:</strong> privacy@affiliatelearning.com</p>
                <p className="text-gray-700"><strong>Support:</strong> support@affiliatelearning.com</p>
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
              href="/terms"
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              View Terms & Conditions →
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}

