-- =========================
-- CONSTANT UUIDS (USED EVERYWHERE)
-- =========================
-- Tenant ID
-- ddf4393b-c774-4232-8593-aec172f44452
-- Admin ID
-- a6a5638e-2841-4c0a-84b3-1d8fcab03c13
-- Project ID
-- 33333333-3333-3333-3333-333333333333

-- =========================
-- TENANT
-- =========================
INSERT INTO tenants (
  id, name, subdomain, status
)
VALUES (
  'ddf4393b-c774-4232-8593-aec172f44452',
  'Demo Company',
  'demo',
  'active'
)
ON CONFLICT DO NOTHING;

-- =========================
-- ADMIN USER (Password: Demo@123)
-- =========================
INSERT INTO users (
  id,
  tenant_id,
  email,
  password_hash,
  full_name,
  role,
  is_active
)
VALUES (
  'a6a5638e-2841-4c0a-84b3-1d8fcab03c13',
  'ddf4393b-c774-4232-8593-aec172f44452',
  'admin@demo.com',
  '$2b$10$7dVe1GiFTGXV.z/1UADEouPw71IoD/RBGUpS9mWfnjZO.kofsbwke',
  'Demo Admin',
  'tenant_admin',
  true
)
ON CONFLICT DO NOTHING;

-- =========================
-- PROJECT (USES SAME TENANT ID)
-- =========================
INSERT INTO projects (
  id,
  tenant_id,
  name,
  description,
  created_by
)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'ddf4393b-c774-4232-8593-aec172f44452',
  'Demo Project',
  'Sample project for demo tenant',
  'a6a5638e-2841-4c0a-84b3-1d8fcab03c13'
)
ON CONFLICT DO NOTHING;
