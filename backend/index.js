require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');

const app = express();


app.use(cors());  // Permite comunicación frontend-backend
app.use(express.json());  // Parsear JSON


const checkJwt = require('./middlewares/auth');



// Routes importadas
const tracksRouter = require('./routes/tracks');
const routesRouter = require('./routes/routes');
const gpxRouter = require('./routes/gpx');
const usersRouter = require('./routes/users');

app.use('/api/users', usersRouter);

// Protege las rutas de tracks y routes con JWT
app.use('/api/tracks', checkJwt, tracksRouter );
app.use('/api/routes', checkJwt, routesRouter );
app.use('/api/gpx', checkJwt, gpxRouter);





// Middleware global para manejo de errores Express
/* app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  res.status(err.status || 500).json({ error: err.message || 'Error interno' });
}); */

if (require.main === module) {
    const port = parseInt(process.env.PORT, 10) || 3000;
    const useHttps = process.env.HTTPS === 'true' || process.env.HTTPS === '1';

    if (useHttps) {
        const certPath = process.env.SSL_CERT_PATH || './ssl/cert.pem';
        const keyPath = process.env.SSL_KEY_PATH || './ssl/key.pem';

        if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
            console.error('HTTPS enabled but SSL_CERT_PATH/SSL_KEY_PATH certificate files not found.');
            process.exit(1);
        }

        const cert = fs.readFileSync(certPath);
        const key = fs.readFileSync(keyPath);

        https.createServer({ key, cert }, app).listen(port, () => {
            console.log(`Servidor backend escuchando en https://localhost:${port}`);
        });
    } else {
        app.listen(port, () => {
            console.log(`Servidor backend escuchando en http://localhost:${port}`);
        });
    }
}

module.exports = app;
