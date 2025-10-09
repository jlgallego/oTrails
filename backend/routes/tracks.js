const express = require('express');
const router = express.Router();
const pool = require('../db');
const fs = require('fs');
const path = require('path');

// Tracks
// Listar todos los tracks
// GET	/api/tracks
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tracks');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tracks' });
  }
});

// Crear un track nuevo
// POST	/api/tracks
router.post('/', async (req, res) => {
  const { title, description, geom } = req.body;
  const userId = req.auth.userId;  // From token

  try {
    const query = `
      INSERT INTO tracks (user_id, title, description, geom, created_at, updated_at)
      VALUES ($1, $2, $3, $4::jsonb, NOW(), NOW()) RETURNING *`;
    const values = [userId, title, description, geom];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear track' });
  }
});

// Obtener un track por id
// GET	/api/tracks/{track_id}
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query('SELECT * FROM tracks WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Track no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener track' });
  }
});

// Actualizar un track
// PUT	/api/tracks/{track_id}
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, geom } = req.body;
  try {
    const query = `
      UPDATE tracks SET title = $1, description = $2, geom = $3, updated_at = NOW()
      WHERE id = $4 RETURNING *`;
    const values = [title, description, geom, id];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Track no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar track' });
  }
});

// Borrar un track
// DELETE	/api/tracks/{track_id}
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  // Borrado en BD
  try {
    // Buscar ficheros asociados
    const fileResult = await pool.query('SELECT filepath FROM track_files WHERE track_id = $1', [id]);
    
    // Borrar ficheros físicos
    for(const file of fileResult.rows) {
      const fullPath = path.join(__dirname, file.filepath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // Borrar registros de ficheros asociados
    await pool.query('DELETE FROM track_files WHERE track_id = $1', [id]);

    // Borrar track en BD
    const deleteRes = await pool.query('DELETE FROM tracks WHERE id = $1 RETURNING *', [id]);
    if (deleteRes .rows.length === 0) {
      return res.status(404).json({ error: 'Track no encontrado' });
    }
    
    res.json({ message: 'Track eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al borrar track' });
  }
});

module.exports = router;

