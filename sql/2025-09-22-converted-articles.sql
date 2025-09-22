-- Migration: Add converted_articles table for user history tracking
-- Date: 2025-09-22
-- Purpose: Track which articles have been converted to stories by device

-- Create converted_articles table
CREATE TABLE IF NOT EXISTS converted_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(255) NOT NULL,
  article_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of article content
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  converted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Ensure one conversion per device per article
  UNIQUE(device_id, article_hash)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_converted_articles_device_id ON converted_articles(device_id);
CREATE INDEX IF NOT EXISTS idx_converted_articles_converted_at ON converted_articles(converted_at DESC);
CREATE INDEX IF NOT EXISTS idx_converted_articles_story_id ON converted_articles(story_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE converted_articles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own converted articles (by device_id)
CREATE POLICY "Users can view own converted articles" ON converted_articles
  FOR SELECT USING (device_id = current_setting('app.device_id', true));

-- Policy: Users can insert their own converted articles
CREATE POLICY "Users can insert own converted articles" ON converted_articles
  FOR INSERT WITH CHECK (device_id = current_setting('app.device_id', true));

-- Policy: Service role can do everything (for server-side operations)
CREATE POLICY "Service role full access" ON converted_articles
  FOR ALL USING (auth.role() = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE converted_articles IS 'Tracks which articles have been converted to stories by each device';
COMMENT ON COLUMN converted_articles.device_id IS 'Anonymous device identifier from HttpOnly cookie';
COMMENT ON COLUMN converted_articles.article_hash IS 'SHA-256 hash of article URL or source+title for deduplication';
COMMENT ON COLUMN converted_articles.story_id IS 'Reference to the generated story record';
COMMENT ON COLUMN converted_articles.converted_at IS 'Timestamp when the article was converted to a story';
