-- =========================================================================
-- ShopSphere - Sample / seed data
-- All demo users share the password: Password@123
-- Run after schema.sql:  mysql -u root -p shopsphere < database/seed.sql
-- =========================================================================

USE shopsphere;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE payments;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE carts;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE addresses;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------------------------
-- Users (password for all: Password@123)
-- -------------------------------------------------------------------------
INSERT INTO users (id, full_name, email, phone, password_hash, status) VALUES
  (1, 'Ananya Iyer',   'ananya.iyer@example.com',   '+91-98765-11111', '$2b$10$8LQTV/gSPj3HAz1HTHTwR.G1GJc8PXhDbx60YH41Hrhr3dISjjIUi', 'active'),
  (2, 'Karan Mehta',   'karan.mehta@example.com',   '+91-98765-22222', '$2b$10$8LQTV/gSPj3HAz1HTHTwR.G1GJc8PXhDbx60YH41Hrhr3dISjjIUi', 'active'),
  (3, 'Sara Thomas',   'sara.thomas@example.com',   '+91-98765-33333', '$2b$10$8LQTV/gSPj3HAz1HTHTwR.G1GJc8PXhDbx60YH41Hrhr3dISjjIUi', 'active');

INSERT INTO addresses (user_id, label, line1, line2, city, state, postal_code, country, is_default) VALUES
  (1, 'Home', '221 MG Road', 'Flat 4B', 'Bengaluru', 'Karnataka', '560001', 'India', 1),
  (2, 'Home', '18 Linking Road', NULL, 'Mumbai', 'Maharashtra', '400050', 'India', 1),
  (3, 'Office', '77 Anna Salai', '3rd Floor', 'Chennai', 'Tamil Nadu', '600002', 'India', 1);

-- -------------------------------------------------------------------------
-- Categories
-- -------------------------------------------------------------------------
INSERT INTO categories (id, name, slug, description) VALUES
  (1, 'Electronics',     'electronics',      'Phones, laptops, audio, and smart devices'),
  (2, 'Fashion',         'fashion',          'Clothing and footwear for everyone'),
  (3, 'Home & Kitchen',  'home-kitchen',     'Appliances and essentials for the home'),
  (4, 'Accessories',     'accessories',      'Bags, watches, and everyday carry'),
  (5, 'Sports & Fitness','sports-fitness',   'Gear for training and outdoor activity'),
  (6, 'Beauty',          'beauty',           'Skincare, haircare, and personal care');

-- -------------------------------------------------------------------------
-- Products (28 items across 6 categories)
-- -------------------------------------------------------------------------
INSERT INTO products
  (category_id, name, slug, description, brand, price, discount_percent, image_url, rating, rating_count, stock_quantity, specifications, is_featured, is_new_arrival) VALUES

