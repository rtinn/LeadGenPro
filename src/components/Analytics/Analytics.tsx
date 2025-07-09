import React from 'react';
import { useState, useEffect } from 'react';
import { TrendingUp, Users, Mail, Target } from 'lucide-react';
import MetricCard from '../Dashboard/MetricCard';
import { LeadService } from '../../services/leadService';
import { EmailService } from '../../services/emailService';

const Analytics: React.FC = () => {
  const [leadStats, setLeadStats] = useState({
    totalLeads: 0,
    hotLeads: 0,
    warmLeads: 0,
    coldLeads: 0,
    averageScore: 0,
    conversionRate: 0
  });
  const [emailStats, setEmailStats] = useState({
    openRate: 0,
    clickRate: 0,
    replyRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [leads, emails] = await Promise.all([
        LeadService.getLeadStats(),
        EmailService.getEmailStats()
      ]);
      
      setLeadStats(leads);
      setEmailStats(emails);
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Detailed insights into your lead generation performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Leads Generated"
          value={leadStats.totalLeads.toLocaleString()}
          change="18.2% from last month"
          changeType="increase"
          icon={Users}
          iconColor="bg-blue-500"
        />
        <MetricCard
          title="Email Performance"
          value={`${emailStats.openRate}%`}
          change="3.1% from last month"
          changeType="increase"
          icon={Mail}
          iconColor="bg-green-500"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${leadStats.conversionRate.toFixed(1)}%`}
          change="2.3% from last month"
          changeType="increase"
          icon={Target}
          iconColor="bg-purple-500"
        />
        <MetricCard
          title="ROI"
          value="340%"
          change="25% from last month"
          changeType="increase"
          icon={TrendingUp}
          iconColor="bg-orange-500"
        />
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Quality Score Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">High Quality (80-100)</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(leadStats.hotLeads / leadStats.totalLeads) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium">{Math.round((leadStats.hotLeads / leadStats.totalLeads) * 100)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Medium Quality (60-79)</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(leadStats.warmLeads / leadStats.totalLeads) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium">{Math.round((leadStats.warmLeads / leadStats.totalLeads) * 100)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low Quality (0-59)</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(leadStats.coldLeads / leadStats.totalLeads) * 100}%` }}></div>
                </div>
                <span className="text-sm font-medium">{Math.round((leadStats.coldLeads / leadStats.totalLeads) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Industries</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">Technology</span>
              <span className="text-sm font-medium text-green-600">28.4%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">Healthcare</span>
              <span className="text-sm font-medium text-green-600">21.7%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">Financial Services</span>
              <span className="text-sm font-medium text-green-600">18.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">Manufacturing</span>
              <span className="text-sm font-medium text-green-600">15.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-900">Retail</span>
              <span className="text-sm font-medium text-green-600">12.8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;