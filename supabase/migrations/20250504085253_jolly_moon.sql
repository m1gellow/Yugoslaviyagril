/*
  # Create page content tables

  1. New Tables
    - `page_content`
      - `id` (uuid, primary key)
      - `page_id` (text, unique)
      - `title` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `page_sections`
      - `id` (uuid, primary key)
      - `page_id` (uuid, foreign key to page_content.id)
      - `title` (text)
      - `content` (text)
      - `image_url` (text)
      - `section_type` (text)
      - `sort_order` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage content
*/

-- Create page_content table
CREATE TABLE IF NOT EXISTS page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id text UNIQUE NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create page_sections table
CREATE TABLE IF NOT EXISTS page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES page_content(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  image_url text,
  section_type text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS page_content_page_id_idx ON page_content(page_id);
CREATE INDEX IF NOT EXISTS page_sections_page_id_idx ON page_sections(page_id);
CREATE INDEX IF NOT EXISTS page_sections_sort_order_idx ON page_sections(sort_order);

-- Create policies for authenticated users
-- Page content policies
CREATE POLICY "Authenticated users can manage page content"
ON page_content
FOR ALL
TO authenticated
USING (true);

-- Page sections policies
CREATE POLICY "Authenticated users can manage page sections"
ON page_sections
FOR ALL
TO authenticated
USING (true);

-- Create trigger function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_page_content_timestamp
BEFORE UPDATE ON page_content
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_page_sections_timestamp
BEFORE UPDATE ON page_sections
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();