CREATE TABLE "business_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"group_name" text DEFAULT 'general' NOT NULL,
	"is_secret" boolean DEFAULT false NOT NULL,
	"updated_by_user_id" text,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_page_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"page_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"label" text NOT NULL,
	"snapshot_json" text NOT NULL,
	"created_by_user_id" text,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_page_versions" ADD CONSTRAINT "site_page_versions_page_id_site_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."site_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_page_versions" ADD CONSTRAINT "site_page_versions_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "business_settings_group_idx" ON "business_settings" USING btree ("group_name");--> statement-breakpoint
CREATE UNIQUE INDEX "site_page_versions_number_unique" ON "site_page_versions" USING btree ("page_id","version_number");--> statement-breakpoint
CREATE INDEX "site_page_versions_timeline_idx" ON "site_page_versions" USING btree ("page_id","created_at");