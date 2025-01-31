-- Primero eliminamos la referencia a events
ALTER TABLE order_items DROP COLUMN IF EXISTS event_id;

-- Hacemos que product_id sea obligatorio ya que ahora todos los items serán productos
ALTER TABLE order_items ALTER COLUMN product_id SET NOT NULL;

-- Actualizamos los comentarios para claridad
COMMENT ON TABLE order_items IS 'Tabla que almacena los items individuales de cada pedido de productos';
