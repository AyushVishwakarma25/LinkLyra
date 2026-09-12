-- Migration: 007_themes.sql
-- Description: Pre-defined design palettes and custom themes

CREATE TABLE IF NOT EXISTS public.themes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    config_json JSONB NOT NULL DEFAULT '{}'::JSONB,
    is_premium BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Seed core high-converting themes
INSERT INTO public.themes (id, name, config_json, is_premium)
VALUES 
    ('warm', 'Warm Linen', '{"canvas":"#ECE7DC","text":"#1C1E22","card":"#5E4BF7","buttonStyle":"rounded"}'::JSONB, false),
    ('cream', 'Morning Cream', '{"canvas":"#FAF8F5","text":"#191A1E","card":"#E75646","buttonStyle":"pill"}'::JSONB, false),
    ('clay', 'Nordic Clay', '{"canvas":"#EFEBE4","text":"#1C1E22","card":"#10B981","buttonStyle":"rounded"}'::JSONB, false),
    ('dark', 'Obsidian Night', '{"canvas":"#191A1E","text":"#FFFFFF","card":"#5E4BF7","buttonStyle":"glass"}'::JSONB, false)
ON CONFLICT (id) DO NOTHING;
