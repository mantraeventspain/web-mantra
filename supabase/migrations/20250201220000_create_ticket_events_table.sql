-- Crear tabla para eventos de tickets múltiples
CREATE TABLE IF NOT EXISTS ticket_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  image_url text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_url CHECK (url ~ '^(https?://|/).*$'),
  CONSTRAINT unique_display_order UNIQUE (display_order)
);

-- Habilitar RLS
ALTER TABLE ticket_events ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Ticket events are viewable by everyone" 
  ON ticket_events FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage ticket events" 
  ON ticket_events FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_ticket_events_updated_at
  BEFORE UPDATE ON ticket_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Índices para optimizar consultas
CREATE INDEX idx_ticket_events_active ON ticket_events (is_active);
CREATE INDEX idx_ticket_events_display_order ON ticket_events (display_order);

-- Comentarios
COMMENT ON TABLE ticket_events IS 'Eventos con URLs de entradas múltiples';
COMMENT ON COLUMN ticket_events.name IS 'Nombre del evento para mostrar al usuario';
COMMENT ON COLUMN ticket_events.url IS 'URL de entradas (externa o interna)';
COMMENT ON COLUMN ticket_events.image_url IS 'URL de la imagen/icono del evento';
COMMENT ON COLUMN ticket_events.description IS 'Descripción opcional del evento';
COMMENT ON COLUMN ticket_events.is_active IS 'Si el evento está activo y visible';
COMMENT ON COLUMN ticket_events.display_order IS 'Orden de visualización (único)';

-- Insertar algunos datos de ejemplo (opcional)
INSERT INTO ticket_events (name, url, display_order) VALUES
  ('Evento Principal', '/tickets/main', 1),
  ('Evento Especial', 'https://eventbrite.com/special-event', 2)
ON CONFLICT DO NOTHING; 