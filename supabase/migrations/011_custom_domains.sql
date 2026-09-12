-- Migration: 011_custom_domains.sql
-- Description: Custom domain mapping for premium creator landing pages

CREATE TABLE IF NOT EXISTS public.custom_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID UNIQUE NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    domain TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'active', 'failed'
    ssl_status TEXT DEFAULT 'pending',
    dns_records JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON public.custom_domains(LOWER(domain));
