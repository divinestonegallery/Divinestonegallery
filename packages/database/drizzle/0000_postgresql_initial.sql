CREATE TABLE "addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"label" text DEFAULT 'Home' NOT NULL,
	"recipient_name" text NOT NULL,
	"phone_e164" text NOT NULL,
	"line_1" text NOT NULL,
	"line_2" text,
	"landmark" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"postal_code" text NOT NULL,
	"country_code" text DEFAULT 'IN' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_user_id" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"changes_json" text,
	"request_id" text,
	"ip_hash" text,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_identities" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"provider_subject" text NOT NULL,
	"last_authenticated_at" integer,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" text PRIMARY KEY NOT NULL,
	"cart_id" text NOT NULL,
	"product_id" text NOT NULL,
	"variant_id" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"intent" text DEFAULT 'purchase' NOT NULL,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	CONSTRAINT "cart_items_quantity_positive" CHECK ("cart_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commission_media" (
	"commission_id" text NOT NULL,
	"media_asset_id" text NOT NULL,
	"source" text NOT NULL,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	CONSTRAINT "commission_media_commission_id_media_asset_id_pk" PRIMARY KEY("commission_id","media_asset_id")
);
--> statement-breakpoint
CREATE TABLE "commission_milestones" (
	"id" text PRIMARY KEY NOT NULL,
	"commission_id" text NOT NULL,
	"sequence" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"customer_note" text,
	"staff_note" text,
	"submitted_at" integer,
	"approved_at" integer,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	CONSTRAINT "commission_milestones_sequence_positive" CHECK ("commission_milestones"."sequence" > 0)
);
--> statement-breakpoint
CREATE TABLE "communication_consent_events" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"channel" text NOT NULL,
	"purpose" text NOT NULL,
	"action" text NOT NULL,
	"policy_version" text NOT NULL,
	"source" text NOT NULL,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "custom_commissions" (
	"id" text PRIMARY KEY NOT NULL,
	"commission_number" text NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"deity_or_subject" text NOT NULL,
	"requirements" text NOT NULL,
	"preferred_material" text DEFAULT 'Marble' NOT NULL,
	"target_height_mm" integer,
	"target_width_mm" integer,
	"target_depth_mm" integer,
	"destination_postal_code" text NOT NULL,
	"status" text DEFAULT 'submitted' NOT NULL,
	"quoted_price_paise" integer,
	"gst_paise" integer,
	"shipping_paise" integer,
	"advance_amount_paise" integer,
	"balance_amount_paise" integer,
	"assigned_staff_user_id" text,
	"expected_completion_at" integer,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deities" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_reservations" (
	"id" text PRIMARY KEY NOT NULL,
	"variant_id" text NOT NULL,
	"user_id" text NOT NULL,
	"order_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"expires_at" integer NOT NULL,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"uploaded_by_user_id" text,
	"storage_key" text NOT NULL,
	"public_path" text,
	"original_filename" text NOT NULL,
	"content_type" text NOT NULL,
	"byte_size" integer NOT NULL,
	"width_px" integer,
	"height_px" integer,
	"kind" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"checksum_sha256" text,
	"alt_text" text,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	CONSTRAINT "media_assets_size_nonnegative" CHECK ("media_assets"."byte_size" >= 0)
);
--> statement-breakpoint
CREATE TABLE "milestone_media" (
	"milestone_id" text NOT NULL,
	"media_asset_id" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "milestone_media_milestone_id_media_asset_id_pk" PRIMARY KEY("milestone_id","media_asset_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"order_id" text,
	"commission_id" text,
	"channel" text NOT NULL,
	"template_key" text NOT NULL,
	"recipient" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"provider" text,
	"provider_message_id" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"scheduled_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"sent_at" integer,
	"delivered_at" integer,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text,
	"variant_id" text,
	"item_name" text NOT NULL,
	"variant_name" text NOT NULL,
	"sku" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_paise" integer NOT NULL,
	"gst_rate_bps" integer DEFAULT 0 NOT NULL,
	"gst_paise" integer DEFAULT 0 NOT NULL,
	"line_total_paise" integer NOT NULL,
	"product_snapshot_json" text NOT NULL,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	CONSTRAINT "order_items_quantity_positive" CHECK ("order_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"order_number" text NOT NULL,
	"user_id" text NOT NULL,
	"quote_id" text,
	"shipping_quote_id" text,
	"idempotency_key" text,
	"checkout_request_hash" text,
	"status" text DEFAULT 'placed' NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"payment_method" text NOT NULL,
	"cod_approval_status" text DEFAULT 'not_required' NOT NULL,
	"phone_verified_at" integer,
	"shipping_address_json" text NOT NULL,
	"billing_address_json" text NOT NULL,
	"subtotal_paise" integer NOT NULL,
	"gst_paise" integer DEFAULT 0 NOT NULL,
	"shipping_paise" integer DEFAULT 0 NOT NULL,
	"discount_paise" integer DEFAULT 0 NOT NULL,
	"total_paise" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"customer_note" text,
	"placed_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"cancelled_at" integer,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	CONSTRAINT "orders_subtotal_nonnegative" CHECK ("orders"."subtotal_paise" >= 0),
	CONSTRAINT "orders_total_nonnegative" CHECK ("orders"."total_paise" >= 0)
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text,
	"commission_id" text,
	"provider" text NOT NULL,
	"provider_order_id" text,
	"provider_payment_id" text,
	"method" text NOT NULL,
	"status" text DEFAULT 'created' NOT NULL,
	"amount_paise" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"bank_reference" text,
	"evidence_media_asset_id" text,
	"failure_code" text,
	"failure_message" text,
	"paid_at" integer,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	CONSTRAINT "payments_amount_positive" CHECK ("payments"."amount_paise" > 0),
	CONSTRAINT "payments_single_owner" CHECK (("payments"."order_id" is not null and "payments"."commission_id" is null) or ("payments"."order_id" is null and "payments"."commission_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"product_id" text NOT NULL,
	"media_asset_id" text NOT NULL,
	"variant_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "product_media_product_id_media_asset_id_pk" PRIMARY KEY("product_id","media_asset_id")
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"material" text DEFAULT 'Marble' NOT NULL,
	"finish" text,
	"height_mm" integer NOT NULL,
	"width_mm" integer,
	"depth_mm" integer,
	"weight_grams" integer,
	"package_length_mm" integer,
	"package_width_mm" integer,
	"package_height_mm" integer,
	"price_paise" integer,
	"gst_rate_bps" integer,
	"inventory_kind" text DEFAULT 'repeatable' NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"cod_eligible" boolean DEFAULT true NOT NULL,
	"shipping_class" text DEFAULT 'marble_sculpture' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	CONSTRAINT "product_variants_height_positive" CHECK ("product_variants"."height_mm" > 0),
	CONSTRAINT "product_variants_weight_positive" CHECK ("product_variants"."weight_grams" is null or "product_variants"."weight_grams" > 0),
	CONSTRAINT "product_variants_package_dimensions_positive" CHECK (("product_variants"."package_length_mm" is null or "product_variants"."package_length_mm" > 0) and ("product_variants"."package_width_mm" is null or "product_variants"."package_width_mm" > 0) and ("product_variants"."package_height_mm" is null or "product_variants"."package_height_mm" > 0)),
	CONSTRAINT "product_variants_stock_nonnegative" CHECK ("product_variants"."stock_quantity" >= 0),
	CONSTRAINT "product_variants_price_nonnegative" CHECK ("product_variants"."price_paise" is null or "product_variants"."price_paise" >= 0),
	CONSTRAINT "product_variants_gst_rate_valid" CHECK ("product_variants"."gst_rate_bps" is null or ("product_variants"."gst_rate_bps" >= 0 and "product_variants"."gst_rate_bps" <= 10000))
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"short_description" text,
	"description" text DEFAULT '' NOT NULL,
	"category_id" text,
	"deity_id" text,
	"product_type" text DEFAULT 'ready_made' NOT NULL,
	"sales_mode" text DEFAULT 'both' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"published_at" integer,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_items" (
	"id" text PRIMARY KEY NOT NULL,
	"quote_id" text NOT NULL,
	"product_id" text,
	"variant_id" text,
	"item_name" text NOT NULL,
	"sku" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price_paise" integer,
	"gst_rate_bps" integer,
	"line_total_paise" integer,
	CONSTRAINT "quote_items_quantity_positive" CHECK ("quote_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" text PRIMARY KEY NOT NULL,
	"quote_number" text NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'requested' NOT NULL,
	"customer_note" text,
	"staff_note" text,
	"subtotal_paise" integer,
	"gst_paise" integer,
	"shipping_paise" integer,
	"total_paise" integer,
	"currency" text DEFAULT 'INR' NOT NULL,
	"expires_at" integer,
	"sent_at" integer,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "return_cases" (
	"id" text PRIMARY KEY NOT NULL,
	"return_number" text NOT NULL,
	"order_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'requested' NOT NULL,
	"reason" text NOT NULL,
	"customer_note" text,
	"staff_decision_note" text,
	"decided_by_user_id" text,
	"decided_at" integer,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "return_items" (
	"return_case_id" text NOT NULL,
	"order_item_id" text NOT NULL,
	"quantity" integer NOT NULL,
	"condition_note" text,
	CONSTRAINT "return_items_return_case_id_order_item_id_pk" PRIMARY KEY("return_case_id","order_item_id"),
	CONSTRAINT "return_items_quantity_positive" CHECK ("return_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" text NOT NULL,
	"order_item_id" text NOT NULL,
	"rating" integer NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"moderation_status" text DEFAULT 'pending' NOT NULL,
	"moderated_by_user_id" text,
	"moderated_at" integer,
	"published_at" integer,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	CONSTRAINT "reviews_rating_valid" CHECK ("reviews"."rating" between 1 and 5)
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"provider" text,
	"provider_shipment_id" text,
	"tracking_number" text,
	"status" text DEFAULT 'rate_selected' NOT NULL,
	"service_name" text,
	"shipping_paise" integer NOT NULL,
	"chargeable_weight_grams" integer NOT NULL,
	"origin_postal_code" text NOT NULL,
	"destination_postal_code" text NOT NULL,
	"estimated_delivery_at" integer,
	"shipped_at" integer,
	"delivered_at" integer,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping_quotes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"provider" text NOT NULL,
	"provider_service_code" text NOT NULL,
	"payment_method" text NOT NULL,
	"cart_fingerprint" text NOT NULL,
	"origin_postal_code" text NOT NULL,
	"destination_postal_code" text NOT NULL,
	"service_name" text NOT NULL,
	"estimated_delivery_days" integer,
	"chargeable_weight_grams" integer NOT NULL,
	"subtotal_paise" integer NOT NULL,
	"gst_paise" integer NOT NULL,
	"shipping_paise" integer NOT NULL,
	"total_paise" integer NOT NULL,
	"packages_json" text NOT NULL,
	"rate_snapshot_json" text NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"expires_at" integer NOT NULL,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	CONSTRAINT "shipping_quotes_weight_positive" CHECK ("shipping_quotes"."chargeable_weight_grams" > 0),
	CONSTRAINT "shipping_quotes_subtotal_nonnegative" CHECK ("shipping_quotes"."subtotal_paise" >= 0),
	CONSTRAINT "shipping_quotes_gst_nonnegative" CHECK ("shipping_quotes"."gst_paise" >= 0),
	CONSTRAINT "shipping_quotes_shipping_nonnegative" CHECK ("shipping_quotes"."shipping_paise" >= 0),
	CONSTRAINT "shipping_quotes_total_nonnegative" CHECK ("shipping_quotes"."total_paise" >= 0)
);
--> statement-breakpoint
CREATE TABLE "staff_members" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"access_level" text DEFAULT 'full_access' NOT NULL,
	"status" text DEFAULT 'invited' NOT NULL,
	"invited_by_user_id" text,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"document_number" text NOT NULL,
	"order_id" text NOT NULL,
	"document_type" text DEFAULT 'tax_invoice' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"seller_gstin" text,
	"place_of_supply_state_code" text NOT NULL,
	"billing_address_json" text NOT NULL,
	"subtotal_paise" integer NOT NULL,
	"cgst_paise" integer DEFAULT 0 NOT NULL,
	"sgst_paise" integer DEFAULT 0 NOT NULL,
	"igst_paise" integer DEFAULT 0 NOT NULL,
	"shipping_paise" integer DEFAULT 0 NOT NULL,
	"total_paise" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"pdf_media_asset_id" text,
	"issued_at" integer,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	CONSTRAINT "tax_documents_total_nonnegative" CHECK ("tax_documents"."total_paise" >= 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"phone_e164" text,
	"display_name" text NOT NULL,
	"email_verified_at" integer,
	"phone_verified_at" integer,
	"whatsapp_transactional_opt_in_at" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"preferred_locale" text DEFAULT 'en-IN' NOT NULL,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	CONSTRAINT "users_contact_required" CHECK ("users"."email" is not null or "users"."phone_e164" is not null)
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"provider_event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"payload_sha256" text NOT NULL,
	"status" text DEFAULT 'received' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"processed_at" integer,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlist_items" (
	"wishlist_id" text NOT NULL,
	"product_id" text NOT NULL,
	"variant_id" text,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	CONSTRAINT "wishlist_items_wishlist_id_product_id_pk" PRIMARY KEY("wishlist_id","product_id")
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"created_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL,
	"updated_at" integer DEFAULT (extract(epoch from now())::integer) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_media" ADD CONSTRAINT "commission_media_commission_id_custom_commissions_id_fk" FOREIGN KEY ("commission_id") REFERENCES "public"."custom_commissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_media" ADD CONSTRAINT "commission_media_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission_milestones" ADD CONSTRAINT "commission_milestones_commission_id_custom_commissions_id_fk" FOREIGN KEY ("commission_id") REFERENCES "public"."custom_commissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication_consent_events" ADD CONSTRAINT "communication_consent_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_commissions" ADD CONSTRAINT "custom_commissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_commissions" ADD CONSTRAINT "custom_commissions_assigned_staff_user_id_users_id_fk" FOREIGN KEY ("assigned_staff_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestone_media" ADD CONSTRAINT "milestone_media_milestone_id_commission_milestones_id_fk" FOREIGN KEY ("milestone_id") REFERENCES "public"."commission_milestones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestone_media" ADD CONSTRAINT "milestone_media_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_commission_id_custom_commissions_id_fk" FOREIGN KEY ("commission_id") REFERENCES "public"."custom_commissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_quote_id_shipping_quotes_id_fk" FOREIGN KEY ("shipping_quote_id") REFERENCES "public"."shipping_quotes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_commission_id_custom_commissions_id_fk" FOREIGN KEY ("commission_id") REFERENCES "public"."custom_commissions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_evidence_media_asset_id_media_assets_id_fk" FOREIGN KEY ("evidence_media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_deity_id_deities_id_fk" FOREIGN KEY ("deity_id") REFERENCES "public"."deities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_cases" ADD CONSTRAINT "return_cases_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_cases" ADD CONSTRAINT "return_cases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_cases" ADD CONSTRAINT "return_cases_decided_by_user_id_users_id_fk" FOREIGN KEY ("decided_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_return_case_id_return_cases_id_fk" FOREIGN KEY ("return_case_id") REFERENCES "public"."return_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_moderated_by_user_id_users_id_fk" FOREIGN KEY ("moderated_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shipping_quotes" ADD CONSTRAINT "shipping_quotes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_documents" ADD CONSTRAINT "tax_documents_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_documents" ADD CONSTRAINT "tax_documents_pdf_media_asset_id_media_assets_id_fk" FOREIGN KEY ("pdf_media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_wishlist_id_wishlists_id_fk" FOREIGN KEY ("wishlist_id") REFERENCES "public"."wishlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "addresses_user_idx" ON "addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "addresses_postal_code_idx" ON "addresses" USING btree ("postal_code");--> statement-breakpoint
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_identity_provider_subject_unique" ON "auth_identities" USING btree ("provider","provider_subject");--> statement-breakpoint
CREATE INDEX "auth_identities_user_idx" ON "auth_identities" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_variant_intent_unique" ON "cart_items" USING btree ("cart_id","variant_id","intent");--> statement-breakpoint
CREATE INDEX "cart_items_cart_idx" ON "cart_items" USING btree ("cart_id","created_at");--> statement-breakpoint
CREATE INDEX "carts_user_status_idx" ON "carts" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_unique" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "commission_milestone_sequence_unique" ON "commission_milestones" USING btree ("commission_id","sequence");--> statement-breakpoint
CREATE INDEX "commission_milestones_status_idx" ON "commission_milestones" USING btree ("commission_id","status");--> statement-breakpoint
CREATE INDEX "communication_consent_user_timeline_idx" ON "communication_consent_events" USING btree ("user_id","channel","purpose","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "custom_commissions_number_unique" ON "custom_commissions" USING btree ("commission_number");--> statement-breakpoint
CREATE INDEX "custom_commissions_customer_idx" ON "custom_commissions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "custom_commissions_staff_queue_idx" ON "custom_commissions" USING btree ("status","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "deities_slug_unique" ON "deities" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_unique_variant_active" ON "inventory_reservations" USING btree ("variant_id") WHERE "inventory_reservations"."status" = 'active';--> statement-breakpoint
CREATE INDEX "inventory_reservations_expiry_idx" ON "inventory_reservations" USING btree ("status","expires_at");--> statement-breakpoint
CREATE INDEX "inventory_reservations_user_idx" ON "inventory_reservations" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_storage_key_unique" ON "media_assets" USING btree ("storage_key");--> statement-breakpoint
CREATE INDEX "media_assets_uploader_idx" ON "media_assets" USING btree ("uploaded_by_user_id","created_at");--> statement-breakpoint
CREATE INDEX "milestone_media_display_idx" ON "milestone_media" USING btree ("milestone_id","sort_order");--> statement-breakpoint
CREATE INDEX "notifications_delivery_queue_idx" ON "notifications" USING btree ("status","scheduled_at");--> statement-breakpoint
CREATE INDEX "notifications_order_idx" ON "notifications" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_commission_idx" ON "notifications" USING btree ("commission_id","created_at");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_variant_idx" ON "order_items" USING btree ("variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_number_unique" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_quote_unique" ON "orders" USING btree ("quote_id") WHERE "orders"."quote_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "orders_shipping_quote_unique" ON "orders" USING btree ("shipping_quote_id") WHERE "orders"."shipping_quote_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "orders_customer_idempotency_unique" ON "orders" USING btree ("user_id","idempotency_key") WHERE "orders"."idempotency_key" is not null;--> statement-breakpoint
CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("user_id","placed_at");--> statement-breakpoint
CREATE INDEX "orders_staff_queue_idx" ON "orders" USING btree ("status","placed_at");--> statement-breakpoint
CREATE INDEX "orders_cod_queue_idx" ON "orders" USING btree ("cod_approval_status","placed_at");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_provider_order_unique" ON "payments" USING btree ("provider","provider_order_id") WHERE "payments"."provider_order_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "payments_provider_id_unique" ON "payments" USING btree ("provider","provider_payment_id") WHERE "payments"."provider_payment_id" is not null;--> statement-breakpoint
CREATE INDEX "payments_order_idx" ON "payments" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE INDEX "payments_commission_idx" ON "payments" USING btree ("commission_id","created_at");--> statement-breakpoint
CREATE INDEX "product_media_display_idx" ON "product_media" USING btree ("product_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_sku_unique" ON "product_variants" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "product_variants_product_idx" ON "product_variants" USING btree ("product_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_unique" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_browse_idx" ON "products" USING btree ("status","category_id","deity_id");--> statement-breakpoint
CREATE INDEX "products_featured_idx" ON "products" USING btree ("status","is_featured");--> statement-breakpoint
CREATE INDEX "quote_items_quote_idx" ON "quote_items" USING btree ("quote_id");--> statement-breakpoint
CREATE UNIQUE INDEX "quotes_number_unique" ON "quotes" USING btree ("quote_number");--> statement-breakpoint
CREATE INDEX "quotes_user_created_idx" ON "quotes" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "quotes_staff_queue_idx" ON "quotes" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "return_cases_number_unique" ON "return_cases" USING btree ("return_number");--> statement-breakpoint
CREATE INDEX "return_cases_customer_idx" ON "return_cases" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "return_cases_staff_queue_idx" ON "return_cases" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_order_item_unique" ON "reviews" USING btree ("order_item_id");--> statement-breakpoint
CREATE INDEX "reviews_product_public_idx" ON "reviews" USING btree ("product_id","moderation_status");--> statement-breakpoint
CREATE INDEX "reviews_moderation_queue_idx" ON "reviews" USING btree ("moderation_status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "shipments_provider_id_unique" ON "shipments" USING btree ("provider","provider_shipment_id") WHERE "shipments"."provider_shipment_id" is not null;--> statement-breakpoint
CREATE INDEX "shipments_order_idx" ON "shipments" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE INDEX "shipments_tracking_idx" ON "shipments" USING btree ("tracking_number");--> statement-breakpoint
CREATE INDEX "shipping_quotes_customer_idx" ON "shipping_quotes" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "shipping_quotes_expiry_idx" ON "shipping_quotes" USING btree ("status","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "staff_members_user_unique" ON "staff_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "staff_members_status_idx" ON "staff_members" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "tax_documents_number_unique" ON "tax_documents" USING btree ("document_number");--> statement-breakpoint
CREATE INDEX "tax_documents_order_idx" ON "tax_documents" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email") WHERE "users"."email" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "users_phone_unique" ON "users" USING btree ("phone_e164") WHERE "users"."phone_e164" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_events_provider_event_unique" ON "webhook_events" USING btree ("provider","provider_event_id");--> statement-breakpoint
CREATE INDEX "webhook_events_processing_idx" ON "webhook_events" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "wishlist_items_created_idx" ON "wishlist_items" USING btree ("wishlist_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "wishlists_user_unique" ON "wishlists" USING btree ("user_id");