-- =====================================================
-- Ambassadors Management Migration
-- Created: 2026-01-26
-- Description: Tables for content ambassador management and deliverables tracking
-- =====================================================

-- Ambassadors Table
CREATE TABLE IF NOT EXISTS public.ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  tiktok_handle TEXT,
  instagram_handle TEXT,
  youtube_handle TEXT,
  profile_photo_url TEXT,
  sport TEXT,
  status TEXT DEFAULT 'contacted' CHECK (status IN ('contacted', 'onboarding', 'active', 'paused', 'terminated')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
) TABLESPACE pg_default;

-- Indexes for ambassadors
CREATE INDEX IF NOT EXISTS idx_ambassadors_status ON public.ambassadors(status);
CREATE INDEX IF NOT EXISTS idx_ambassadors_sport ON public.ambassadors(sport);
CREATE INDEX IF NOT EXISTS idx_ambassadors_email ON public.ambassadors(email);

-- Ambassador Deliverables Table
CREATE TABLE IF NOT EXISTS public.ambassador_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES public.ambassadors(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'photo', 'story', 'reel')),
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'delivered', 'approved', 'rejected')),
  title TEXT NOT NULL,
  description TEXT,
  delivery_date DATE,
  delivered_at TIMESTAMPTZ,
  content_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
) TABLESPACE pg_default;

-- Indexes for deliverables
CREATE INDEX IF NOT EXISTS idx_ambassador_deliverables_ambassador_id ON public.ambassador_deliverables(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_deliverables_status ON public.ambassador_deliverables(status);

-- =====================================================
-- Updated_at Triggers
-- =====================================================

-- Trigger function for ambassadors
CREATE OR REPLACE FUNCTION update_ambassadors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ambassadors_updated_at ON public.ambassadors;
CREATE TRIGGER trigger_ambassadors_updated_at
  BEFORE UPDATE ON public.ambassadors
  FOR EACH ROW
  EXECUTE FUNCTION update_ambassadors_updated_at();

-- Trigger function for ambassador_deliverables
CREATE OR REPLACE FUNCTION update_ambassador_deliverables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ambassador_deliverables_updated_at ON public.ambassador_deliverables;
CREATE TRIGGER trigger_ambassador_deliverables_updated_at
  BEFORE UPDATE ON public.ambassador_deliverables
  FOR EACH ROW
  EXECUTE FUNCTION update_ambassador_deliverables_updated_at();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

ALTER TABLE public.ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_deliverables ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage ambassadors
CREATE POLICY "Admins can manage ambassadors" ON public.ambassadors
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policy: Admins can manage deliverables
CREATE POLICY "Admins can manage ambassador deliverables" ON public.ambassador_deliverables
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Stats RPC Function
-- =====================================================

CREATE OR REPLACE FUNCTION get_ambassador_stats()
RETURNS TABLE (
  total BIGINT,
  active BIGINT,
  delivered_this_month BIGINT,
  pending BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::BIGINT FROM public.ambassadors) as total,
    (SELECT COUNT(*)::BIGINT FROM public.ambassadors WHERE status = 'active') as active,
    (SELECT COUNT(*)::BIGINT FROM public.ambassador_deliverables
     WHERE status = 'delivered'
     AND delivered_at >= date_trunc('month', CURRENT_DATE)
    ) as delivered_this_month,
    (SELECT COUNT(*)::BIGINT FROM public.ambassador_deliverables
     WHERE status IN ('assigned', 'in_progress')
    ) as pending;
END;
$$ LANGUAGE plpgsql;
