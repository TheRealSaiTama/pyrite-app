-- ========================================================
-- PYRITE - FULL SUPABASE DATABASE SETUP & SEED SCRIPT
-- Run this entire script in Supabase SQL Editor (1-Click Setup)
-- ========================================================


-- >>> Migration: 20260704115707_e8a14980-598e-475d-a1d1-96a56abd6021.sql <<<

-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('owner');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.has_role(auth.uid(), 'owner'::public.app_role) $$;

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- ============ SITE SETTINGS ============
CREATE TABLE public.site_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  brand_name TEXT NOT NULL DEFAULT 'GiftVibe',
  tagline TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#c4654a',
  whatsapp_number TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  socials JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "owner write settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE TRIGGER set_site_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PAGE SEO ============
CREATE TABLE public.page_seo (
  page_key TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  og_image_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.page_seo TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.page_seo TO authenticated;
GRANT ALL ON public.page_seo TO service_role;
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read seo" ON public.page_seo FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "owner write seo" ON public.page_seo FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE TRIGGER set_page_seo_updated BEFORE UPDATE ON public.page_seo FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PAGE SECTIONS ============
CREATE TABLE public.page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  title TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (page_key, section_key)
);
CREATE INDEX page_sections_page_order_idx ON public.page_sections (page_key, sort_order);
GRANT SELECT ON public.page_sections TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.page_sections TO authenticated;
GRANT ALL ON public.page_sections TO service_role;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read sections" ON public.page_sections FOR SELECT TO anon, authenticated USING (enabled = true);
CREATE POLICY "owner read all sections" ON public.page_sections FOR SELECT TO authenticated USING (public.is_owner());
CREATE POLICY "owner write sections" ON public.page_sections FOR INSERT TO authenticated WITH CHECK (public.is_owner());
CREATE POLICY "owner update sections" ON public.page_sections FOR UPDATE TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "owner delete sections" ON public.page_sections FOR DELETE TO authenticated USING (public.is_owner());
CREATE TRIGGER set_page_sections_updated BEFORE UPDATE ON public.page_sections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ NAV LINKS ============
CREATE TABLE public.nav_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_key TEXT NOT NULL,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX nav_links_group_order_idx ON public.nav_links (group_key, sort_order);
GRANT SELECT ON public.nav_links TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.nav_links TO authenticated;
GRANT ALL ON public.nav_links TO service_role;
ALTER TABLE public.nav_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read nav" ON public.nav_links FOR SELECT TO anon, authenticated USING (enabled = true);
CREATE POLICY "owner read all nav" ON public.nav_links FOR SELECT TO authenticated USING (public.is_owner());
CREATE POLICY "owner write nav" ON public.nav_links FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE TRIGGER set_nav_links_updated BEFORE UPDATE ON public.nav_links FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  min_price INT,
  max_price INT,
  category TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT false,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON public.products (category);
CREATE INDEX products_featured_idx ON public.products (featured) WHERE featured = true;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read products" ON public.products FOR SELECT TO anon, authenticated USING (enabled = true);
CREATE POLICY "owner read all products" ON public.products FOR SELECT TO authenticated USING (public.is_owner());
CREATE POLICY "owner write products" ON public.products FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE TRIGGER set_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ DIARIES ============
CREATE TABLE public.diaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  min_price INT,
  max_price INT,
  category TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  color TEXT,
  size TEXT,
  pages INT,
  cover_type TEXT,
  image_url TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT false,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX diaries_category_idx ON public.diaries (category);
GRANT SELECT ON public.diaries TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.diaries TO authenticated;
GRANT ALL ON public.diaries TO service_role;
ALTER TABLE public.diaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read diaries" ON public.diaries FOR SELECT TO anon, authenticated USING (enabled = true);
CREATE POLICY "owner read all diaries" ON public.diaries FOR SELECT TO authenticated USING (public.is_owner());
CREATE POLICY "owner write diaries" ON public.diaries FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE TRIGGER set_diaries_updated BEFORE UPDATE ON public.diaries FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ MEDIA ============
CREATE TABLE public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  alt TEXT,
  width INT,
  height INT,
  size_bytes INT,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media_assets TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
GRANT ALL ON public.media_assets TO service_role;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read media" ON public.media_assets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "owner write media" ON public.media_assets FOR ALL TO authenticated USING (public.is_owner()) WITH CHECK (public.is_owner());

-- ============ AUDIT ============
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  action TEXT NOT NULL,
  diff JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_created_idx ON public.audit_log (created_at DESC);
GRANT SELECT, INSERT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner read audit" ON public.audit_log FOR SELECT TO authenticated USING (public.is_owner());
CREATE POLICY "owner insert audit" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (public.is_owner());


