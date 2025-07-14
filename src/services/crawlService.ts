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
  // Effectuer le crawling et retourner les résultats
  static async performCrawling(config: CrawlConfig): Promise<CrawledLead[]> {
    try {
      // Simuler des données crawlées
      const mockLeads = this.generateMockLeads(config);

      // Ajouter le score et le statut à chaque lead
      const processedLeads = mockLeads.map(lead => {
        const score = this.calculateLeadScore(lead);
        const status = score >= 80 ? 'hot' : score >= 60 ? 'warm' : 'cold';
        
        return {
          ...lead,
          score,
          status,
          source: config.source
        };
      });

      return processedLeads;
    } catch (error) {
      console.error('Erreur lors du crawling:', error);
      throw new Error('Erreur lors du crawling des leads');
    }
  }

  // Sauvegarder les leads sélectionnés
  static async saveSelectedLeads(leads: (CrawledLead & { score: number; status: string; source: string })[], searchQuery: string) {
    try {
      // Créer une session de crawling
      const { data: session, error: sessionError } = await supabase
        .from('crawl_sessions')
        .insert([{
          source: leads[0]?.source || 'manual',
          search_query: searchQuery,
          total_found: leads.length,
          total_processed: 0,
          status: 'running'
        }])
        .select()
        .single();

      if (sessionError) {
        throw new Error(`Erreur lors de la création de la session: ${sessionError.message}`);
      }

      let savedCount = 0;

      // Sauvegarder chaque lead
      for (const leadData of leads) {
        try {
          // Vérifier les doublons
          const existingLeads = await LeadService.findSimilarLeads(
            leadData.email, 
            leadData.company
          );

          if (existingLeads.length === 0) {
            await LeadService.createLead({
              name: leadData.name,
              email: leadData.email,
              title: leadData.title || '',
              company: leadData.company || '',
              source: leadData.source,
              score: leadData.score,
              status: leadData.status as 'hot' | 'warm' | 'cold',
              date_added: new Date().toLocaleDateString('fr-FR')
            });
            savedCount++;
          }
        } catch (error) {
          console.error('Erreur lors de la sauvegarde du lead:', error);
        }
      }

      // Mettre à jour la session
      await supabase
        .from('crawl_sessions')
        .update({ 
          total_processed: savedCount,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', session.id);

      return { savedCount, totalLeads: leads.length };

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw new Error('Erreur lors de la sauvegarde des leads');
    }
  }

  // Générer des leads fictifs pour la démonstration
  private static generateMockLeads(config: CrawlConfig): CrawledLead[] {
    // Données organisées par secteur d'activité
    const industriesData = {
      'Technology': {
        companies: ['TechCorp', 'DataFlow Systems', 'Innovation Labs', 'Future Tech', 'Digital Dynamics', 'Cloud Systems', 'NextGen Solutions', 'StartupX', 'AI Innovations', 'CyberTech', 'DevSolutions', 'CodeFactory'],
        titles: ['CTO', 'VP of Engineering', 'Director of IT', 'Technical Lead', 'Head of Product', 'Engineering Manager', 'Data Scientist', 'Software Engineer', 'DevOps Engineer', 'Product Manager', 'Tech Lead', 'Solutions Architect'],
        keywords: ['développeur', 'ingénieur', 'tech', 'software', 'data', 'cloud', 'AI', 'machine learning', 'développement', 'programmeur']
      },
      'Healthcare': {
        companies: ['MedTech Solutions', 'HealthCare Plus', 'BioInnovations', 'MedicalSoft', 'HealthTech', 'ClinicalSystems', 'MedData', 'BioTech Labs', 'HealthFlow', 'MedConnect', 'CareSystem', 'HealthInnovate'],
        titles: ['Directeur Médical', 'Chef de Projet Santé', 'Responsable IT Médical', 'Ingénieur Biomédical', 'Data Analyst Santé', 'Product Manager Santé', 'Directeur Innovation', 'Responsable Qualité', 'Chef de Service', 'Directeur R&D'],
        keywords: ['médical', 'santé', 'healthcare', 'médecin', 'infirmier', 'biomédical', 'pharmaceutique', 'clinique', 'hôpital', 'thérapie']
      },
      'Financial Services': {
        companies: ['FinTech Pro', 'BankingSoft', 'Investment Tech', 'Financial Solutions', 'CryptoTech', 'PaymentSys', 'InsurTech', 'TradingPlatform', 'FinanceFlow', 'MoneyTech', 'CreditSoft', 'WealthTech'],
        titles: ['Directeur Financier', 'Analyste Financier', 'Risk Manager', 'Product Owner Finance', 'Compliance Officer', 'Investment Manager', 'Credit Analyst', 'Treasury Manager', 'Financial Controller', 'Audit Manager'],
        keywords: ['finance', 'banque', 'investissement', 'crédit', 'assurance', 'trading', 'fintech', 'comptabilité', 'audit', 'risque']
      },
      'Manufacturing': {
        companies: ['IndustrialTech', 'ManufacturingSoft', 'Production Systems', 'Factory Solutions', 'Industrial IoT', 'AutomationTech', 'QualityTech', 'SupplyChain Pro', 'Manufacturing Plus', 'IndustryFlow', 'ProductionTech', 'FactoryFlow'],
        titles: ['Directeur Production', 'Ingénieur Industriel', 'Responsable Qualité', 'Chef de Projet Industriel', 'Responsable Maintenance', 'Supply Chain Manager', 'Lean Manager', 'Process Engineer', 'Operations Manager', 'Plant Manager'],
        keywords: ['production', 'industriel', 'manufacturing', 'usine', 'qualité', 'lean', 'automation', 'maintenance', 'supply chain', 'process']
      },
      'Retail': {
        companies: ['RetailTech', 'E-Commerce Solutions', 'ShopSoft', 'RetailFlow', 'Commerce Plus', 'StoreSystem', 'RetailInnovate', 'ShopTech', 'MarketPlace Pro', 'RetailData', 'CommerceFlow', 'ShopFlow'],
        titles: ['Directeur Commercial', 'E-Commerce Manager', 'Retail Manager', 'Category Manager', 'Merchandising Manager', 'Store Manager', 'Sales Director', 'Marketing Manager', 'Customer Success Manager', 'Brand Manager'],
        keywords: ['commerce', 'retail', 'vente', 'e-commerce', 'magasin', 'merchandising', 'marketing', 'brand', 'customer', 'sales']
      },
      'Education': {
        companies: ['EduTech Solutions', 'Learning Systems', 'EducationFlow', 'SchoolTech', 'EduInnovate', 'LearningTech', 'EduSoft', 'TeachingTech', 'StudyFlow', 'EduData', 'ClassroomTech', 'EduConnect'],
        titles: ['Directeur Pédagogique', 'Responsable Formation', 'Chef de Projet EdTech', 'Ingénieur Pédagogique', 'Product Manager Education', 'Learning Designer', 'Training Manager', 'Academic Director', 'Education Consultant', 'E-Learning Manager'],
        keywords: ['éducation', 'formation', 'enseignement', 'pédagogie', 'e-learning', 'école', 'université', 'cours', 'apprentissage', 'teaching']
      }
    };

    // Locations organisées par région
    const locationsByRegion = {
      'Paris': ['Paris, France', 'Boulogne-Billancourt, France', 'Neuilly-sur-Seine, France', 'Levallois-Perret, France', 'Issy-les-Moulineaux, France'],
      'Lyon': ['Lyon, France', 'Villeurbanne, France', 'Vénissieux, France', 'Caluire-et-Cuire, France'],
      'Marseille': ['Marseille, France', 'Aix-en-Provence, France', 'Toulon, France', 'Avignon, France'],
      'Toulouse': ['Toulouse, France', 'Blagnac, France', 'Colomiers, France', 'Tournefeuille, France'],
      'Nice': ['Nice, France', 'Cannes, France', 'Antibes, France', 'Grasse, France'],
      'Nantes': ['Nantes, France', 'Saint-Nazaire, France', 'Rezé, France', 'Saint-Sébastien-sur-Loire, France'],
      'Strasbourg': ['Strasbourg, France', 'Mulhouse, France', 'Colmar, France', 'Haguenau, France'],
      'Montpellier': ['Montpellier, France', 'Nîmes, France', 'Perpignan, France', 'Béziers, France'],
      'Lille': ['Lille, France', 'Roubaix, France', 'Tourcoing, France', 'Villeneuve-d\'Ascq, France'],
      'Bordeaux': ['Bordeaux, France', 'Mérignac, France', 'Pessac, France', 'Talence, France']
    };
    const leads: CrawledLead[] = [];
    const maxResults = config.maxResults || 20;
    
    // Déterminer le secteur d'activité à utiliser
    const targetIndustry = config.filters?.industry || this.detectIndustryFromQuery(config.searchQuery);
    const industryData = industriesData[targetIndustry as keyof typeof industriesData] || industriesData['Technology'];
    
    // Déterminer les locations à utiliser
    const targetLocations = this.getTargetLocations(config.filters?.location, locationsByRegion);
    
    // Extraire les mots-clés de la requête de recherche
    const searchKeywords = this.extractKeywordsFromQuery(config.searchQuery);

    for (let i = 0; i < maxResults; i++) {
      // Sélectionner une entreprise du secteur ciblé
      const company = industryData.companies[Math.floor(Math.random() * industryData.companies.length)];
      
      // Sélectionner un titre correspondant au secteur et aux mots-clés
      const title = this.selectRelevantTitle(industryData.titles, searchKeywords);
      
      // Utiliser le secteur ciblé
      const industry = targetIndustry;
      
      // Sélectionner une location correspondante
      const location = targetLocations[Math.floor(Math.random() * targetLocations.length)];
      
      const firstName = this.generateRandomName();
      const lastName = this.generateRandomLastName();
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`;

      // Ajuster le score en fonction de la correspondance aux critères
      const relevanceBonus = this.calculateRelevanceBonus(
        { title, company, industry, location },
        config
      );
      leads.push({
        name,
        email,
        title,
        company,
        industry,
        location,
        linkedin_url: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        website: `https://${company.toLowerCase().replace(/\s+/g, '')}.com`,
        company_size: Math.random() > 0.5 ? '50-200' : '200-1000',
        relevanceScore: relevanceBonus
      });
    }

    return leads;
  }

  // Détecter le secteur d'activité à partir de la requête de recherche
  private static detectIndustryFromQuery(query: string): string {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('tech') || queryLower.includes('développeur') || queryLower.includes('ingénieur') || queryLower.includes('software') || queryLower.includes('data')) {
      return 'Technology';
    }
    if (queryLower.includes('santé') || queryLower.includes('médical') || queryLower.includes('healthcare') || queryLower.includes('médecin')) {
      return 'Healthcare';
    }
    if (queryLower.includes('finance') || queryLower.includes('banque') || queryLower.includes('investment') || queryLower.includes('fintech')) {
      return 'Financial Services';
    }
    if (queryLower.includes('production') || queryLower.includes('industriel') || queryLower.includes('manufacturing') || queryLower.includes('usine')) {
      return 'Manufacturing';
    }
    if (queryLower.includes('commerce') || queryLower.includes('retail') || queryLower.includes('vente') || queryLower.includes('e-commerce')) {
      return 'Retail';
    }
    if (queryLower.includes('éducation') || queryLower.includes('formation') || queryLower.includes('enseignement') || queryLower.includes('école')) {
      return 'Education';
    }
    
    return 'Technology'; // Par défaut
  }

  // Obtenir les locations cibles
  private static getTargetLocations(locationFilter: string | undefined, locationsByRegion: Record<string, string[]>): string[] {
    if (!locationFilter) {
      // Retourner toutes les locations si pas de filtre
      return Object.values(locationsByRegion).flat();
    }
    
    const filterLower = locationFilter.toLowerCase();
    
    // Chercher une correspondance exacte avec une région
    for (const [region, locations] of Object.entries(locationsByRegion)) {
      if (region.toLowerCase().includes(filterLower) || filterLower.includes(region.toLowerCase())) {
        return locations;
      }
    }
    
    // Chercher dans toutes les locations
    const matchingLocations = Object.values(locationsByRegion)
      .flat()
      .filter(location => location.toLowerCase().includes(filterLower));
    
    return matchingLocations.length > 0 ? matchingLocations : Object.values(locationsByRegion).flat();
  }

  // Extraire les mots-clés de la requête de recherche
  private static extractKeywordsFromQuery(query: string): string[] {
    return query.toLowerCase()
      .split(/[\s,]+/)
      .filter(word => word.length > 2)
      .map(word => word.trim());
  }

  // Sélectionner un titre pertinent
  private static selectRelevantTitle(titles: string[], searchKeywords: string[]): string {
    // Chercher un titre qui correspond aux mots-clés
    for (const keyword of searchKeywords) {
      const matchingTitles = titles.filter(title => 
        title.toLowerCase().includes(keyword) || 
        keyword.includes(title.toLowerCase().split(' ')[0])
      );
      if (matchingTitles.length > 0) {
        return matchingTitles[Math.floor(Math.random() * matchingTitles.length)];
      }
    }
    
    // Sinon, retourner un titre aléatoire du secteur
    return titles[Math.floor(Math.random() * titles.length)];
  }

  // Calculer le bonus de pertinence
  private static calculateRelevanceBonus(
    lead: { title: string; company: string; industry: string; location: string },
    config: CrawlConfig
  ): number {
    let bonus = 0;
    const queryLower = config.searchQuery.toLowerCase();
    
    // Bonus pour correspondance avec les mots-clés dans le titre
    if (queryLower.split(' ').some(word => lead.title.toLowerCase().includes(word))) {
      bonus += 20;
    }
    
    // Bonus pour correspondance avec le secteur
    if (config.filters?.industry && config.filters.industry === lead.industry) {
      bonus += 15;
    }
    
    // Bonus pour correspondance avec la localisation
    if (config.filters?.location && lead.location.toLowerCase().includes(config.filters.location.toLowerCase())) {
      bonus += 10;
    }
    
    // Bonus pour correspondance avec les mots-clés dans l'entreprise
    if (queryLower.split(' ').some(word => lead.company.toLowerCase().includes(word))) {
      bonus += 5;
    }
    
    return bonus;
  }
  // Calculer le score d'un lead
  private static calculateLeadScore(lead: CrawledLead & { relevanceScore?: number }): number {
    let score = 50; // Score de base

    // Ajouter le bonus de pertinence
    if (lead.relevanceScore) {
      score += lead.relevanceScore;
    }

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
    const techIndustries = ['Technology', 'Software', 'IT', 'Tech', 'Healthcare', 'Financial Services'];
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