const request = require('supertest');
const express = require('express');
const app = require('../index'); // importa app
const pool = require('../db');
const path = require('path');

const { v4: uuidv4 } = require('uuid');


describe('API Tracks Endpoints', () => {
  let token;

  beforeAll(async () => {
    // Delete test data first
    await pool.query('DELETE FROM track_files');
    await pool.query('DELETE FROM tracks');
    await pool.query('DELETE FROM route_files');
    await pool.query('DELETE FROM routes');
    await pool.query('DELETE FROM users');
    
    // Generar email único
    const emailUnique = `testuser_${uuidv4()}@example.com`;

    // Registrar y autenticar un usuario para obtener token JWT para rutas protegidas
    const registerRes = await request(app)
      .post('/api/users/register')
      .send({ email: emailUnique, password: '123456' });
 
    if (registerRes.statusCode !== 201) {
        console.error('Error registro usuario:', registerRes.body);
        throw new Error('No se pudo registrar usuario');
    }

    const loginRes = await request(app)
      .post('/api/users/login')
      .send({ email: emailUnique, password: '123456' });

    if (loginRes.statusCode !== 200) {
        console.error('Error login:', loginRes.body);
        throw new Error('No se pudo autenticar usuario');
    }
    token = loginRes.body.token;
    

  });

  afterAll(async () => {
    await pool.end();
  });

  it('Debe subir un archivo GPX para un track nuevo correctamente', async () => {
    const res = await request(app)
      .post(`/api/gpx/upload`)
      .set('Authorization', `Bearer ${token}`)
      .field('type', 'track') // Campo para diferenciar si se crea track o route
      .field('title', 'Track title')
      .field('sport', 'Bike')
      .field('date', '2025-10-07 00:00:00')
      .attach('gpxfile', path.join(__dirname, 'test-data', 'guadalajara.gpx'));
    
    trackId = res.body.trackId;
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Track creado con archivo GPX');
    expect(res.body.file).toHaveProperty('filename');
    expect(res.body.file).toHaveProperty('filepath');

  });


  it('Debe subir un archivo GPX para una route nuevo correctamente', async () => {
    const res = await request(app)
      .post(`/api/gpx/upload`)
      .set('Authorization', `Bearer ${token}`)
      .field('type', 'route') // Campo para diferenciar si se crea track o route
      .field('title', 'Track title')
      .field('sport', 'Bike')
      .attach('gpxfile', path.join(__dirname, 'test-data', 'guadalajara.gpx'));

    routeId = res.body.routeId;
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Ruta creada con archivo GPX');
    expect(res.body.file).toHaveProperty('filename');
    expect(res.body.file).toHaveProperty('filepath');
  });

  it('Debe rechazar archivo sin token', async () => {
    const res = await request(app)
      .post(`/api/gpx/upload`)
      .field('type', 'track') // Campo para diferenciar si se crea track o route
      .field('title', 'Track title')
      .field('sport', 'Bike')
      .attach('gpxfile', path.join(__dirname, 'test-data', 'guadalajara.gpx'));

    expect(res.statusCode).toBe(401);
  });

  it('Debe rechazar archivo no GPX', async () => {
    const res = await request(app)
      .post(`/api/gpx/upload`)
      .set('Authorization', `Bearer ${token}`)
      .field('type', 'track') // Campo para diferenciar si se crea track o route
      .field('title', 'Track title')
      .field('sport', 'Bike')
      .attach('gpxfile', path.join(__dirname, 'test-data', 'not_a_gpx.txt'));

    expect(res.statusCode).toBe(400); 
    expect(res.body).toHaveProperty('error');
  });

  // Test DELETE: Borrar track
  // DELETE	/api/tracks/{track_id}
  it('Debe borrar el track existente y fichero asociado', async () => {
    const res = await request(app)
      .delete(`/api/tracks/${trackId}`)
      .set('Authorization', `Bearer ${token}`);

    expect([200, 204]).toContain(res.statusCode);
  });


  // Test DELETE: Borrar route
  // DELETE	/api/routes/{route_id}
  it('Debe borrar la route existente y fichero asociado', async () => {
    const res = await request(app)
      .delete(`/api/routes/${routeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect([200,204]).toContain(res.statusCode);
  });
});
