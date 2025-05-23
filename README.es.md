[🇧🇷 Português](README.pt.md) | [🇺🇸 English](README.md) | [🇪🇸 Español](README.es.md) | [🇫🇷 Français](README.fr.md) | [🇩🇪 Deutsch](README.de.md) | [🇮🇹 Italiano](README.it.md)

# Bad Word Filter API

Bad Word Filter es un servicio web simple, multilingüe y gratuito para filtrar y eliminar palabrotas, obscenidades y otros textos no deseados.

![NPM Version](https://img.shields.io/npm/v/%40menesesevandro%2Fbad-word-filter-api) ![NPM Unpacked Size](https://img.shields.io/npm/unpacked-size/%40menesesevandro%2Fbad-word-filter-api) ![Crates.io License](https://img.shields.io/crates/l/mit) ![GitHub last commit](https://img.shields.io/github/last-commit/menesesevandro/bad-word-filter-api)

## Instalación vía npmord Filter API

[🇧🇷 Português](README.pt.md) | [🇺🇸 English](README.md) | [🇪🇸 Español](README.es.md) | [🇫🇷 Français](README.fr.md) | [🇩🇪 Deutsch](README.de.md)

Bad Word Filter es un servicio web simple y gratuito para filtrar y eliminar palabrotas, obscenidades y otros textos no deseados.

## Instalación vía npm

Este paquete está disponible en npm:

[https://www.npmjs.com/package/@menesesevandro/bad-word-filter-api](https://www.npmjs.com/package/@menesesevandro/bad-word-filter-api)

Instala en tu proyecto:
```bash
npm i @menesesevandro/bad-word-filter-api
```

## Cómo usar localmente

```bash
npm install
npm start
```
La API estará disponible en `http://localhost:3000`.

## Funcionalidades
- Soporte para múltiples idiomas: pt-br, en, es, fr, de, it
- Sustitución de palabrotas por carácter personalizable o palabra fija
- Soporta GET y POST
- Añade palabras extra para filtrar
- Ignora acentos automáticamente

## Endpoints

### Filtrar texto
`GET /filter`
`POST /filter`

#### Parámetros
- `text` (string o array de strings, obligatorio): texto(s) a filtrar
- `lang` (string, opcional): idioma (ej: pt-br, en, es, fr, de, it). Por defecto: en
- `fill_char` (string, opcional): carácter para reemplazar cada letra de la palabrota. Por defecto: `*`
- `fill_word` (string, opcional): palabra fija para reemplazar la palabrota (ej: "oculto"). Si se proporciona, tiene prioridad sobre `fill_char`.
- `extras` (string o array, opcional): hasta 10 palabras extra para filtrar, separadas por comas o array

#### Ejemplo de petición GET
```
GET /filter?text=esto es mierda&lang=es&fill_char=#
```
Respuesta:
```json
{
  "original_text": "esto es mierda",
  "filtered_text": "esto es #####",
  "isFiltered": true,
  "words_found": ["mierda"],
  "lang": "es",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": []
}
```

#### Ejemplo con fill_word
```
GET /filter?text=esto es mierda&lang=es&fill_word=[oculto]
```
Respuesta:
```json
{
  "original_text": "esto es mierda",
  "filtered_text": "esto es [oculto]",
  "isFiltered": true,
  "words_found": ["mierda"],
  "lang": "es",
  "fill_char": "*",
  "fill_word": "[oculto]",
  "extra_words": []
}
```

#### Ejemplo de petición POST con texto único
```json
POST /filter
{
  "text": "plátano naranja",
  "extras": ["plátano", "naranja"],
  "fill_char": "#"
}
```
Respuesta:
```json
{
  "results": {
    "original_text": "plátano naranja",
    "filtered_text": "###### #######",
    "isFiltered": true,
    "words_found": ["plátano", "naranja"]
  },
  "lang": "es",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": ["plátano", "naranja"]
}
```

#### Ejemplo de petición POST con múltiples textos
```json
POST /filter
{
  "text": [
    "primer texto con palabrota",
    "segundo texto limpio",
    "tercero con plátano"
  ],
  "extras": ["plátano"],
  "fill_char": "#"
}
```
Respuesta:
```json
{
  "results": [
    {
      "original_text": "primer texto con palabrota",
      "filtered_text": "primer texto con #########",
      "isFiltered": true,
      "words_found": ["palabrota"]
    },
    {
      "original_text": "segundo texto limpio",
      "filtered_text": "segundo texto limpio",
      "isFiltered": false,
      "words_found": []
    },
    {
      "original_text": "tercero con plátano",
      "filtered_text": "tercero con #######",
      "isFiltered": true,
      "words_found": ["plátano"]
    }
  ],
  "lang": "es",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": ["plátano"]
}
```

### Listar idiomas soportados
`GET /languages`

Respuesta:
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

## Pruebas
Ejecuta todas las pruebas automatizadas con:
```bash
npm test
```

## Deploy
- Para producción, hospeda en servicios como [Vercel](https://vercel.com/), [Render](https://render.com/), [Railway](https://railway.app/) o [Heroku](https://heroku.com/).

## Licencia
MIT

---

## Ejemplos de uso con diferentes frameworks

### Node.js (axios)
```js
const axios = require('axios');

// Ejemplo de filtro simple
axios.get('http://localhost:3000/filter', {
  params: {
    text: 'palabra mala aquí',
    lang: 'es',
    fill_char: '#'
  }
}).then(res => console.log(res.data));

// Ejemplo con palabras seguras y estadísticas
axios.post('http://localhost:3000/filter', {
  text: 'banana y naranja son frutas',
  extras: ['banana', 'naranja'],
  safe_words: ['banana'],
  include_stats: true
}).then(res => console.log(res.data));
```

### Python (requests)
```python
import requests

# Filtro simple
resp = requests.get('http://localhost:3000/filter', params={
    'text': 'palabra mala aquí',
    'lang': 'es',
    'fill_char': '#'
})
print(resp.json())

# Con palabras seguras y estadísticas
resp = requests.post('http://localhost:3000/filter', json={
    'text': 'banana y naranja son frutas',
    'extras': ['banana', 'naranja'],
    'safe_words': ['banana'],
    'include_stats': True
})
print(resp.json())
```

### cURL
```bash
curl "http://localhost:3000/filter?text=palabra%20mala%20aquí&lang=es&fill_char=#"

curl -X POST http://localhost:3000/filter \
  -H "Content-Type: application/json" \
  -d '{"text": "banana y naranja son frutas", "extras": ["banana", "naranja"], "safe_words": ["banana"], "include_stats": true}'
```

## Ejemplo detallado de respuesta

### Con palabras seguras y estadísticas
```json
{
  "results": {
    "original_text": "banana y naranja son frutas",
    "filtered_text": "banana y ###### son frutas",
    "isFiltered": true,
    "words_found": ["naranja"],
    "stats": {
      "total_words": 5,
      "total_characters": 27,
      "filtered_words": 1,
      "filtered_characters": 6,
      "filter_ratio": 0.222,
      "words_ratio": 0.2,
      "safe_words_used": 1
    }
  },
  "lang": "es",
  "fill_char": "*",
  "fill_word": null,
  "extra_words": ["banana", "naranja"],
  "safe_words": ["banana"],
  "aggregate_stats": {
    "total_words": 5,
    "total_characters": 27,
    "filtered_words": 1,
    "filtered_characters": 6,
    "safe_words_used": 1,
    "average_filter_ratio": 0.222,
    "average_words_ratio": 0.2
  }
}
```

## Cómo contribuir con nuevos idiomas

1. Crea un nuevo archivo en `src/lang/` con el código del idioma, por ejemplo, `xx.js`.
2. Exporta un objeto con las siguientes propiedades:
   - `name`: Nombre del idioma
   - `profanityList`: Array de palabras prohibidas
   - `messages`: Mensajes de error y advertencia (ver ejemplos en archivos existentes)
3. Sigue el patrón de los archivos existentes (ej: `pt-br.js`, `en.js`).
4. ¡Haz un PR o envía tu sugerencia!

---
