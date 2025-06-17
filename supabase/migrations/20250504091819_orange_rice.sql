/*
  # Create addresses table

  1. New Tables
    - `addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `address` (text, not null)
      - `city` (text, not null)
      - `postal_code` (text)
      - `is_default` (boolean)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
  2. Security
    - Enable RLS on `addresses` table
    - Add policy for authenticated users to manage their own addresses
    - Add policy for public to view addresses
*/

CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  postal_code text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS addresses_user_id_idx ON addresses(user_id);
CREATE INDEX IF NOT EXISTS addresses_is_default_idx ON addresses(is_default);

-- Enable Row Level Security
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own addresses
CREATE POLICY "Users can manage their own addresses"
  ON addresses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy for public to view addresses
CREATE POLICY "Addresses are viewable by everyone"
  ON addresses
  FOR SELECT
  TO public
  USING (true);

-- Add update timestamp trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_addresses_timestamp'
  ) THEN
    CREATE TRIGGER update_addresses_timestamp
    BEFORE UPDATE ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
  END IF;
END $$;