-- >>> Migration: 20260704115726_3d7c02e8-e63f-48eb-89df-7e23b51b53d7.sql <<<

REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_owner() FROM PUBLIC, anon, authenticated;


-- >>> Migration: 20260704115800_02a7b0f9-2c51-4fe5-9cff-a1f3c52ade98.sql <<<

CREATE POLICY "public read site-media" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-media');
CREATE POLICY "owner upload site-media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-media' AND public.is_owner());
CREATE POLICY "owner update site-media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-media' AND public.is_owner()) WITH CHECK (bucket_id = 'site-media' AND public.is_owner());
CREATE POLICY "owner delete site-media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-media' AND public.is_owner());


-- >>> Migration: 20260704115911_08fdc6cf-b94c-4546-808c-0abbc84fcb13.sql <<<

CREATE OR REPLACE FUNCTION public.bootstrap_first_owner()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'owner') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'owner');
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created_bootstrap ON auth.users;
CREATE TRIGGER on_auth_user_created_bootstrap
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.bootstrap_first_owner();

-- helper: is any owner registered? (used to disable signup UI after first owner)
CREATE OR REPLACE FUNCTION public.owner_exists()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE role = 'owner') $$;
GRANT EXECUTE ON FUNCTION public.owner_exists() TO anon, authenticated;


-- >>> Migration: 20260704115931_7522bb12-bbec-408c-8b06-e103425d1dbf.sql <<<

REVOKE EXECUTE ON FUNCTION public.bootstrap_first_owner() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.owner_exists() FROM PUBLIC;
-- keep for anon so the auth page can show a first-time-setup banner; the function only returns a boolean
GRANT EXECUTE ON FUNCTION public.owner_exists() TO anon, authenticated;


-- >>> Migration: 20260704115950_d1c4de6e-49e9-46a5-a257-937d50228480.sql <<<
DROP FUNCTION IF EXISTS public.owner_exists();

-- >>> Migration: 20260704121325_67e1eb9e-32cb-49b9-95b9-f98b03b8e56c.sql <<<
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS site_url TEXT,
  ADD COLUMN IF NOT EXISTS preview_url TEXT;

-- >>> Migration: 20260704122437_86836a26-836b-436c-b91b-d3c5df454dce.sql <<<
-- 1) media_assets: remove public read; keep owner-only read/write
DROP POLICY IF EXISTS "public read media" ON public.media_assets;
REVOKE SELECT ON public.media_assets FROM anon;

CREATE POLICY "owner read media"
  ON public.media_assets
  FOR SELECT
  TO authenticated
  USING (public.is_owner());

-- 2) site_settings: restrict anon column access so contact info is not exposed
REVOKE SELECT ON public.site_settings FROM anon;
GRANT SELECT
  (id, brand_name, tagline, logo_url, favicon_url, primary_color,
   site_url, socials, updated_at)
  ON public.site_settings TO anon;

-- 3) storage.objects for site-media: remove anon read
DROP POLICY IF EXISTS "public read site-media" ON storage.objects;

CREATE POLICY "owner read site-media"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'site-media' AND public.is_owner());

-- >>> Migration: 20260705080000_homepage_sections_seed.sql <<<
-- ============================================================
-- Seed all storefront home-page sections into page_sections
-- so the admin "Home page" editor can edit them.
-- Uses INSERT … ON CONFLICT DO NOTHING so re-running is safe.
-- ============================================================

INSERT INTO public.page_sections (page_key, section_key, title, sort_order, enabled, content)
VALUES

-- 1. Hero
('home', 'hero', 'Hero Section', 10, true, '{
  "headline": "Custom Diaries",
  "headline_line2": "Corporate Gifts.",
  "subheading": "Crafting premium customized diaries and corporate gifts with unmatched quality.",
  "cta_text": "Explore More",
  "cta_href": "/shop",
  "background_image_url": "/headerimage5.png"
}'::jsonb),

-- 2. About / GiftVibes About
('home', 'about', 'About GiftVibes', 20, true, '{
  "heading": "GiftVibes — 25 Years of Excellence",
  "body": "We are a leading manufacturer of premium customized diaries, corporate gifts, and promotional products. With over two decades of experience, we have served 10,000+ happy clients across India.",
  "stats": [
    { "number": "25+", "label": "Years of Excellence" },
    { "number": "10K+", "label": "Happy Clients" },
    { "number": "50K+", "label": "Products Delivered" },
    { "number": "100%", "label": "Quality Assured" }
  ]
}'::jsonb),

-- 3. Best Discounts Banner
('home', 'best_discounts', 'Best Discounts Banner', 30, true, '{
  "heading": "Best Discounts",
  "subheading": "Exclusive deals on bulk orders and corporate gifting packages.",
  "cta_text": "Shop Now",
  "cta_href": "/shop"
}'::jsonb),

