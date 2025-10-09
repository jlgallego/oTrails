const express = require('express');
const router = express.Router();
const pool = require('../db');


// Routes
// Listar todas las routes
// GET	/api/routes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM routes');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener routes' });
  }
});

// Crear una routes nueva
// POST	/api/routes
router.post('/', async (req, res) => {
  const { title, description, geom } = req.body;
  const userId = req.auth.userId;  // From token

  try {
    const query = `
      INSERT INTO routes (user_id, title, description, geom, created_at, updated_at)
      VALUES ($1, $2, $3, $4::jsonb, NOW(), NOW()) RETURNING *`;
    const values = [userId, title, description, geom];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear route' });
  }
});

// Obtener una route por id
// GET	/api/routes/{route_id}
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query('SELECT * FROM routes WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener route' });
  }
});

// Actualizar una route
// PUT	/api/routes/{route_id}
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, geom } = req.body;
  try {
    const query = `
      UPDATE routes SET title = $1, description = $2, geom = $3, updated_at = NOW()
      WHERE id = $4 RETURNING *`;
    const values = [title, description, geom, id];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar route' });
  }
});

// Borrar una route
// DELETE	/api/routes/{route_id}
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query('DELETE FROM routes WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Route no encontrada' });
    }
    res.json({ message: 'route eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al borrar route' });
  }
});

module.exports = router;

