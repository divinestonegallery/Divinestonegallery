INSERT OR IGNORE INTO `categories` (`id`, `slug`, `name`, `description`, `sort_order`, `is_active`) VALUES
  ('deity-idol', 'deity-idol', 'Deity Idol', 'Individual sacred forms for home and temple worship.', 1, 1),
  ('divine-family', 'divine-family', 'Divine Family', 'Coordinated divine-family compositions and devotional sets.', 2, 1),
  ('wall-sculpture', 'wall-sculpture', 'Wall Sculpture', 'Sacred marble works designed for a vertical setting.', 3, 1),
  ('sacred-accent', 'sacred-accent', 'Sacred Accent', 'Compact devotional sculptures and gifting forms.', 4, 1);
--> statement-breakpoint

INSERT OR IGNORE INTO `deities` (`id`, `slug`, `name`, `sort_order`, `is_active`) VALUES
  ('radha-krishna', 'radha-krishna', 'Radha Krishna', 1, 1),
  ('ganesha', 'ganesha', 'Ganesha', 2, 1),
  ('shiva', 'shiva', 'Shiva', 3, 1),
  ('rama', 'rama', 'Rama', 4, 1),
  ('lakshmi', 'lakshmi', 'Lakshmi', 5, 1),
  ('saraswati', 'saraswati', 'Saraswati', 6, 1),
  ('shrinathji', 'shrinathji', 'Shrinathji', 7, 1),
  ('gau-mata', 'gau-mata', 'Gau Mata', 8, 1),
  ('divine-trio', 'divine-trio', 'Divine Trio', 9, 1);
--> statement-breakpoint

INSERT OR IGNORE INTO `products` (`id`, `slug`, `name`, `short_description`, `description`, `category_id`, `deity_id`, `product_type`, `sales_mode`, `status`, `is_featured`, `sort_order`, `seo_title`, `seo_description`, `published_at`) VALUES
  ('radha-krishna-39', 'radha-krishna-39-inch-marble', 'Radha Krishna Moorti', 'A serene Radha Krishna composition in hand-painted white marble.', 'A serene Radha Krishna composition carved in white marble and completed with delicate hand-painted details for a graceful devotional presence.', 'deity-idol', 'radha-krishna', 'ready_made', 'both', 'active', 1, 1, 'Radha Krishna Moorti | 39-inch Marble', 'Hand-carved 39-inch Radha Krishna moorti in white marble with delicate painted details.', unixepoch()),
  ('ganesha-24', 'ornate-ganesh-24-inch-marble', 'Sri Ornate Ganesha', 'An expressive Ganesha moorti with finely rendered ornamentation.', 'An expressive Ganesha moorti shaped in white marble, with carefully rendered ornamentation and hand-painted accents.', 'deity-idol', 'ganesha', 'ready_made', 'both', 'active', 1, 2, 'Sri Ornate Ganesha | 24-inch Marble', 'Hand-carved 24-inch Ganesha moorti in white marble with ornate painted details.', unixepoch()),
  ('gauri-shankar-18', 'gauri-shankar-family-18-inch-marble', 'Gauri Shankar Family', 'A balanced Gauri Shankar family composition in white marble.', 'A balanced Gauri Shankar family composition, hand-carved in white marble and finished with gentle colour and devotional detail.', 'divine-family', 'shiva', 'ready_made', 'both', 'active', 1, 3, 'Gauri Shankar Family | 18-inch Marble', 'Hand-carved 18-inch Gauri Shankar family composition in white marble.', unixepoch()),
  ('ram-darbar-24', 'ram-darbar-24-inch-marble', 'Ram Darbar', 'A complete Ram Darbar arrangement in a calm natural-white finish.', 'A complete Ram Darbar arrangement in a calm natural-white finish, designed to create a harmonious focal point for a mandir or sacred space.', 'divine-family', 'rama', 'ready_made', 'both', 'active', 1, 4, 'Ram Darbar | 24-inch Marble', 'Complete 24-inch Ram Darbar arrangement hand-carved in marble.', unixepoch()),
  ('lakshmi-24', 'lakshmi-mata-24-inch-marble', 'Lakshmi Mata', 'A poised Lakshmi Mata moorti with refined painted details.', 'A poised Lakshmi Mata moorti in white marble, completed with refined hand-painted details and a warm devotional expression.', 'deity-idol', 'lakshmi', 'ready_made', 'both', 'active', 1, 5, 'Lakshmi Mata | 24-inch Marble', 'Hand-carved 24-inch Lakshmi Mata moorti in white marble.', unixepoch()),
  ('saraswati-18', 'saraswati-mata-18-inch-marble', 'Saraswati Mata', 'A graceful Saraswati Mata form with soft painted accents.', 'A graceful Saraswati Mata form hand-carved in white marble, with considered ornamentation and soft painted accents.', 'deity-idol', 'saraswati', 'ready_made', 'both', 'active', 1, 6, 'Saraswati Mata | 18-inch Marble', 'Hand-carved 18-inch Saraswati Mata moorti in white marble.', unixepoch()),
  ('shrinathji-wall-27', 'shrinathji-wall-sculpture-27-inch', 'Shrinathji Wall Sculpture', 'A richly detailed Shrinathji wall sculpture carved in marble.', 'A richly detailed Shrinathji wall sculpture carved in marble and hand-painted to bring devotional character to a vertical sacred setting.', 'wall-sculpture', 'shrinathji', 'ready_made', 'both', 'active', 1, 7, 'Shrinathji Wall Sculpture | 27-inch Marble', 'Hand-painted 27-inch Shrinathji wall sculpture carved in marble.', unixepoch()),
  ('cow-calf-6', 'gau-mata-calf-6-inch-marble', 'Gau Mata & Calf', 'A compact Gau Mata and calf sculpture for a sacred accent.', 'A compact Gau Mata and calf sculpture, carved in marble and delicately painted for a mandir shelf, gifting or sacred accent.', 'sacred-accent', 'gau-mata', 'ready_made', 'both', 'active', 1, 8, 'Gau Mata & Calf | 6-inch Marble', 'Compact 6-inch Gau Mata and calf sculpture carved in marble.', unixepoch()),
  ('divine-trio-12', 'lakshmi-ganesh-saraswati-12-inch', 'Lakshmi, Ganesha & Saraswati', 'A coordinated divine trio in hand-painted white marble.', 'A coordinated Lakshmi, Ganesha and Saraswati trio in white marble, created as a harmonious devotional arrangement for the home.', 'divine-family', 'divine-trio', 'ready_made', 'both', 'active', 1, 9, 'Lakshmi, Ganesha & Saraswati | 12-inch Marble', 'A coordinated 12-inch Lakshmi, Ganesha and Saraswati trio in white marble.', unixepoch());
