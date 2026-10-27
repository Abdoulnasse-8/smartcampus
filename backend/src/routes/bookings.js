const express = require('express');
const { all, get, run } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const bookings = await all(
      `SELECT b.id, b.user_id, b.room_id, b.date, b.heure_debut, b.heure_fin, b.created_at,
              r.name AS room_name, r.capacity
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
       WHERE b.user_id = ?
       ORDER BY b.date DESC, b.heure_debut DESC`,
      [req.user.id]
    );
    return res.status(200).json(bookings);
  } catch (err) {
    return next(err);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { room_id, date, heure_debut, heure_fin } = req.body;

    if (!room_id || !date || !heure_debut || !heure_fin) {
      return res.status(400).json({ error: 'room_id, date, heure_debut et heure_fin sont requis' });
    }
    if (!DATE_RE.test(date) || !TIME_RE.test(heure_debut) || !TIME_RE.test(heure_fin)) {
      return res.status(400).json({ error: 'Format invalide (AAAA-MM-JJ et HH:MM attendus)' });
    }
    if (heure_fin <= heure_debut) {
      return res.status(400).json({ error: "heure_fin doit être postérieure à heure_debut" });
    }

    const room = await get('SELECT id, name FROM rooms WHERE id = ?', [room_id]);
    if (!room) {
      return res.status(404).json({ error: 'Salle inexistante' });
    }

    const conflict = await get(
      `SELECT id FROM bookings
       WHERE room_id = ? AND date = ?
         AND heure_debut < ? AND heure_fin > ?`,
      [room_id, date, heure_fin, heure_debut]
    );
    if (conflict) {
      return res.status(409).json({ error: 'Créneau déjà réservé pour cette salle' });
    }

    const result = await run(
      'INSERT INTO bookings (user_id, room_id, date, heure_debut, heure_fin) VALUES (?, ?, ?, ?, ?) RETURNING id',
      [req.user.id, room_id, date, heure_debut, heure_fin]
    );

    const booking = await get(
      `SELECT b.id, b.user_id, b.room_id, b.date, b.heure_debut, b.heure_fin, r.name AS room_name
       FROM bookings b JOIN rooms r ON r.id = b.room_id WHERE b.id = ?`,
      [result.lastInsertRowid]
    );

    return res.status(201).json(booking);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
