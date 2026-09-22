# ShopSphere — E-commerce Microservices Platform

A realistic, production-style e-commerce application built for advanced
DevOps practice: 3-tier architecture, microservices backend, AngularJS
frontend, MySQL database.

```
shopsphere/
├── frontend/            AngularJS single-page application (static files)
├── api-gateway/          Single entry point, routes to the 5 microservices
├── services/
│   ├── user-service/      auth, profile, addresses
│   ├── product-service/    catalogue, categories, search, inventory
│   ├── cart-service/       shopping cart (calls product-service)
│   ├── order-service/      checkout orchestration (calls cart/product/payment)
│   └── payment-service/    simulated payment processing
└── database/
    ├── schema.sql
    └── seed.sql
```

No Dockerfiles, Compose files, Kubernetes manifests, Jenkinsfiles, Argo CD
configs, Terraform, or monitoring configs are included, intentionally —
this is meant to be containerized, pipelined, and deployed by you.

---

## 1. Architecture

```
                    USER
                     |
                     v
              AngularJS Frontend  (port 8080)
                     |
                     v
              API Gateway         (port 8000)
                     |
       +-------------+-------------+
       |             |             |
       v             v             v
 User Service   Product Service  Cart Service
  (5001)          (5002)          (5003)
       |             ^               |
       |             |  (verifies    |
       |             |   price/stock)|
       v             |               v
   [users,       [products,      [carts,
    addresses]    categories]     cart_items]
                     ^
                     | (reserve/restock)
                     |
                Order Service ---------> Payment Service
                  (5004)                    (5005)
                     |                         |
                     v                         v
              [orders,                    [payments]
               order_items]

                  All tables live in one MySQL instance,
                  but each table is owned by exactly one
                  service (see database/README.md).
```

The frontend **only** ever talks to the API Gateway. The gateway proxies
each path prefix to the service that owns it. Services call each other
directly over plain REST when they need to (see section 4).

## 2. Setup

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.x

### Database
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p shopsphere < database/seed.sql
```
Demo login (all seeded users): password `Password@123`
- `ananya.iyer@example.com`, `karan.mehta@example.com`, `sara.thomas@example.com`

### Each microservice
Repeat for `user-service`, `product-service`, `cart-service`,
`order-service`, `payment-service`:
```bash
cd services/<name>
cp .env.example .env      # edit DB credentials + JWT_SECRET
npm install
npm run dev                # or: npm start
```

**`JWT_SECRET` must be identical across all five services** — there's no
central auth server; every service independently verifies the same
signed token.

### API Gateway
```bash
cd api-gateway
cp .env.example .env       # point at each service's URL (defaults match local dev)
npm install
npm run dev
```
Check `http://localhost:8000/healthz/all` — it pings every service's
`/healthz` and reports which ones are up.

### Frontend
```bash
cd frontend
npm install                 # also vendors AngularJS/Bootstrap into src/vendor
npm start                   # http://localhost:8080
```
The gateway URL is set in `frontend/src/app/app.config.js`
(`API_BASE_URL` constant) — update it for staging/production.

### Start order for local development
MySQL → all 5 microservices → API Gateway → frontend. Each service logs
its own name and port on startup, which makes it obvious in a multi-pane
terminal (or `npm run dev` in 6 tabs) which one just crashed.

---

## 3. API reference (via the Gateway, prefix `http://localhost:8000/api`)

| Method | Endpoint | Service | Auth | Description |
|--------|-----------|---------|------|-------------|
| POST | `/users/register` | user | Public | Register |
| POST | `/users/login` | user | Public | Login, returns JWT |
| POST | `/users/logout` | user | Yes | Stateless no-op (client discards token) |
| GET | `/users/profile` | user | Yes | Current user |
| PUT | `/users/profile` | user | Yes | Update name/phone |
| GET/POST | `/users/addresses` | user | Yes | List / add address |
| DELETE | `/users/addresses/:id` | user | Yes | Remove address |
| GET | `/products` | product | Public | List, with `search/category/minPrice/maxPrice/sort/page/limit` |
| GET | `/products/search?q=` | product | Public | Full-text search |
| GET | `/products/:id` | product | Public | Detail + related products |
| POST/PUT/DELETE | `/products/:id` | product | Yes | Create/update/discontinue |
| GET | `/categories` | product | Public | List categories |
| GET | `/cart` | cart | Yes | Current user's cart |
| POST | `/cart/items` | cart | Yes | Add item (validates against product-service) |
| PUT | `/cart/items/:productId` | cart | Yes | Update quantity |
| DELETE | `/cart/items/:productId` | cart | Yes | Remove item |
| DELETE | `/cart` | cart | Yes | Clear cart |
| POST | `/orders` | order | Yes | Place order from current cart (the saga - see below) |
| GET | `/orders` | order | Yes | Order history |
| GET | `/orders/:id` | order | Yes | Order detail |
| POST | `/orders/:id/cancel` | order | Yes | Cancel + restock + refund if paid |
| POST | `/payments` | payment | Yes | Process a payment (called by order-service) |
| GET | `/payments/:id` | payment | Yes | Payment detail |
| GET | `/payments/order/:orderId` | payment | Yes | Payments for an order |
| POST | `/payments/:id/refund` | payment | Yes | Refund a successful payment |

