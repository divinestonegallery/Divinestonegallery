PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_product_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`sku` text NOT NULL,
	`name` text NOT NULL,
	`material` text DEFAULT 'Marble' NOT NULL,
	`finish` text,
	`height_mm` integer NOT NULL,
	`width_mm` integer,
	`depth_mm` integer,
	`weight_grams` integer,
	`price_paise` integer,
	`gst_rate_bps` integer,
	`inventory_kind` text DEFAULT 'repeatable' NOT NULL,
	`stock_quantity` integer DEFAULT 0 NOT NULL,
	`cod_eligible` integer DEFAULT true NOT NULL,
	`shipping_class` text DEFAULT 'marble_sculpture' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "product_variants_height_positive" CHECK("height_mm" > 0),
	CONSTRAINT "product_variants_weight_positive" CHECK("weight_grams" is null or "weight_grams" > 0),
	CONSTRAINT "product_variants_stock_nonnegative" CHECK("stock_quantity" >= 0),
	CONSTRAINT "product_variants_price_nonnegative" CHECK("price_paise" is null or "price_paise" >= 0),
	CONSTRAINT "product_variants_gst_rate_valid" CHECK("gst_rate_bps" is null or ("gst_rate_bps" >= 0 and "gst_rate_bps" <= 10000))
);
--> statement-breakpoint
INSERT INTO `__new_product_variants`("id", "product_id", "sku", "name", "material", "finish", "height_mm", "width_mm", "depth_mm", "weight_grams", "price_paise", "gst_rate_bps", "inventory_kind", "stock_quantity", "cod_eligible", "shipping_class", "is_active", "created_at", "updated_at") SELECT "id", "product_id", "sku", "name", "material", "finish", "height_mm", "width_mm", "depth_mm", "weight_grams", "price_paise", "gst_rate_bps", "inventory_kind", "stock_quantity", "cod_eligible", "shipping_class", "is_active", "created_at", "updated_at" FROM `product_variants`;--> statement-breakpoint
DROP TABLE `product_variants`;--> statement-breakpoint
ALTER TABLE `__new_product_variants` RENAME TO `product_variants`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `product_variants_sku_unique` ON `product_variants` (`sku`);--> statement-breakpoint
CREATE INDEX `product_variants_product_idx` ON `product_variants` (`product_id`,`is_active`);--> statement-breakpoint
ALTER TABLE `media_assets` ADD `public_path` text;