--> statement-breakpoint

INSERT OR IGNORE INTO `product_variants` (`id`, `product_id`, `sku`, `name`, `material`, `finish`, `height_mm`, `weight_grams`, `price_paise`, `gst_rate_bps`, `inventory_kind`, `stock_quantity`, `cod_eligible`, `is_active`) VALUES
  ('radha-krishna-39:default', 'radha-krishna-39', 'DSG-RK-039', '39 inch', 'White marble', 'Hand-painted', 991, NULL, NULL, NULL, 'repeatable', 0, 1, 1),
  ('ganesha-24:default', 'ganesha-24', 'DSG-GAN-024', '24 inch', 'White marble', 'Hand-painted', 610, NULL, NULL, NULL, 'repeatable', 0, 1, 1),
  ('gauri-shankar-18:default', 'gauri-shankar-18', 'DSG-GS-018', '18 inch', 'White marble', 'Hand-painted', 457, NULL, NULL, NULL, 'repeatable', 0, 1, 1),
  ('ram-darbar-24:default', 'ram-darbar-24', 'DSG-RAM-024', '24 inch', 'White marble', 'Natural white', 610, NULL, NULL, NULL, 'repeatable', 0, 1, 1),
  ('lakshmi-24:default', 'lakshmi-24', 'DSG-LAK-024', '24 inch', 'White marble', 'Hand-painted', 610, NULL, NULL, NULL, 'repeatable', 0, 1, 1),
  ('saraswati-18:default', 'saraswati-18', 'DSG-SAR-018', '18 inch', 'White marble', 'Hand-painted', 457, NULL, NULL, NULL, 'repeatable', 0, 1, 1),
  ('shrinathji-wall-27:default', 'shrinathji-wall-27', 'DSG-SHR-W-027', '27 inch', 'Marble', 'Hand-painted', 686, NULL, NULL, NULL, 'repeatable', 0, 1, 1),
  ('cow-calf-6:default', 'cow-calf-6', 'DSG-GAU-006', '6 inch', 'Marble', 'Hand-painted', 152, NULL, NULL, NULL, 'repeatable', 0, 1, 1),
  ('divine-trio-12:default', 'divine-trio-12', 'DSG-TRIO-012', '12 inch', 'White marble', 'Hand-painted', 305, NULL, NULL, NULL, 'repeatable', 0, 1, 1);
