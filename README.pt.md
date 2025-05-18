# Bad Word Filter API

[🇧🇷 Português](README.pt.md) | [🇺🇸 English](README.md) | [🇪🇸 Español](README.es.md) | [🇫🇷 Français](README.fr.md) | [🇩🇪 Deutsch](README.de.md) | [🇮🇹 Italiano](README.it.md)


Bad Word Filter é um serviço web simples, multilíngue e gratuito para filtrar e remover palavrões, obscenidades e outros textos indesejados.

## Instalação via npm

Este pacote está disponível no npm:

[https://www.npmjs.com/package/@menesesevandro/bad-word-filter-api](https://www.npmjs.com/package/@menesesevandro/bad-word-filter-api)

Instale no seu projeto:
```bash
npm i @menesesevandro/bad-word-filter-api
```

## Como usar localmente

```bash
npm install
npm start
```
A API estará disponível em `http://localhost:3000`.

## Funcionalidades
- Suporte a múltiplos idiomas: pt-br, en, es, fr, de, it
- Substituição de palavrões por caractere customizável ou palavra fixa
- Suporte a GET e POST
- Adição de palavras extras para filtro
- Ignora acentuação automaticamente

## Endpoints

### Filtrar texto
`GET /filter`
`POST /filter`

#### Parâmetros
- `text` (string ou array de strings, obrigatório): texto(s) a ser(em) filtrado(s)
- `lang` (string, opcional): idioma (ex: pt-br, en, es, fr, de, it). Padrão: en
- `fill_char` (string, opcional): caractere para substituir cada letra do palavrão. Padrão: `*`
- `fill_word` (string, opcional): palavra fixa para substituir o palavrão (ex: "oculto"). Se informado, tem prioridade sobre `fill_char`.
- `extras` (string ou array, opcional): até 10 palavras extras para filtrar, separadas por vírgula ou array

#### Exemplo de requisição GET
```
GET /filter?text=isso é merda&lang=pt-br&fill_char=#
```
Resposta:
```json
{
  "original_text": "isso é uma merda",
  "filtered_text": "isso é uma #####",
  "isFiltered": true,
  "words_found": ["merda"],
  "lang": "pt-br",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": []
}
```

#### Exemplo de requisição com fill_word
```
GET /filter?text=isso é uma merda&lang=pt-br&fill_word=[oculto]
```
Resposta:
```json
{
  "original_text": "isso é uma merda",
  "filtered_text": "isso é uma [oculto]",
  "isFiltered": true,
  "words_found": ["merda"],
  "lang": "pt-br",
  "fill_char": "*",
  "fill_word": "[oculto]",
  "extra_words": []
}
```

#### Exemplo de requisição POST com texto único
```json
POST /filter
{
  "text": "banana laranja",
  "extras": ["banana", "laranja"],
  "fill_char": "#"
}
```
Resposta:
```json
{
  "results": {
    "original_text": "banana laranja",
    "filtered_text": "##### ######",
    "isFiltered": true,
    "words_found": ["banana", "laranja"]
  },
  "lang": "pt-br",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": ["banana", "laranja"]
}
```

#### Exemplo de requisição POST com múltiplos textos
```json
POST /filter
{
  "text": [
    "primeiro texto com palavrão",
    "segundo texto limpo",
    "terceiro com banana"
  ],
  "extras": ["banana"],
  "fill_char": "#"
}
```
Resposta:
```json
{
  "results": [
    {
      "original_text": "primeiro texto com palavrão",
      "filtered_text": "primeiro texto com ########",
      "isFiltered": true,
      "words_found": ["palavrão"]
    },
    {
      "original_text": "segundo texto limpo",
      "filtered_text": "segundo texto limpo",
      "isFiltered": false,
      "words_found": []
    },
    {
      "original_text": "terceiro com banana",
      "filtered_text": "terceiro com #####",
      "isFiltered": true,
      "words_found": ["banana"]
    }
  ],
  "lang": "pt-br",
  "fill_char": "#",
  "fill_word": null,
  "extra_words": ["banana"]
}
```

### Listar idiomas suportados
`GET /languages`

Resposta:
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

## Testes
Execute todos os testes automatizados com:
```bash
npm test
```

## Deploy
- Para uso em produção, hospede em serviços como [Vercel](https://vercel.com/), [Render](https://render.com/), [Railway](https://railway.app/) ou [Heroku](https://heroku.com/).

## Licença
MIT