## 4. Microservice communication (the part worth understanding well)

**Cart Service → Product Service**: every add-to-cart / quantity-update
call fetches the live product record to verify it's active, has enough
stock, and to read its *current* price — the cart never trusts a
client-supplied price.

**Order Service → Cart Service, Product Service, Payment Service**: this
is the interesting one. `services/order-service/src/services/orderService.js`
implements the checkout flow as a **saga**, not a distributed transaction
(there is no 2-phase commit across three separate service boundaries —
that's the point of microservices owning their own data):

1. Read the cart from Cart Service.
2. Reserve stock in Product Service, one item at a time, tracking what
   succeeded.
3. If any item fails (insufficient stock), **compensate**: restock every
   item already reserved, then fail the whole checkout.
4. Create the order + order_items locally (a normal local DB transaction —
   safe to roll back, since it's all in this service's own tables).
5. Charge the order via Payment Service.
6. If payment fails, **compensate again**: restock every item, mark the
   order `CANCELLED` (not deleted, so there's an audit trail), leave the
   cart intact so the customer can retry with a different payment method.
7. If payment succeeds (or the method is Cash on Delivery), confirm the
   order and clear the cart.

Cancelling a *confirmed* order later follows the same compensating-action
pattern in reverse: restock every item, and refund the payment if one had
succeeded.

This pattern (also called the **choreography-free orchestrated saga**,
since Order Service is the single orchestrator rather than services
reacting to each other's events) is deliberately the simplest version of
"keep multiple services' data consistent without a shared database
transaction." If you want to go further, the natural next step is an
event-driven version using a message broker (Kafka/RabbitMQ) instead of
synchronous REST calls — a good thing to explore once your Kubernetes
deployment is stable.

## 5. Payment simulation

`payment-service` never touches a real payment provider or stores real
card data. `paymentSimulator.js` generates a plausible masked reference
(e.g. `VISA •••• 4242`) and randomly fails a configurable percentage of
attempts (`SIMULATED_FAILURE_RATE` in `.env`, default 5%) so the
frontend's failure-handling UI has something real to exercise. Cash on
Delivery is never "processed" — it's left `PENDING` until delivery.

---

## 6. Suggested DevOps practice path

1. **Local development** (this doc) — get all 5 services + gateway +
   frontend running and talking to each other manually first.
2. **Dockerfiles** — one per service (7 total: frontend, gateway, 5
   microservices), plus running MySQL from the official `mysql:8` image
   with `schema.sql`/`seed.sql` mounted into
   `/docker-entrypoint-initdb.d/`.
3. **Docker networking** — a user-defined bridge network so services can
   reach each other by container name (update each `.env`'s `*_URL` /
   `DB_HOST` to the container name instead of `localhost`).
4. **Docker Hub** — tag and push `shopsphere-frontend`,
   `shopsphere-api-gateway`, `shopsphere-user-service`, etc.
5. **Jenkins CI/CD** — build → test → SonarQube → Trivy → push → deploy,
   per service.
6. **Kubernetes** — a Deployment + Service per microservice, a
   StatefulSet + PVC for MySQL, an Ingress in front of the gateway (or
   the frontend, with the gateway as a ClusterIP), ConfigMaps/Secrets for
   every `.env` value, and liveness/readiness probes against each
   service's `/healthz`.
7. **AWS/EKS** — worker nodes, VPC, IAM, an AWS Load Balancer Controller
   for the Ingress.
8. **Argo CD / GitOps** — once your K8s manifests live in a repo.
9. **Prometheus + Grafana** — service health, request rates/latency
   (consider adding `prom-client` to each service for custom metrics),
   Kubernetes resource usage.

Every service's `/healthz` endpoint and the gateway's `/healthz/all`
aggregator exist specifically to give your monitoring and Kubernetes
probes something real to check.
