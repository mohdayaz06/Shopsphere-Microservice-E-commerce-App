const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const addressRoutes = require('./routes/addressRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
  })
);

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'user-service', uptime: process.uptime() });
});

// Routes are mounted under /api/users so the API Gateway can proxy
// /api/users/* straight through to this service with no path rewriting.
app.use('/api/users', authRoutes);
app.use('/api/users/addresses', addressRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
