ALTER TABLE `shipping_quotes` ADD `provider` text NOT NULL;--> statement-breakpoint
ALTER TABLE `shipping_quotes` ADD `provider_service_code` text NOT NULL;--> statement-breakpoint
ALTER TABLE `shipping_quotes` ADD `payment_method` text NOT NULL;--> statement-breakpoint
ALTER TABLE `shipping_quotes` ADD `origin_postal_code` text NOT NULL;--> statement-breakpoint
ALTER TABLE `shipping_quotes` ADD `estimated_delivery_days` integer;--> statement-breakpoint
ALTER TABLE `shipping_quotes` ADD `packages_json` text NOT NULL;--> statement-breakpoint
ALTER TABLE `shipping_quotes` ADD `rate_snapshot_json` text NOT NULL;