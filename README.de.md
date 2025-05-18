# Bad Word Filter API

[🇧🇷 Português](README.md) | [🇺🇸 English](README.en.md) | [🇪🇸 Español](README.es.md) | [🇫🇷 Français](README.fr.md) | [🇩🇪 Deutsch](README.de.md)

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
- Unterstützung für mehrere Sprachen: pt-br, en-us, es-es, fr-fr, de-de
- Ersetzen von Schimpfwörtern durch ein anpassbares Zeichen oder ein festes Wort
- Unterstützt GET und POST
- Hinzufügen von zusätzlichen Wörtern zum Filtern
- Ignoriert Akzente automatisch

## Endpunkte

### Text filtern
`GET /filter`
`POST /filter`

#### Parameter
- `text` (string, erforderlich): zu filternder Text
- `lang` (string, optional): Sprache (z.B. pt-br, en-us, es-es, fr-fr, de-de). Standard: pt-br
- `fill_char` (string, optional): Zeichen zum Ersetzen jedes Buchstabens des Schimpfworts. Standard: `*`
- `fill_word` (string, optional): Festes Wort zum Ersetzen des Schimpfworts (z.B. "versteckt"). Wenn angegeben, hat es Vorrang vor `fill_char`.
- `extras` (string oder Array, optional): bis zu 10 zusätzliche Wörter zum Filtern, durch Kommas getrennt oder als Array

#### Beispiel GET-Anfrage
```
GET /filter?text=das ist scheiße&lang=de-de&fill_char=#
```
Antwort:
```json
{
  "original_text": "das ist scheiße",
  "filtered_text": "das ist #####",
  "isFiltered": true,
  "words_found": ["scheiße"],
  "lang": "de-de",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": []
}
```

#### Beispiel mit fill_word
```
GET /filter?text=das ist scheiße&lang=de-de&fill_word=[versteckt]
```
Antwort:
```json
{
  "original_text": "das ist scheiße",
  "filtered_text": "das ist [versteckt]",
  "isFiltered": true,
  "words_found": ["scheiße"],
  "lang": "de-de",
  "fill_char": "*",
  "fill_word": "[versteckt]",
  "extra_words": []
}
```

#### Beispiel POST-Anfrage
```json
POST /filter
{
  "text": "banane orange",
  "extras": ["banane", "orange"],
  "fill_char": "#"
}
```

### Unterstützte Sprachen auflisten
`GET /languages`

Antwort:
```json
{
  "suported_lang": ["pt-br", "en-us", "es-es", "fr-fr", "de-de"],
  "default_lang": "pt-br"
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
