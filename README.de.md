[🇧🇷 Português](README.pt.md) | [🇺🇸 English](README.md) | [🇪🇸 Español](README.es.md) | [🇫🇷 Français](README.fr.md) | [🇩🇪 Deutsch](README.de.md) | [🇮🇹 Italiano](README.it.md)

# Bad Word Filter API

Bad Word Filter ist ein einfacher, mehrsprachiger und kostenloser Webdienst zum Filtern und Entfernen von Schimpfwörtern, Obszönitäten und anderen unerwünschten Texten.

![NPM Version](https://img.shields.io/npm/v/%40menesesevandro%2Fbad-word-filter-api) ![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/%40menesesevandro%2Fbad-word-filter-api) ![Crates.io License](https://img.shields.io/crates/l/mit) ![GitHub last commit](https://img.shields.io/github/last-commit/menesesevandro/bad-word-filter-api)

## Installation über npmord Filter API

[🇧🇷 Português](README.pt.md) | [🇺🇸 English](README.md) | [🇪🇸 Español](README.es.md) | [🇫🇷 Français](README.fr.md) | [🇩🇪 Deutsch](README.de.md)

Bad Word Filter ist ein einfacher und kostenloser Webdienst zum Filtern und Entfernen von Schimpfwörtern, Obszönitäten und anderen unerwünschten Texten.

## Installation über npm

Dieses Paket ist auf npm verfügbar:

[https://www.npmjs.com/package/@menesesevandro/bad-word-filter-api](https://www.npmjs.com/package/@menesesevandro/bad-word-filter-api)

Installiere es in deinem Projekt:
```bash
npm i @menesesevandro/bad-word-filter-api
```

## Lokale Nutzung

```bash
npm install
npm start
```
Die API ist dann unter `http://localhost:3000` erreichbar.

## Funktionen
- Unterstützung für mehrere Sprachen: pt-br, en, es, fr, de, it
- Ersetzen von Schimpfwörtern durch ein anpassbares Zeichen oder ein festes Wort
- Unterstützt GET und POST
- Hinzufügen von zusätzlichen Wörtern zum Filtern
- Ignoriert Akzente automatisch

## Endpunkte

### Text filtern
`GET /filter`
`POST /filter`

#### Parameter
- `text` (String oder String-Array, erforderlich): zu filternde(r) Text(e)
- `lang` (String, optional): Sprache (z.B. pt-br, en, es, fr, de). Standard: en
- `fill_char` (String, optional): Zeichen zum Ersetzen jedes Buchstabens des Schimpfworts. Standard: `*`
- `fill_word` (String, optional): Festes Wort zum Ersetzen des Schimpfworts (z.B. "versteckt"). Wenn angegeben, hat es Vorrang vor `fill_char`.
- `extras` (String oder Array, optional): bis zu 10 zusätzliche Wörter zum Filtern, durch Kommas getrennt oder Array

#### Beispiel GET-Anfrage
```
GET /filter?text=das ist scheiße&lang=de&fill_char=#
```
Antwort:
```json
{
  "original_text": "das ist scheiße",
  "filtered_text": "das ist #####",
  "isFiltered": true,
  "words_found": ["scheiße"],
  "lang": "de",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": []
}
```

#### Beispiel mit fill_word
```
GET /filter?text=das ist scheiße&lang=de&fill_word=[versteckt]
```
Antwort:
```json
{
  "original_text": "das ist scheiße",
  "filtered_text": "das ist [versteckt]",
  "isFiltered": true,
  "words_found": ["scheiße"],
  "lang": "de",
  "fill_char": "*",
  "fill_word": "[versteckt]",
  "extra_words": []
}
```

#### Beispiel POST-Anfrage mit einzelnem Text
```json
POST /filter
{
  "text": "banane orange",
  "extras": ["banane", "orange"],
  "fill_char": "#"
}
```
Antwort:
```json
{
  "results": {
    "original_text": "banane orange",
    "filtered_text": "###### ######",
    "isFiltered": true,
    "words_found": ["banane", "orange"]
  },
  "lang": "de",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": ["banane", "orange"]
}
```

#### Beispiel POST-Anfrage mit mehreren Texten
```json
POST /filter
{
  "text": [
    "erster Text mit Schimpfwort",
    "zweiter sauberer Text",
    "dritter mit Banane"
  ],
  "extras": ["banane"],
  "fill_char": "#"
}
```
Antwort:
```json
{
  "results": [
    {
      "original_text": "erster Text mit Schimpfwort",
      "filtered_text": "erster Text mit ##########",
      "isFiltered": true,
      "words_found": ["schimpfwort"]
    },
    {
      "original_text": "zweiter sauberer Text",
      "filtered_text": "zweiter sauberer Text",
      "isFiltered": false,
      "words_found": []
    },
    {
      "original_text": "dritter mit Banane",
      "filtered_text": "dritter mit ######",
      "isFiltered": true,
      "words_found": ["banane"]
    }
  ],
  "lang": "de",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": ["banane"]
}
```

### Unterstützte Sprachen auflisten
`GET /languages`

Antwort:
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
Führe alle automatisierten Tests aus mit:
```bash
npm test
```

## Deployment
- Für die Produktion hoste auf Diensten wie [Vercel](https://vercel.com/), [Render](https://render.com/), [Railway](https://railway.app/) oder [Heroku](https://heroku.com/).

## Lizenz
MIT
