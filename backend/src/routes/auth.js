const express = require('express');
const authService = require('../services/authService');

const router = express.Router();

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const result = authService.login(email, password);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
});

module.exports = router;
