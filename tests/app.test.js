const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Import the real app
const app = require('../app');
app.use(bodyParser.json());

describe('Bad Word Filter API', () => {
  test('Replaces profanity with character (GET)', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'this is bullshit', lang: 'en-us', fill_char: '#' });
    expect(res.status).toBe(200);
    expect(res.body.filtered_text).toMatch(/#+/);
    expect(res.body.isFiltered).toBe(true);
    expect(res.body.words_found).toContain('bullshit');
  });

  test('Replaces profanity with fixed word (GET)', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'this is bullshit', lang: 'en-us', fill_word: 'hidden' });
    expect(res.status).toBe(200);
    expect(res.body.filtered_text).toContain('hidden');
    expect(res.body.isFiltered).toBe(true);
  });

  test('Replaces profanity with character (POST)', async () => {
    const res = await request(app)
      .post('/filter')
      .send({ text: 'this is bullshit', lang: 'en-us', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.filtered_text).toMatch(/\*+/);
    expect(res.body.isFiltered).toBe(true);
  });

  test('Ignores accents', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'bullshít', lang: 'en-us', fill_char: '#' });
    expect(res.status).toBe(200);
    expect(res.body.isFiltered).toBe(true);
  });

  test('Filters in Portuguese', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'isso é merda', lang: 'pt-br', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.isFiltered).toBe(true);
    expect(res.body.words_found).toContain('merda');
  });

  test('Filters in Spanish', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'esto es mierda', lang: 'es-es', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.isFiltered).toBe(true);
    expect(res.body.words_found).toContain('mierda');
  });

  test('Filters extra words', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'apple orange', extras: 'apple,orange', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.isFiltered).toBe(true);
    expect(res.body.words_found).toContain('apple');
    expect(res.body.words_found).toContain('orange');
  });

  test('Limits extras to 10 words', async () => {
    const extras = Array.from({ length: 15 }, (_, i) => `word${i}`).join(',');
    const res = await request(app)
      .get('/filter')
      .query({ text: 'word0 word10', extras, fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.extra_words.length).toBeLessThanOrEqual(10);
  });

  test('Returns error if text is not provided', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ lang: 'en-us', fill_char: '*' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('Returns error if text is not a string', async () => {
    const res = await request(app)
      .post('/filter')
      .send({ text: 123, lang: 'en-us', fill_char: '*' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('Processes array of texts correctly (POST)', async () => {
    const res = await request(app)
      .post('/filter')
      .send({
        text: [
          'first text with bullshit',
          'second clean text',
          'third with damn'
        ],
        lang: 'en-us',
        fill_char: '#'
      });
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results).toHaveLength(3);
    
    // Check first text (with profanity)
    expect(res.body.results[0].isFiltered).toBe(true);
    expect(res.body.results[0].words_found).toContain('bullshit');
    
    // Check second text (clean)
    expect(res.body.results[1].isFiltered).toBe(false);
    expect(res.body.results[1].words_found).toHaveLength(0);
    
    // Check third text (with profanity)
    expect(res.body.results[2].isFiltered).toBe(true);
    expect(res.body.results[2].words_found).toContain('damn');
  });

  test('Returns single object for single text in array', async () => {
    const res = await request(app)
      .post('/filter')
      .send({
        text: ['single text with bullshit'],
        lang: 'en-us',
        fill_char: '#'
      });
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.results)).toBe(false);
    expect(res.body.results.isFiltered).toBe(true);
    expect(res.body.results.words_found).toContain('bullshit');
  });

  test('Processes array with extras correctly', async () => {
    const res = await request(app)
      .post('/filter')
      .send({
        text: [
          'text with apple',
          'clean text',
          'text with orange'
        ],
        extras: ['apple', 'orange'],
        fill_char: '#'
      });
    
    expect(res.status).toBe(200);
    expect(res.body.results[0].isFiltered).toBe(true);
    expect(res.body.results[0].words_found).toContain('apple');
    expect(res.body.results[1].isFiltered).toBe(false);
    expect(res.body.results[2].isFiltered).toBe(true);
    expect(res.body.results[2].words_found).toContain('orange');
  });

  test('Handles empty array correctly', async () => {
    const res = await request(app)
      .post('/filter')
      .send({ text: [], lang: 'en-us' });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('Filters non-string values from array', async () => {
    const res = await request(app)
      .post('/filter')
      .send({
        text: ['text with bullshit', 123, null, undefined, 'another text with damn'],
        lang: 'en-us',
        fill_char: '#'
      });
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results).toHaveLength(2); // Only valid texts
    expect(res.body.results[0].words_found).toContain('bullshit');
    expect(res.body.results[1].words_found).toContain('damn');
  });
});