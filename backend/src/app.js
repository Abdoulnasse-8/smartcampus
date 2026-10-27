const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route inconnue' });
});

// Gestionnaire d'erreurs JSON (express 4 ne rejette pas les promesses seul)
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error(`[ERROR] ${req.method} ${req.originalUrl} -> ${err.message}`);
  return res.status(err.statusCode || 500).json({ error: err.message || 'Erreur serveur' });
});

module.exports = app;
