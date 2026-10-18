const express = require('express');
const { db } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const rooms = db.prepare('SELECT id, name, capacity FROM rooms ORDER BY name').all();
  return res.status(200).json(rooms);
});

module.exports = router;
