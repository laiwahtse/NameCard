-- Seed a demo tenant, admin user, and attach existing cards to this tenant (safe idempotent ops).
-- Run this in Neon SQL editor connected to your dev database/branch.

-- 1) Upsert tenant
INSERT INTO tenants (name, slug)
VALUES ('CDC Demo Tenant', 'cdc-demo')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- 2) Upsert admin user for the tenant (plain-text password for now)
INSERT INTO users (tenant_id, email, password_hash, role, display_name)
VALUES (
  (SELECT id FROM tenants WHERE slug = 'cdc-demo'),
  'laiwah76@gmail.com',
  'Hot Dog 1012025§',
  'tenant_admin',
  'CDC Demo Admin'
)
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name;

-- 3) Optional: non-admin user to test role restrictions
INSERT INTO users (tenant_id, email, password_hash, role, display_name)
VALUES (
  (SELECT id FROM tenants WHERE slug = 'cdc-demo'),
  'viewer@example.com',
  'Viewer Pass 123!',
  'employee',
  'CDC Viewer User'
)
ON CONFLICT (email) DO NOTHING;

-- 4) Attach any existing cards without tenant to the demo tenant so scans show up
UPDATE cards
SET tenant_id = (SELECT id FROM tenants WHERE slug = 'cdc-demo')
WHERE tenant_id IS NULL;
