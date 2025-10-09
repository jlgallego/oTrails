const express = require('express');
const router = express.Router();
const uploadErrorHandler = require('../upload');
const pool = require('../db');
const fs = require('fs');
const path = require('path');
const { DOMParser } = require('xmldom');
const toGeoJSON = require('@tmcw/togeojson');


// Endpoint para recibir archivo GPX para nuevo track o ruta, según tipo
// POST	/api/gpx/upload
router.post('/upload', uploadErrorHandler, async (req, res) => {
  
  try {
    const { type, title, sport, date } = req.body;
    const userId = req.auth.userId;  // From token

    // Confirma que llegó el archivo
    if (!req.file) {
      return res.status(400).json({ error: 'Archivo GPX no enviado' });
    }
    
    // Confirma que se informó el tipo (route | track)
    if (!['route', 'track'].includes(type)) {
      return res.status(400).json({ error: 'type debe ser route o track' });
    }

    if (req.file.mimetype !== 'application/gpx+xml' && req.file.mimetype !== 'application/xml' && req.file.mimetype !== 'text/xml') {
        return res.status(400).json({ error: 'El archivo no es un GPX válido.' });
    }
    // Leer archivo GPX y parsear a GeoJSON
    const gpxPath = req.file.path;
    const gpxXml = fs.readFileSync(gpxPath, 'utf8');
    const gpxDom = new DOMParser().parseFromString(gpxXml);
    const geojson = toGeoJSON.gpx(gpxDom);

    // Extraer primer LineString del GeoJSON
    const lineFeature = geojson.features.find(f => f.geometry.type === 'LineString');
    if (!lineFeature) {
      return res.status(400).json({ error: 'El archivo GPX no contiene geometría LineString' });
    }
    const geom = lineFeature.geometry;

    // Construir datos comunes para archivos
    const filename = req.file.filename; // nombre generado por multer
    const fileUrl = path.relative(__dirname, req.file.path); // ruta relativa

    if (type === 'track') {
      // Insertar track con referencia archivo en track_files

      // Parsear fecha del GPX si puedes (simplificado: toma fecha actual si no hay fecha)
      let dateObj = date ? new Date(date) : new Date();
     
      const trackQuery = `
        INSERT INTO tracks (user_id, title, sport, geom, activity_date)
        VALUES ($1,$2,$3,$4,$5) RETURNING *`;
      const trackValues  = [userId, title, sport, geom, dateObj];

      const trackResult = await pool.query(trackQuery, trackValues );
      const trackId = trackResult.rows[0].id;

      // Guardar referencia archivo
      const fileTrackQuery = `
        INSERT INTO track_files (track_id, filename, filepath, content_type) 
        VALUES ($1, $2, $3, $4) RETURNING *`;
      const fileTrackValues = [trackId, filename, fileUrl, req.file.mimetype];
      const fileTrackResult = await pool.query(fileTrackQuery, fileTrackValues);

      res.status(201).json({
        message: 'Track creado con archivo GPX',
        trackId,
        file: fileTrackResult.rows[0]
      });


    } else if (type === 'route') {
      // Insertar ruta con referencia archivo en route_files
      const routeQuery = `
        INSERT INTO routes (user_id, title, sport, geom) 
        VALUES ($1, $2, $3, $4) RETURNING id`;
      const routeValues = [userId, title, sport, geom];
      const routeResult = await pool.query(routeQuery, routeValues);
      const routeId = routeResult.rows[0].id;

      // Guardar referencia archivo
      const fileRouteQuery = `
        INSERT INTO route_files (route_id, filename, filepath, content_type) 
        VALUES ($1, $2, $3, $4) RETURNING *`;
      const fileRouteValues = [routeId, filename, fileUrl, req.file.mimetype];
      const fileRouteResult = await pool.query(fileRouteQuery, fileRouteValues);

      res.status(201).json({
        message: 'Ruta creada con archivo GPX',
        routeId,
        file: fileRouteResult.rows[0]
      });
    }
  } catch (error) {
    console.error('Error importando GPX:', error);
    res.status(500).json({ error: 'Error interno al importar GPX' });
  }

});

module.exports = router;
