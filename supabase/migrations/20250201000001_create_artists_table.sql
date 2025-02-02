-- Eliminamos la tabla profiles si existe
DROP TABLE IF EXISTS profiles;

-- Creamos la nueva tabla artists
CREATE TABLE IF NOT EXISTS artists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text NOT NULL UNIQUE,
  first_name text,
  last_name1 text,
  last_name2 text,
  avatar_filename text,
  description text,
  instagram_username text,
  soundcloud_url text,
  beatport_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Aseguramos que el nickname sea único y tenga un formato válido
  CONSTRAINT valid_nickname CHECK (nickname ~ '^[a-zA-Z0-9_-]+$'),
  -- Aseguramos que las URLs tengan un formato válido
  CONSTRAINT valid_soundcloud_url CHECK (soundcloud_url ~ '^https://soundcloud\.com/.*$'),
  CONSTRAINT valid_beatport_url CHECK (beatport_url ~ '^https://www\.beatport\.com/.*$')
);

-- Habilitamos RLS
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Artists are viewable by everyone" 
  ON artists FOR SELECT USING (true);

CREATE POLICY "Only admins can insert/update artists" 
  ON artists FOR ALL 
  USING (auth.uid() IN (
    SELECT user_id FROM admin_users
  ));

-- Trigger para actualizar updated_at
CREATE TRIGGER update_artists_updated_at
  BEFORE UPDATE ON artists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Comentarios en la tabla
COMMENT ON TABLE artists IS 'Información de los artistas de la plataforma';
COMMENT ON COLUMN artists.avatar_filename IS 'Nombre del archivo de avatar almacenado en bucket media/images/artist-avatar/'; 