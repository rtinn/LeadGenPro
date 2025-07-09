/*
  # Schéma de base de données pour LeadGen Pro

  1. Nouvelles Tables
    - `leads`
      - `id` (uuid, clé primaire)
      - `name` (text, nom du lead)
      - `email` (text, email unique)
      - `title` (text, titre/poste)
      - `company` (text, nom de l'entreprise)
      - `source` (text, source du lead)
      - `score` (integer, score de qualité)
      - `status` (text, statut: hot/warm/cold)
      - `phone` (text, numéro de téléphone)
      - `linkedin_url` (text, profil LinkedIn)
      - `website` (text, site web de l'entreprise)
      - `industry` (text, secteur d'activité)
      - `company_size` (text, taille de l'entreprise)
      - `location` (text, localisation)
      - `notes` (text, notes sur le lead)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `email_campaigns`
      - `id` (uuid, clé primaire)
      - `name` (text, nom de la campagne)
      - `subject` (text, sujet de l'email)
      - `content` (text, contenu de l'email)
      - `status` (text, statut: draft/active/completed/paused)
      - `sent_count` (integer, nombre d'emails envoyés)
      - `open_rate` (decimal, taux d'ouverture)
      - `click_rate` (decimal, taux de clic)
      - `reply_count` (integer, nombre de réponses)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `email_logs`
      - `id` (uuid, clé primaire)
      - `campaign_id` (uuid, référence à email_campaigns)
      - `lead_id` (uuid, référence à leads)
      - `sent_at` (timestamp, date d'envoi)
      - `opened_at` (timestamp, date d'ouverture)
      - `clicked_at` (timestamp, date de clic)
      - `replied_at` (timestamp, date de réponse)
      - `status` (text, statut: sent/opened/clicked/replied/bounced)

    - `crawl_sessions`
      - `id` (uuid, clé primaire)
      - `source` (text, source du crawling)
      - `search_query` (text, requête de recherche)
      - `total_found` (integer, nombre total trouvé)
      - `total_processed` (integer, nombre traité)
      - `status` (text, statut: running/completed/failed)
      - `started_at` (timestamp)
      - `completed_at` (timestamp)

  2. Sécurité
    - Activer RLS sur toutes les tables
    - Ajouter des politiques pour les utilisateurs authentifiés
*/

-- Table des leads
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  title text,
  company text,
  source text DEFAULT 'Manual',
  score integer DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  status text DEFAULT 'cold' CHECK (status IN ('hot', 'warm', 'cold')),
  phone text,
  linkedin_url text,
  website text,
  industry text,
  company_size text,
  location text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des campagnes email
CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'paused')),
  sent_count integer DEFAULT 0,
  open_rate decimal(5,2) DEFAULT 0.00,
  click_rate decimal(5,2) DEFAULT 0.00,
  reply_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des logs d'emails
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES email_campaigns(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  sent_at timestamptz DEFAULT now(),
  opened_at timestamptz,
  clicked_at timestamptz,
  replied_at timestamptz,
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'opened', 'clicked', 'replied', 'bounced'))
);

-- Table des sessions de crawling
CREATE TABLE IF NOT EXISTS crawl_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  search_query text,
  total_found integer DEFAULT 0,
  total_processed integer DEFAULT 0,
  status text DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Activer RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crawl_sessions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les leads
CREATE POLICY "Users can read all leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert leads"
  ON leads
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update leads"
  ON leads
  FOR UPDATE
  TO authenticated
  USING (true);

-- Politiques RLS pour les campagnes email
CREATE POLICY "Users can manage email campaigns"
  ON email_campaigns
  FOR ALL
  TO authenticated
  USING (true);

-- Politiques RLS pour les logs d'emails
CREATE POLICY "Users can manage email logs"
  ON email_logs
  FOR ALL
  TO authenticated
  USING (true);

-- Politiques RLS pour les sessions de crawling
CREATE POLICY "Users can manage crawl sessions"
  ON crawl_sessions
  FOR ALL
  TO authenticated
  USING (true);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_campaign_id ON email_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_lead_id ON email_logs(lead_id);