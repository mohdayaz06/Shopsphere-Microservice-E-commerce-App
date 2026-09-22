# ShopSphere database

Plain MySQL DDL/DML - no ORM migrations.

## Files

- `schema.sql` — creates the `shopsphere` database and every table.
- `seed.sql` — 3 demo users, addresses, 6 categories, 28 realistic products,
  and one completed order + payment so the app doesn't look empty on first
  login.

## Usage

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p shopsphere < database/seed.sql
```

Demo login (all seeded users): password `Password@123`
- `ananya.iyer@example.com`
- `karan.mehta@example.com`
- `sara.thomas@example.com`

## Table ownership (important for your microservices practice)

Even though every service currently points at the same physical MySQL
database, each **table** is conceptually owned by exactly one service, and
only that service's models write to it:

| Table(s)                      | Owning service   |
|--------------------------------|------------------|
| `users`, `addresses`           | user-service     |
| `categories`, `products`       | product-service  |
| `carts`, `cart_items`          | cart-service     |
| `orders`, `order_items`        | order-service    |
| `payments`                     | payment-service  |

Other services never query another service's tables directly — they call
that service's REST API instead (see the "Microservice Communication"
section of each service's README). This is a common intermediate step
between "one shared database" and "one database per service": it keeps
local development simple (one MySQL instance to run) while still enforcing
the service boundaries in code, so splitting into separate databases later
is a config change, not a rewrite.

If you want to practice true database-per-service isolation as part of
your Kubernetes/AWS phase, the natural next step is giving each service
its own schema (or its own RDS instance) and only copying over the tables
it owns.
