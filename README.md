# Bad Word Filter API

Bad Word Filter é um serviço web simples e gratuito para filtrar e remover palavrões, obscenidades e outros textos indesejados.

## Funcionalidades
- Suporte a múltiplos idiomas: pt-br, en-us, es-es, fr-fr, de-de
- Substituição de palavrões por caractere customizável ou palavra fixa
- Suporte a GET e POST
- Adição de palavras extras para filtro
- Ignora acentuação automaticamente

## Como usar

### Instalação local
```bash
npm install
npm start
```
A API estará disponível em `http://localhost:3000`.

### Endpoints

#### Filtrar texto
`GET /filter`
`POST /filter`

##### Parâmetros
- `text` (string, obrigatório): texto a ser filtrado
- `lang` (string, opcional): idioma (ex: pt-br, en-us, es-es, fr-fr, de-de). Padrão: pt-br
- `fill_char` (string, opcional): caractere para substituir cada letra do palavrão. Padrão: `*`
- `fill_word` (string, opcional): palavra fixa para substituir o palavrão (ex: "oculto"). Se informado, tem prioridade sobre `fill_char`.
- `extras` (string ou array, opcional): até 10 palavras extras para filtrar, separadas por vírgula ou array

##### Exemplo de requisição GET
```
GET /filter?text=isso é uma merda&lang=pt-br&fill_char=#
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

##### Exemplo de requisição com fill_word
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

##### Exemplo de requisição POST
```json
POST /filter
{
  "text": "banana laranja",
  "extras": ["banana", "laranja"],
  "fill_char": "#"
}
```

#### Listar idiomas suportados
`GET /languages`

Resposta:
```json
{
  "suported_lang": ["pt-br", "en-us", "es-es", "fr-fr", "de-de"],
  "default_lang": "pt-br"
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