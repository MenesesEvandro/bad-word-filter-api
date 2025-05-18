const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Importa o app real
const app = require('../app');
app.use(bodyParser.json());

describe('API Filtro de Palavras', () => {
  test('Substitui palavrão por caractere (GET)', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'isso é merda', lang: 'pt-br', fill_char: '#' });
    expect(res.status).toBe(200);
    expect(res.body.filtered_text).toMatch(/#+/);
    expect(res.body.isFiltered).toBe(true);
    expect(res.body.words_found).toContain('merda');
  });

  test('Substitui palavrão por palavra fixa (GET)', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'isso é merda', lang: 'pt-br', fill_word: 'oculto' });
    expect(res.status).toBe(200);
    expect(res.body.filtered_text).toContain('oculto');
    expect(res.body.isFiltered).toBe(true);
  });

  test('Substitui palavrão por caractere (POST)', async () => {
    const res = await request(app)
      .post('/filter')
      .send({ text: 'isso é merda', lang: 'pt-br', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.filtered_text).toMatch(/\*+/);
    expect(res.body.isFiltered).toBe(true);
  });

  test('Ignora acentuação', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'merdao', lang: 'pt-br', fill_char: '#' });
    expect(res.status).toBe(200);
    expect(res.body.isFiltered).toBe(true);
  });

  test('Filtra em inglês', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'this is bullshit', lang: 'en-us', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.isFiltered).toBe(true);
    expect(res.body.words_found).toContain('bullshit');
  });

  test('Filtra em espanhol', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'esto es mierda', lang: 'es-es', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.isFiltered).toBe(true);
    expect(res.body.words_found).toContain('mierda');
  });

  test('Filtra palavras extras', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'banana laranja', extras: 'banana,laranja', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.isFiltered).toBe(true);
    expect(res.body.words_found).toContain('banana');
    expect(res.body.words_found).toContain('laranja');
  });

  test('Limita extras a 10 palavras', async () => {
    const extras = Array.from({ length: 15 }, (_, i) => `palavra${i}`).join(',');
    const res = await request(app)
      .get('/filter')
      .query({ text: 'palavra0 palavra10', extras, fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.extra_words.length).toBeLessThanOrEqual(10);
  });

  test('Retorna erro se text não for enviado', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ lang: 'pt-br', fill_char: '*' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('Retorna erro se text não for string', async () => {
    const res = await request(app)
      .post('/filter')
      .send({ text: 123, lang: 'pt-br', fill_char: '*' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});