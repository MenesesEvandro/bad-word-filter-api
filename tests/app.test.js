const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Import the real app
const app = require('../src/app');
app.use(bodyParser.json());

describe('Bad Word Filter API', () => {
  test('Replaces profanity with character (GET)', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'this is bullshit', lang: 'en', fill_char: '#' });
    expect(res.status).toBe(200);
    expect(res.body.results.filtered_text).toMatch(/#+/);
    expect(res.body.results.isFiltered).toBe(true);
    expect(res.body.results.words_found).toContain('bullshit');
  });

  test('Replaces profanity with fixed word (GET)', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'this is bullshit', lang: 'en', fill_word: 'hidden' });
    expect(res.status).toBe(200);
    expect(res.body.results.filtered_text).toContain('hidden');
    expect(res.body.results.isFiltered).toBe(true);
  });

  test('Replaces profanity with character (POST)', async () => {
    const res = await request(app)
      .post('/filter')
      .send({ text: 'this is bullshit', lang: 'en', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.results.filtered_text).toMatch(/\*+/);
    expect(res.body.results.isFiltered).toBe(true);
  });

  test('Ignores accents', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'bullshít', lang: 'en', fill_char: '#' });
    expect(res.status).toBe(200);
    expect(res.body.results.isFiltered).toBe(true);
  });

  test('Filters in Portuguese', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'isso é merda', lang: 'pt-br', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.results.isFiltered).toBe(true);
    expect(res.body.results.words_found).toContain('merda');
  });

  test('Filters in Spanish', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'esto es mierda', lang: 'es', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.results.isFiltered).toBe(true);
    expect(res.body.results.words_found).toContain('mierda');
  });

  test('Filters in French', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'c\'est de la merde', lang: 'fr', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.results.isFiltered).toBe(true);
    expect(res.body.results.words_found).toContain('merde');
  });

  test('Filters in German', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'das ist scheiße', lang: 'de', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.results.isFiltered).toBe(true);
    expect(res.body.results.filtered_text).toBe('das ist *******');
  });

  test('Filters in Italian', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'questo è merda', lang: 'it', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.results.isFiltered).toBe(true);
    expect(res.body.results.words_found).toContain('merda');
    expect(res.body.results.filtered_text).toBe('questo è *****');
  });

  test('Replaces profanity with character (GET)', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'this is bullshit', lang: 'en', fill_char: '#' });
    expect(res.status).toBe(200);
    expect(res.body.results.filtered_text).toMatch(/#+/);
    expect(res.body.results.isFiltered).toBe(true);
    expect(res.body.results.words_found).toContain('bullshit');
  });

  test('Replaces profanity with fixed word (GET)', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'this is bullshit', lang: 'en', fill_word: 'hidden' });
    expect(res.status).toBe(200);
    expect(res.body.results.filtered_text).toContain('hidden');
    expect(res.body.results.isFiltered).toBe(true);
  });

  test('Replaces profanity with character (POST)', async () => {
    const res = await request(app)
      .post('/filter')
      .send({ text: 'this is bullshit', lang: 'en', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.results.filtered_text).toMatch(/\*+/);
    expect(res.body.results.isFiltered).toBe(true);
  });

  test('Ignores accents', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'bullshít', lang: 'en', fill_char: '#' });
    expect(res.status).toBe(200);
    expect(res.body.results.isFiltered).toBe(true);
  });

  test('Filters in Portuguese', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'isso é merda', lang: 'pt-br', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.results.isFiltered).toBe(true);
    expect(res.body.results.words_found).toContain('merda');
  });

  test('Filters in Spanish', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'esto es mierda', lang: 'es', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.results.isFiltered).toBe(true);
    expect(res.body.results.words_found).toContain('mierda');
  });

  test('Filters in French', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'c\'est de la merde', lang: 'fr', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.results.isFiltered).toBe(true);
    expect(res.body.results.words_found).toContain('merde');
  });

  test('Filters in German', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'das ist scheiße', lang: 'de', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.results.isFiltered).toBe(true);
    expect(res.body.results.filtered_text).toBe('das ist *******');
  });

  test('Filters in Italian', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'questo è merda', lang: 'it', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.results.isFiltered).toBe(true);
    expect(res.body.results.words_found).toContain('merda');
    expect(res.body.results.filtered_text).toBe('questo è *****');
  });

  test('Returns error if text is not provided', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ lang: 'en', fill_char: '*' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('Returns error if text is not a string', async () => {
    const res = await request(app)
      .post('/filter')
      .send({ text: 123, lang: 'en', fill_char: '*' });
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
        lang: 'en',
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
        lang: 'en',
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
      .send({ text: [], lang: 'en' });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('Filters non-string values from array', async () => {
    const res = await request(app)
      .post('/filter')
      .send({
        text: ['text with bullshit', 123, null, undefined, 'another text with damn'],
        lang: 'en',
        fill_char: '#'
      });
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body.results).toHaveLength(2); // Only valid texts
    expect(res.body.results[0].words_found).toContain('bullshit');
    expect(res.body.results[1].words_found).toContain('damn');
  });

  test('Returns warning for unsupported language and uses default', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'this is bullshit', lang: 'invalid-lang', fill_char: '*' });
    expect(res.status).toBe(200);
    expect(res.body.warning).toBeDefined();
    expect(res.body.lang).toBe('en');
    expect(res.body.results.isFiltered).toBe(true);
    expect(res.body.results.words_found).toContain('bullshit');
  });

  test('GET /languages returns correct language list', async () => {
    const res = await request(app)
      .get('/languages');
    expect(res.status).toBe(200);
    expect(res.body.languages).toHaveLength(6);
    expect(res.body.default_lang).toBe('en');
    
    // Verificar a presença de todos os idiomas suportados
    const expectedLanguages = ['pt-br', 'en', 'es', 'fr', 'de', 'it'];
    const codes = res.body.languages.map(lang => lang.code);
    expectedLanguages.forEach(lang => {
      expect(codes).toContain(lang);
    });
    
    // Verificar se os nomes dos idiomas estão corretos
    const langMap = new Map(res.body.languages.map(lang => [lang.code, lang.name]));
    expect(langMap.get('pt-br')).toBe('Português (Brasil)');
    expect(langMap.get('en')).toBe('English (USA)');
    expect(langMap.get('es')).toBe('Español (España)');
    expect(langMap.get('fr')).toBe('Français (France)');
    expect(langMap.get('de')).toBe('Deutsch (Deutschland)');
    expect(langMap.get('it')).toBe('Italiano (Italia)');
  });

  test('Handles mixed case profanity correctly', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'this is BuLlShIt', lang: 'en', fill_char: '#' });
    expect(res.status).toBe(200);
    expect(res.body.results.isFiltered).toBe(true);
    expect(res.body.results.words_found).toContain('bullshit');
  });

  test('Preserves original text case in filtered output', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'This is BULLSHIT', lang: 'en', fill_char: '#' });
    expect(res.status).toBe(200);
    expect(res.body.results.filtered_text).toBe('This is ########');
  });

  test('Handles multiple profanities in single text', async () => {
    const res = await request(app)
      .post('/filter')
      .send({
        text: 'this bullshit is shit',
        lang: 'en',
        fill_char: '#'
      });
    
    expect(res.status).toBe(200);
    expect(res.body.results.isFiltered).toBe(true);
    expect(res.body.results.words_found).toEqual(expect.arrayContaining(['bullshit', 'shit']));
    expect(res.body.results.filtered_text).toBe('this ######## is ####');
  });

  test('Maintains word boundaries when filtering', async () => {
    const res = await request(app)
      .get('/filter')
      .query({ text: 'assistance buttclass butternut', extras: 'butt', fill_char: '#' });
    expect(res.status).toBe(200);
    expect(res.body.results.filtered_text).toBe('assistance buttclass butternut');
    expect(res.body.results.isFiltered).toBe(false);
  });

});