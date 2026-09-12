-- Migration: 009_page_views.sql
-- Description: Page view telemetry for real-time analytics, unique visitors, and CTR calculation

CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    visitor_id TEXT,
    country TEXT DEFAULT '',
    city TEXT DEFAULT '',
    device TEXT DEFAULT 'mobile', -- 'mobile', 'desktop', 'tablet'
    browser TEXT DEFAULT '',
    referrer TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_page_views_page_id ON public.page_views(page_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at);
