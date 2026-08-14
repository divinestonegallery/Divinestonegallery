import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: integer("created_at").notNull().default(sql`(extract(epoch from now())::integer)`),
  updatedAt: integer("updated_at").notNull().default(sql`(extract(epoch from now())::integer)`),
};

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email"),
    phoneE164: text("phone_e164"),
    displayName: text("display_name").notNull(),
    emailVerifiedAt: integer("email_verified_at"),
    phoneVerifiedAt: integer("phone_verified_at"),
    whatsappTransactionalOptInAt: integer("whatsapp_transactional_opt_in_at"),
    status: text("status", { enum: ["active", "blocked", "deleted"] })
      .notNull()
      .default("active"),
    preferredLocale: text("preferred_locale").notNull().default("en-IN"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("users_email_unique")
      .on(table.email)
      .where(sql`${table.email} is not null`),
    uniqueIndex("users_phone_unique")
      .on(table.phoneE164)
      .where(sql`${table.phoneE164} is not null`),
    check(
      "users_contact_required",
      sql`${table.email} is not null or ${table.phoneE164} is not null`,
    ),
  ],
);

export const communicationConsentEvents = pgTable(
  "communication_consent_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    channel: text("channel", { enum: ["whatsapp"] }).notNull(),
    purpose: text("purpose", { enum: ["transactional_updates"] }).notNull(),
    action: text("action", { enum: ["granted", "withdrawn"] }).notNull(),
    policyVersion: text("policy_version").notNull(),
    source: text("source", { enum: ["account"] }).notNull(),
    createdAt: integer("created_at").notNull().default(sql`(extract(epoch from now())::integer)`),
  },
  (table) => [
    index("communication_consent_user_timeline_idx").on(
      table.userId,
      table.channel,
      table.purpose,
      table.createdAt,
    ),
  ],
);

export const authIdentities = pgTable(
  "auth_identities",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider", { enum: ["clerk", "email", "phone", "google"] }).notNull(),
    providerSubject: text("provider_subject").notNull(),
    lastAuthenticatedAt: integer("last_authenticated_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("auth_identity_provider_subject_unique").on(
      table.provider,
      table.providerSubject,
    ),
    index("auth_identities_user_idx").on(table.userId),
  ],
);

export const addresses = pgTable(
  "addresses",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    label: text("label").notNull().default("Home"),
    recipientName: text("recipient_name").notNull(),
    phoneE164: text("phone_e164").notNull(),
    line1: text("line_1").notNull(),
    line2: text("line_2"),
    landmark: text("landmark"),
    city: text("city").notNull(),
    state: text("state").notNull(),
    postalCode: text("postal_code").notNull(),
    countryCode: text("country_code").notNull().default("IN"),
    isDefault: boolean("is_default").notNull().default(false),
    ...timestamps,
  },
  (table) => [
    index("addresses_user_idx").on(table.userId),
    index("addresses_postal_code_idx").on(table.postalCode),
  ],
);

