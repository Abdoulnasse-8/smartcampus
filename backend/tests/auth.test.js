/**
 * Tests unitaires de la logique de connexion (Login) - SmartCampus API.
 *
 * ⚠️ SIMULATION D'ÉCHEC CI :
 * Pour faire échouer le pipeline volontairement, modifiez la ligne marquée
 * "[CI-FAIL] ci-dessous (dans le test « login avec identifiants valides »).
 * Exemple : remplacez `expect(res.status).toBe(200)` par `expect(res.status).toBe(500)`.
 */

process.env.DB_PATH = ':memory:';
process.env.DB_DRIVER = 'sqlite';
process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const bcrypt = require('bcryptjs');

const { init, get, close } = require('../src/db');
const app = require('../src/app');
const authService = require('../src/services/authService');

beforeAll(async () => {
  await init();
});

afterAll(async () => {
  await close();
});

describe('POST /api/auth/login', () => {
  test('login avec identifiants valides renvoie un token JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@smartcampus.com', password: 'password123' });

    // [CI-FAIL] ← LIGNE À MODIFIER POUR FAIRE ÉCHOUER LE TEST VOLONTAIREMENT
    expect(res.status).toBe(200);

    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.split('.')).toHaveLength(3);
    expect(res.body.user).toMatchObject({ email: 'admin@smartcampus.com', role: 'admin' });
  });

  test('login avec un mot de passe erroné renvoie 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@smartcampus.com', password: 'mauvais-mdp' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  test('login avec un email inconnu renvoie 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inconnu@smartcampus.com', password: 'password123' });

    expect(res.status).toBe(401);
  });

  test('login avec un body vide renvoie 401', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(401);
  });
});

describe('authService.login (unitaire)', () => {
  test('retourne un token et l\'utilisateur pour un compte seedé', async () => {
    const result = await authService.login('etudiant@smartcampus.com', 'password123');
    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('etudiant@smartcampus.com');
    expect(result.user).not.toHaveProperty('password');
  });

  test('lève InvalidCredentialsError pour un mauvais mot de passe', async () => {
    await expect(authService.login('etudiant@smartcampus.com', 'wrong')).rejects.toThrow(
      authService.InvalidCredentialsError
    );
  });

  test('lève InvalidCredentialsError si le hash bcrypt est vérifié', async () => {
    const row = await get('SELECT password FROM users WHERE email = ?', ['admin@smartcampus.com']);
    expect(bcrypt.compareSync('password123', row.password)).toBe(true);
    expect(bcrypt.compareSync('autre', row.password)).toBe(false);
  });
});
