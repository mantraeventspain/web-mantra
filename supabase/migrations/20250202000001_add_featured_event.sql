-- Add featured event functionality
-- Only one event can be featured at a time

-- Add is_featured column to events table
ALTER TABLE events ADD COLUMN is_featured boolean DEFAULT false;

-- Create unique partial index to ensure only one event can be featured
CREATE UNIQUE INDEX unique_featured_event ON events (is_featured) WHERE is_featured = true;

-- Create function to ensure only one event is featured
CREATE OR REPLACE FUNCTION ensure_single_featured_event()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new/updated event is being set as featured
  IF NEW.is_featured = true THEN
    -- Unset any other featured events
    UPDATE events 
    SET is_featured = false 
    WHERE is_featured = true AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure only one featured event
CREATE TRIGGER ensure_single_featured_event_trigger
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_featured_event();

-- Add policy for featured events (readable by everyone)
CREATE POLICY "Featured events are viewable by everyone" ON events
  FOR SELECT USING (true); 