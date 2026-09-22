const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');

const services = require('./config/services');
const { aggregatedHealth } = require('./routes/healthRoutes');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());

// The frontend only ever talks to the gateway, so this is the one place
// in the whole system that needs a public-facing CORS policy - every
// individual microservice's CORS_ORIGIN can be locked down to just the
// gateway's own origin (or removed entirely if they're never reached
// directly from a browser).
const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use(limiter);

// Body parsing MUST happen before the proxies below so req.body is
// available if we ever add gateway-level logic that inspects it. Because
// that consumes the request stream, each proxy uses `fixRequestBody` to
// re-serialize req.body onto the outgoing proxied request.
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/healthz', (req, res) => res.status(200).json({ status: 'ok', service: 'api-gateway', uptime: process.uptime() }));
app.get('/healthz/all', aggregatedHealth);

app.get('/api', (req, res) => {
  res.json({
    name: 'ShopSphere API Gateway',
    version: '1.0.0',
    routes: services.map((s) => `${s.pathPrefix} -> ${s.name}`),
  });
});

// One reverse proxy per path prefix, each pointed at its owning service.
// pathRewrite is intentionally absent - every service mounts its own
// routes under the same /api/<resource> prefix the gateway receives, so
// the path is forwarded unchanged (see each service's app.js).
services.forEach(({ pathPrefix, target, name }) => {
  app.use(
    pathPrefix,
    createProxyMiddleware({
      target,
      changeOrigin: true,
      onProxyReq: fixRequestBody,
      onError: (err, req, res) => {
        console.error(`[gateway] Proxy error reaching ${name} (${target}): ${err.message}`);
        res.status(503).json({
          success: false,
          message: `The ${name.replace('-', ' ')} is temporarily unavailable. Please try again shortly.`,
        });
      },
      logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
    })
  );
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `No route matches ${req.originalUrl}` });
});

module.exports = app;
