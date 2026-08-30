-- ============================================================================  
-- MIGRATION: 20260830_qa_bugfix_schema_alignment.sql  
-- Description: QA bug-fix pass - add created_by to financial_adjustments  
-- ============================================================================  
  
-- Add created_by column to financial_adjustments for audit trail  
ALTER TABLE public.financial_adjustments  
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;  
  
-- Reload PostgREST schema cache  
NOTIFY pgrst, 'reload schema'; 