-- 4. Categories  (leave content empty — categories are managed separately)
('home', 'categories', 'Product Categories', 40, true, '{
  "heading": "Our Products",
  "note": "Categories are managed from the storefront categories component."
}'::jsonb),

-- 5. Best Deals / Latest Diaries
('home', 'best_deals', 'Latest Diaries Section', 50, true, '{
  "heading": "Latest 2026 Diaries",
  "items": [
    {
      "name": "Management Premium PU Leather Diary 2026",
      "description": "Magnetic flap executive diary with soft-touch PU cover and premium natural shade paper.",
      "image_url": "https://drive.google.com/uc?id=11sbS-XW7D6BsdoMYkXkINTHFsxp2NVx-",
      "min_price": 240,
      "max_price": 300,
      "href": "/shop"
    },
    {
      "name": "DIRECTORS Premium Leather Diary 2026",
      "description": "Director edition PU leather diary with sponge padding and elegant magnetic flap finish.",
      "image_url": "https://drive.google.com/uc?id=1YqUkhJ9YX33wuuJcH_qGCaAsZ0GIDNNZ",
      "min_price": 172,
      "max_price": 195,
      "href": "/shop"
    },
    {
      "name": "Heritage Leather Executive Diary 2026",
      "description": "Heritage inspired PU leather diary with foam padding and one-date-per-page layout.",
      "image_url": "https://drive.google.com/uc?id=1ntl6n5DQpoF-FkfxYO1Rs49nJHl-NWsF",
      "min_price": 137,
      "max_price": 153,
      "href": "/shop"
    },
    {
      "name": "Paipin Brown Executive Leather Diary",
      "description": "Two-tone brown magnetic flap diary crafted in soft PU with premium writing paper.",
      "image_url": "https://drive.google.com/uc?id=1lfIN2mDTjNwAMYX1xbnPBkqkl95OTuzL",
      "min_price": 154,
      "max_price": 176,
      "href": "/shop"
    }
  ]
}'::jsonb),

-- 6. Brands Section
('home', 'brands', 'Brands / Partners', 60, true, '{
  "heading": "Trusted by Leading Brands",
  "logos": []
}'::jsonb),

-- 7. Trending Diary Giftsets (Weekly Popular)
('home', 'trending_giftsets', 'Trending Diary Giftsets', 70, true, '{
  "heading": "Trending Diary Giftsets",
  "items": [
    {
      "name": "Primo A5 Corporate Diary and Pen Set",
      "description": "Soft-touch PU diary with matching metal pen and premium planner pages in an elegant gift box.",
      "image_url": "https://drive.google.com/uc?id=1UcB8Gmh4knL15Su_DsD5D0WihKEFN6pH",
      "min_price": 225,
      "max_price": 255,
      "href": "/shop"
    },
    {
      "name": "Wooden A5 Corporate Diary and Pen Set",
      "description": "Wood grain inspired diary with smooth pen, monthly planner inserts and custom branding ready box.",
      "image_url": "https://drive.google.com/uc?id=1gfUUIhJoA_fhUtO5q8cosOqV9I8fGkVV",
      "min_price": 230,
      "max_price": 250,
      "href": "/shop"
    },
    {
      "name": "Polo A5 Corporate Diary and Pen Set",
      "description": "Premium PU diary combo with elastic closure, satin ribbon and logo-ready keepsake packaging.",
      "image_url": "https://drive.google.com/uc?id=11pKAL_jh7Af3IQxxa49_MIbMXOT0tx7e",
      "min_price": 220,
      "max_price": 245,
      "href": "/shop"
    },
    {
      "name": "50-50 B5 Diary Calendar with Pen Combo Set",
      "description": "Executive B5 diary with detachable desk calendar, heavyweight pen and luxe presentation box.",
      "image_url": "https://drive.google.com/uc?id=1ZHcdURpLfDV5ZQsoXlrRjttX_d5IT_86",
      "min_price": 315,
      "max_price": 332,
      "href": "/shop"
    },
    {
      "name": "Oval Leather B5 Diary with Pen Gift Set",
      "description": "Oval motif B5 diary in plush leatherette with premium metal pen and foil-ready gift box.",
      "image_url": "https://drive.google.com/uc?id=1jIxlNwdi-E1f_-LyXT5eoP7g_JECd3JM",
      "min_price": 300,
      "max_price": 310,
      "href": "/shop"
    }
  ]
}'::jsonb),

