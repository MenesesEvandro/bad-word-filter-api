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
- `text` (string, requis) : texte à filtrer
- `lang` (string, optionnel) : langue (ex : pt-br, en-us, es-es, fr-fr, de-de). Par défaut : pt-br
- `fill_char` (string, optionnel) : caractère pour remplacer chaque lettre du mot grossier. Par défaut : `*`
- `fill_word` (string, optionnel) : mot fixe pour remplacer le mot grossier (ex : "caché"). Si renseigné, il a priorité sur `fill_char`.
- `extras` (string ou tableau, optionnel) : jusqu'à 10 mots supplémentaires à filtrer, séparés par des virgules ou un tableau

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

#### Exemple de requête POST
```json
POST /filter
{
  "text": "banane orange",
  "extras": ["banane", "orange"],
  "fill_char": "#"
}
```

### Lister les langues prises en charge
`GET /languages`

Réponse :
```json
{
  "suported_lang": ["pt-br", "en-us", "es-es", "fr-fr", "de-de"],
  "default_lang": "pt-br"
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