export const staffMembers = pgTable(
  "staff_members",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    accessLevel: text("access_level", { enum: ["full_access"] })
      .notNull()
      .default("full_access"),
    status: text("status", { enum: ["invited", "active", "disabled"] })
      .notNull()
      .default("invited"),
    invitedByUserId: text("invited_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("staff_members_user_unique").on(table.userId),
    index("staff_members_status_idx").on(table.status),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [uniqueIndex("categories_slug_unique").on(table.slug)],
);

export const deities = pgTable(
  "deities",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [uniqueIndex("deities_slug_unique").on(table.slug)],
);

export const collections = pgTable(
  "collections",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("collections_slug_unique").on(table.slug),
    index("collections_browse_idx").on(table.isActive, table.sortOrder),
  ],
);

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    shortDescription: text("short_description"),
    description: text("description").notNull().default(""),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    deityId: text("deity_id").references(() => deities.id, { onDelete: "set null" }),
    productType: text("product_type", { enum: ["ready_made", "made_to_order"] })
      .notNull()
      .default("ready_made"),
    salesMode: text("sales_mode", { enum: ["direct", "quote", "both"] })
      .notNull()
      .default("both"),
    status: text("status", { enum: ["draft", "active", "archived"] })
      .notNull()
      .default("draft"),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    publishedAt: integer("published_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("products_slug_unique").on(table.slug),
    index("products_browse_idx").on(table.status, table.categoryId, table.deityId),
    index("products_featured_idx").on(table.status, table.isFeatured),
  ],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull(),
    name: text("name").notNull(),
    material: text("material").notNull().default("Marble"),
    finish: text("finish"),
    heightMm: integer("height_mm").notNull(),
    widthMm: integer("width_mm"),
    depthMm: integer("depth_mm"),
    weightMinGrams: integer("weight_min_grams"),
    weightGrams: integer("weight_grams"),
    packageLengthMm: integer("package_length_mm"),
    packageWidthMm: integer("package_width_mm"),
    packageHeightMm: integer("package_height_mm"),
    pricePaise: integer("price_paise"),
    gstRateBps: integer("gst_rate_bps"),
    inventoryKind: text("inventory_kind", { enum: ["unique", "repeatable"] })
      .notNull()
      .default("repeatable"),
    stockQuantity: integer("stock_quantity").notNull().default(0),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(1),
    codEligible: boolean("cod_eligible").notNull().default(true),
    shippingClass: text("shipping_class").notNull().default("marble_sculpture"),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("product_variants_sku_unique").on(table.sku),
    index("product_variants_product_idx").on(table.productId, table.isActive),
    check("product_variants_height_positive", sql`${table.heightMm} > 0`),
    check(
      "product_variants_weight_positive",
      sql`${table.weightGrams} is null or ${table.weightGrams} > 0`,
    ),
    check(
      "product_variants_weight_range_valid",
      sql`${table.weightMinGrams} is null or (${table.weightMinGrams} > 0 and ${table.weightGrams} is not null and ${table.weightMinGrams} <= ${table.weightGrams})`,
    ),
    check(
      "product_variants_package_dimensions_positive",
      sql`(${table.packageLengthMm} is null or ${table.packageLengthMm} > 0) and (${table.packageWidthMm} is null or ${table.packageWidthMm} > 0) and (${table.packageHeightMm} is null or ${table.packageHeightMm} > 0)`,
    ),
    check("product_variants_stock_nonnegative", sql`${table.stockQuantity} >= 0`),
    check(
      "product_variants_low_stock_threshold_nonnegative",
      sql`${table.lowStockThreshold} >= 0`,
    ),
    check(
      "product_variants_price_nonnegative",
      sql`${table.pricePaise} is null or ${table.pricePaise} >= 0`,
    ),
    check(
      "product_variants_gst_rate_valid",
      sql`${table.gstRateBps} is null or (${table.gstRateBps} >= 0 and ${table.gstRateBps} <= 10000)`,
    ),
  ],
);

export const productCollections = pgTable(
  "product_collections",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    collectionId: text("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.collectionId] }),
    index("product_collections_collection_idx").on(table.collectionId, table.sortOrder),
  ],
);

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: text("id").primaryKey(),
    uploadedByUserId: text("uploaded_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    storageKey: text("storage_key").notNull(),
    publicPath: text("public_path"),
    originalFilename: text("original_filename").notNull(),
    contentType: text("content_type").notNull(),
    byteSize: integer("byte_size").notNull(),
    widthPx: integer("width_px"),
    heightPx: integer("height_px"),
    kind: text("kind", { enum: ["image", "video", "document"] }).notNull(),
    status: text("status", { enum: ["pending", "ready", "rejected", "deleted"] })
      .notNull()
      .default("pending"),
    checksumSha256: text("checksum_sha256"),
    altText: text("alt_text"),
    caption: text("caption"),
    folder: text("folder").notNull().default("Gallery"),
    tagsJson: text("tags_json").notNull().default("[]"),
    focalPointX: integer("focal_point_x").notNull().default(50),
    focalPointY: integer("focal_point_y").notNull().default(50),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("media_assets_storage_key_unique").on(table.storageKey),
    index("media_assets_uploader_idx").on(table.uploadedByUserId, table.createdAt),
    check("media_assets_size_nonnegative", sql`${table.byteSize} >= 0`),
    check("media_assets_focal_x_valid", sql`${table.focalPointX} >= 0 and ${table.focalPointX} <= 100`),
    check("media_assets_focal_y_valid", sql`${table.focalPointY} >= 0 and ${table.focalPointY} <= 100`),
  ],
);