-- 8. Cash Back / Promo Banner
('home', 'cashback_banner', 'Cashback / Promo Banner', 80, true, '{
  "heading": "Get 10% Cashback",
  "subheading": "On your first bulk order above ₹50,000. Use code GVBULK10 at checkout.",
  "cta_text": "Claim Offer",
  "cta_href": "/shop",
  "background_color": "#124559"
}'::jsonb),

-- 9. Best Deals Tabbed (Todays Best Deals — pulls from DB products)
('home', 'best_deals_tabbed', 'Today''s Best Deals (Tabbed)', 90, true, '{
  "heading": "Todays Best Deals for you!",
  "note": "Products in this section are pulled live from the Products catalog based on their category field."
}'::jsonb),

-- 10. Why Choose Us
('home', 'why_choose_us', 'Why Choose Us', 100, true, '{
  "heading": "Why Choose GiftVibes?",
  "subheading": "Delivering excellence in every gift.",
  "features": [
    { "title": "Ethical Business Practices", "description": "Built on trust and transparency for lasting partnerships." },
    { "title": "On-Time Deliveries", "description": "Reliable shipping and delivery commitments you can count on." },
    { "title": "Reasonable Prices", "description": "Competitive pricing without compromising on quality." },
    { "title": "Custom Branding", "description": "Full customization — logos, colors, and personalization on every product." },
    { "title": "Quality Assured", "description": "Every product goes through strict quality checks before dispatch." },
    { "title": "Dedicated Support", "description": "A personal account manager for every corporate client." }
  ]
}'::jsonb),

-- 11. Customer Satisfaction
('home', 'customer_satisfaction', 'Customer Satisfaction', 110, true, '{
  "heading": "Customer Satisfaction",
  "subheading": "Trusted by thousands of businesses across India.",
  "rating": "4.9",
  "review_count": "2,400+",
  "testimonials": [
    {
      "name": "Rahul Sharma",
      "company": "Tech Corp India",
      "text": "Exceptional quality diaries with our branding. Delivered on time for our annual conference.",
      "rating": 5
    },
    {
      "name": "Priya Mehta",
      "company": "FMC Solutions",
      "text": "Best corporate gifting partner we have worked with. Premium products at great prices.",
      "rating": 5
    }
  ]
}'::jsonb),

-- 12. Cash Back Bottom Banner
('home', 'cashback_bottom', 'Bottom Promo Banner', 120, true, '{
  "heading": "Premium Corporate Gifting Made Easy",
  "subheading": "Contact us for custom quotes on bulk orders. Free samples available.",
  "cta_text": "Get a Quote",
  "cta_href": "/custom-design"
}'::jsonb),

-- 13. Services Section
('home', 'services', 'Our Services', 130, true, '{
  "heading": "Our Premium Services",
  "services": [
    {
      "title": "Custom Design Services",
      "subtitle": "Professional diary design and customization solutions",
      "image_url": "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e55b939fea169c0292_faq-min.png",
      "bg_color": "#124559"
    },
    {
      "title": "Bulk Order Solutions",
      "subtitle": "Special pricing and services for corporate orders and expertise in handling bulk orders",
      "image_url": "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e6707380718425e697_onlie%20payment-min.png",
      "bg_color": "#2c3e50"
    },
    {
      "title": "Fast Delivery",
      "subtitle": "Quick turnaround for all diary orders nationwide",
      "image_url": "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e544663ba3d0fd2bb8_home%20delivery-min.png",
      "bg_color": "#1a5d73"
    }
  ]
}'::jsonb),

-- 14. Corporate Showcase
('home', 'corporate_showcase', 'Corporate Showcase', 140, true, '{
  "heading": "Trusted by Top Corporations",
  "subheading": "Join 500+ companies who gift with GiftVibes every year.",
  "cta_text": "View Corporate Plans",
  "cta_href": "/custom-design",
  "logos": []
}'::jsonb)

ON CONFLICT (page_key, section_key) DO NOTHING;


-- >>> Migration: 20260705080100_create_site_media_bucket.sql <<<
-- Create the site-media storage bucket if it does not already exist.
-- This is idempotent: the DO block catches the duplicate name error.
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'site-media',
    'site-media',
    true,
    52428800,   -- 50 MB per file
    ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml','image/avif']
  )
  ON CONFLICT (id) DO NOTHING;
END $$;


-- >>> Migration: 20260809140000_categories_section_items.sql <<<
-- ============================================================
-- Add editable items array to the home > categories section
-- (the "Our Products" carousel on the storefront).
--
-- Each item has:
--   name        - category label (matches STOREFRONT_CATEGORIES on the admin)
--   subtitle    - meta text under the label
--   image_url   - cover photo (drives the MediaPicker in the admin editor)
--   bgColor     - fallback tile color while image loads
--   alt         - alt text
--   href        - optional CTA link; falls back to getCategoryHref(name)
--   sort_order  - display order; lower = first
--
-- Idempotent: only updates the row if items is not already present,
-- so re-running after the admin seeds its own list is a no-op.
-- ============================================================

