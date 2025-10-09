// File handling
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Carpeta base para almacenar GPX (debe existir)
const BASE_GPX_DIR = path.join(__dirname, 'data', 'gpx');
const upload = multer({ dest: BASE_GPX_DIR });

function uploadErrorHandler(req, res, next) {
  const uploadSingle = upload.single('gpxfile');
  uploadSingle(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // Error específico de multer, responde JSON con error
      return res.status(400).json({ error: err.message });
    } else if (err) {
      // Error genérico desde multer u otro middleware
      return res.status(400).json({ error: err.message });
    }
    // Si no hay error, continuar con siguiente middleware/handler
    next();
  });
}

module.exports = uploadErrorHandler;
