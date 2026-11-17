-- VETMAP V26 - CONSULTAS DE SOLO LECTURA PARA PGADMIN 4.
-- Conectarse a la base vetmap_db -> Query Tool. Ejecutar sentencias por separado.
-- No contiene INSERT, UPDATE, DELETE ni DROP.

-- 1. Estado de la conexión y base seleccionada.
SELECT current_database() AS base_de_datos, current_schema() AS esquema, version() AS version_postgresql;

-- 2. Todas las tablas públicas de VetMap.
SELECT table_name AS tabla
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 3. Campos de las nuevas tablas de reparto.
SELECT table_name AS tabla, column_name AS columna, data_type AS tipo, is_nullable AS admite_nulos
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name IN ('delivery_drivers', 'delivery_assignments')
ORDER BY table_name, ordinal_position;

-- 4. Relaciones (claves foráneas) del módulo de repartidores.
SELECT tc.table_name AS tabla, kcu.column_name AS columna,
       ccu.table_name AS tabla_referenciada, ccu.column_name AS columna_referenciada
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON kcu.constraint_name = tc.constraint_name AND kcu.constraint_schema = tc.constraint_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name AND ccu.constraint_schema = tc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema='public'
  AND tc.table_name IN ('delivery_assignments', 'delivery_drivers')
ORDER BY tc.table_name, kcu.column_name;

-- 5. Cuántos registros hay (ejecutar después de arrancar FastAPI para crear tablas).
SELECT 'delivery_drivers' AS tabla, COUNT(*) AS cantidad FROM delivery_drivers
UNION ALL
SELECT 'delivery_assignments', COUNT(*) FROM delivery_assignments
UNION ALL
SELECT 'store_orders', COUNT(*) FROM store_orders
UNION ALL
SELECT 'store_products', COUNT(*) FROM store_products;

-- 6. Demostración: reparto asignado, tienda, repartidor y pedido.
SELECT a.id AS asignacion, s.name AS tienda, d.name AS repartidor,
       a.order_id AS pedido, a.state AS estado_entrega, o.status AS estado_pedido,
       a.assigned_at AS fecha_asignacion, a.delivered_at AS fecha_entrega
FROM delivery_assignments a
JOIN delivery_drivers d ON d.id = a.driver_id
JOIN pet_stores s ON s.id = a.store_id
JOIN store_orders o ON o.id = a.order_id
ORDER BY a.id DESC LIMIT 30;

-- 7. Productos incluidos en un reparto.
SELECT a.order_id AS pedido, d.name AS repartidor,
       p.name AS producto, i.quantity AS cantidad, i.unit_price AS precio_unitario
FROM delivery_assignments a
JOIN delivery_drivers d ON d.id=a.driver_id
JOIN store_order_items i ON i.order_id=a.order_id
JOIN store_products p ON p.id=i.product_id
ORDER BY a.order_id DESC, p.name LIMIT 40;

-- 8. Registro general de estados de pedidos (trazabilidad).
SELECT order_id, status, changed_at
FROM store_order_status_history
ORDER BY changed_at DESC LIMIT 30;
