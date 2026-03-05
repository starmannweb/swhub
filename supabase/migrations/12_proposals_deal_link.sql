-- Vincular propostas a negócios do CRM
ALTER TABLE public.crm_proposals ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES public.crm_deals(id) ON DELETE SET NULL;