export const sitePages = pgTable(
  "site_pages",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    navigationTitle: text("navigation_title"),
    status: text("status", { enum: ["draft", "published", "archived"] })
      .notNull()
      .default("draft"),
    isSystem: boolean("is_system").notNull().default(false),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    publishedAt: integer("published_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("site_pages_slug_unique").on(table.slug),
    index("site_pages_status_idx").on(table.status, table.updatedAt),
  ],
);

export const siteSections = pgTable(
  "site_sections",
  {
    id: text("id").primaryKey(),
    pageId: text("page_id")
      .notNull()
      .references(() => sitePages.id, { onDelete: "cascade" }),
    sectionKey: text("section_key").notNull(),
    blockType: text("block_type", {
      enum: ["hero", "rich_text", "image_text", "collection", "feature_grid", "callout", "faq"],
    }).notNull(),
    eyebrow: text("eyebrow"),
    heading: text("heading"),
    body: text("body"),
    ctaLabel: text("cta_label"),
    ctaHref: text("cta_href"),
    secondaryCtaLabel: text("secondary_cta_label"),
    secondaryCtaHref: text("secondary_cta_href"),
    mediaAssetId: text("media_asset_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    mediaPosition: text("media_position", { enum: ["left", "right", "background"] })
      .notNull()
      .default("right"),
    contentJson: text("content_json").notNull().default("[]"),
    styleVariant: text("style_variant").notNull().default("light"),
    sortOrder: integer("sort_order").notNull().default(0),
    isVisible: boolean("is_visible").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("site_sections_page_key_unique").on(table.pageId, table.sectionKey),
    index("site_sections_page_order_idx").on(table.pageId, table.sortOrder),
    check("site_sections_sort_nonnegative", sql`${table.sortOrder} >= 0`),
  ],
);

export const sitePageVersions = pgTable(
  "site_page_versions",
  {
    id: text("id").primaryKey(),
    pageId: text("page_id")
      .notNull()
      .references(() => sitePages.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    label: text("label").notNull(),
    snapshotJson: text("snapshot_json").notNull(),
    createdByUserId: text("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: integer("created_at").notNull().default(sql`(extract(epoch from now())::integer)`),
  },
  (table) => [
    uniqueIndex("site_page_versions_number_unique").on(table.pageId, table.versionNumber),
    index("site_page_versions_timeline_idx").on(table.pageId, table.createdAt),
  ],
);

export const businessSettings = pgTable(
  "business_settings",
  {
    key: text("key").primaryKey(),
    value: text("value").notNull(),
    groupName: text("group_name").notNull().default("general"),
    isSecret: boolean("is_secret").notNull().default(false),
    updatedByUserId: text("updated_by_user_id").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => [index("business_settings_group_idx").on(table.groupName)],
);

export const productMedia = pgTable(
  "product_media",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    mediaAssetId: text("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    variantId: text("variant_id").references(() => productVariants.id, {
      onDelete: "cascade",
    }),
    sortOrder: integer("sort_order").notNull().default(0),
    isPrimary: boolean("is_primary").notNull().default(false),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.mediaAssetId] }),
    index("product_media_display_idx").on(table.productId, table.sortOrder),
  ],
);

export const wishlists = pgTable(
  "wishlists",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [uniqueIndex("wishlists_user_unique").on(table.userId)],
);

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    wishlistId: text("wishlist_id")
      .notNull()
      .references(() => wishlists.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: text("variant_id").references(() => productVariants.id, {
      onDelete: "cascade",
    }),
    createdAt: integer("created_at").notNull().default(sql`(extract(epoch from now())::integer)`),
  },
  (table) => [
    primaryKey({ columns: [table.wishlistId, table.productId] }),
    index("wishlist_items_created_idx").on(table.wishlistId, table.createdAt),
  ],
);

