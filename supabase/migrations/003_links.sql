-- Migration: 003_links.sql
-- Description: Interactive link cards and blocks on a landing page

CREATE TABLE IF NOT EXISTS public.links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    section_id UUID,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT DEFAULT '',
    thumbnail_url TEXT DEFAULT '',
    icon TEXT DEFAULT '',
    link_type TEXT DEFAULT 'standard', -- 'standard', 'real_estate', 'coaching', 'youtube', 'product'
    color TEXT DEFAULT 'purple',
    badge_text TEXT DEFAULT '',
    position INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    open_new_tab BOOLEAN DEFAULT TRUE NOT NULL,
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    clicks INTEGER DEFAULT 0 NOT NULL,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_links_page_id ON public.links(page_id);
CREATE INDEX IF NOT EXISTS idx_links_position ON public.links(page_id, position);
