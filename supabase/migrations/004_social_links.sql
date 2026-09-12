-- Migration: 004_social_links.sql
-- Description: Social media icons and direct handles per landing page

CREATE TABLE IF NOT EXISTS public.social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- 'instagram', 'youtube', 'whatsapp', 'twitter', 'linkedin', 'github', 'spotify', etc.
    username TEXT DEFAULT '',
    url TEXT NOT NULL,
    position INTEGER DEFAULT 0 NOT NULL,
    is_visible BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_social_links_page_id ON public.social_links(page_id);
