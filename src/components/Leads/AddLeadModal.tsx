import React, { useState } from 'react';
import { Lead } from '../../types';
import { LeadService } from '../../services/leadService';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadAdded: () => void;
}

const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onLeadAdded }) => {
  const [formData, setFormData] = useState<Omit<Lead, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    email: '',
    title: '',
    company: '',
    source: 'Manual',
    score: 0,
    status: 'cold',
    phone: '',
    linkedin_url: '',
    website: '',
    industry: '',
    company_size: '',
    location: '',
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await LeadService.createLead(formData);
      onLeadAdded();
      onClose();
    } catch (err) {
      setError('Erreur lors de l\'ajout du lead. Vérifiez les champs ou la console.');
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Ajouter un Lead</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Colonne 1 */}
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Nom *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Titre</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Entreprise</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Source</label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                  <option value="Manual">Manuel</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Industry Directories">Répertoires Industriels</option>
                  <option value="Referrals">Références</option>
                  <option value="Company Websites">Sites d'Entreprise</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                  <option value="cold">Cold</option>
                  <option value="warm">Warm</option>
                  <option value="hot">Hot</option>
                </select>
              </div>
            </div>

            {/* Colonne 2 */}
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Score (0-100)</label>
                <input
                  type="number"
                  name="score"
                  value={formData.score}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">URL LinkedIn</label>
                <input
                  type="text"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Site Web</label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Industrie</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Taille de l'entreprise</label>
                <input
                  type="text"
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Localisation</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;