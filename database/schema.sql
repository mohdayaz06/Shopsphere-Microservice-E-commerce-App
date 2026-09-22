-- =========================================================================
-- ShopSphere - E-commerce Platform
-- MySQL schema (shared database, accessed independently by each microservice
-- using its own connection pool - see database/README.md for the rationale)
--
-- Run against a fresh database:
--   mysql -u root -p < database/schema.sql
-- =========================================================================

CREATE DATABASE IF NOT EXISTS shopsphere
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE shopsphere;

-- -------------------------------------------------------------------------
-- users  (owned by user-service)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name       VARCHAR(120)        NOT NULL,
  email           VARCHAR(150)        NOT NULL,
  phone           VARCHAR(20)         NULL,
  password_hash   VARCHAR(255)        NOT NULL,
  status          ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
  created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------
-- addresses  (owned by user-service)
-- A user can store multiple shipping addresses; one is marked default.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED     NOT NULL,
  label           VARCHAR(50)         NOT NULL DEFAULT 'Home',
  line1           VARCHAR(150)        NOT NULL,
  line2           VARCHAR(150)        NULL,
  city            VARCHAR(80)         NOT NULL,
  state           VARCHAR(80)         NOT NULL,
  postal_code     VARCHAR(20)         NOT NULL,
  country         VARCHAR(60)         NOT NULL DEFAULT 'India',
  is_default      TINYINT(1)          NOT NULL DEFAULT 0,
  created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_addresses_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- -------------------------------------------------------------------------
-- categories  (owned by product-service)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(60)         NOT NULL,
  slug            VARCHAR(60)         NOT NULL,
  description     VARCHAR(255)        NULL,
  CONSTRAINT uq_categories_slug UNIQUE (slug)
) ENGINE=InnoDB;

-- -------------------------------------------------------------------------
-- products  (owned by product-service)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_id       INT UNSIGNED      NOT NULL,
  name              VARCHAR(150)      NOT NULL,
  slug              VARCHAR(170)      NOT NULL,
  description       TEXT              NULL,
  brand             VARCHAR(80)       NULL,
  price             DECIMAL(10,2)     NOT NULL,
  discount_percent  DECIMAL(5,2)      NOT NULL DEFAULT 0.00,
  image_url         VARCHAR(500)      NOT NULL,
  rating             DECIMAL(2,1)      NOT NULL DEFAULT 0.0,
  rating_count       INT UNSIGNED      NOT NULL DEFAULT 0,
  stock_quantity     INT UNSIGNED      NOT NULL DEFAULT 0,
  specifications     JSON              NULL,
  is_featured        TINYINT(1)        NOT NULL DEFAULT 0,
  is_new_arrival     TINYINT(1)        NOT NULL DEFAULT 0,
  status             ENUM('active', 'discontinued') NOT NULL DEFAULT 'active',
  created_at         TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                        ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_products_slug UNIQUE (slug),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT chk_products_price CHECK (price >= 0),
  CONSTRAINT chk_products_discount CHECK (discount_percent BETWEEN 0 AND 100)
) ENGINE=InnoDB;

CREATE INDEX idx_products_category ON products(category_id);
CREATE FULLTEXT INDEX idx_products_search ON products(name, description, brand);

-- -------------------------------------------------------------------------
-- carts / cart_items  (owned by cart-service)
-- One open cart per user. Cart items snapshot the unit price at the time
-- they were added, so cart totals stay stable even if the product price
-- later changes (product-service remains the source of truth for "current"
-- price, which the cart re-validates against on checkout).
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carts (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         BIGINT UNSIGNED     NOT NULL,
  created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_carts_user UNIQUE (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cart_items (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_id         BIGINT UNSIGNED     NOT NULL,
  product_id      BIGINT UNSIGNED     NOT NULL,
  product_name    VARCHAR(150)        NOT NULL,
  unit_price      DECIMAL(10,2)       NOT NULL,
  image_url       VARCHAR(500)        NULL,
  quantity        INT UNSIGNED        NOT NULL DEFAULT 1,
  created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_cart_items_cart_product UNIQUE (cart_id, product_id),
  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id) REFERENCES carts(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_cart_items_quantity CHECK (quantity > 0)
) ENGINE=InnoDB;

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);

-- -------------------------------------------------------------------------
-- orders / order_items  (owned by order-service)
-- Order items are a permanent snapshot of what was purchased (name, price
-- at time of sale) - they must NOT change even if the product catalogue
-- changes later.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id             BIGINT UNSIGNED   NOT NULL,
  status              ENUM('PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED')
                                          NOT NULL DEFAULT 'PENDING',
  payment_status      ENUM('PENDING','PROCESSING','SUCCESS','FAILED','REFUNDED')
                                          NOT NULL DEFAULT 'PENDING',
  subtotal            DECIMAL(10,2)     NOT NULL,
  tax                 DECIMAL(10,2)     NOT NULL DEFAULT 0.00,
  shipping_cost       DECIMAL(10,2)     NOT NULL DEFAULT 0.00,
  total               DECIMAL(10,2)     NOT NULL,
  shipping_full_name  VARCHAR(120)      NOT NULL,
  shipping_phone      VARCHAR(20)       NOT NULL,
  shipping_line1      VARCHAR(150)      NOT NULL,
  shipping_line2      VARCHAR(150)      NULL,
  shipping_city       VARCHAR(80)       NOT NULL,
  shipping_state      VARCHAR(80)       NOT NULL,
  shipping_postal_code VARCHAR(20)      NOT NULL,
  shipping_country    VARCHAR(60)       NOT NULL DEFAULT 'India',
  created_at          TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                          ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_orders_user_id ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id        BIGINT UNSIGNED     NOT NULL,
  product_id      BIGINT UNSIGNED     NOT NULL,
  product_name    VARCHAR(150)        NOT NULL,
  image_url       VARCHAR(500)        NULL,
  unit_price      DECIMAL(10,2)       NOT NULL,
  quantity        INT UNSIGNED        NOT NULL,
  subtotal        DECIMAL(10,2)       NOT NULL,
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- -------------------------------------------------------------------------
-- payments  (owned by payment-service)
-- Simulated payments only - no real card data is ever stored, only a
-- masked reference (e.g. last 4 digits) for display purposes.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id          BIGINT UNSIGNED   NOT NULL,
  user_id           BIGINT UNSIGNED   NOT NULL,
  amount            DECIMAL(10,2)     NOT NULL,
  method            ENUM('CARD','UPI','NET_BANKING','COD') NOT NULL,
  status            ENUM('PENDING','PROCESSING','SUCCESS','FAILED','REFUNDED')
                                        NOT NULL DEFAULT 'PENDING',
  masked_reference  VARCHAR(40)       NULL,
  failure_reason    VARCHAR(255)      NULL,
  transaction_ref   VARCHAR(36)       NOT NULL,
  created_at        TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP
                                        ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_payments_transaction_ref UNIQUE (transaction_ref),
  CONSTRAINT chk_payments_amount CHECK (amount >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