UPDATE public.page_sections
SET content = content - 'note' || jsonb_build_object(
  'items',
  '[
    {"name": "CORPORATE GIFT SETS", "subtitle": "120+ Packages Available", "image_url": "/Giftvibes categories/CORPORATE GIFTSETS.png", "bgColor": "#124559", "alt": "Professional corporate gift sets and custom diaries", "href": "", "sort_order": 1},
    {"name": "NEW YEAR DIARY", "subtitle": "80+ Styles Available", "image_url": "/Giftvibes categories/NEW YEAR DIARY.png", "bgColor": "#1a5d73", "alt": "Premium New Year themed diaries and planners", "href": "", "sort_order": 2},
    {"name": "LEATHER GIFT ITEMS", "subtitle": "Premium Collection", "image_url": "/Giftvibes categories/LEATHER GIFT ITEMS.png", "bgColor": "#2c3e50", "alt": "High-quality leather gift items and accessories", "href": "", "sort_order": 3},
    {"name": "LEATHER BAGS", "subtitle": "Executive Collection", "image_url": "/Giftvibes categories/LEATHER BAGS.png", "bgColor": "#E8923C", "alt": "Premium leather bags and accessories", "href": "", "sort_order": 4},
    {"name": "JUTE BAGS", "subtitle": "Eco-Friendly Options", "image_url": "/Giftvibes categories/JUTE BAGS.png", "bgColor": "#28966E", "alt": "Sustainable jute bags for promotional use", "href": "", "sort_order": 5},
    {"name": "BOTTLES GIFT SET", "subtitle": "Premium Combos", "image_url": "/Giftvibes categories/BOTTLE GIFT SETS.png", "bgColor": "#124559", "alt": "Gift sets with premium bottles and accessories", "href": "", "sort_order": 6},
    {"name": "POWER BANK DIARIES", "subtitle": "Tech-Integrated", "image_url": "/Giftvibes categories/POWERBANK DIARIES.png", "bgColor": "#1a5d73", "alt": "Diaries with built-in power bank functionality", "href": "", "sort_order": 7},
    {"name": "PEN STANDS", "subtitle": "Desktop Essentials", "image_url": "/Giftvibes categories/PEN STANDS.png", "bgColor": "#2c3e50", "alt": "Elegant pen stands and desk accessories", "href": "", "sort_order": 8},
    {"name": "PROMOTIONAL UMBRELLAS", "subtitle": "Branded Solutions", "image_url": "/Giftvibes categories/PROMOTIONAL UMBRELLAS.jpg", "bgColor": "#8b4513", "alt": "Custom promotional umbrellas for marketing", "href": "", "sort_order": 9},
    {"name": "CUSTOMISED DIARY & NOTE BOOKS", "subtitle": "150+ Designs Available", "image_url": "/Giftvibes categories/PROMOTIONAL DIARIES AND NOTEBOOKS.jpg", "bgColor": "#E8923C", "alt": "Fully customized diaries and notebooks", "href": "", "sort_order": 10},
    {"name": "CALENDARS", "subtitle": "Desktop & Wall Options", "image_url": "/Giftvibes categories/CALENDARS.png", "bgColor": "#28966E", "alt": "Custom table and wall calendars", "href": "", "sort_order": 11},
    {"name": "EXHIBITION VISITOR''S GIFT IDEAS", "subtitle": "Trade Show Specials", "image_url": "/Giftvibes categories/EXHIBITION GIVEAWAY IDEAS.png", "bgColor": "#124559", "alt": "Special gift ideas for exhibition visitors", "href": "", "sort_order": 12}
  ]'::jsonb
)
WHERE page_key = 'home'
  AND section_key = 'categories'
  AND NOT (content ? 'items');


-- >>> Migration: 20260809150000_best_deals_section_picker.sql <<<
-- ============================================================
-- Convert home > best_deals section to productId-driven items.
-- The old content stored full product snapshots (name, image,
-- min_price, max_price, description). The new shape is a lean
-- [{ productId: "<uuid>" }, ...] list; the storefront looks each
-- one up in the products table.
--
-- Behavior: this migration only fires if the section's items
-- array is not already in the new shape. If items[0] has a
-- productId key, we leave it alone (idempotent). If items[0] is
-- the legacy object shape, we wipe items to [] so the admin's
-- picker takes over (the storefront falls back to the hardcoded
-- "Latest 2026 Diaries" set until the user picks).
--
-- Why wipe instead of auto-mapping: the legacy rows held Google
-- Drive URLs and ad-hoc fields that don't reliably match a row
-- in the products table. Silently mapping would risk duplicates
-- and wrong products. Cleaner to make the admin re-pick once.
-- ============================================================

