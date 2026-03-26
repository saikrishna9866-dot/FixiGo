import React from 'react';
import { motion } from 'motion/react';
import { Users, Briefcase, Calendar, TrendingUp } from 'lucide-react';

interface StatsGridProps {
  stats: {
    totalUsers: number;
    totalProviders: number;
    totalBookings: number;
    totalRevenue: number;
  };
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: <Users size={24} />, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: '+12%' },
    { label: 'Total Providers', value: stats.totalProviders, icon: <Briefcase size={24} />, color: 'text-purple-400', bg: 'bg-purple-400/10', trend: '+5%' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: <Calendar size={24} />, color: 'text-yellow-500', bg: 'bg-yellow-500/10', trend: '+18%' },
    { label: 'Total Revenue', value: stats.totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }), icon: <TrendingUp size={24} />, color: 'text-green-400', bg: 'bg-green-400/10', trend: '+24%' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-gray-900 p-6 rounded-3xl border border-gray-800 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
              {stat.icon}
            </div>
            <span className="text-green-400 text-xs font-bold flex items-center bg-green-400/10 px-2 py-1 rounded-full">
              <TrendingUp size={12} className="mr-1" /> {stat.trend}
            </span>
          </div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
        </motion.div>
      ))}
    </div>
  );
};
