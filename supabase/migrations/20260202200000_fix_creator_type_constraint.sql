-- =====================================================
-- Add creator_type Column to Partners Table
-- Created: 2026-02-02
-- Description: Add creator_type to distinguish partners, influencers, beta_partners
-- =====================================================

-- Step 1: Add the creator_type column with default 'partner'
ALTER TABLE partners
ADD COLUMN IF NOT EXISTS creator_type TEXT DEFAULT 'partner';

-- Step 2: Set creator_type to 'influencer' for records that have influencer_status set
UPDATE partners
SET creator_type = 'influencer'
WHERE influencer_status IS NOT NULL;

-- Step 3: Ensure all records have a value (should already be 'partner' from default)
UPDATE partners
SET creator_type = 'partner'
WHERE creator_type IS NULL;

-- Step 4: Add NOT NULL constraint
ALTER TABLE partners
ALTER COLUMN creator_type SET NOT NULL;

-- Step 5: Add check constraint for valid values
ALTER TABLE partners
ADD CONSTRAINT check_creator_type
CHECK (creator_type IN ('partner', 'influencer', 'beta_partner'));

-- Step 6: Add index for filtering by creator_type
CREATE INDEX IF NOT EXISTS idx_partners_creator_type ON partners(creator_type);
