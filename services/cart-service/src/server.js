require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5003;

const startServer = async () => {
  await testConnection();

  const server = app.listen(PORT, () => {
    console.log(`[cart-service] running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`[cart-service] ${signal} received, shutting down gracefully...`);
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

process.on('unhandledRejection', (err) => {
  console.error(`[cart-service] Unhandled rejection: ${err.message}`);
  process.exit(1);
});

startServer().catch((err) => {
  console.error(`[cart-service] Failed to start: ${err.message}`);
  process.exit(1);
});
