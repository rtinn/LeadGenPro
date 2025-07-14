import React, { useState } from 'react';
import { X, Search, Globe, Users, Linkedin, Check, Mail, Building, User } from 'lucide-react';
import { CrawlService, CrawlConfig, CrawledLead } from '../../services/crawlService';

interface CrawlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadsSaved: () => void;
}

const CrawlModal: React.FC<CrawlModalProps> = ({ isOpen, onClose, onLeadsSaved }) => {
  const [config, setConfig] = useState<CrawlConfig>({
    source: 'linkedin',
    searchQuery: '',
    maxResults: 50,
    filters: {
      industry: '',
      location: '',
      companySize: '',
      jobTitles: []
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [crawlResults, setCrawlResults] = useState<(CrawledLead & { score: number; status: string; source: string })[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const resetModal = () => {
    setCrawlResults([]);
    setSelectedLeads(new Set());
    setShowResults(false);
    setConfig({
      source: 'linkedin',
      searchQuery: '',
      maxResults: 50,
      filters: {
        industry: '',
        location: '',
        companySize: '',
        jobTitles: []
      }
    });
  };

  if (!isOpen) return null;

  const handleCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const results = await CrawlService.performCrawling(config);
      setCrawlResults(results);
      setSelectedLeads(new Set(results.map((_, index) => index))); // Sélectionner tous par défaut
      setShowResults(true);
    } catch (error) {
      console.error('Erreur lors du démarrage du crawling:', error);
      alert('Erreur lors du démarrage du crawling');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSelected = async () => {
    if (selectedLeads.size === 0) {
      alert('Veuillez sélectionner au moins un lead à sauvegarder');
      return;
    }

    setIsSaving(true);
    try {
      const leadsToSave = Array.from(selectedLeads).map(index => crawlResults[index]);
      const result = await CrawlService.saveSelectedLeads(leadsToSave, config.searchQuery);
      
      alert(`${result.savedCount} leads sauvegardés sur ${result.totalLeads} sélectionnés`);
      onLeadsSaved();
      resetModal();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
     
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLeadSelection = (index: number) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedLeads(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === crawlResults.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(crawlResults.map((_, index) => index)));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-100 text-red-800';
      case 'warm': return 'bg-yellow-100 text-yellow-800';
      case 'cold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const sourceOptions = [
    { value: 'LinkedIn', label: 'LinkedIn', icon: Linkedin },
    { value: 'company_websites', label: 'Sites d\'entreprise', icon: Globe },
    { value: 'directories', label: 'Annuaires professionnels', icon: Users },
    { value: 'social_media', label: 'Réseaux sociaux', icon: Search }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg w-full max-h-[90vh] overflow-y-auto ${showResults ? 'max-w-6xl' : 'max-w-2xl'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {showResults ? 'Résultats du Crawling' : 'Crawler des Leads'}
          </h2>
          <button
            onClick={() => {
              resetModal();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!showResults ? (
          <form onSubmit={handleCrawl} className="p-6 space-y-6">
          {/* Source de crawling */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Source de données
            </label>
            <div className="grid grid-cols-2 gap-3">
              {sourceOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setConfig({ ...config, source: option.value as any })}
                    className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${
                      config.source === option.value
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Requête de recherche */}
          <div>
            <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-2">
              Mots-clés de recherche
            </label>
            <input
              id="searchQuery"
              type="text"
              value={config.searchQuery}
              onChange={(e) => setConfig({ ...config, searchQuery: e.target.value })}
              placeholder="Ex: CTO startup, développeur senior React, directeur marketing..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Les mots-clés influencent le titre et le secteur des leads trouvés
            </p>
          </div>

          {/* Nombre maximum de résultats */}
          <div>
            <label htmlFor="maxResults" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre maximum de résultats
            </label>
            <select
              id="maxResults"
              value={config.maxResults}
              onChange={(e) => setConfig({ ...config, maxResults: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
               <option value={5}>5 leads</option>
              <option value={25}>25 leads</option>
              <option value={50}>50 leads</option>
              <option value={100}>100 leads</option>
              <option value={200}>200 leads</option>
            </select>
          </div>

          {/* Filtres avancés */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filtres avancés</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                  Secteur d'activité
                </label>
                <select
                  id="industry"
                  value={config.filters?.industry || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    filters: { ...config.filters, industry: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Tous les secteurs</option>
                  <option value="Technology">Technologie</option>
                  <option value="Healthcare">Santé</option>
                  <option value="Financial Services">Services financiers</option>
                  <option value="Manufacturing">Industrie</option>
                  <option value="Retail">Commerce</option>
                  <option value="Education">Éducation</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Filtre les entreprises par secteur d'activité
                </p>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation
                </label>
                <input
                  id="location"
                  type="text"
                  value={config.filters?.location || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    filters: { ...config.filters, location: e.target.value }
                  })}
                  placeholder="Ex: Paris, Lyon, France..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Filtre les leads par ville ou région
                </p>
              </div>

              <div>
                <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-2">
                  Taille d'entreprise
                </label>
                <select
                  id="companySize"
                  value={config.filters?.companySize || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    filters: { ...config.filters, companySize: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Toutes les tailles</option>
                  <option value="1-10">1-10 employés</option>
                  <option value="11-50">11-50 employés</option>
                  <option value="51-200">51-200 employés</option>
                  <option value="201-1000">201-1000 employés</option>
                  <option value="1000+">1000+ employés</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Filtre par nombre d'employés de l'entreprise
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                resetModal();
                onClose();
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !config.searchQuery}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{isLoading ? 'Démarrage...' : 'Démarrer le crawling'}</span>
            </button>
          </div>
          </form>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {crawlResults.length} leads trouvés
                </h3>
                <button
                  onClick={toggleSelectAll}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  {selectedLeads.size === crawlResults.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                </button>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowResults(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Nouvelle recherche
                </button>
                <button
                  onClick={handleSaveSelected}
                  disabled={selectedLeads.size === 0 || isSaving}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSaving && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>
                    {isSaving ? 'Sauvegarde...' : `Sauvegarder (${selectedLeads.size})`}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {crawlResults.map((lead, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedLeads.has(index)
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleLeadSelection(index)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(index)}
                        onChange={() => toggleLeadSelection(index)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getScoreColor(lead.score)}`}>
                        <span className="text-xs font-bold">{lead.score}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 text-sm">{lead.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">{lead.email}</span>
                    </div>

                    {lead.title && (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                        <span className="text-sm text-gray-600">{lead.title}</span>
                      </div>
                    )}

                    {lead.company && (
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{lead.company}</span>
                      </div>
                    )}

                    {lead.location && (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                        <span className="text-sm text-gray-500">{lead.location}</span>
                      </div>
                    )}

                    {lead.industry && (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 flex items-center justify-center">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                        <span className="text-sm text-gray-500">{lead.industry}</span>
                      </div>
                    )}
                  </div>

                  {selectedLeads.has(index) && (
                    <div className="mt-3 pt-3 border-t border-teal-200">
                      <div className="flex items-center space-x-2 text-teal-600">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Sélectionné</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {crawlResults.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun lead trouvé</h3>
                <p className="text-gray-600">Essayez de modifier vos critères de recherche.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrawlModal;