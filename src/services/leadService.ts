import { supabase } from '../lib/supabase';
import { Lead } from '../types';

export class LeadService {


  // Récupérer tous les leads avec filtres
  static async getLeads(filters?: {
    search?: string;
    status?: string;
    source?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`);
    }

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters?.source && filters.source !== 'all') {
      query = query.eq('source', filters.source);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erreur lors de la récupération des leads: ${error.message}`);
    }

    return data || [];
  }

  // Ajouter un nouveau lead
  static async createLead(leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création du lead: ${error.message}`);
    }

    return data;
  }

  // Mettre à jour un lead
  static async updateLead(id: string, updates: Partial<Lead>) {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la mise à jour du lead: ${error.message}`);
    }

    return data;
  }

  // Supprimer un lead
  static async deleteLead(id: string) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression du lead: ${error.message}`);
    }
  }

  // Obtenir les statistiques des leads
  static async getLeadStats() {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('status, source, score, created_at');

    if (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }

    const totalLeads = leads?.length || 0;
    const hotLeads = leads?.filter(lead => lead.status === 'hot').length || 0;
    const warmLeads = leads?.filter(lead => lead.status === 'warm').length || 0;
    const coldLeads = leads?.filter(lead => lead.status === 'cold').length || 0;

    // Calcul du score moyen
    const averageScore = leads?.length 
      ? leads.reduce((sum, lead) => sum + lead.score, 0) / leads.length 
      : 0;

    // Leads par source
    const sourceStats = leads?.reduce((acc: Record<string, number>, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {}) || {};

    // Leads par jour (derniers 30 jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentLeads = leads?.filter(lead => 
      new Date(lead.created_at) >= thirtyDaysAgo
    ) || [];

    const dailyStats = recentLeads.reduce((acc: Record<string, number>, lead) => {
      const date = new Date(lead.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return {
      totalLeads,
      hotLeads,
      warmLeads,
      coldLeads,
      averageScore: Math.round(averageScore),
      sourceStats,
      dailyStats,
      conversionRate: totalLeads > 0 ? (hotLeads / totalLeads) * 100 : 0
    };
  }

  // Rechercher des leads similaires (pour éviter les doublons)
  static async findSimilarLeads(email: string, company?: string) {
    let query = supabase
      .from('leads')
      .select('*');

    if (company) {
      query = query.or(`email.eq.${email},company.ilike.%${company}%`);
    } else {
      query = query.eq('email', email);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erreur lors de la recherche de leads similaires: ${error.message}`);
    }

    return data || [];
  }
}