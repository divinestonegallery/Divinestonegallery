CREATE TABLE `shipping_quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`cart_fingerprint` text NOT NULL,
	`destination_postal_code` text NOT NULL,
	`service_name` text NOT NULL,
	`chargeable_weight_grams` integer NOT NULL,
	`subtotal_paise` integer NOT NULL,
	`gst_paise` integer NOT NULL,
	`shipping_paise` integer NOT NULL,
	`total_paise` integer NOT NULL,
	`currency` text DEFAULT 'INR' NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "shipping_quotes_weight_positive" CHECK("shipping_quotes"."chargeable_weight_grams" > 0),
	CONSTRAINT "shipping_quotes_subtotal_nonnegative" CHECK("shipping_quotes"."subtotal_paise" >= 0),
	CONSTRAINT "shipping_quotes_gst_nonnegative" CHECK("shipping_quotes"."gst_paise" >= 0),
	CONSTRAINT "shipping_quotes_shipping_nonnegative" CHECK("shipping_quotes"."shipping_paise" >= 0),
	CONSTRAINT "shipping_quotes_total_nonnegative" CHECK("shipping_quotes"."total_paise" >= 0)
);
--> statement-breakpoint
CREATE INDEX `shipping_quotes_customer_idx` ON `shipping_quotes` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `shipping_quotes_expiry_idx` ON `shipping_quotes` (`status`,`expires_at`);--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_quote_id` text REFERENCES shipping_quotes(id);--> statement-breakpoint
ALTER TABLE `orders` ADD `idempotency_key` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `checkout_request_hash` text;--> statement-breakpoint
CREATE UNIQUE INDEX `orders_shipping_quote_unique` ON `orders` (`shipping_quote_id`) WHERE "orders"."shipping_quote_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX `orders_customer_idempotency_unique` ON `orders` (`user_id`,`idempotency_key`) WHERE "orders"."idempotency_key" is not null;