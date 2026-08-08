CREATE TABLE `addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`label` text DEFAULT 'Home' NOT NULL,
	`recipient_name` text NOT NULL,
	`phone_e164` text NOT NULL,
	`line_1` text NOT NULL,
	`line_2` text,
	`landmark` text,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`postal_code` text NOT NULL,
	`country_code` text DEFAULT 'IN' NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `addresses_user_idx` ON `addresses` (`user_id`);--> statement-breakpoint
CREATE INDEX `addresses_postal_code_idx` ON `addresses` (`postal_code`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_user_id` text,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`changes_json` text,
	`request_id` text,
	`ip_hash` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `audit_logs_entity_idx` ON `audit_logs` (`entity_type`,`entity_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `audit_logs_actor_idx` ON `audit_logs` (`actor_user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `auth_identities` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`provider_subject` text NOT NULL,
	`last_authenticated_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_identity_provider_subject_unique` ON `auth_identities` (`provider`,`provider_subject`);--> statement-breakpoint
CREATE INDEX `auth_identities_user_idx` ON `auth_identities` (`user_id`);--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` text PRIMARY KEY NOT NULL,
	`cart_id` text NOT NULL,
	`product_id` text NOT NULL,
	`variant_id` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`intent` text DEFAULT 'purchase' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "cart_items_quantity_positive" CHECK("cart_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cart_items_variant_intent_unique` ON `cart_items` (`cart_id`,`variant_id`,`intent`);--> statement-breakpoint
CREATE INDEX `cart_items_cart_idx` ON `cart_items` (`cart_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `carts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `carts_user_status_idx` ON `carts` (`user_id`,`status`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `commission_media` (
	`commission_id` text NOT NULL,
	`media_asset_id` text NOT NULL,
	`source` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`commission_id`, `media_asset_id`),
	FOREIGN KEY (`commission_id`) REFERENCES `custom_commissions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_asset_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `commission_milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`commission_id` text NOT NULL,
	`sequence` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`customer_note` text,
	`staff_note` text,
	`submitted_at` integer,
	`approved_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`commission_id`) REFERENCES `custom_commissions`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "commission_milestones_sequence_positive" CHECK("commission_milestones"."sequence" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `commission_milestone_sequence_unique` ON `commission_milestones` (`commission_id`,`sequence`);--> statement-breakpoint
CREATE INDEX `commission_milestones_status_idx` ON `commission_milestones` (`commission_id`,`status`);--> statement-breakpoint
CREATE TABLE `custom_commissions` (
	`id` text PRIMARY KEY NOT NULL,
	`commission_number` text NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`deity_or_subject` text NOT NULL,
	`requirements` text NOT NULL,
	`preferred_material` text DEFAULT 'Marble' NOT NULL,
	`target_height_mm` integer,
	`target_width_mm` integer,
	`target_depth_mm` integer,
	`destination_postal_code` text NOT NULL,
	`status` text DEFAULT 'submitted' NOT NULL,
	`quoted_price_paise` integer,
	`gst_paise` integer,
	`shipping_paise` integer,
	`advance_amount_paise` integer,
	`balance_amount_paise` integer,
	`assigned_staff_user_id` text,
	`expected_completion_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`assigned_staff_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `custom_commissions_number_unique` ON `custom_commissions` (`commission_number`);--> statement-breakpoint
CREATE INDEX `custom_commissions_customer_idx` ON `custom_commissions` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `custom_commissions_staff_queue_idx` ON `custom_commissions` (`status`,`updated_at`);--> statement-breakpoint
CREATE TABLE `deities` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `deities_slug_unique` ON `deities` (`slug`);--> statement-breakpoint
CREATE TABLE `inventory_reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`variant_id` text NOT NULL,
	`user_id` text NOT NULL,
	`order_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inventory_unique_variant_active` ON `inventory_reservations` (`variant_id`) WHERE "inventory_reservations"."status" = 'active';--> statement-breakpoint
CREATE INDEX `inventory_reservations_expiry_idx` ON `inventory_reservations` (`status`,`expires_at`);--> statement-breakpoint
CREATE INDEX `inventory_reservations_user_idx` ON `inventory_reservations` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`uploaded_by_user_id` text,
	`r2_key` text NOT NULL,
	`original_filename` text NOT NULL,
	`content_type` text NOT NULL,
	`byte_size` integer NOT NULL,
	`width_px` integer,
	`height_px` integer,
	`kind` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`checksum_sha256` text,
	`alt_text` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "media_assets_size_nonnegative" CHECK("media_assets"."byte_size" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_assets_r2_key_unique` ON `media_assets` (`r2_key`);--> statement-breakpoint
CREATE INDEX `media_assets_uploader_idx` ON `media_assets` (`uploaded_by_user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `milestone_media` (
	`milestone_id` text NOT NULL,
	`media_asset_id` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`milestone_id`, `media_asset_id`),
	FOREIGN KEY (`milestone_id`) REFERENCES `commission_milestones`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_asset_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `milestone_media_display_idx` ON `milestone_media` (`milestone_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`order_id` text,
	`commission_id` text,
	`channel` text NOT NULL,
	`template_key` text NOT NULL,
	`recipient` text NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`provider` text,
	`provider_message_id` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`scheduled_at` integer DEFAULT (unixepoch()) NOT NULL,
	`sent_at` integer,
	`delivered_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`commission_id`) REFERENCES `custom_commissions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_delivery_queue_idx` ON `notifications` (`status`,`scheduled_at`);--> statement-breakpoint
CREATE INDEX `notifications_order_idx` ON `notifications` (`order_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `notifications_commission_idx` ON `notifications` (`commission_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text,
	`variant_id` text,
	`item_name` text NOT NULL,
	`variant_name` text NOT NULL,
	`sku` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price_paise` integer NOT NULL,
	`gst_rate_bps` integer DEFAULT 0 NOT NULL,
	`gst_paise` integer DEFAULT 0 NOT NULL,
	`line_total_paise` integer NOT NULL,
	`product_snapshot_json` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "order_items_quantity_positive" CHECK("order_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE INDEX `order_items_order_idx` ON `order_items` (`order_id`);--> statement-breakpoint
CREATE INDEX `order_items_variant_idx` ON `order_items` (`variant_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`user_id` text NOT NULL,
	`quote_id` text,
	`status` text DEFAULT 'placed' NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`payment_method` text NOT NULL,
	`cod_approval_status` text DEFAULT 'not_required' NOT NULL,
	`phone_verified_at` integer,
	`shipping_address_json` text NOT NULL,
	`billing_address_json` text NOT NULL,
	`subtotal_paise` integer NOT NULL,
	`gst_paise` integer DEFAULT 0 NOT NULL,
	`shipping_paise` integer DEFAULT 0 NOT NULL,
	`discount_paise` integer DEFAULT 0 NOT NULL,
	`total_paise` integer NOT NULL,
	`currency` text DEFAULT 'INR' NOT NULL,
	`customer_note` text,
	`placed_at` integer DEFAULT (unixepoch()) NOT NULL,
	`cancelled_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "orders_subtotal_nonnegative" CHECK("orders"."subtotal_paise" >= 0),
	CONSTRAINT "orders_total_nonnegative" CHECK("orders"."total_paise" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_quote_unique` ON `orders` (`quote_id`) WHERE "orders"."quote_id" is not null;--> statement-breakpoint
CREATE INDEX `orders_customer_idx` ON `orders` (`user_id`,`placed_at`);--> statement-breakpoint
CREATE INDEX `orders_staff_queue_idx` ON `orders` (`status`,`placed_at`);--> statement-breakpoint
CREATE INDEX `orders_cod_queue_idx` ON `orders` (`cod_approval_status`,`placed_at`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text,
	`commission_id` text,
	`provider` text NOT NULL,
	`provider_payment_id` text,
	`method` text NOT NULL,
	`status` text DEFAULT 'created' NOT NULL,
	`amount_paise` integer NOT NULL,
	`currency` text DEFAULT 'INR' NOT NULL,
	`bank_reference` text,
	`evidence_media_asset_id` text,
	`failure_code` text,
	`failure_message` text,
	`paid_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`commission_id`) REFERENCES `custom_commissions`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`evidence_media_asset_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "payments_amount_positive" CHECK("payments"."amount_paise" > 0),
	CONSTRAINT "payments_single_owner" CHECK(("payments"."order_id" is not null and "payments"."commission_id" is null) or ("payments"."order_id" is null and "payments"."commission_id" is not null))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_provider_id_unique` ON `payments` (`provider`,`provider_payment_id`) WHERE "payments"."provider_payment_id" is not null;--> statement-breakpoint
CREATE INDEX `payments_order_idx` ON `payments` (`order_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `payments_commission_idx` ON `payments` (`commission_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `product_media` (
	`product_id` text NOT NULL,
	`media_asset_id` text NOT NULL,
	`variant_id` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_primary` integer DEFAULT false NOT NULL,
	PRIMARY KEY(`product_id`, `media_asset_id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_asset_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_media_display_idx` ON `product_media` (`product_id`,`sort_order`);--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`sku` text NOT NULL,
	`name` text NOT NULL,
	`material` text DEFAULT 'Marble' NOT NULL,
	`finish` text,
	`height_mm` integer NOT NULL,
	`width_mm` integer,
	`depth_mm` integer,
	`weight_grams` integer NOT NULL,
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
	CONSTRAINT "product_variants_height_positive" CHECK("product_variants"."height_mm" > 0),
	CONSTRAINT "product_variants_weight_positive" CHECK("product_variants"."weight_grams" > 0),
	CONSTRAINT "product_variants_stock_nonnegative" CHECK("product_variants"."stock_quantity" >= 0),
	CONSTRAINT "product_variants_price_nonnegative" CHECK("product_variants"."price_paise" is null or "product_variants"."price_paise" >= 0),
	CONSTRAINT "product_variants_gst_rate_valid" CHECK("product_variants"."gst_rate_bps" is null or ("product_variants"."gst_rate_bps" >= 0 and "product_variants"."gst_rate_bps" <= 10000))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_variants_sku_unique` ON `product_variants` (`sku`);--> statement-breakpoint
CREATE INDEX `product_variants_product_idx` ON `product_variants` (`product_id`,`is_active`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`short_description` text,
	`description` text DEFAULT '' NOT NULL,
	`category_id` text,
	`deity_id` text,
	`product_type` text DEFAULT 'ready_made' NOT NULL,
	`sales_mode` text DEFAULT 'both' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`published_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`deity_id`) REFERENCES `deities`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `products_browse_idx` ON `products` (`status`,`category_id`,`deity_id`);--> statement-breakpoint
CREATE INDEX `products_featured_idx` ON `products` (`status`,`is_featured`);--> statement-breakpoint
CREATE TABLE `quote_items` (
	`id` text PRIMARY KEY NOT NULL,
	`quote_id` text NOT NULL,
	`product_id` text,
	`variant_id` text,
	`item_name` text NOT NULL,
	`sku` text,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price_paise` integer,
	`gst_rate_bps` integer,
	`line_total_paise` integer,
	FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "quote_items_quantity_positive" CHECK("quote_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE INDEX `quote_items_quote_idx` ON `quote_items` (`quote_id`);--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`quote_number` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`customer_note` text,
	`staff_note` text,
	`subtotal_paise` integer,
	`gst_paise` integer,
	`shipping_paise` integer,
	`total_paise` integer,
	`currency` text DEFAULT 'INR' NOT NULL,
	`expires_at` integer,
	`sent_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quotes_number_unique` ON `quotes` (`quote_number`);--> statement-breakpoint
CREATE INDEX `quotes_user_created_idx` ON `quotes` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `quotes_staff_queue_idx` ON `quotes` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `return_cases` (
	`id` text PRIMARY KEY NOT NULL,
	`return_number` text NOT NULL,
	`order_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`reason` text NOT NULL,
	`customer_note` text,
	`staff_decision_note` text,
	`decided_by_user_id` text,
	`decided_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`decided_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `return_cases_number_unique` ON `return_cases` (`return_number`);--> statement-breakpoint
CREATE INDEX `return_cases_customer_idx` ON `return_cases` (`user_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `return_cases_staff_queue_idx` ON `return_cases` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `return_items` (
	`return_case_id` text NOT NULL,
	`order_item_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`condition_note` text,
	PRIMARY KEY(`return_case_id`, `order_item_id`),
	FOREIGN KEY (`return_case_id`) REFERENCES `return_cases`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "return_items_quantity_positive" CHECK("return_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`product_id` text NOT NULL,
	`order_item_id` text NOT NULL,
	`rating` integer NOT NULL,
	`title` text,
	`body` text NOT NULL,
	`moderation_status` text DEFAULT 'pending' NOT NULL,
	`moderated_by_user_id` text,
	`moderated_at` integer,
	`published_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`moderated_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "reviews_rating_valid" CHECK("reviews"."rating" between 1 and 5)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reviews_order_item_unique` ON `reviews` (`order_item_id`);--> statement-breakpoint
CREATE INDEX `reviews_product_public_idx` ON `reviews` (`product_id`,`moderation_status`);--> statement-breakpoint
CREATE INDEX `reviews_moderation_queue_idx` ON `reviews` (`moderation_status`,`created_at`);--> statement-breakpoint
CREATE TABLE `shipments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`provider` text,
	`provider_shipment_id` text,
	`tracking_number` text,
	`status` text DEFAULT 'rate_selected' NOT NULL,
	`service_name` text,
	`shipping_paise` integer NOT NULL,
	`chargeable_weight_grams` integer NOT NULL,
	`origin_postal_code` text NOT NULL,
	`destination_postal_code` text NOT NULL,
	`estimated_delivery_at` integer,
	`shipped_at` integer,
	`delivered_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shipments_provider_id_unique` ON `shipments` (`provider`,`provider_shipment_id`) WHERE "shipments"."provider_shipment_id" is not null;--> statement-breakpoint
CREATE INDEX `shipments_order_idx` ON `shipments` (`order_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `shipments_tracking_idx` ON `shipments` (`tracking_number`);--> statement-breakpoint
CREATE TABLE `staff_members` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`access_level` text DEFAULT 'full_access' NOT NULL,
	`status` text DEFAULT 'invited' NOT NULL,
	`invited_by_user_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`invited_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_members_user_unique` ON `staff_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `staff_members_status_idx` ON `staff_members` (`status`);--> statement-breakpoint
CREATE TABLE `tax_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`document_number` text NOT NULL,
	`order_id` text NOT NULL,
	`document_type` text DEFAULT 'tax_invoice' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`seller_gstin` text,
	`place_of_supply_state_code` text NOT NULL,
	`billing_address_json` text NOT NULL,
	`subtotal_paise` integer NOT NULL,
	`cgst_paise` integer DEFAULT 0 NOT NULL,
	`sgst_paise` integer DEFAULT 0 NOT NULL,
	`igst_paise` integer DEFAULT 0 NOT NULL,
	`shipping_paise` integer DEFAULT 0 NOT NULL,
	`total_paise` integer NOT NULL,
	`currency` text DEFAULT 'INR' NOT NULL,
	`pdf_media_asset_id` text,
	`issued_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`pdf_media_asset_id`) REFERENCES `media_assets`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "tax_documents_total_nonnegative" CHECK("tax_documents"."total_paise" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tax_documents_number_unique` ON `tax_documents` (`document_number`);--> statement-breakpoint
CREATE INDEX `tax_documents_order_idx` ON `tax_documents` (`order_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`phone_e164` text,
	`display_name` text NOT NULL,
	`email_verified_at` integer,
	`phone_verified_at` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`preferred_locale` text DEFAULT 'en-IN' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	CONSTRAINT "users_contact_required" CHECK("users"."email" is not null or "users"."phone_e164" is not null)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`) WHERE "users"."email" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone_e164`) WHERE "users"."phone_e164" is not null;--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`provider_event_id` text NOT NULL,
	`event_type` text NOT NULL,
	`payload_sha256` text NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`processed_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `webhook_events_provider_event_unique` ON `webhook_events` (`provider`,`provider_event_id`);--> statement-breakpoint
CREATE INDEX `webhook_events_processing_idx` ON `webhook_events` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `wishlist_items` (
	`wishlist_id` text NOT NULL,
	`product_id` text NOT NULL,
	`variant_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`wishlist_id`, `product_id`),
	FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `wishlist_items_created_idx` ON `wishlist_items` (`wishlist_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wishlists_user_unique` ON `wishlists` (`user_id`);