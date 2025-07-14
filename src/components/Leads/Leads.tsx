import React from 'react';
import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import LeadTable from './LeadTable';
import CrawlModal from './CrawlModal';
import AddLeadModal from './AddLeadModal'; // Importez le nouveau modal
import { LeadService } from '../../services/leadService';
import { Lead } from '../../types';

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCrawlModalOpen, setIsCrawlModalOpen] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false); // Nouvel état pour le modal

  useEffect(() => {
    
    loadLeads();
  }, []);

  const loadLeads = async () => {
    console.log('Début du chargement des leads');
    try {
      setLoading(true);
      const data = await LeadService.getLeads();
      console.log('Données récupérées:', data);
      setLeads(data);
    } catch (error) {
      console.error('Erreur lors du chargement des leads:', error);
    } finally {
      setLoading(false);
      console.log('Chargement terminé');
    }
  };

  const handleViewLead = (lead: Lead) => {
    console.log('Viewing lead:', lead);
  };

  const handleEmailLead = (lead: Lead) => {
    console.log('Emailing lead:', lead);
  };

  const handleCrawlStarted = () => {
    setTimeout(() => {
      loadLeads();
    }, 2000);
  };

  const handleLeadAdded = () => {
    loadLeads(); // Recharge les leads après ajout
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsCrawlModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Crawler des Leads</span>
          </button>
          <button
            onClick={() => setIsAddLeadModalOpen(true)} // Ouvre le modal d'ajout
            className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un Lead</span>
          </button>
        </div>
      </div>
      
      {leads.length === 0 ? (
        <p>Aucun lead à afficher. Vérifiez la console pour les erreurs.</p>
      ) : (
        <LeadTable 
          leads={leads}
          onViewLead={handleViewLead}
          onEmailLead={handleEmailLead}
          onLeadsChange={loadLeads}
        />
      )}

      <CrawlModal
        isOpen={isCrawlModalOpen}
        onClose={() => setIsCrawlModalOpen(false)}
        onCrawlStarted={handleCrawlStarted}
      />
      <AddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        onLeadAdded={handleLeadAdded}
      />
    </div>
  );
};

export default Leads;