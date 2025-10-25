'use client';

import { useState } from 'react';
import ModernDashboardLayout from '@/components/ModernDashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  Users, 
  Award,
  BookOpen,
  DollarSign,
  Target,
  Rocket,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function UIDemoPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      title: 'Total Earnings',
      value: '$12,450',
      change: '+23.5%',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Active Courses',
      value: '24',
      change: '+12%',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Referrals',
      value: '156',
      change: '+8.2%',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Certificates',
      value: '18',
      change: '+5',
      icon: Award,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  const features = [
    {
      title: 'Auto-Collapsing Sidebar',
      description: 'Hover to expand, leave to collapse. Maximizes screen space.',
      icon: Sparkles,
      color: 'purple',
    },
    {
      title: 'Quick Actions Menu',
      description: 'Fast access to earnings, wallet, referrals, and certificates.',
      icon: Zap,
      color: 'yellow',
    },
    {
      title: 'Global Search',
      description: 'Search courses, topics, and instructors from anywhere.',
      icon: Target,
      color: 'blue',
    },
    {
      title: 'Color-Coded Navigation',
      description: 'Visual hierarchy with color-coded sections for easy navigation.',
      icon: Star,
      color: 'pink',
    },
    {
      title: 'Performance Optimized',
      description: 'GPU-accelerated animations for smooth 60fps experience.',
      icon: Rocket,
      color: 'green',
    },
    {
      title: 'Mobile Responsive',
      description: 'Beautiful experience on all devices with adaptive layouts.',
      icon: TrendingUp,
      color: 'indigo',
    },
  ];

  const colorMap: Record<string, string> = {
    purple: 'from-purple-500 to-pink-500',
    yellow: 'from-yellow-500 to-orange-500',
    blue: 'from-blue-500 to-cyan-500',
    pink: 'from-pink-500 to-rose-500',
    green: 'from-green-500 to-emerald-500',
    indigo: 'from-indigo-500 to-purple-500',
  };

  return (
    <ModernDashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                UI/UX Demo Page
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Showcasing the new modern sidebar and enhanced navigation
              </p>
            </div>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 text-sm">
              ✨ New Design
            </Badge>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                      <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`${stat.color} h-6 w-6`} />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-6">✨ New Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="p-6 h-full hover:shadow-xl transition-all">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorMap[feature.color]} flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Component Showcase */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold mb-6">🎨 Component Showcase</h2>
          <Card className="p-8">
            <div className="space-y-6">
              {/* Buttons */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Buttons</h3>
                <div className="flex flex-wrap gap-4">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Primary Button
                  </Button>
                  <Button variant="outline">Outline Button</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
                    <Sparkles className="w-4 h-4 mr-2" />
                    With Icon
                  </Button>
                </div>
              </div>

              {/* Badges */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Badges</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-blue-100 text-blue-700">New</Badge>
                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                  <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                  <Badge className="bg-red-100 text-red-700">Urgent</Badge>
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    Premium
                  </Badge>
                </div>
              </div>

              {/* Color Palette */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Color Palette</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500"></div>
                    <p className="text-sm text-center">Primary</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500"></div>
                    <p className="text-sm text-center">Success</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500"></div>
                    <p className="text-sm text-center">Warning</p>
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 rounded-lg bg-gradient-to-br from-red-500 to-pink-500"></div>
                    <p className="text-sm text-center">Danger</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800">
            <h2 className="text-2xl font-bold mb-4">🚀 Try These Features</h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">1.</span>
                <span><strong>Hover over the sidebar</strong> on desktop to see it expand with smooth animations</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-600 font-bold">2.</span>
                <span><strong>Click the search icon</strong> in the navbar to open the global search modal</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 font-bold">3.</span>
                <span><strong>Click the lightning bolt icon</strong> to access quick actions menu</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-600 font-bold">4.</span>
                <span><strong>Toggle dark/light mode</strong> using the sun/moon icon in the navbar</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-pink-600 font-bold">5.</span>
                <span><strong>Resize your browser</strong> to see the responsive mobile menu in action</span>
              </li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </ModernDashboardLayout>
  );
}

