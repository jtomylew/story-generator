-- Stories table for persisting generated stories by device
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  article_hash TEXT NOT NULL,
  reading_level TEXT NOT NULL CHECK (reading_level IN ('preschool', 'early-elementary', 'elementary')),
  story TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for efficient lookups by device_id
CREATE INDEX IF NOT EXISTS idx_stories_device_id ON public.stories(device_id);

-- Index for efficient lookups by device_id and article_hash (for upserts)
CREATE UNIQUE INDEX IF NOT EXISTS idx_stories_device_article ON public.stories(device_id, article_hash);

-- Index for efficient ordering by creation time
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON public.stories(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to access all rows
CREATE POLICY "Service role can manage all stories" ON public.stories
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy to allow users to read their own stories (if using user auth in future)
CREATE POLICY "Users can read their own stories" ON public.stories
  FOR SELECT USING (auth.uid()::text = device_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
