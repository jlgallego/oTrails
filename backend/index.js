require('dotenv').config();

const express = require('express');
const cors = require('cors');

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
    app.listen(process.env.PORT, () => {
        console.log(`Servidor backend escuchando en http://localhost:${process.env.PORT}`);
    });
}

module.exports = app;
