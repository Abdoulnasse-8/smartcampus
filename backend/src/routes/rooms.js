const express = require('express');
const { all } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const rooms = await all('SELECT id, name, capacity FROM rooms ORDER BY name');
    return res.status(200).json(rooms);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
