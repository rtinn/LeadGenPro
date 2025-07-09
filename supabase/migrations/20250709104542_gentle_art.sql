/*
# Fonction pour incrémenter le compteur de campagnes

1. Fonctions
  - `increment_sent_count` - Incrémente le compteur d'emails envoyés pour une campagne

2. Sécurité
  - Fonction accessible aux utilisateurs authentifiés
*/

CREATE OR REPLACE FUNCTION increment_sent_count(campaign_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE email_campaigns 
  SET sent_count = sent_count + 1,
      updated_at = now()
  WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION increment_sent_count(uuid) TO authenticated;