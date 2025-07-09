export interface Lead {
  id: string;
  name: string;
  email: string;
  title: string;
  company: string;
  source: string;
  score: number;
  status: 'hot' | 'warm' | 'cold';
  date_added: string;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'active' | 'completed' | 'draft' | 'paused';
  open_rate: number;
  click_rate: number;
  reply_count: number;
  sent_count: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  totalLeads: number;
  conversionRate: number;
  costPerLead: number;
  emailOpenRate: number;
  leadsChange: number;
  conversionChange: number;
  costChange: number;
  emailChange: number;
}

export interface LeadSource {
  name: string;
  value: number;
  color: string;
}

export interface DailyLeadData {
  date: string;
  leads: number;
}