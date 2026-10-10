-- Migration: Add updated_at to tenants table
-- Fixes trigger 'set_updated_at' failure when updating tenant details
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
