CREATE TABLE "site_pages" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"navigation_title" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"published_at" integer,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"page_id" text NOT NULL,
	"section_key" text NOT NULL,
	"block_type" text NOT NULL,
	"eyebrow" text,
	"heading" text,
	"body" text,
	"cta_label" text,
	"cta_href" text,
	"secondary_cta_label" text,
	"secondary_cta_href" text,
	"media_asset_id" text,
	"media_position" text DEFAULT 'right' NOT NULL,
	"content_json" text DEFAULT '[]' NOT NULL,
	"style_variant" text DEFAULT 'light' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	CONSTRAINT "site_sections_sort_nonnegative" CHECK ("site_sections"."sort_order" >= 0)
);
--> statement-breakpoint
ALTER TABLE "site_sections" ADD CONSTRAINT "site_sections_page_id_site_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."site_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_sections" ADD CONSTRAINT "site_sections_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "site_pages_slug_unique" ON "site_pages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "site_pages_status_idx" ON "site_pages" USING btree ("status","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "site_sections_page_key_unique" ON "site_sections" USING btree ("page_id","section_key");--> statement-breakpoint
CREATE INDEX "site_sections_page_order_idx" ON "site_sections" USING btree ("page_id","sort_order");
--> statement-breakpoint
INSERT INTO "site_pages" ("id", "slug", "title", "navigation_title", "status", "is_system", "seo_title", "seo_description", "published_at") VALUES
('page:home', 'home', 'Homepage', 'Home', 'published', true, 'Divine Stone Gallery | Hand-Carved Marble Moorties', 'Authentic hand-carved marble moorties by fourth-generation master moortikars from Alwar, Rajasthan.', extract(epoch from now())::integer),
('page:our-story', 'our-story', 'Our Story', 'Our Story', 'published', true, 'Our Story | Divine Stone Gallery', 'Four generations of marble sculpture tradition from Alwar, Rajasthan.', extract(epoch from now())::integer),
('page:artisans', 'artisans', 'Artisans', 'Artisans', 'published', true, 'Our Artisans | Divine Stone Gallery', 'Meet the master moortikars behind every Divine Stone Gallery creation.', extract(epoch from now())::integer),
('page:custom-murti', 'custom-murti', 'Custom Murti', 'Custom Murti', 'published', true, 'Custom Marble Murti Commission | Divine Stone Gallery', 'Commission a marble murti shaped around your deity, dimensions and vision.', extract(epoch from now())::integer)
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
INSERT INTO "site_sections" ("id", "page_id", "section_key", "block_type", "eyebrow", "heading", "body", "cta_label", "cta_href", "secondary_cta_label", "secondary_cta_href", "media_position", "content_json", "style_variant", "sort_order", "is_visible") VALUES
('section:home:hero', 'page:home', 'hero', 'hero', 'From Alwar, Rajasthan · Since 1960', 'Sacred forms, carved for generations.', 'Authentic hand-carved marble moorties shaped by fourth-generation master moortikars and guided by the principles of Shilp Shastra.', 'Explore moorties', '/shop', 'Commission a murti', '/custom-murti', 'right', '[]', 'warm', 0, true),
('section:home:devotion', 'page:home', 'shop-by-devotion', 'collection', 'Shop by devotion', 'Find the form that speaks to you.', 'Explore signature forms for home mandirs, temples, gifting and deeply personal commissions.', 'View all moorties', '/shop', null, null, 'right', '[]', 'light', 10, true),
('section:home:featured', 'page:home', 'featured-works', 'feature_grid', 'From our gallery', 'Featured works', 'A considered selection of hand-carved marble moorties from our gallery.', 'View the collection', '/shop', null, null, 'right', '[]', 'light', 20, true),
('section:home:commission', 'page:home', 'custom-commission', 'image_text', 'Created only for you', 'A sacred commission, shaped around your vision.', 'From a home mandir idol to a large temple installation, our family works with you on scale, expression, posture, marble and ornamentation.', 'Begin a consultation', '/custom-murti', null, null, 'left', '[]', 'dark', 30, true),
('section:home:process', 'page:home', 'commission-journey', 'feature_grid', 'The commission journey', 'Clear, personal and considered.', 'One gallery advisor stays with you from the first conversation to final delivery.', null, null, null, null, 'right', '[{"title":"Share your vision","body":"Tell us the deity, dimensions, marble, posture and setting."},{"title":"Approve the design","body":"Refine proportions, ornamentation and finish before carving."},{"title":"Follow the creation","body":"Receive progress milestones through carving, painting and delivery."}]', 'light', 40, true),
('section:home:legacy', 'page:home', 'family-legacy', 'callout', 'Four generations', 'A family language of faith, patience and precision.', 'Every work carries forward the sculpture legacy established in 1960.', 'Read our story', '/our-story', null, null, 'background', '[]', 'warm', 50, true)
ON CONFLICT ("page_id", "section_key") DO NOTHING;
