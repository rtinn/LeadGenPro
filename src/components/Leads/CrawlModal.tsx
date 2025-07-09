import React, { useState } from 'react';
import { X, Search, Globe, Users, Linkedin } from 'lucide-react';
import { CrawlService, CrawlConfig } from '../../services/crawlService';

interface CrawlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCrawlStarted: () => void;
}

const CrawlModal: React.FC<CrawlModalProps> = ({ isOpen, onClose, onCrawlStarted }) => {
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await CrawlService.startCrawlSession(config);
      onCrawlStarted();
      onClose();
    } catch (error) {
      console.error('Erreur lors du démarrage du crawling:', error);
      alert('Erreur lors du démarrage du crawling');
    } finally {
      setIsLoading(false);
    }
  };

  const sourceOptions = [
    { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
    { value: 'company_websites', label: 'Sites d\'entreprise', icon: Globe },
    { value: 'directories', label: 'Annuaires professionnels', icon: Users },
    { value: 'social_media', label: 'Réseaux sociaux', icon: Search }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Crawler des Leads</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
              placeholder="Ex: CTO startup Paris, développeur senior..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              required
            />
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
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
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
      </div>
    </div>
  );
};

export default CrawlModal;