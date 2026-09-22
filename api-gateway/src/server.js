require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`[api-gateway] running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

const shutdown = (signal) => {
  console.log(`[api-gateway] ${signal} received, shutting down gracefully...`);
  server.close(() => process.exit(0));
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (err) => {
  console.error(`[api-gateway] Unhandled rejection: ${err.message}`);
  process.exit(1);
});