UPDATE public.page_sections
SET content = content || jsonb_build_object('items', '[]'::jsonb)
WHERE page_key = 'home'
  AND section_key = 'best_deals'
  AND content ? 'items'
  AND jsonb_typeof(content->'items') = 'array'
  AND jsonb_array_length(content->'items') > 0
  AND NOT (
    (content->'items'->0) ? 'productId'
  );


-- >>> Migration: 20260809160000_remaining_editable_sections.sql <<<
-- ============================================================
-- Wipe legacy item shapes on the home sections that are now
-- productId-driven, and add an empty `tabs` array to the tabbed
-- section so the admin's TabManager has somewhere to write.
--
-- Idempotent: every block only runs when the legacy / missing
-- shape is detected.
-- ============================================================

-- 1) home > popular: legacy full product snapshots to []
UPDATE public.page_sections
SET content = content || jsonb_build_object('items', '[]'::jsonb)
WHERE page_key = 'home'
  AND section_key = 'popular'
  AND content ? 'items'
  AND jsonb_typeof(content->'items') = 'array'
  AND jsonb_array_length(content->'items') > 0
  AND NOT ((content->'items'->0) ? 'productId');

-- 2) home > best_deals_tabbed: drop the obsolete `note` and seed empty tabs.
UPDATE public.page_sections
SET content = (content - 'note') || jsonb_build_object('tabs', '[]'::jsonb)
WHERE page_key = 'home'
  AND section_key = 'best_deals_tabbed'
  AND NOT (content ? 'tabs');


-- >>> Migration: 20260809170000_product_form_enhancements.sql <<<
-- ============================================================
-- Product + diary form enhancements: SEO, secondary gallery, and
-- per-product feature flags.
--
-- Backwards compatible: every new column is nullable / has a
-- default, so existing rows keep working without code changes.
--
--   seo_title        text       nullable. Used by storefront generateMetadata.
--   seo_description  text       nullable.
--   features         jsonb      default '{}'. Per-feature { show, value }.
--                                Only enabled + non-empty values render
--                                on the product page (M8).
--
-- The `gallery` jsonb column already exists on both tables
-- (Prisma models it as @default("[]")). This migration doesn't
-- touch it; secondary images just store URL strings into it.
-- ============================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS seo_title       text,
  ADD COLUMN IF NOT EXISTS seo_description text;

-- features column was never migrated; add it now.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.diaries
  ADD COLUMN IF NOT EXISTS seo_title       text,
  ADD COLUMN IF NOT EXISTS seo_description text;

ALTER TABLE public.diaries
  ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '{}'::jsonb;


-- Update site_settings for Pyrite
INSERT INTO public.site_settings (id, brand_name, tagline, primary_color, whatsapp_number, phone, email, address)
VALUES (1, 'Pyrite', 'Custom Corporate Diaries & Luxury Gift Sets', '#0F172A', '+919899223130', '+919899223130', 'info@pyrite.in', 'Delhi, India')
ON CONFLICT (id) DO UPDATE SET
  brand_name = EXCLUDED.brand_name,
  tagline = EXCLUDED.tagline,
  primary_color = EXCLUDED.primary_color,
  whatsapp_number = EXCLUDED.whatsapp_number,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  address = EXCLUDED.address;