--> statement-breakpoint

INSERT OR IGNORE INTO `media_assets` (`id`, `r2_key`, `public_path`, `original_filename`, `content_type`, `byte_size`, `width_px`, `height_px`, `kind`, `status`, `alt_text`) VALUES
  ('media:radha-krishna-39', 'seed/catalog/radha-krishna-39.jpg', '/catalog/radha-krishna-39.jpg', 'radha-krishna-39.jpg', 'image/jpeg', 498629, 1440, 1800, 'image', 'ready', 'Hand-carved Radha Krishna marble moorties with gold and pastel detailing'),
  ('media:ganesha-24', 'seed/catalog/ganesh-24.jpg', '/catalog/ganesh-24.jpg', 'ganesh-24.jpg', 'image/jpeg', 525097, 1440, 1800, 'image', 'ready', 'Ornate Ganesha marble moorti with finely painted details'),
  ('media:gauri-shankar-18', 'seed/catalog/gauri-shankar-18.jpg', '/catalog/gauri-shankar-18.jpg', 'gauri-shankar-18.jpg', 'image/jpeg', 439799, 1440, 1800, 'image', 'ready', 'Gauri Shankar divine family marble sculpture'),
  ('media:ram-darbar-24', 'seed/catalog/ram-darbar-24.jpg', '/catalog/ram-darbar-24.jpg', 'ram-darbar-24.jpg', 'image/jpeg', 462144, 1440, 1800, 'image', 'ready', 'Ram Darbar divine family set carved in white marble'),
  ('media:lakshmi-24', 'seed/catalog/lakshmi-24.jpg', '/catalog/lakshmi-24.jpg', 'lakshmi-24.jpg', 'image/jpeg', 449221, 1440, 1800, 'image', 'ready', 'Lakshmi Mata moorti hand-carved and painted in white marble'),
  ('media:saraswati-18', 'seed/catalog/saraswati-18.jpg', '/catalog/saraswati-18.jpg', 'saraswati-18.jpg', 'image/jpeg', 420070, 1440, 1800, 'image', 'ready', 'Saraswati Mata marble moorti with hand-painted ornamentation'),
  ('media:shrinathji-wall-27', 'seed/catalog/shreenathji-wall-27.jpg', '/catalog/shreenathji-wall-27.jpg', 'shreenathji-wall-27.jpg', 'image/jpeg', 513947, 1440, 1800, 'image', 'ready', 'Hand-painted Shrinathji marble wall sculpture'),
  ('media:cow-calf-6', 'seed/catalog/cow-calf-6.jpg', '/catalog/cow-calf-6.jpg', 'cow-calf-6.jpg', 'image/jpeg', 347056, 1440, 1800, 'image', 'ready', 'Gau Mata and calf miniature marble sculpture'),
  ('media:divine-trio-12', 'seed/catalog/lakshmi-ganesh-saraswati-12.jpg', '/catalog/lakshmi-ganesh-saraswati-12.jpg', 'lakshmi-ganesh-saraswati-12.jpg', 'image/jpeg', 462600, 1800, 1440, 'image', 'ready', 'Lakshmi, Ganesha and Saraswati trio in hand-painted white marble');
--> statement-breakpoint

INSERT OR IGNORE INTO `product_media` (`product_id`, `media_asset_id`, `variant_id`, `sort_order`, `is_primary`) VALUES
  ('radha-krishna-39', 'media:radha-krishna-39', 'radha-krishna-39:default', 1, 1),
  ('ganesha-24', 'media:ganesha-24', 'ganesha-24:default', 1, 1),
  ('gauri-shankar-18', 'media:gauri-shankar-18', 'gauri-shankar-18:default', 1, 1),
  ('ram-darbar-24', 'media:ram-darbar-24', 'ram-darbar-24:default', 1, 1),
  ('lakshmi-24', 'media:lakshmi-24', 'lakshmi-24:default', 1, 1),
  ('saraswati-18', 'media:saraswati-18', 'saraswati-18:default', 1, 1),
  ('shrinathji-wall-27', 'media:shrinathji-wall-27', 'shrinathji-wall-27:default', 1, 1),
  ('cow-calf-6', 'media:cow-calf-6', 'cow-calf-6:default', 1, 1),
  ('divine-trio-12', 'media:divine-trio-12', 'divine-trio-12:default', 1, 1);
--> statement-breakpoint

PRAGMA optimize;
