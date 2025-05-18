# Bad Word Filter API

[🇧🇷 Português](README.md) | [🇺🇸 English](README.en.md) | [🇪🇸 Español](README.es.md) | [🇫🇷 Français](README.fr.md) | [🇩🇪 Deutsch](README.de.md)

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
- Prise en charge de plusieurs langues : pt-br, en-us, es-es, fr-fr, de-de
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
- `lang` (string, optionnel): langue (ex: pt-br, en-us, es-es, fr-fr, de-de). Par défaut: pt-br
- `fill_char` (string, optionnel): caractère pour remplacer chaque lettre du gros mot. Par défaut: `*`
- `fill_word` (string, optionnel): mot fixe pour remplacer le gros mot (ex: "caché"). Si fourni, prend la priorité sur `fill_char`.
- `extras` (string ou tableau, optionnel): jusqu'à 10 mots supplémentaires à filtrer, séparés par des virgules ou tableau

#### Exemple de requête GET
```
GET /filter?text=c'est de la merde&lang=fr-fr&fill_char=#
```
Réponse :
```json
{
  "original_text": "c'est de la merde",
  "filtered_text": "c'est de la #####",
  "isFiltered": true,
  "words_found": ["merde"],
  "lang": "fr-fr",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": []
}
```

#### Exemple avec fill_word
```
GET /filter?text=c'est de la merde&lang=fr-fr&fill_word=[caché]
```
Réponse :
```json
{
  "original_text": "c'est de la merde",
  "filtered_text": "c'est de la [caché]",
  "isFiltered": true,
  "words_found": ["merde"],
  "lang": "fr-fr",
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
  "lang": "fr-fr",
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
  "lang": "fr-fr",
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
            "code": "en-us",
            "name": "English (USA)"
        },
        {
            "code": "es-es",
            "name": "Español (España)"
        },
        {
            "code": "fr-fr",
            "name": "Français (France)"
        },
        {
            "code": "de-de",
            "name": "Deutsch (Deutschland)"
        }
    ],
    "default_lang": "en-us"
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
