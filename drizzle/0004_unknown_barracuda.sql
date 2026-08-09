ALTER TABLE "media_assets" ADD COLUMN "caption" text;--> statement-breakpoint
ALTER TABLE "media_assets" ADD COLUMN "folder" text DEFAULT 'Gallery' NOT NULL;--> statement-breakpoint
ALTER TABLE "media_assets" ADD COLUMN "tags_json" text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "media_assets" ADD COLUMN "focal_point_x" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "media_assets" ADD COLUMN "focal_point_y" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_focal_x_valid" CHECK ("media_assets"."focal_point_x" >= 0 and "media_assets"."focal_point_x" <= 100);--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_focal_y_valid" CHECK ("media_assets"."focal_point_y" >= 0 and "media_assets"."focal_point_y" <= 100);