const axios = require('axios');
const services = require('../config/services');

/**
 * Pings every unique downstream service's /healthz endpoint in parallel
 * and reports back a combined status. Handy for a quick "is everything
 * up" check during local development, and a natural thing to wire a
 * Kubernetes readiness probe or a Grafana panel to later.
 */
const aggregatedHealth = async (req, res) => {
  const uniqueServices = [...new Map(services.map((s) => [s.name, s])).values()];

  const results = await Promise.all(
    uniqueServices.map(async (service) => {
      try {
        const response = await axios.get(`${service.target}/healthz`, { timeout: 3000 });
        return { service: service.name, status: 'up', detail: response.data };
      } catch (error) {
        return { service: service.name, status: 'down', error: error.message };
      }
    })
  );

  const allUp = results.every((r) => r.status === 'up');
  res.status(allUp ? 200 : 503).json({
    status: allUp ? 'ok' : 'degraded',
    gateway: 'up',
    services: results,
  });
};

module.exports = { aggregatedHealth };