export const carts = pgTable(
  "carts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["active", "converted", "abandoned"] })
      .notNull()
      .default("active"),
    ...timestamps,
  },
  (table) => [index("carts_user_status_idx").on(table.userId, table.status)],
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: text("id").primaryKey(),
    cartId: text("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: text("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    intent: text("intent", { enum: ["purchase", "quote"] }).notNull().default("purchase"),
    createdAt: integer("created_at").notNull().default(sql`(extract(epoch from now())::integer)`),
    updatedAt: integer("updated_at").notNull().default(sql`(extract(epoch from now())::integer)`),
  },
  (table) => [
    uniqueIndex("cart_items_variant_intent_unique").on(
      table.cartId,
      table.variantId,
      table.intent,
    ),
    index("cart_items_cart_idx").on(table.cartId, table.createdAt),
    check("cart_items_quantity_positive", sql`${table.quantity} > 0`),
  ],
);

export const quotes = pgTable(
  "quotes",
  {
    id: text("id").primaryKey(),
    quoteNumber: text("quote_number").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    status: text("status", {
      enum: ["requested", "preparing", "sent", "accepted", "declined", "expired", "cancelled"],
    })
      .notNull()
      .default("requested"),
    customerNote: text("customer_note"),
    staffNote: text("staff_note"),
    subtotalPaise: integer("subtotal_paise"),
    gstPaise: integer("gst_paise"),
    shippingPaise: integer("shipping_paise"),
    totalPaise: integer("total_paise"),
    currency: text("currency").notNull().default("INR"),
    expiresAt: integer("expires_at"),
    sentAt: integer("sent_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("quotes_number_unique").on(table.quoteNumber),
    index("quotes_user_created_idx").on(table.userId, table.createdAt),
    index("quotes_staff_queue_idx").on(table.status, table.createdAt),
  ],
);

export const quoteItems = pgTable(
  "quote_items",
  {
    id: text("id").primaryKey(),
    quoteId: text("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
    variantId: text("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    itemName: text("item_name").notNull(),
    sku: text("sku"),
    quantity: integer("quantity").notNull().default(1),
    unitPricePaise: integer("unit_price_paise"),
    gstRateBps: integer("gst_rate_bps"),
    lineTotalPaise: integer("line_total_paise"),
  },
  (table) => [
    index("quote_items_quote_idx").on(table.quoteId),
    check("quote_items_quantity_positive", sql`${table.quantity} > 0`),
  ],
);

export const shippingQuotes = pgTable(
  "shipping_quotes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["active", "consumed", "expired", "cancelled"] })
      .notNull()
      .default("active"),
    provider: text("provider").notNull(),
    providerServiceCode: text("provider_service_code").notNull(),
    paymentMethod: text("payment_method", { enum: ["online", "bank_transfer", "cod"] })
      .notNull(),
    cartFingerprint: text("cart_fingerprint").notNull(),
    originPostalCode: text("origin_postal_code").notNull(),
    destinationPostalCode: text("destination_postal_code").notNull(),
    serviceName: text("service_name").notNull(),
    estimatedDeliveryDays: integer("estimated_delivery_days"),
    chargeableWeightGrams: integer("chargeable_weight_grams").notNull(),
    subtotalPaise: integer("subtotal_paise").notNull(),
    gstPaise: integer("gst_paise").notNull(),
    shippingPaise: integer("shipping_paise").notNull(),
    totalPaise: integer("total_paise").notNull(),
    packagesJson: text("packages_json").notNull(),
    rateSnapshotJson: text("rate_snapshot_json").notNull(),
    currency: text("currency").notNull().default("INR"),
    expiresAt: integer("expires_at").notNull(),
    ...timestamps,
  },
  (table) => [
    index("shipping_quotes_customer_idx").on(table.userId, table.createdAt),
    index("shipping_quotes_expiry_idx").on(table.status, table.expiresAt),
    check("shipping_quotes_weight_positive", sql`${table.chargeableWeightGrams} > 0`),
    check("shipping_quotes_subtotal_nonnegative", sql`${table.subtotalPaise} >= 0`),
    check("shipping_quotes_gst_nonnegative", sql`${table.gstPaise} >= 0`),
    check("shipping_quotes_shipping_nonnegative", sql`${table.shippingPaise} >= 0`),
    check("shipping_quotes_total_nonnegative", sql`${table.totalPaise} >= 0`),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    orderNumber: text("order_number").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    quoteId: text("quote_id").references(() => quotes.id, { onDelete: "set null" }),
    shippingQuoteId: text("shipping_quote_id").references(() => shippingQuotes.id, {
      onDelete: "restrict",
    }),
    idempotencyKey: text("idempotency_key"),
    checkoutRequestHash: text("checkout_request_hash"),
    status: text("status", {
      enum: [
        "approval_pending",
        "placed",
        "confirmed",
        "in_production",
        "ready_to_ship",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
    })
      .notNull()
      .default("placed"),
    paymentStatus: text("payment_status", {
      enum: ["pending", "partially_paid", "paid", "failed", "refunded", "partially_refunded"],
    })
      .notNull()
      .default("pending"),
    paymentMethod: text("payment_method", {
      enum: ["online", "bank_transfer", "cod"],
    }).notNull(),
    codApprovalStatus: text("cod_approval_status", {
      enum: ["not_required", "pending", "approved", "rejected"],
    })
      .notNull()
      .default("not_required"),
    phoneVerifiedAt: integer("phone_verified_at"),
    shippingAddressJson: text("shipping_address_json").notNull(),
    billingAddressJson: text("billing_address_json").notNull(),
    subtotalPaise: integer("subtotal_paise").notNull(),
    gstPaise: integer("gst_paise").notNull().default(0),
    shippingPaise: integer("shipping_paise").notNull().default(0),
    discountPaise: integer("discount_paise").notNull().default(0),
    totalPaise: integer("total_paise").notNull(),
    currency: text("currency").notNull().default("INR"),
    customerNote: text("customer_note"),
    placedAt: integer("placed_at").notNull().default(sql`(extract(epoch from now())::integer)`),
    cancelledAt: integer("cancelled_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("orders_number_unique").on(table.orderNumber),
    uniqueIndex("orders_quote_unique")
      .on(table.quoteId)
      .where(sql`${table.quoteId} is not null`),
    uniqueIndex("orders_shipping_quote_unique")
      .on(table.shippingQuoteId)
      .where(sql`${table.shippingQuoteId} is not null`),
    uniqueIndex("orders_customer_idempotency_unique")
      .on(table.userId, table.idempotencyKey)
      .where(sql`${table.idempotencyKey} is not null`),
    index("orders_customer_idx").on(table.userId, table.placedAt),
    index("orders_staff_queue_idx").on(table.status, table.placedAt),
    index("orders_cod_queue_idx").on(table.codApprovalStatus, table.placedAt),
    check("orders_subtotal_nonnegative", sql`${table.subtotalPaise} >= 0`),
    check("orders_total_nonnegative", sql`${table.totalPaise} >= 0`),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
    variantId: text("variant_id").references(() => productVariants.id, {
      onDelete: "set null",
    }),
    itemName: text("item_name").notNull(),
    variantName: text("variant_name").notNull(),
    sku: text("sku").notNull(),
    quantity: integer("quantity").notNull(),
    unitPricePaise: integer("unit_price_paise").notNull(),
    gstRateBps: integer("gst_rate_bps").notNull().default(0),
    gstPaise: integer("gst_paise").notNull().default(0),
    lineTotalPaise: integer("line_total_paise").notNull(),
    productSnapshotJson: text("product_snapshot_json").notNull(),
    createdAt: integer("created_at").notNull().default(sql`(extract(epoch from now())::integer)`),
  },
  (table) => [
    index("order_items_order_idx").on(table.orderId),
    index("order_items_variant_idx").on(table.variantId),
    check("order_items_quantity_positive", sql`${table.quantity} > 0`),
  ],
);

export const inventoryReservations = pgTable(
  "inventory_reservations",
  {
    id: text("id").primaryKey(),
    variantId: text("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    orderId: text("order_id").references(() => orders.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["active", "converted", "released", "expired"] })
      .notNull()
      .default("active"),
    expiresAt: integer("expires_at").notNull(),
    createdAt: integer("created_at").notNull().default(sql`(extract(epoch from now())::integer)`),
    updatedAt: integer("updated_at").notNull().default(sql`(extract(epoch from now())::integer)`),
  },
  (table) => [
    uniqueIndex("inventory_unique_variant_active")
      .on(table.variantId)
      .where(sql`${table.status} = 'active'`),
    index("inventory_reservations_expiry_idx").on(table.status, table.expiresAt),
    index("inventory_reservations_user_idx").on(table.userId, table.createdAt),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id").references(() => orders.id, { onDelete: "restrict" }),
    commissionId: text("commission_id").references(() => customCommissions.id, {
      onDelete: "restrict",
    }),
    provider: text("provider").notNull(),
    providerOrderId: text("provider_order_id"),
    providerPaymentId: text("provider_payment_id"),
    method: text("method", { enum: ["online", "bank_transfer", "cod"] }).notNull(),
    status: text("status", {
      enum: ["created", "pending", "authorized", "captured", "failed", "refunded", "cancelled"],
    })
      .notNull()
      .default("created"),
    amountPaise: integer("amount_paise").notNull(),
    currency: text("currency").notNull().default("INR"),
    bankReference: text("bank_reference"),
    evidenceMediaAssetId: text("evidence_media_asset_id").references(
      () => mediaAssets.id,
      { onDelete: "set null" },
    ),
    failureCode: text("failure_code"),
    failureMessage: text("failure_message"),
    paidAt: integer("paid_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("payments_provider_order_unique")
      .on(table.provider, table.providerOrderId)
      .where(sql`${table.providerOrderId} is not null`),
    uniqueIndex("payments_provider_id_unique")
      .on(table.provider, table.providerPaymentId)
      .where(sql`${table.providerPaymentId} is not null`),
    index("payments_order_idx").on(table.orderId, table.createdAt),
    index("payments_commission_idx").on(table.commissionId, table.createdAt),
    check("payments_amount_positive", sql`${table.amountPaise} > 0`),
    check(
      "payments_single_owner",
      sql`(${table.orderId} is not null and ${table.commissionId} is null) or (${table.orderId} is null and ${table.commissionId} is not null)`,
    ),
  ],
);

export const shipments = pgTable(
  "shipments",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    provider: text("provider"),
    providerShipmentId: text("provider_shipment_id"),
    trackingNumber: text("tracking_number"),
    status: text("status", {
      enum: ["rate_selected", "booked", "picked_up", "in_transit", "delivered", "exception", "cancelled"],
    })
      .notNull()
      .default("rate_selected"),
    serviceName: text("service_name"),
    shippingPaise: integer("shipping_paise").notNull(),
    chargeableWeightGrams: integer("chargeable_weight_grams").notNull(),
    originPostalCode: text("origin_postal_code").notNull(),
    destinationPostalCode: text("destination_postal_code").notNull(),
    estimatedDeliveryAt: integer("estimated_delivery_at"),
    shippedAt: integer("shipped_at"),
    deliveredAt: integer("delivered_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("shipments_provider_id_unique")
      .on(table.provider, table.providerShipmentId)
      .where(sql`${table.providerShipmentId} is not null`),
    index("shipments_order_idx").on(table.orderId, table.createdAt),
    index("shipments_tracking_idx").on(table.trackingNumber),
  ],
);

export const taxDocuments = pgTable(
  "tax_documents",
  {
    id: text("id").primaryKey(),
    documentNumber: text("document_number").notNull(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    documentType: text("document_type", { enum: ["tax_invoice", "credit_note"] })
      .notNull()
      .default("tax_invoice"),
    status: text("status", { enum: ["draft", "issued", "void"] })
      .notNull()
      .default("draft"),
    sellerGstin: text("seller_gstin"),
    placeOfSupplyStateCode: text("place_of_supply_state_code").notNull(),
    billingAddressJson: text("billing_address_json").notNull(),
    subtotalPaise: integer("subtotal_paise").notNull(),
    cgstPaise: integer("cgst_paise").notNull().default(0),
    sgstPaise: integer("sgst_paise").notNull().default(0),
    igstPaise: integer("igst_paise").notNull().default(0),
    shippingPaise: integer("shipping_paise").notNull().default(0),
    totalPaise: integer("total_paise").notNull(),
    currency: text("currency").notNull().default("INR"),
    pdfMediaAssetId: text("pdf_media_asset_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    issuedAt: integer("issued_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("tax_documents_number_unique").on(table.documentNumber),
    index("tax_documents_order_idx").on(table.orderId, table.createdAt),
    check("tax_documents_total_nonnegative", sql`${table.totalPaise} >= 0`),
  ],
);

export const returnCases = pgTable(
  "return_cases",
  {
    id: text("id").primaryKey(),
    returnNumber: text("return_number").notNull(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    status: text("status", {
      enum: [
        "requested",
        "under_review",
        "approved",
        "rejected",
        "in_transit",
        "received",
        "refunded",
        "closed",
      ],
    })
      .notNull()
      .default("requested"),
    reason: text("reason").notNull(),
    customerNote: text("customer_note"),
    staffDecisionNote: text("staff_decision_note"),
    decidedByUserId: text("decided_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    decidedAt: integer("decided_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("return_cases_number_unique").on(table.returnNumber),
    index("return_cases_customer_idx").on(table.userId, table.createdAt),
    index("return_cases_staff_queue_idx").on(table.status, table.createdAt),
  ],
);

export const returnItems = pgTable(
  "return_items",
  {
    returnCaseId: text("return_case_id")
      .notNull()
      .references(() => returnCases.id, { onDelete: "cascade" }),
    orderItemId: text("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    conditionNote: text("condition_note"),
  },
  (table) => [
    primaryKey({ columns: [table.returnCaseId, table.orderItemId] }),
    check("return_items_quantity_positive", sql`${table.quantity} > 0`),
  ],
);

export const customCommissions = pgTable(
  "custom_commissions",
  {
    id: text("id").primaryKey(),
    commissionNumber: text("commission_number").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    deityOrSubject: text("deity_or_subject").notNull(),
    requirements: text("requirements").notNull(),
    preferredMaterial: text("preferred_material").notNull().default("Marble"),
    targetHeightMm: integer("target_height_mm"),
    targetWidthMm: integer("target_width_mm"),
    targetDepthMm: integer("target_depth_mm"),
    destinationPostalCode: text("destination_postal_code").notNull(),
    status: text("status", {
      enum: [
        "submitted",
        "consultation",
        "quoted",
        "awaiting_advance",
        "in_production",
        "awaiting_approval",
        "ready_to_ship",
        "completed",
        "cancelled",
      ],
    })
      .notNull()
      .default("submitted"),
    quotedPricePaise: integer("quoted_price_paise"),
    gstPaise: integer("gst_paise"),
    shippingPaise: integer("shipping_paise"),
    advanceAmountPaise: integer("advance_amount_paise"),
    balanceAmountPaise: integer("balance_amount_paise"),
    assignedStaffUserId: text("assigned_staff_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    expectedCompletionAt: integer("expected_completion_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("custom_commissions_number_unique").on(table.commissionNumber),
    index("custom_commissions_customer_idx").on(table.userId, table.createdAt),
    index("custom_commissions_staff_queue_idx").on(table.status, table.updatedAt),
  ],
);

export const commissionMedia = pgTable(
  "commission_media",
  {
    commissionId: text("commission_id")
      .notNull()
      .references(() => customCommissions.id, { onDelete: "cascade" }),
    mediaAssetId: text("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    source: text("source", { enum: ["website", "whatsapp", "staff"] }).notNull(),
    createdAt: integer("created_at").notNull().default(sql`(extract(epoch from now())::integer)`),
  },
  (table) => [primaryKey({ columns: [table.commissionId, table.mediaAssetId] })],
);

export const commissionMilestones = pgTable(
  "commission_milestones",
  {
    id: text("id").primaryKey(),
    commissionId: text("commission_id")
      .notNull()
      .references(() => customCommissions.id, { onDelete: "cascade" }),
    sequence: integer("sequence").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status", { enum: ["pending", "in_progress", "submitted", "approved", "changes_requested"] })
      .notNull()
      .default("pending"),
    customerNote: text("customer_note"),
    staffNote: text("staff_note"),
    submittedAt: integer("submitted_at"),
    approvedAt: integer("approved_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("commission_milestone_sequence_unique").on(
      table.commissionId,
      table.sequence,
    ),
    index("commission_milestones_status_idx").on(table.commissionId, table.status),
    check("commission_milestones_sequence_positive", sql`${table.sequence} > 0`),
  ],
);

export const milestoneMedia = pgTable(
  "milestone_media",
  {
    milestoneId: text("milestone_id")
      .notNull()
      .references(() => commissionMilestones.id, { onDelete: "cascade" }),
    mediaAssetId: text("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.milestoneId, table.mediaAssetId] }),
    index("milestone_media_display_idx").on(table.milestoneId, table.sortOrder),
  ],
);

export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    orderItemId: text("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "restrict" }),
    rating: integer("rating").notNull(),
    title: text("title"),
    body: text("body").notNull(),
    moderationStatus: text("moderation_status", {
      enum: ["pending", "approved", "rejected"],
    })
      .notNull()
      .default("pending"),
    moderatedByUserId: text("moderated_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    moderatedAt: integer("moderated_at"),
    publishedAt: integer("published_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("reviews_order_item_unique").on(table.orderItemId),
    index("reviews_product_public_idx").on(table.productId, table.moderationStatus),
    index("reviews_moderation_queue_idx").on(table.moderationStatus, table.createdAt),
    check("reviews_rating_valid", sql`${table.rating} between 1 and 5`),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    orderId: text("order_id").references(() => orders.id, { onDelete: "cascade" }),
    commissionId: text("commission_id").references(() => customCommissions.id, {
      onDelete: "cascade",
    }),
    channel: text("channel", { enum: ["email", "sms", "whatsapp"] }).notNull(),
    templateKey: text("template_key").notNull(),
    recipient: text("recipient").notNull(),
    status: text("status", { enum: ["queued", "processing", "sent", "delivered", "failed", "cancelled"] })
      .notNull()
      .default("queued"),
    provider: text("provider"),
    providerMessageId: text("provider_message_id"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    scheduledAt: integer("scheduled_at").notNull().default(sql`(extract(epoch from now())::integer)`),
    sentAt: integer("sent_at"),
    deliveredAt: integer("delivered_at"),
    ...timestamps,
  },
  (table) => [
    index("notifications_delivery_queue_idx").on(table.status, table.scheduledAt),
    index("notifications_order_idx").on(table.orderId, table.createdAt),
    index("notifications_commission_idx").on(table.commissionId, table.createdAt),
  ],
);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: text("id").primaryKey(),
    provider: text("provider").notNull(),
    providerEventId: text("provider_event_id").notNull(),
    eventType: text("event_type").notNull(),
    payloadSha256: text("payload_sha256").notNull(),
    status: text("status", { enum: ["received", "processed", "failed", "ignored"] })
      .notNull()
      .default("received"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    processedAt: integer("processed_at"),
    createdAt: integer("created_at").notNull().default(sql`(extract(epoch from now())::integer)`),
    updatedAt: integer("updated_at").notNull().default(sql`(extract(epoch from now())::integer)`),
  },
  (table) => [
    uniqueIndex("webhook_events_provider_event_unique").on(
      table.provider,
      table.providerEventId,
    ),
    index("webhook_events_processing_idx").on(table.status, table.createdAt),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    actorUserId: text("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    changesJson: text("changes_json"),
    requestId: text("request_id"),
    ipHash: text("ip_hash"),
    createdAt: integer("created_at").notNull().default(sql`(extract(epoch from now())::integer)`),
  },
  (table) => [
    index("audit_logs_entity_idx").on(table.entityType, table.entityId, table.createdAt),
    index("audit_logs_actor_idx").on(table.actorUserId, table.createdAt),
  ],
);