-- >>> Products Seed <<<
INSERT INTO public.products (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('primo-a5-corporate-diary-and-pen-set', 'Primo A5 Corporate Diary and Pen Set', '', NULL, NULL, 'Corporate Gift Sets', ARRAY['best corporate gift','best gifting ideas','customized diary with pen','diary and calendar gift set','diary and pen set','diary with pen'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.products (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('wooden-a5-corporate-diary-and-pen-set', 'Wooden A5 Corporate Diary and Pen Set', '', NULL, NULL, 'Corporate Gift Sets', ARRAY['best corporate gift','best gifting ideas','customized diary with pen','diary and calendar gift set','diary and pen set','diary with pen'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.products (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('polo-a5-corporate-diary-and-pen-set', 'Polo A5 Corporate Diary and Pen Set', '', NULL, NULL, 'Corporate Gift Sets', ARRAY['best corporate gift','best gifting ideas','customized diary with pen','diary and calendar gift set','diary and pen set','diary with pen'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.products (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('50-50-b5-diary-calendar-with-pen-combo-set', '50-50 B5 Diary Calendar with Pen Combo Set', '', NULL, NULL, 'Corporate Gift Sets', ARRAY['best corporate gift','best gifting ideas','customized diary with pen','diary and calendar gift set','diary and pen set','diary with pen'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.products (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('oval-leather-b5-diary-with-pen-gift-set', 'Oval Leather B5 Diary with Pen Gift Set', '', NULL, NULL, 'Corporate Gift Sets', ARRAY['best corporate gift','best gifting ideas','customized diary with pen','diary and calendar gift set','diary and pen set','diary with pen'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.products (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('ant-a5-corporate-diary-and-pen-gift-set', 'ANT A5 Corporate Diary And Pen Gift Set', '', NULL, NULL, 'Corporate Gift Sets', ARRAY['best corporate gift','best gifting ideas','customized diary with pen','diary and pen combo','diary and pen set','diary with pen'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;

-- >>> Diaries Seed <<<
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('com-economy-2-date-hb-diary', 'COM Economy 2 Date HB Diary', '', NULL, NULL, 'Premium Diary', ARRAY['com economy diary','diary','economy diary','hard bound diary','small size diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('com-economy-1-date-hard-bound-diary', 'COM Economy 1 Date Hard Bound diary', '', NULL, NULL, 'Premium Diary', ARRAY['diary','diary manufacturer','economical diary','economy diary','hard bound diary','small diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('executive-2-date-eco-hb-diary-2026', 'Executive 2 Date ECO HB Diary 2026', '', NULL, NULL, 'Premium Diary', ARRAY['diary 2026','economy diary','economy paper diary','executive economy diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('pp-corporate-executive-diary-2026', 'PP Corporate Executive Diary 2026', '', NULL, NULL, 'Premium Diary', ARRAY['best 2026 diary','diary manufacturer','hard bound diary','new year diaries','planner diary','premium diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('desginer-corporate-planner-diary-2026', 'Desginer Corporate Planner Diary 2026', '', NULL, NULL, 'Premium Diary', ARRAY['black corporte diary','black diary','corporate diary','diary for gifting','executive diary','hard cover diary','new year gift'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('go-green-executive-planner-diary-j', 'Go Green Executive Planner Diary J', '', NULL, NULL, 'Premium Diary', ARRAY['corporate diary','diary for gifting','executive diary','go green 2026 diary','go green diary','go green executive diary','go green hard bound diary','new year gift'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('clean-and-green-planner-diary-2026', 'Clean and Green Planner Diary 2026', '', NULL, NULL, 'Premium Diary', ARRAY['corporate diary','diary for gifting','executive diary','go green 2026 diary','go green diary','go green executive diary','go green hard bound diary','new year gift'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('go-green-executive-diary-2026-hb-r', 'Go Green Executive Diary 2026 HB R', '', NULL, NULL, 'Premium Diary', ARRAY['corporate diary','diary for gifting','executive diary','go green 2026 diary','go green diary','go green executive diary','go green hard bound diary','new year gift'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('motivation-theme-planner-hb-diary-2026', 'Motivation Theme Planner HB Diary 2026', '', NULL, NULL, 'Premium Diary', ARRAY['corporate diary','diary 2026','diary for gifting','executive diary','motivation diary','motivation theme diary','new year gift','planner diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('burma-shell-eco-diary-2-date-hb', 'Burma Shell Eco Diary 2 Date HB', '', NULL, NULL, 'Premium Diary', ARRAY['diary','economy diary','hard bound diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('engineer-s-planner-hb-diary-with-box', 'Engineer’s Planner HB Diary with Box', '', NULL, NULL, 'Premium Diary', ARRAY['engineering diary','engineering diary manufacturer','engineers diary','executive engineering diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('engineering-premium-diary-hard-bound-with-box', 'Engineering Premium Diary Hard Bound with Box', '', NULL, NULL, 'Premium Diary', ARRAY['engineering diary','engineering diary manufacturer','engineers diary','executive engineering diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('red-gold-border-corporate-planner-diary-2026', 'Red Gold Border Corporate Planner Diary 2026', '', NULL, NULL, 'Premium Diary', ARRAY['corporate diary','diary for gifting','executive diary','golden diary','hard cover diary','new year gift','premium diary','primium diary for gift'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('management-premium-pu-leather-diary', 'Management Premium PU Leather Diary', '', NULL, NULL, 'Premium Diary', ARRAY['best leather diary','brown diary','corporate diary','executive economy diary','leather diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('directors-premium-leather-diary-2026', 'DIRECTORS Premium Leather Diary 2026', '', NULL, NULL, 'Premium Diary', ARRAY['best leather diary','brown diary','corporate diary','executive economy diary','leather diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('heritage-leather-executive-diary-2026', 'Heritage Leather Executive Diary 2026', '', NULL, NULL, 'Premium Diary', ARRAY['best leather diary','brown diary','corporate diary','executive economy diary','leather diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('paipin-brown-executive-leather-diary', 'Paipin Brown Executive Leather Diary', '', NULL, NULL, 'Premium Diary', ARRAY['best leather diary','brown diary','corporate diary','executive economy diary','leather diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('canvas-button-magnetic-flap-leather-diary', 'Canvas Button Magnetic Flap Leather Diary', '', NULL, NULL, 'Premium Diary', ARRAY['best leather diary','brown diary','corporate diary','executive economy diary','leather diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('antique-cherry-leather-diary-with-flap', 'Antique Cherry Leather Diary with Flap', '', NULL, NULL, 'Premium Diary', ARRAY['best leather diary','brown diary','corporate diary','executive economy diary','leather diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('signature-64-executive-leather-diary-2026', 'Signature 64 Executive Leather Diary 2026', '', NULL, NULL, 'Premium Diary', ARRAY['best leather diary','brown diary','corporate diary','executive economy diary','leather diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('teera-flap-leather-diary-2026', 'Teera Flap Leather Diary 2026', '', NULL, NULL, 'Premium Diary', ARRAY['best leather diary','brown diary','corporate diary','executive economy diary','leather diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('50-50-soft-cream-leather-premium-2026-diary', '50-50 Soft Cream Leather Premium 2026 Diary', '', NULL, NULL, 'Premium Diary', ARRAY['best leather diary','brown diary','corporate diary','executive economy diary','leather diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('viva-sunday-full-page-leather-diary-2026', 'Viva Sunday Full Page Leather Diary 2026', '', NULL, NULL, 'Premium Diary', ARRAY['best leather diary','brown diary','corporate diary','executive economy diary','leather diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('border-brown-leather-premium-2026-diary', 'BORDER Brown Leather Premium 2026 Diary', '', NULL, NULL, 'Premium Diary', ARRAY['best leather diary','brown diary','corporate diary','executive economy diary','leather diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('grey-alder-textured-leather-diary-2026', 'Grey Alder Textured Leather Diary 2026', '', NULL, NULL, 'Premium Diary', ARRAY['best leather diary','brown diary','corporate diary','executive economy diary','leather diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('blue-ocean-leather-diary-with-magnet-flap', 'Blue Ocean Leather Diary with Magnet Flap', '', NULL, NULL, 'Premium Diary', ARRAY['best leather diary','brown diary','corporate diary','executive economy diary','leather diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('brown-premium-leather-diary-2026', 'Brown Premium Leather Diary 2026', '', NULL, NULL, 'Premium Diary', ARRAY['best leather diary','brown diary','corporate diary','executive economy diary','leather diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('curve-executive-leather-diary-2026', 'Curve Executive Leather Diary 2026', '', NULL, NULL, 'Premium Diary', ARRAY['best leather diary','brown diary','corporate diary','executive economy diary','leather diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('grateful-woody-pu-leather-diary-2026', 'Grateful Woody PU Leather Diary 2026', '', NULL, NULL, 'Premium Diary', ARRAY['best leather diary','brown diary','corporate diary','executive economy diary','leather diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('go-green-leather-diary-2026-with-planner', 'Go Green Leather Diary 2026 with Planner', '', NULL, NULL, 'Premium Diary', ARRAY['go green diary','go green leather diary','green diary','green leather diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('a5-wooden-gold-planner-diary-2026', 'A5 Wooden Gold Planner Diary 2026', '', NULL, NULL, 'Premium Diary', ARRAY['a5 diary','a5 planner diary','corporate diary','pure wood diary','wood cover dairy','wooden diary 2026'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('a5-mobile-pocket-grey-leather-diary-2026', 'A5 Mobile Pocket Grey Leather Diary 2026', '', NULL, NULL, 'Premium Diary', ARRAY['2026 a5 diary','a5 diary','a5 leather diary','a5 planner diary','best leather diary','corporate diary','mobile pocket diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('regular-leather-engineering-diary-2026', 'Regular Leather Engineering Diary 2026', '', NULL, NULL, 'Premium Diary', ARRAY['2026 engineering diary','engineering diary','engineers diary','leather engineering diary','pu leather engineering diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.diaries (slug, name, description, min_price, max_price, category, tags, image_url, gallery, featured, enabled)
VALUES ('premium-leather-engineering-diary-with-planner', 'Premium Leather Engineering Diary with Planner', '', NULL, NULL, 'Premium Diary', ARRAY['2027 engineering diary','engineering diary','engineers diary','leather engineering diary','pu leather engineering diary'], '', '[]'::jsonb, false, true)
ON CONFLICT (slug) DO NOTHING;
