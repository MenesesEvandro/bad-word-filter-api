# [🇧🇷 Português](README.pt.md) | [🇺🇸 English](README.md) | [🇪🇸 Español](README.es.md) | [🇫🇷 Français](README.fr.md) | [🇩🇪 Deutsch](README.de.md) | [🇮🇹 Italiano](README.it.md)

Bad Word Filter is a simple, multilang and free web service for filtering and removing profanity, obscenity, and other unwanted text. Word Filter API

[🇧🇷 Português](README.pt.md) | [🇺🇸 English](README.md) | [🇪🇸 Español](README.es.md) | [🇫🇷 Français](README.fr.md) | [🇩🇪 Deutsch](README.de.md)

Bad Word Filter is a simple multi-language and free web service for filtering and removing profanity, obscenity, and other unwanted text.

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
