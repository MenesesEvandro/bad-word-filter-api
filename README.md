[🇧🇷 Português](README.pt.md) | [🇺🇸 English](README.md) | [🇪🇸 Español](README.es.md) | [🇫🇷 Français](README.fr.md) | [🇩🇪 Deutsch](README.de.md) | [🇮🇹 Italiano](README.it.md)

# Bad Word Filter API

Bad Word Filter is a simple multi-language and free web service for filtering and removing profanity, obscenity, and other unwanted text.

![NPM Version](https://img.shields.io/npm/v/%40menesesevandro%2Fbad-word-filter-api) ![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/%40menesesevandro%2Fbad-word-filter-api) ![Crates.io License](https://img.shields.io/crates/l/mit) ![GitHub last commit](https://img.shields.io/github/last-commit/menesesevandro/bad-word-filter-api)


## Installation via npm

This package is available on npm:

[https://www.npmjs.com/package/@menesesevandro/bad-word-filter-api](https://www.npmjs.com/package/@menesesevandro/bad-word-filter-api)

Install in your project:
```bash
npm i @menesesevandro/bad-word-filter-api
```

## How to use locally

```bash
npm install
npm start
```
The API will be available at `http://localhost:3000`.

## Features
- Multi-language support: pt-br, en, es, fr, de, it, it
- Replace bad words with a customizable character or fixed word
- Supports GET and POST
- Add extra words to filter
- Ignores accents automatically

## Endpoints

### Filter text
`GET /filter`
`POST /filter`

#### Parameters
- `text` (string or string array, required): text(s) to be filtered
- `lang` (string, optional): language (e.g., pt-br, en, es, fr, de, it). Default: en
- `fill_char` (string, optional): character to replace each letter of the profanity. Default: `*`
- `fill_word` (string, optional): fixed word to replace the profanity (e.g., "hidden"). If provided, takes precedence over `fill_char`.
- `extras` (string or array, optional): up to 10 extra words to filter, comma-separated or array

#### GET request example
```
GET /filter?text=this is shit&lang=en&fill_char=#
```
Response:
```json
{
  "original_text": "this is shit",
  "filtered_text": "this is ####",
  "isFiltered": true,
  "words_found": ["shit"],
  "lang": "en",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": []
}
```

#### Example with fill_word
```
GET /filter?text=this is shit&lang=en&fill_word=[hidden]
```
Response:
```json
{
  "original_text": "this is shit",
  "filtered_text": "this is [hidden]",
  "isFiltered": true,
  "words_found": ["shit"],
  "lang": "en",
  "fill_char": "*",
  "fill_word": "[hidden]",
  "extra_words": []
}
```

#### POST request example with single text
```json
POST /filter
{
  "text": "banana orange",
  "extras": ["banana", "orange"],
  "fill_char": "#"
}
```
Response:
```json
{
  "results": {
    "original_text": "banana orange",
    "filtered_text": "##### ######",
    "isFiltered": true,
    "words_found": ["banana", "orange"]
  },
  "lang": "en",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": ["banana", "orange"]
}
```

#### POST request example with multiple texts
```json
POST /filter
{
  "text": [
    "first text with curse",
    "second clean text",
    "third with banana"
  ],
  "extras": ["banana"],
  "fill_char": "#"
}
```
Response:
```json
{
  "results": [
    {
      "original_text": "first text with curse",
      "filtered_text": "first text with #####",
      "isFiltered": true,
      "words_found": ["curse"]
    },
    {
      "original_text": "second clean text",
      "filtered_text": "second clean text",
      "isFiltered": false,
      "words_found": []
    },
    {
      "original_text": "third with banana",
      "filtered_text": "third with #####",
      "isFiltered": true,
      "words_found": ["banana"]
    }
  ],
  "lang": "en",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": ["banana"]
}
```

### List supported languages
`GET /languages`

Response:
```json
{
    "languages": [
        {
            "code": "pt-br",
            "name": "Português (Brasil)"
        },
        {
            "code": "en",
            "name": "English (USA)"
        },
        {
            "code": "es",
            "name": "Español (España)"
        },
        {
            "code": "fr",
            "name": "Français (France)"
        },
        {
            "code": "de",
            "name": "Deutsch (Deutschland)"
        }
    ],
    "default_lang": "en"
}
```

## Tests
Run all automated tests with:
```bash
npm test
```

## Deploy
- For production, host on services like [Vercel](https://vercel.com/), [Render](https://render.com/), [Railway](https://railway.app/) or [Heroku](https://heroku.com/).

## License
MIT

---

## Usage examples with different frameworks

### Node.js (axios)
```js
const axios = require('axios');

// Simple filter example
axios.get('http://localhost:3000/filter', {
  params: {
    text: 'badword here',
    lang: 'en',
    fill_char: '#'
  }
}).then(res => console.log(res.data));

// Example with safe_words and statistics
axios.post('http://localhost:3000/filter', {
  text: 'banana and orange are fruits',
  extras: ['banana', 'orange'],
  safe_words: ['banana'],
  include_stats: true
}).then(res => console.log(res.data));
```

### Python (requests)
```python
import requests

# Simple filter
resp = requests.get('http://localhost:3000/filter', params={
    'text': 'badword here',
    'lang': 'en',
    'fill_char': '#'
})
print(resp.json())

# With safe_words and statistics
resp = requests.post('http://localhost:3000/filter', json={
    'text': 'banana and orange are fruits',
    'extras': ['banana', 'orange'],
    'safe_words': ['banana'],
    'include_stats': True
})
print(resp.json())
```

### cURL
```bash
curl "http://localhost:3000/filter?text=badword%20here&lang=en&fill_char=#"

curl -X POST http://localhost:3000/filter \
  -H "Content-Type: application/json" \
  -d '{"text": "banana and orange are fruits", "extras": ["banana", "orange"], "safe_words": ["banana"], "include_stats": true}'
```

## Detailed response example

### With safe_words and include_stats
```json
{
  "results": {
    "original_text": "banana and orange are fruits",
    "filtered_text": "banana and ###### are fruits",
    "isFiltered": true,
    "words_found": ["orange"],
    "stats": {
      "total_words": 5,
      "total_characters": 29,
      "filtered_words": 1,
      "filtered_characters": 6,
      "filter_ratio": 0.207,
      "words_ratio": 0.2,
      "safe_words_used": 1
    }
  },
  "lang": "en",
  "fill_char": "*",
  "fill_word": null,
  "extra_words": ["banana", "orange"],
  "safe_words": ["banana"],
  "aggregate_stats": {
    "total_words": 5,
    "total_characters": 29,
    "filtered_words": 1,
    "filtered_characters": 6,
    "safe_words_used": 1,
    "average_filter_ratio": 0.207,
    "average_words_ratio": 0.2
  }
}
```

## How to contribute with new languages

1. Create a new file in `src/lang/` with the language code, e.g., `xx.js`.
2. Export an object with the following properties:
   - `name`: Language name
   - `profanityList`: Array of profane words
   - `messages`: Error and warning messages (see examples in existing files)
3. Follow the pattern of existing files (e.g., `pt-br.js`, `en.js`).
4. Open a PR or send your suggestion!

---
