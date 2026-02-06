-- Add created_at to existing tables
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE skills ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Create site_visits table
CREATE TABLE IF NOT EXISTS site_visits (
  id SERIAL PRIMARY KEY,
  visited_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS for site_visits (optional, but good practice)
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public view)
CREATE POLICY "Public insert access" ON site_visits FOR INSERT WITH CHECK (true);

-- Allow admins to read (dashboard)
-- Assuming admin has authenticated role
CREATE POLICY "Admin read access" ON site_visits FOR SELECT USING (true);
