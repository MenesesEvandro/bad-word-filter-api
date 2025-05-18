# Bad Word Filter API

[🇧🇷 Português](README.md) | [🇺🇸 English](README.en.md) | [🇪🇸 Español](README.es.md) | [🇫🇷 Français](README.fr.md) | [🇩🇪 Deutsch](README.de.md)

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
- Soporte para múltiples idiomas: pt-br, en-us, es-es, fr-fr, de-de
- Sustitución de palabrotas por carácter personalizable o palabra fija
- Soporta GET y POST
- Añade palabras extra para filtrar
- Ignora acentos automáticamente

## Endpoints

### Filtrar texto
`GET /filter`
`POST /filter`

#### Parámetros
- `text` (string, obligatorio): texto a filtrar
- `lang` (string, opcional): idioma (ej: pt-br, en-us, es-es, fr-fr, de-de). Por defecto: pt-br
- `fill_char` (string, opcional): carácter para sustituir cada letra de la palabrota. Por defecto: `*`
- `fill_word` (string, opcional): palabra fija para sustituir la palabrota (ej: "oculto"). Si se proporciona, tiene prioridad sobre `fill_char`.
- `extras` (string o array, opcional): hasta 10 palabras extra para filtrar, separadas por coma o array

#### Ejemplo de petición GET
```
GET /filter?text=esto es mierda&lang=es-es&fill_char=#
```
Respuesta:
```json
{
  "original_text": "esto es mierda",
  "filtered_text": "esto es #####",
  "isFiltered": true,
  "words_found": ["mierda"],
  "lang": "es-es",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": []
}
```

#### Ejemplo con fill_word
```
GET /filter?text=esto es mierda&lang=es-es&fill_word=[oculto]
```
Respuesta:
```json
{
  "original_text": "esto es mierda",
  "filtered_text": "esto es [oculto]",
  "isFiltered": true,
  "words_found": ["mierda"],
  "lang": "es-es",
  "fill_char": "*",
  "fill_word": "[oculto]",
  "extra_words": []
}
```

#### Ejemplo de petición POST
```json
POST /filter
{
  "text": "banana naranja",
  "extras": ["banana", "naranja"],
  "fill_char": "#"
}
```

### Listar idiomas soportados
`GET /languages`

Respuesta:
```json
{
  "suported_lang": ["pt-br", "en-us", "es-es", "fr-fr", "de-de"],
  "default_lang": "pt-br"
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