-- Electronics
(1, 'AuraSound Wireless Earbuds Pro', 'aurasound-wireless-earbuds-pro', 'Active noise cancellation, 30-hour battery life with the charging case, and IPX5 sweat resistance.', 'AuraSound', 4999.00, 20.00, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600', 4.5, 1284, 86, JSON_OBJECT('Battery Life','30 hrs','Bluetooth','5.3','Water Resistance','IPX5'), 1, 0),
(1, 'Nimbus 6 Smartphone 128GB', 'nimbus-6-smartphone-128gb', '6.5-inch AMOLED display, triple camera system, and all-day battery in a lightweight aluminum body.', 'Nimbus', 24999.00, 12.00, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600', 4.3, 942, 42, JSON_OBJECT('Storage','128GB','RAM','8GB','Display','6.5in AMOLED'), 1, 1),
(1, 'FlexBook Air 14" Laptop', 'flexbook-air-14-laptop', 'Ultra-thin laptop with a 14-inch display, all-day battery, and enough power for everyday work and browsing.', 'FlexBook', 54999.00, 8.00, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600', 4.6, 511, 19, JSON_OBJECT('CPU','8-core','RAM','16GB','Storage','512GB SSD'), 1, 0),
(1, 'PixelView 27" 4K Monitor', 'pixelview-27-4k-monitor', 'Color-accurate 4K IPS monitor for creative work and productivity, with slim bezels and a stable stand.', 'PixelView', 21999.00, 15.00, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600', 4.4, 328, 24, JSON_OBJECT('Resolution','3840x2160','Panel','IPS','Refresh Rate','60Hz'), 0, 0),
(1, 'Vortex Mechanical Keyboard', 'vortex-mechanical-keyboard', 'Hot-swappable mechanical keyboard with per-key RGB lighting and a durable aluminum frame.', 'Vortex', 3499.00, 10.00, 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600', 4.5, 677, 58, JSON_OBJECT('Switches','Hot-swap','Backlight','RGB','Connectivity','USB-C'), 0, 1),
(1, 'Halo Smartwatch Series 3', 'halo-smartwatch-series-3', 'Track workouts, sleep, and heart rate with a bright always-on display and 7-day battery life.', 'Halo', 6999.00, 18.00, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600', 4.2, 803, 65, JSON_OBJECT('Battery Life','7 days','Display','AMOLED','Water Resistance','5ATM'), 1, 0),
(1, 'SonicWave Bluetooth Speaker', 'sonicwave-bluetooth-speaker', 'Portable speaker with rich bass, 12-hour playtime, and a rugged waterproof shell for outdoor use.', 'SonicWave', 2799.00, 22.00, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600', 4.3, 559, 91, JSON_OBJECT('Battery Life','12 hrs','Water Resistance','IPX7','Output','20W'), 0, 0),
(1, 'CoreTab 10" Tablet 64GB', 'coretab-10-tablet-64gb', 'A versatile 10-inch tablet for streaming, reading, and light productivity, with a crisp full-HD display.', 'CoreTab', 15999.00, 10.00, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600', 4.1, 244, 33, JSON_OBJECT('Storage','64GB','Display','10in FHD','Battery','8000mAh'), 0, 1),

-- Fashion
(2, 'Classic Fit Oxford Shirt', 'classic-fit-oxford-shirt', 'Breathable cotton oxford shirt with a tailored fit, perfect for both office and weekend wear.', 'Northfield', 1299.00, 25.00, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600', 4.3, 412, 120, JSON_OBJECT('Material','100% Cotton','Fit','Classic','Care','Machine wash'), 1, 0),
(2, 'Urban Runner Sneakers', 'urban-runner-sneakers', 'Lightweight everyday sneakers with cushioned soles and breathable mesh uppers.', 'Strydr', 3299.00, 15.00, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 4.6, 985, 74, JSON_OBJECT('Material','Mesh/Rubber','Closure','Lace-up','Style','Low-top'), 1, 1),
(2, 'Slim Straight Denim Jeans', 'slim-straight-denim-jeans', 'Stretch denim with a slim-straight cut that stays comfortable through a full day of wear.', 'Northfield', 1899.00, 20.00, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600', 4.2, 356, 98, JSON_OBJECT('Material','98% Cotton, 2% Elastane','Fit','Slim Straight'), 0, 0),
(2, 'Everyday Zip Hoodie', 'everyday-zip-hoodie', 'Fleece-lined zip hoodie with a relaxed fit, ideal for cool mornings and evening walks.', 'Basecamp', 1699.00, 18.00, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', 4.4, 289, 140, JSON_OBJECT('Material','Cotton Fleece','Fit','Relaxed'), 0, 1),
(2, 'Summer Floral Maxi Dress', 'summer-floral-maxi-dress', 'Flowy floral maxi dress in breathable viscose, designed for warm-weather comfort and style.', 'Meadow & Co', 2199.00, 30.00, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600', 4.5, 401, 66, JSON_OBJECT('Material','Viscose','Length','Maxi'), 1, 0),
(2, 'Performance Polo Tee', 'performance-polo-tee', 'Moisture-wicking polo shirt that moves with you, on the course or around town.', 'Strydr', 999.00, 12.00, 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600', 4.1, 178, 155, JSON_OBJECT('Material','Polyester Blend','Fit','Regular'), 0, 0),

-- Home & Kitchen
(3, 'BrewMaster Drip Coffee Maker', 'brewmaster-drip-coffee-maker', 'Programmable 12-cup coffee maker with a thermal carafe that keeps coffee hot for hours.', 'BrewMaster', 3499.00, 15.00, 'https://images.unsplash.com/photo-1608354580875-30bd4168b425?w=600', 4.4, 620, 47, JSON_OBJECT('Capacity','12 cups','Carafe','Thermal','Programmable','Yes'), 1, 0),
(3, 'AeroChef Air Fryer 5L', 'aerochef-air-fryer-5l', 'Oil-free frying with rapid air circulation, a 5-liter basket, and 8 preset cooking modes.', 'AeroChef', 5499.00, 20.00, 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600', 4.7, 1102, 53, JSON_OBJECT('Capacity','5L','Presets','8','Power','1500W'), 1, 1),
(3, 'CloudNine Memory Foam Pillow', 'cloudnine-memory-foam-pillow', 'Contoured memory foam pillow that supports proper neck alignment for a better night''s sleep.', 'CloudNine', 1299.00, 25.00, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=600', 4.3, 512, 88, JSON_OBJECT('Material','Memory Foam','Cover','Removable, washable'), 0, 0),
(3, 'PureAir HEPA Air Purifier', 'pureair-hepa-air-purifier', 'True HEPA filtration for rooms up to 400 sq ft, with quiet operation and a filter-change indicator.', 'PureAir', 8999.00, 10.00, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600', 4.5, 366, 21, JSON_OBJECT('Coverage','400 sq ft','Filter','True HEPA'), 0, 1),
(3, 'Nonstick Cookware Set (5-Piece)', 'nonstick-cookware-set-5-piece', 'A complete 5-piece nonstick cookware set with heat-resistant handles, oven-safe up to 250°C.', 'HomeCraft', 4299.00, 22.00, 'https://images.unsplash.com/photo-1584990347449-a2d4c2ba21f4?w=600', 4.2, 289, 39, JSON_OBJECT('Pieces','5','Oven Safe','Up to 250C'), 0, 0),
(3, 'LumaGlow LED Desk Lamp', 'lumaglow-led-desk-lamp', 'Adjustable LED desk lamp with 5 brightness levels and a USB charging port built into the base.', 'LumaGlow', 1499.00, 18.00, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600', 4.4, 233, 112, JSON_OBJECT('Brightness Levels','5','USB Port','Yes'), 0, 0),

-- Accessories
(4, 'Voyager Leather Backpack', 'voyager-leather-backpack', 'Full-grain leather backpack with a padded 15-inch laptop sleeve and multiple organizer pockets.', 'Voyager', 3999.00, 15.00, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600', 4.6, 478, 44, JSON_OBJECT('Material','Full-grain leather','Laptop Sleeve','15in'), 1, 0),
(4, 'Chrono Classic Analog Watch', 'chrono-classic-analog-watch', 'Stainless steel analog watch with a minimalist face and genuine leather strap.', 'Chrono', 4499.00, 20.00, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600', 4.5, 601, 37, JSON_OBJECT('Case','Stainless Steel','Strap','Leather','Water Resistance','3ATM'), 1, 1),
(4, 'Horizon Polarized Sunglasses', 'horizon-polarized-sunglasses', 'UV400 polarized sunglasses with a lightweight frame that stays comfortable all day.', 'Horizon', 1799.00, 25.00, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', 4.3, 342, 96, JSON_OBJECT('Lens','Polarized UV400','Frame','Acetate'), 0, 0),
(4, 'EverydayCarry Canvas Tote', 'everydaycarry-canvas-tote', 'Durable canvas tote bag with reinforced stitching, ideal for daily errands and light travel.', 'EverydayCarry', 899.00, 10.00, 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600', 4.1, 165, 130, JSON_OBJECT('Material','Canvas','Capacity','18L'), 0, 1),

-- Sports & Fitness
(5, 'FlexFit Adjustable Dumbbell Set', 'flexfit-adjustable-dumbbell-set', 'Space-saving adjustable dumbbells from 2.5kg to 24kg per hand, with a quick-turn dial system.', 'FlexFit', 8999.00, 12.00, 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=600', 4.6, 388, 18, JSON_OBJECT('Range','2.5-24kg','Mechanism','Dial'), 1, 0),
(5, 'TrailBlazer Running Shoes', 'trailblazer-running-shoes', 'Responsive cushioning and a grippy outsole built for daily training runs on road or trail.', 'TrailBlazer', 4299.00, 18.00, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600', 4.5, 720, 62, JSON_OBJECT('Cushioning','High','Outsole','Rubber grip'), 1, 1),
(5, 'ZenFlow Yoga Mat 6mm', 'zenflow-yoga-mat-6mm', 'Extra-cushioned 6mm yoga mat with a non-slip surface, includes a carrying strap.', 'ZenFlow', 1299.00, 20.00, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600', 4.4, 455, 105, JSON_OBJECT('Thickness','6mm','Material','TPE'), 0, 0),
(5, 'HydroFlask Insulated Bottle 1L', 'hydroflask-insulated-bottle-1l', 'Double-wall vacuum insulated bottle that keeps drinks cold for 24 hours or hot for 12.', 'HydroFlask', 1499.00, 8.00, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600', 4.7, 892, 140, JSON_OBJECT('Capacity','1L','Insulation','Double-wall vacuum'), 0, 0),

-- Beauty
(6, 'RadiantGlow Vitamin C Serum', 'radiantglow-vitamin-c-serum', 'Brightening serum with 15% vitamin C and hyaluronic acid to even skin tone and boost hydration.', 'RadiantGlow', 899.00, 15.00, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600', 4.5, 634, 154, JSON_OBJECT('Volume','30ml','Key Ingredient','15% Vitamin C'), 1, 1),
(6, 'SilkStrand Argan Hair Oil', 'silkstrand-argan-hair-oil', 'Lightweight argan oil blend that tames frizz and adds shine without weighing hair down.', 'SilkStrand', 649.00, 10.00, 'https://images.unsplash.com/photo-1585232351009-aa87416fca90?w=600', 4.3, 298, 178, JSON_OBJECT('Volume','100ml','Key Ingredient','Argan Oil'), 0, 0);

-- -------------------------------------------------------------------------
-- A completed order + payment so "Order History" isn't empty on first login
-- -------------------------------------------------------------------------
INSERT INTO orders
  (id, user_id, status, payment_status, subtotal, tax, shipping_cost, total,
   shipping_full_name, shipping_phone, shipping_line1, shipping_line2, shipping_city, shipping_state, shipping_postal_code, shipping_country, created_at)
VALUES
  (1, 1, 'DELIVERED', 'SUCCESS', 7998.00, 400.00, 0.00, 8398.00,
   'Ananya Iyer', '+91-98765-11111', '221 MG Road', 'Flat 4B', 'Bengaluru', 'Karnataka', '560001', 'India', '2026-08-01 10:15:00');

INSERT INTO order_items (order_id, product_id, product_name, image_url, unit_price, quantity, subtotal) VALUES
  (1, 6, 'Halo Smartwatch Series 3', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600', 5739.18, 1, 5739.18),
  (1, 7, 'SonicWave Bluetooth Speaker', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600', 2183.22, 1, 2183.22);

INSERT INTO payments (order_id, user_id, amount, method, status, masked_reference, transaction_ref) VALUES
  (1, 1, 8398.00, 'CARD', 'SUCCESS', 'VISA •••• 4242', UUID());
