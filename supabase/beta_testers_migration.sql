-- =====================================================
-- Beta Testers Management Migration
-- Erstellt: 2025-01-24
-- Beschreibung: Verwaltungstabelle für iOS und Android Betatester
-- =====================================================

-- Beta Testers Tabelle
CREATE TABLE IF NOT EXISTS public.beta_testers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'active', 'inactive')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  device_model TEXT,
  os_version TEXT,
  invited_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
) TABLESPACE pg_default;

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_beta_testers_email ON public.beta_testers(email);
CREATE INDEX IF NOT EXISTS idx_beta_testers_platform ON public.beta_testers(platform);
CREATE INDEX IF NOT EXISTS idx_beta_testers_status ON public.beta_testers(status);
CREATE INDEX IF NOT EXISTS idx_beta_testers_platform_status ON public.beta_testers(platform, status);

-- Updated_at Trigger Funktion
CREATE OR REPLACE FUNCTION update_beta_testers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für automatisches updated_at
DROP TRIGGER IF EXISTS trigger_beta_testers_updated_at ON public.beta_testers;
CREATE TRIGGER trigger_beta_testers_updated_at
  BEFORE UPDATE ON public.beta_testers
  FOR EACH ROW
  EXECUTE FUNCTION update_beta_testers_updated_at();

-- Row Level Security (RLS)
ALTER TABLE public.beta_testers ENABLE ROW LEVEL SECURITY;

-- Policy: Nur authentifizierte Benutzer können beta_testers lesen/schreiben
CREATE POLICY "Authenticated users can manage beta testers" ON public.beta_testers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Hilfsfunktionen
-- =====================================================

-- Funktion: Betatester nach Plattform zählen
CREATE OR REPLACE FUNCTION get_beta_tester_stats()
RETURNS TABLE (
  platform TEXT,
  total BIGINT,
  pending BIGINT,
  invited BIGINT,
  active BIGINT,
  inactive BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bt.platform,
    COUNT(*)::BIGINT as total,
    COUNT(*) FILTER (WHERE bt.status = 'pending')::BIGINT as pending,
    COUNT(*) FILTER (WHERE bt.status = 'invited')::BIGINT as invited,
    COUNT(*) FILTER (WHERE bt.status = 'active')::BIGINT as active,
    COUNT(*) FILTER (WHERE bt.status = 'inactive')::BIGINT as inactive
  FROM public.beta_testers bt
  GROUP BY bt.platform;
END;
$$ LANGUAGE plpgsql;
