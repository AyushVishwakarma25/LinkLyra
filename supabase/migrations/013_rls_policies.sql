-- Migration: 013_rls_policies.sql
-- Description: Row Level Security (RLS) policies for complete multi-tenant security

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Pages Policies
CREATE POLICY "Published pages are viewable by everyone" 
ON public.pages FOR SELECT USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own pages" 
ON public.pages FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pages" 
ON public.pages FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pages" 
ON public.pages FOR DELETE USING (auth.uid() = user_id);

-- 4. Links Policies
CREATE POLICY "Active links are viewable by everyone" 
ON public.links FOR SELECT USING (
    is_active = true OR 
    EXISTS (SELECT 1 FROM public.pages WHERE pages.id = links.page_id AND pages.user_id = auth.uid())
);

CREATE POLICY "Users can insert links on their own pages" 
ON public.links FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.pages WHERE pages.id = links.page_id AND pages.user_id = auth.uid())
);

CREATE POLICY "Users can update links on their own pages" 
ON public.links FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.pages WHERE pages.id = links.page_id AND pages.user_id = auth.uid())
);

CREATE POLICY "Users can delete links on their own pages" 
ON public.links FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.pages WHERE pages.id = links.page_id AND pages.user_id = auth.uid())
);

-- 5. Social Links Policies
CREATE POLICY "Visible social links are viewable by everyone" 
ON public.social_links FOR SELECT USING (is_visible = true OR EXISTS (SELECT 1 FROM public.pages WHERE pages.id = social_links.page_id AND pages.user_id = auth.uid()));

CREATE POLICY "Users can manage social links on their own pages" 
ON public.social_links FOR ALL USING (
    EXISTS (SELECT 1 FROM public.pages WHERE pages.id = social_links.page_id AND pages.user_id = auth.uid())
);

-- 6. Sections Policies
CREATE POLICY "Visible sections are viewable by everyone" 
ON public.sections FOR SELECT USING (is_visible = true OR EXISTS (SELECT 1 FROM public.pages WHERE pages.id = sections.page_id AND pages.user_id = auth.uid()));

CREATE POLICY "Users can manage sections on their own pages" 
ON public.sections FOR ALL USING (
    EXISTS (SELECT 1 FROM public.pages WHERE pages.id = sections.page_id AND pages.user_id = auth.uid())
);

-- 7. Page Settings & Themes
CREATE POLICY "Page settings are viewable by everyone" 
ON public.page_settings FOR SELECT USING (true);

CREATE POLICY "Users can update settings on their own pages" 
ON public.page_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.pages WHERE pages.id = page_settings.page_id AND pages.user_id = auth.uid())
);

CREATE POLICY "Themes are viewable by everyone" 
ON public.themes FOR SELECT USING (true);

-- 8. Analytics (Views & Clicks) & Subscribers
CREATE POLICY "Anyone can record a page view" 
ON public.page_views FOR INSERT WITH CHECK (true);

CREATE POLICY "Page owners can view their page traffic" 
ON public.page_views FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.pages WHERE pages.id = page_views.page_id AND pages.user_id = auth.uid())
);

CREATE POLICY "Anyone can record a link click" 
ON public.link_clicks FOR INSERT WITH CHECK (true);

CREATE POLICY "Page owners can view their click analytics" 
ON public.link_clicks FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.pages WHERE pages.id = link_clicks.page_id AND pages.user_id = auth.uid())
);

CREATE POLICY "Anyone can subscribe to a page" 
ON public.subscribers FOR INSERT WITH CHECK (true);

CREATE POLICY "Page owners can view their subscribers" 
ON public.subscribers FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.pages WHERE pages.id = subscribers.page_id AND pages.user_id = auth.uid())
);
