-- Migration: 002_pages.sql
-- Description: Landing pages created by user profiles

CREATE TABLE IF NOT EXISTS public.pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    bio TEXT DEFAULT '',
    profile_image TEXT DEFAULT '',
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Index for instant username lookup (e.g. site.com/@username)
CREATE INDEX IF NOT EXISTS idx_pages_username ON public.pages(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON public.pages(user_id);
