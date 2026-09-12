-- Migration: 008_subscribers.sql
-- Description: Newsletter subscribers captured directly on landing pages

CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    CONSTRAINT unique_subscriber_per_page UNIQUE(page_id, email)
);

CREATE INDEX IF NOT EXISTS idx_subscribers_page_id ON public.subscribers(page_id);
