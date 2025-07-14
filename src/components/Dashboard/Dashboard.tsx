import React from 'react';
import { useState, useEffect } from 'react';
import { TrendingUp, Target, DollarSign, Mail, RefreshCw, Download } from 'lucide-react';
import MetricCard from './MetricCard';
import ChartCard from './ChartCard';
import LeadSourceChart from './LeadSourceChart';
import LeadTrendChart from './LeadTrendChart';
import { LeadSource, DailyLeadData, EmailCampaign } from '../../types';
import { LeadService } from '../../services/leadService';
import { EmailService } from '../../services/emailService';

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    conversionRate: 0,
    costPerLead: 32.80,
    emailOpenRate: 0,
    leadsChange: 0,
    conversionChange: 0,
    costChange: -4.20,
    emailChange: 0,
  });
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [dailyLeads, setDailyLeads] = useState<DailyLeadData[]>([]);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques des leads
      const leadStats = await LeadService.getLeadStats();
      
      // Charger les statistiques des emails
      const emailStats = await EmailService.getEmailStats();
      
      // Charger les campagnes récentes
      const campaigns = await EmailService.getCampaigns({ limit: 4 });
      
      // Mettre à jour les métriques
      setMetrics({
        totalLeads: leadStats.totalLeads,
        conversionRate: leadStats.conversionRate,
        costPerLead: 32.80, // Valeur fixe pour la démo
        emailOpenRate: emailStats.openRate,
        leadsChange: 13.5, // Valeur fixe pour la démo
        conversionChange: 2.1, // Valeur fixe pour la démo
        costChange: -4.20, // Valeur fixe pour la démo
        emailChange: 1.8, // Valeur fixe pour la démo
      });
      
      // Convertir les sources en format graphique
     // Exemple : LeadSource[]
      const sourceColors: Record<string, string> = {
        linkedin: '#1b04ebff',
        company_websites: '#ffee00ff',
        directories: '#DC2626',
        social_media: '#6B7280',
        referrals: '#059669',
        cold_outreach: '#2b0966ff',
        manual: '#8B5CF6',
      };
      
        


      const sources = Object.entries(leadStats.sourceStats).map(([key, value]) => {
      const cleanKey = key.toLowerCase(); // Assure la correspondance avec sourceColors
      return {
        name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Pour l'affichage
        value,
        color: sourceColors[cleanKey] || '#d0ff00ff', // Pour la couleur
      };
    });

      
      setLeadSources(sources);
      
      // Convertir les données quotidiennes
      const dailyData = Object.entries(leadStats.dailyStats)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-30) // Derniers 30 jours
        .map(([date, leads]) => ({
          date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
          leads
        }));
      
      setDailyLeads(dailyData);
      setEmailCampaigns(campaigns);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };


  const topContent = [
    { name: 'SaaS ROI Calculator', downloads: 847 },
    { name: 'Industry Trends Report', downloads: 632 },
    { name: 'Free Trial Landing Page', conversion: '28.4%' },
  ];

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span onClick={loadDashboardData}>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Leads This Month"
          value={metrics.totalLeads.toLocaleString()}
          change={`${metrics.leadsChange}% from last month`}
          changeType="increase"
          icon={TrendingUp}
          iconColor="bg-blue-500"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          change={`${metrics.conversionChange}% from last month`}
          changeType="increase"
          icon={Target}
          iconColor="bg-green-500"
        />
        <MetricCard
          title="Cost Per Lead"
          value={`$${metrics.costPerLead}`}
          change={`$${Math.abs(metrics.costChange)} from last month`}
          changeType="decrease"
          icon={DollarSign}
          iconColor="bg-yellow-500"
        />
        <MetricCard
          title="Email Open Rate"
          value={`${metrics.emailOpenRate}%`}
          change={`${metrics.emailChange}% from last month`}
          changeType="increase"
          icon={Mail}
          iconColor="bg-purple-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Lead Sources">
          <LeadSourceChart data={leadSources} />
        </ChartCard>
        <ChartCard title="Daily Leads Trend">
          <LeadTrendChart data={dailyLeads} />
        </ChartCard>
      </div>

      {/* Email Campaigns and Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Email Campaign Status">
          <div className="space-y-4">
            {emailCampaigns.map((campaign) => (
              <div key={campaign.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{campaign.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    campaign.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : campaign.status === 'completed'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {campaign.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Open: {campaign.open_rate}% | Click: {campaign.click_rate}% | Replies: {campaign.reply_count}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Top Performing Content">
          <div className="space-y-4">
            {topContent.map((content, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{content.name}</span>
                <span className="text-sm text-gray-600">
                  {'downloads' in content ? `${content.downloads} downloads` : content.conversion}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default Dashboard;