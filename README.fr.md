[🇧🇷 Português](README.pt.md) | [🇺🇸 English](README.md) | [🇪🇸 Español](README.es.md) | [🇫🇷 Français](README.fr.md) | [🇩🇪 Deutsch](README.de.md) | [🇮🇹 Italiano](README.it.md)

# Bad Word Filter API

Bad Word Filter est un service web simple, multilingue et gratuit pour filtrer et supprimer les grossièretés, obscénités et autres textes indésirables.

![NPM Version](https://img.shields.io/npm/v/%40menesesevandro%2Fbad-word-filter-api) ![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/%40menesesevandro%2Fbad-word-filter-api) ![Crates.io License](https://img.shields.io/crates/l/mit) ![GitHub last commit](https://img.shields.io/github/last-commit/menesesevandro/bad-word-filter-api)

## Installation via npmord Filter API

[🇧🇷 Português](README.pt.md) | [🇺🇸 English](README.md) | [🇪🇸 Español](README.es.md) | [🇫🇷 Français](README.fr.md) | [🇩🇪 Deutsch](README.de.md)

Bad Word Filter est un service web simple et gratuit pour filtrer et supprimer les grossièretés, obscénités et autres textes indésirables.

## Installation via npm

Ce package est disponible sur npm :

[https://www.npmjs.com/package/@menesesevandro/bad-word-filter-api](https://www.npmjs.com/package/@menesesevandro/bad-word-filter-api)

Installez dans votre projet :
```bash
npm i @menesesevandro/bad-word-filter-api
```

## Utilisation locale

```bash
npm install
npm start
```
L'API sera disponible sur `http://localhost:3000`.

## Fonctionnalités
- Prise en charge de plusieurs langues : pt-br, en, es, fr, de, it
- Remplacement des grossièretés par un caractère personnalisable ou un mot fixe
- Prend en charge GET et POST
- Ajout de mots supplémentaires à filtrer
- Ignore automatiquement les accents

## Endpoints

### Filtrer le texte
`GET /filter`
`POST /filter`

#### Paramètres
- `text` (string ou tableau de strings, obligatoire): texte(s) à filtrer
- `lang` (string, optionnel): langue (ex: pt-br, en, es, fr, de, it). Par défaut: en
- `fill_char` (string, optionnel): caractère pour remplacer chaque lettre du gros mot. Par défaut: `*`
- `fill_word` (string, optionnel): mot fixe pour remplacer le gros mot (ex: "caché"). Si fourni, prend la priorité sur `fill_char`.
- `extras` (string ou tableau, optionnel): jusqu'à 10 mots supplémentaires à filtrer, séparés par des virgules ou tableau

#### Exemple de requête GET
```
GET /filter?text=c'est de la merde&lang=fr&fill_char=#
```
Réponse :
```json
{
  "original_text": "c'est de la merde",
  "filtered_text": "c'est de la #####",
  "isFiltered": true,
  "words_found": ["merde"],
  "lang": "fr",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": []
}
```

#### Exemple avec fill_word
```
GET /filter?text=c'est de la merde&lang=fr&fill_word=[caché]
```
Réponse :
```json
{
  "original_text": "c'est de la merde",
  "filtered_text": "c'est de la [caché]",
  "isFiltered": true,
  "words_found": ["merde"],
  "lang": "fr",
  "fill_char": "*",
  "fill_word": "[caché]",
  "extra_words": []
}
```

#### Exemple de requête POST avec texte unique
```json
POST /filter
{
  "text": "banane orange",
  "extras": ["banane", "orange"],
  "fill_char": "#"
}
```
Réponse:
```json
{
  "results": {
    "original_text": "banane orange",
    "filtered_text": "###### ######",
    "isFiltered": true,
    "words_found": ["banane", "orange"]
  },
  "lang": "fr",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": ["banane", "orange"]
}
```

#### Exemple de requête POST avec textes multiples
```json
POST /filter
{
  "text": [
    "premier texte avec gros mot",
    "deuxième texte propre",
    "troisième avec banane"
  ],
  "extras": ["banane"],
  "fill_char": "#"
}
```
Réponse:
```json
{
  "results": [
    {
      "original_text": "premier texte avec gros mot",
      "filtered_text": "premier texte avec ########",
      "isFiltered": true,
      "words_found": ["gros mot"]
    },
    {
      "original_text": "deuxième texte propre",
      "filtered_text": "deuxième texte propre",
      "isFiltered": false,
      "words_found": []
    },
    {
      "original_text": "troisième avec banane",
      "filtered_text": "troisième avec ######",
      "isFiltered": true,
      "words_found": ["banane"]
    }
  ],
  "lang": "fr",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": ["banane"]
}
```

### Lister les langues supportées
`GET /languages`

Réponse :
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
Lancez tous les tests automatisés avec :
```bash
npm test
```

## Déploiement
- Pour la production, hébergez sur des services comme [Vercel](https://vercel.com/), [Render](https://render.com/), [Railway](https://railway.app/) ou [Heroku](https://heroku.com/).

## Licence
MIT

---

## Exemples d'utilisation avec différents frameworks

### Node.js (axios)
```js
const axios = require('axios');

// Exemple de filtre simple
axios.get('http://localhost:3000/filter', {
  params: {
    text: 'gros mot ici',
    lang: 'fr',
    fill_char: '#'
  }
}).then(res => console.log(res.data));

// Exemple avec mots sûrs et statistiques
axios.post('http://localhost:3000/filter', {
  text: 'banane et orange sont des fruits',
  extras: ['banane', 'orange'],
  safe_words: ['banane'],
  include_stats: true
}).then(res => console.log(res.data));
```

### Python (requests)
```python
import requests

# Filtre simple
resp = requests.get('http://localhost:3000/filter', params={
    'text': 'gros mot ici',
    'lang': 'fr',
    'fill_char': '#'
})
print(resp.json())

# Avec mots sûrs et statistiques
resp = requests.post('http://localhost:3000/filter', json={
    'text': 'banane et orange sont des fruits',
    'extras': ['banane', 'orange'],
    'safe_words': ['banane'],
    'include_stats': True
})
print(resp.json())
```

### cURL
```bash
curl "http://localhost:3000/filter?text=gros%20mot%20ici&lang=fr&fill_char=#"

curl -X POST http://localhost:3000/filter \
  -H "Content-Type: application/json" \
  -d '{"text": "banane et orange sont des fruits", "extras": ["banane", "orange"], "safe_words": ["banane"], "include_stats": true}'
```

## Exemple détaillé de réponse

### Avec mots sûrs et statistiques
```json
{
  "results": {
    "original_text": "banane et orange sont des fruits",
    "filtered_text": "banane et ###### sont des fruits",
    "isFiltered": true,
    "words_found": ["orange"],
    "stats": {
      "total_words": 6,
      "total_characters": 32,
      "filtered_words": 1,
      "filtered_characters": 6,
      "filter_ratio": 0.188,
      "words_ratio": 0.167,
      "safe_words_used": 1
    }
  },
  "lang": "fr",
  "fill_char": "*",
  "fill_word": null,
  "extra_words": ["banane", "orange"],
  "safe_words": ["banane"],
  "aggregate_stats": {
    "total_words": 6,
    "total_characters": 32,
    "filtered_words": 1,
    "filtered_characters": 6,
    "safe_words_used": 1,
    "average_filter_ratio": 0.188,
    "average_words_ratio": 0.167
  }
}
```

## Comment contribuer avec de nouvelles langues

1. Créez un nouveau fichier dans `src/lang/` avec le code de la langue, par exemple, `xx.js`.
2. Exportez un objet avec les propriétés suivantes :
   - `name` : Nom de la langue
   - `profanityList` : Tableau de mots interdits
   - `messages` : Messages d'erreur et d'avertissement (voir exemples dans les fichiers existants)
3. Suivez le modèle des fichiers existants (ex : `pt-br.js`, `en.js`).
4. Faites une PR ou envoyez votre suggestion !

---
