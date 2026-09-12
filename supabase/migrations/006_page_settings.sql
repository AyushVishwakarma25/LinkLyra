-- Migration: 006_page_settings.sql
-- Description: Visual styling, themes, fonts, and background configurations for each page

CREATE TABLE IF NOT EXISTS public.page_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID UNIQUE NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    theme_id TEXT DEFAULT 'warm',
    background_type TEXT DEFAULT 'color', -- 'color', 'gradient', 'image'
    background_value TEXT DEFAULT '#ECE7DC',
    font_family TEXT DEFAULT 'Plus Jakarta Sans',
    text_color TEXT DEFAULT '#1C1E22',
    button_color TEXT DEFAULT '#5E4BF7',
    button_style TEXT DEFAULT 'rounded', -- 'rounded', 'square', 'pill', 'glass'
    button_radius TEXT DEFAULT '16px',
    custom_css TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_page_settings_page_id ON public.page_settings(page_id);
