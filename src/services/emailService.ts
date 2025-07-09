import { supabase } from '../lib/supabase';
import { EmailCampaign } from '../types';

export class EmailService {
  // Récupérer toutes les campagnes email
  static async getCampaigns(filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erreur lors de la récupération des campagnes: ${error.message}`);
    }

    return data || [];
  }

  // Créer une nouvelle campagne
  static async createCampaign(campaignData: Omit<EmailCampaign, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('email_campaigns')
      .insert([campaignData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création de la campagne: ${error.message}`);
    }

    return data;
  }

  // Mettre à jour une campagne
  static async updateCampaign(id: string, updates: Partial<EmailCampaign>) {
    const { data, error } = await supabase
      .from('email_campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de la campagne: ${error.message}`);
    }

    return data;
  }

  // Envoyer un email à un lead
  static async sendEmailToLead(campaignId: string, leadId: string, emailData: {
    to: string;
    subject: string;
    message: string;
  }) {
    try {
      // Simuler l'envoi d'email (remplacer par votre service d'email réel)
      console.log('Envoi d\'email:', emailData);
      
      // Enregistrer le log d'email
      const { data, error } = await supabase
        .from('email_logs')
        .insert([{
          campaign_id: campaignId,
          lead_id: leadId,
          status: 'sent'
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Erreur lors de l'enregistrement du log: ${error.message}`);
      }

      // Mettre à jour le compteur de la campagne
      const { error: updateError } = await supabase.rpc('increment_sent_count', {
        campaign_id: campaignId
      });

      if (updateError) {
        console.warn('Erreur lors de la mise à jour du compteur:', updateError.message);
      }

      return data;
    } catch (error) {
      throw new Error(`Erreur lors de l'envoi de l'email: ${error}`);
    }
  }

  // Obtenir les statistiques des emails
  static async getEmailStats() {
    const { data: campaigns, error: campaignsError } = await supabase
      .from('email_campaigns')
      .select('*');

    const { data: logs, error: logsError } = await supabase
      .from('email_logs')
      .select('*');

    if (campaignsError || logsError) {
      throw new Error('Erreur lors de la récupération des statistiques email');
    }

    const totalCampaigns = campaigns?.length || 0;
    const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
    const totalSent = campaigns?.reduce((sum, c) => sum + c.sent_count, 0) || 0;
    const totalOpened = logs?.filter(l => l.opened_at).length || 0;
    const totalClicked = logs?.filter(l => l.clicked_at).length || 0;
    const totalReplied = logs?.filter(l => l.replied_at).length || 0;

    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
    const replyRate = totalSent > 0 ? (totalReplied / totalSent) * 100 : 0;

    return {
      totalCampaigns,
      activeCampaigns,
      totalSent,
      totalOpened,
      totalClicked,
      totalReplied,
      openRate: Math.round(openRate * 10) / 10,
      clickRate: Math.round(clickRate * 10) / 10,
      replyRate: Math.round(replyRate * 10) / 10
    };
  }
}