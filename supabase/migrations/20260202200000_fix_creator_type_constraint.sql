-- =====================================================
-- Fix creator_type Data and Add NOT NULL Constraint
-- Created: 2026-02-02
-- Description: Fix Kelly's record and ensure creator_type is always set
-- =====================================================

-- Step 1: Fix records that have influencer_status set but wrong creator_type
-- This catches Kelly and any other misclassified influencers
UPDATE partners
SET creator_type = 'influencer'
WHERE influencer_status IS NOT NULL
  AND (creator_type IS NULL OR creator_type = 'partner');

-- Step 2: Set default for any remaining NULL records (legacy partners)
UPDATE partners
SET creator_type = 'partner'
WHERE creator_type IS NULL;

-- Step 3: Add NOT NULL constraint with default value
ALTER TABLE partners
ALTER COLUMN creator_type SET DEFAULT 'partner';

ALTER TABLE partners
ALTER COLUMN creator_type SET NOT NULL;

-- Step 4: Add check constraint to ensure valid values
ALTER TABLE partners
ADD CONSTRAINT check_creator_type
CHECK (creator_type IN ('partner', 'influencer', 'beta_partner'));
