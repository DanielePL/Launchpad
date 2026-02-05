-- Add influencer_status column for influencer outreach workflow
-- Status workflow: pending -> contacted -> approved -> rejected
-- Note: Skips if partners table doesn't exist

-- Create enum type for influencer status
DO $$ BEGIN
  CREATE TYPE influencer_status AS ENUM ('pending', 'contacted', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add column to partners table (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'partners') THEN
    ALTER TABLE partners
    ADD COLUMN IF NOT EXISTS influencer_status influencer_status DEFAULT 'pending';

    CREATE INDEX IF NOT EXISTS idx_partners_influencer_status ON partners(influencer_status);

    COMMENT ON COLUMN partners.influencer_status IS 'Outreach status for influencers: pending, contacted, approved, rejected';
    RAISE NOTICE 'Added influencer_status to partners table';
  ELSE
    RAISE NOTICE 'partners table does not exist, skipping';
  END IF;
END $$;
