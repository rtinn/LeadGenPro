import { supabase } from '../lib/supabase';
import { LeadService } from './leadService';

export interface CrawlConfig {
  source: 'linkedin' | 'company_websites' | 'directories' | 'social_media';
  searchQuery: string;
  maxResults?: number;
  filters?: {
    industry?: string;
    location?: string;
    companySize?: string;
    jobTitles?: string[];
  };
}

export interface CrawledLead {
  name: string;
  email: string;
  title?: string;
  company?: string;
  linkedin_url?: string;
  website?: string;
  industry?: string;
  location?: string;
  phone?: string;
  company_size?: string;
}

export class CrawlService {
  // Démarrer une session de crawling
  static async startCrawlSession(config: CrawlConfig) {
    const { data: session, error } = await supabase
      .from('crawl_sessions')
      .insert([{
        source: config.source,
        search_query: config.searchQuery,
        status: 'running'
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création de la session: ${error.message}`);
    }

    // Démarrer le crawling en arrière-plan
    this.performCrawling(session.id, config);

    return session;
  }

  // Simuler le crawling (remplacer par votre logique de crawling réelle)
  private static async performCrawling(sessionId: string, config: CrawlConfig) {
    try {
      // Simuler des données crawlées
      const mockLeads = this.generateMockLeads(config);
      
      let processedCount = 0;
      const totalFound = mockLeads.length;

      // Mettre à jour le total trouvé
      await supabase
        .from('crawl_sessions')
        .update({ total_found: totalFound })
        .eq('id', sessionId);

      // Traiter chaque lead
      for (const leadData of mockLeads) {
        try {
          // Vérifier les doublons
          const existingLeads = await LeadService.findSimilarLeads(
            leadData.email, 
            leadData.company
          );

          if (existingLeads.length === 0) {
            // Calculer un score basé sur les données disponibles
            const score = this.calculateLeadScore(leadData);
            
            // Déterminer le statut basé sur le score
            const status = score >= 80 ? 'hot' : score >= 60 ? 'warm' : 'cold';

            await LeadService.createLead({
              ...leadData,
              source: config.source,
              score,
              status,
              date_added: new Date().toLocaleDateString('fr-FR')
            });
          }

          processedCount++;

          // Mettre à jour le progrès
          await supabase
            .from('crawl_sessions')
            .update({ total_processed: processedCount })
            .eq('id', sessionId);

          // Simuler un délai pour éviter la surcharge
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error('Erreur lors du traitement du lead:', error);
        }
      }

      // Marquer la session comme terminée
      await supabase
        .from('crawl_sessions')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);

    } catch (error) {
      console.error('Erreur lors du crawling:', error);
      
      // Marquer la session comme échouée
      await supabase
        .from('crawl_sessions')
        .update({ 
          status: 'failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    }
  }

  // Générer des leads fictifs pour la démonstration
  private static generateMockLeads(config: CrawlConfig): CrawledLead[] {
    const companies = [
      'TechCorp', 'DataFlow Systems', 'Innovation Labs', 'Future Tech',
      'Digital Dynamics', 'Cloud Systems', 'NextGen Solutions', 'StartupX',
      'Enterprise Solutions', 'Global Corp', 'Cyber Security Inc', 'AI Innovations'
    ];

    const titles = [
      'CEO', 'CTO', 'VP of Engineering', 'Director of IT', 'Product Manager',
      'Technical Lead', 'Head of Product', 'Engineering Manager', 'Data Scientist',
      'Software Engineer', 'DevOps Engineer', 'Marketing Director'
    ];

    const industries = [
      'Technology', 'Healthcare', 'Financial Services', 'Manufacturing',
      'Retail', 'Education', 'Consulting', 'Media', 'Real Estate'
    ];

    const locations = [
      'Paris, France', 'Lyon, France', 'Marseille, France', 'Toulouse, France',
      'Nice, France', 'Nantes, France', 'Strasbourg, France', 'Montpellier, France'
    ];

    const leads: CrawledLead[] = [];
    const maxResults = config.maxResults || 20;

    for (let i = 0; i < maxResults; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const title = titles[Math.floor(Math.random() * titles.length)];
      const industry = industries[Math.floor(Math.random() * industries.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      const firstName = this.generateRandomName();
      const lastName = this.generateRandomLastName();
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`;

      leads.push({
        name,
        email,
        title,
        company,
        industry,
        location,
        linkedin_url: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        website: `https://${company.toLowerCase().replace(/\s+/g, '')}.com`,
        company_size: Math.random() > 0.5 ? '50-200' : '200-1000'
      });
    }

    return leads;
  }

  // Calculer le score d'un lead
  private static calculateLeadScore(lead: CrawledLead): number {
    let score = 50; // Score de base

    // Bonus pour les informations complètes
    if (lead.title) score += 10;
    if (lead.company) score += 10;
    if (lead.linkedin_url) score += 15;
    if (lead.website) score += 10;
    if (lead.phone) score += 5;

    // Bonus pour les titres importants
    const seniorTitles = ['CEO', 'CTO', 'VP', 'Director', 'Head of', 'Manager'];
    if (seniorTitles.some(title => lead.title?.includes(title))) {
      score += 20;
    }

    // Bonus pour les industries tech
    const techIndustries = ['Technology', 'Software', 'IT', 'Tech'];
    if (techIndustries.some(industry => lead.industry?.includes(industry))) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  // Obtenir les sessions de crawling
  static async getCrawlSessions(limit = 10) {
    const { data, error } = await supabase
      .from('crawl_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Erreur lors de la récupération des sessions: ${error.message}`);
    }

    return data || [];
  }

  // Obtenir les statistiques de crawling
  static async getCrawlStats() {
    const { data: sessions, error } = await supabase
      .from('crawl_sessions')
      .select('*');

    if (error) {
      throw new Error(`Erreur lors de la récupération des statistiques: ${error.message}`);
    }

    const totalSessions = sessions?.length || 0;
    const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0;
    const totalFound = sessions?.reduce((sum, s) => sum + s.total_found, 0) || 0;
    const totalProcessed = sessions?.reduce((sum, s) => sum + s.total_processed, 0) || 0;

    const successRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    return {
      totalSessions,
      completedSessions,
      totalFound,
      totalProcessed,
      successRate: Math.round(successRate)
    };
  }

  // Fonctions utilitaires pour générer des noms aléatoires
  private static generateRandomName(): string {
    const names = [
      'Alexandre', 'Marie', 'Pierre', 'Sophie', 'Jean', 'Emma', 'Paul', 'Julie',
      'Michel', 'Claire', 'David', 'Sarah', 'Thomas', 'Laura', 'Nicolas', 'Anna'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  private static generateRandomLastName(): string {
    const lastNames = [
      'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit',
      'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel'
    ];
    return lastNames[Math.floor(Math.random() * lastNames.length)];
  }
}