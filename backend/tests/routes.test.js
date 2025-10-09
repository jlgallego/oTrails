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

  // POST	/api/routes
  it('Debería crear una nueva route', async () => {
    const res = await request(app)
      .post('/api/routes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Route Test',
        description: 'Descripción test',
        geom: { type: 'LineString', coordinates: [[-3.7, 40.4], [-3.6, 40.5]] }
      });

    if (res.statusCode !== 201) {
        console.error('Error response:', res.text);
    }

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Route Test');
    routeId = res.body.id;
  });

  // GET	/api/routes
  it('Debería listar routes', async () => {
    const res = await request(app)
      .get('/api/routes')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  //GET	/api/routes/{route_id}
  it('Debe devolver la route correspondiente al ID', async () => {
    const res = await request(app)
      .get(`/api/routes/${routeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', routeId);
    expect(res.body).toHaveProperty('title', 'Route Test');
    expect(res.body).toHaveProperty('description', 'Descripción test');
  });

  // Test PUT: Actualizar route
  // PUT	/api/routes/{route_id}
  it('Debería actualizar una route por su ID', async () => {
    const res = await request(app)
      .put(`/api/routes/${routeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Route Actualizada',
        description: 'Actualizada descripción',
        geom: { type: 'LineString', coordinates: [[-3.8, 40.5], [-3.7, 40.6]] }
      });

    if (res.statusCode !== 200 && res.statusCode !== 201) {
      console.error('Error response:', res.text);
    }

    expect([200,201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('id', routeId);
    expect(res.body.title).toBe('Route Actualizada');

  });

  // Test DELETE: Borrar route
  // DELETE	/api/routes/{route_id}
  it('Debe borrar la route existente', async () => {
    const res = await request(app)
      .delete(`/api/routes/${routeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect([200,204]).toContain(res.statusCode);
  });
});
