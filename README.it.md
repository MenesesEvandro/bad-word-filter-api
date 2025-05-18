[🇧🇷 Português](README.pt.md) | [🇺🇸 English](README.md) | [🇪🇸 Español](README.es.md) | [🇫🇷 Français](README.fr.md) | [🇩🇪 Deutsch](README.de.md) | [🇮🇹 Italiano](README.it.md)

# Bad Word Filter API

Bad Word Filter è un servizio web semplice, multilingue e gratuito per filtrare e rimuovere parolacce, oscenità e altri testi indesiderati.

![NPM Version](https://img.shields.io/npm/v/%40menesesevandro%2Fbad-word-filter-api) ![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/%40menesesevandro%2Fbad-word-filter-api) ![Crates.io License](https://img.shields.io/crates/l/mit) ![GitHub last commit](https://img.shields.io/github/last-commit/menesesevandro/bad-word-filter-api)

## Installazione tramite npm

Questo pacchetto è disponibile su npm:

[https://www.npmjs.com/package/@menesesevandro/bad-word-filter-api](https://www.npmjs.com/package/@menesesevandro/bad-word-filter-api)

Installa nel tuo progetto:
```bash
npm i @menesesevandro/bad-word-filter-api
```

## Come utilizzare localmente

```bash
npm install
npm start
```
L'API sarà disponibile su `http://localhost:3000`.

## Caratteristiche
- Supporto multilingue: pt-br, en, es, fr, de, it
- Sostituisci le parolacce con un carattere personalizzabile o una parola fissa
- Supporta GET e POST
- Aggiungi parole extra da filtrare
- Ignora automaticamente gli accenti

## Endpoints

### Filtra testo
`GET /filter`
`POST /filter`

#### Parametri
- `text` (stringa o array di stringhe, obbligatorio): testo/i da filtrare
- `lang` (stringa, opzionale): lingua (es. pt-br, en, es, fr, de, it). Predefinito: en
- `fill_char` (stringa, opzionale): carattere per sostituire ogni lettera della parolaccia. Predefinito: `*`
- `fill_word` (stringa, opzionale): parola fissa per sostituire la parolaccia (es. "nascosto"). Se fornito, ha la precedenza su `fill_char`.
- `extras` (stringa o array, opzionale): fino a 10 parole extra da filtrare, separate da virgola o array

#### Esempio richiesta GET
```
GET /filter?text=questo è merda&lang=it&fill_char=#
```
Risposta:
```json
{
  "original_text": "questo è merda",
  "filtered_text": "questo è #####",
  "isFiltered": true,
  "words_found": ["merda"],
  "lang": "it",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": []
}
```

#### Esempio con fill_word
```
GET /filter?text=questo è merda&lang=it&fill_word=[nascosto]
```
Risposta:
```json
{
  "original_text": "questo è merda",
  "filtered_text": "questo è [nascosto]",
  "isFiltered": true,
  "words_found": ["merda"],
  "lang": "it",
  "fill_char": "*",
  "fill_word": "[nascosto]",
  "extra_words": []
}
```

#### Esempio richiesta POST con testo singolo
```json
POST /filter
{
  "text": "banana arancia",
  "extras": ["banana", "arancia"],
  "fill_char": "#"
}
```
Risposta:
```json
{
  "results": {
    "original_text": "banana arancia",
    "filtered_text": "###### #######",
    "isFiltered": true,
    "words_found": ["banana", "arancia"]
  },
  "lang": "it",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": ["banana", "arancia"]
}
```

#### Esempio richiesta POST con testi multipli
```json
POST /filter
{
  "text": [
    "primo testo con parolaccia",
    "secondo testo pulito",
    "terzo con banana"
  ],
  "extras": ["banana"],
  "fill_char": "#"
}
```
Risposta:
```json
{
  "results": [
    {
      "original_text": "primo testo con parolaccia",
      "filtered_text": "primo testo con #########",
      "isFiltered": true,
      "words_found": ["parolaccia"]
    },
    {
      "original_text": "secondo testo pulito",
      "filtered_text": "secondo testo pulito",
      "isFiltered": false,
      "words_found": []
    },
    {
      "original_text": "terzo con banana",
      "filtered_text": "terzo con ######",
      "isFiltered": true,
      "words_found": ["banana"]
    }
  ],
  "lang": "it",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": ["banana"]
}
```

### Lista lingue supportate
`GET /languages`

Risposta:
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
        },
        {
            "code": "it",
            "name": "Italiano (Italia)"
        }
    ],
    "default_lang": "en"
}
```

## Test
Esegui tutti i test automatizzati con:
```bash
npm test
```

## Deploy
- Per la produzione, ospita su servizi come [Vercel](https://vercel.com/), [Render](https://render.com/), [Railway](https://railway.app/) o [Heroku](https://heroku.com/).

## Licenza
MIT
