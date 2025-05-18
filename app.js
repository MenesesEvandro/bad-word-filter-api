// Importa o framework Express
const express = require('express');
// Importa o middleware para parsear JSON
const bodyParser = require('body-parser');

// Cria a aplicação Express
const app = express();
// Define a porta em que a API vai rodar
const port = process.env.PORT || 3000;

// Middleware para permitir que a API entenda JSON no corpo das requisições
app.use(bodyParser.json());

// Idioma padrão caso nenhum seja especificado ou o especificado não seja suportado
const IDIOMA_PADRAO = "pt-br";

// Carácter para substituição dos palavrões
const CARACTER_SUBSTITUICAO = '*';

// Limite de palavras extras
const LIMITE = 10; 

/**
 * Remove acentos e caracteres especiais de uma string
 * @param {string} texto - O texto a ser normalizado
 * @returns {string} - O texto sem acentos
 */
function normalizarTexto(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Constrói uma expressão regular para encontrar qualquer um dos palavrões na lista.
 * Usa \b para garantir que palavras completas sejam correspondidas.
 * A flag 'gi' torna a regex global (encontra todas as ocorrências) e case-insensitive.
 * @param {string[]} listaPalavroes - A lista de palavrões para o idioma selecionado.
 * @returns {RegExp | null} - A expressão regular compilada ou null se a lista for vazia/inválida.
 */
function construirRegexPalavroes(listaPalavroes) {
    if (!listaPalavroes || listaPalavroes.length === 0) {
        return null;
    }
    // Escapa caracteres especiais de regex dentro das palavras e normaliza acentuação
    const palavroesEscapados = listaPalavroes.map(p => 
        normalizarTexto(p).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    // Cria a regex com \b para garantir que só palavras inteiras sejam capturadas
    // e ignora diferenças de maiúsculas/minúsculas
    const pattern = `\\b(${palavroesEscapados.join('|')})\\b`;
    return new RegExp(pattern, 'gi'); // 'g' para global, 'i' para case-insensitive
}

// Função para carregar dinamicamente a lista de palavrões do idioma solicitado
function carregarListaPalavroes(idioma) {
    try {
        // Mapeamento entre idioma e arquivo
        const arquivos = {
            'pt-br': './lang/pt-br.js',
            'en-us': './lang/en-us.js',
            'es-es': './lang/es-es.js',
            'fr-fr': './lang/fr-fr.js',
            'de-de': './lang/de-de.js'
        };
        const arquivo = arquivos[idioma];
        if (!arquivo) return null;
        return require(arquivo);
    } catch (e) {
        return null;
    }
}

// Função utilitária para obter o texto, idioma, caractere e palavras extras da requisição
function extrairParametros(req) {
    // Suporte a GET (query) e POST (body)
    const isGet = req.method === 'GET';
    const texto = isGet ? req.query.text : req.body.text;
    const idioma = (isGet ? req.query.lang : req.body.lang) || IDIOMA_PADRAO;
    const fill_char = (isGet ? req.query.fill_char : req.body.fill_char) || CARACTER_SUBSTITUICAO;
    const fill_word = (isGet ? req.query.fill_word : req.body.fill_word) || null;
    let extras = isGet ? req.query.extras : req.body.extras;
    // Permite extras como string separada por vírgula ou array
    if (typeof extras === 'string') {
        extras = extras.split(',').map(p => p.trim()).filter(Boolean);
    } else if (!Array.isArray(extras)) {
        extras = [];
    }
    // Limita a 10 palavras
    extras = extras.slice(0, LIMITE);
    return { texto, idioma, fill_char, fill_word, extras };
}

// Handler compartilhado para GET e POST
function filtrarHandler(req, res) {
    const { texto, idioma, fill_char, fill_word, extras } = extrairParametros(req);
    if (typeof texto === 'undefined') {
        return res.status(400).json({ erro: "Parâmetro ou campo 'text' é obrigatório." });
    }
    if (typeof texto !== 'string') {
        return res.status(400).json({ erro: "O valor de 'text' deve ser uma string." });
    }
    const idiomaSelecionado = (typeof idioma === 'string' && carregarListaPalavroes(idioma.toLowerCase()))
        ? idioma.toLowerCase()
        : IDIOMA_PADRAO;
    let listaDePalavroesAtual = carregarListaPalavroes(idiomaSelecionado) || [];
    // Adiciona extras, evitando duplicatas
    if (extras && extras.length > 0) {
        listaDePalavroesAtual = [...new Set([...listaDePalavroesAtual, ...extras.map(p => p.toLowerCase())])];
    }
    if (!listaDePalavroesAtual || listaDePalavroesAtual.length === 0) {
        return res.status(200).json({
            texto_original: texto,
            texto_filtrado: texto,
            contem_palavrao: false,
            palavroes_encontrados: [],
            idioma_utilizado: idiomaSelecionado
        });
    }
    const regexPalavroesAtual = construirRegexPalavroes(listaDePalavroesAtual);
    if (!regexPalavroesAtual) {
        return res.status(200).json({
            texto_original: texto,
            texto_filtrado: texto,
            contem_palavrao: false,
            palavroes_encontrados: [],
            idioma_utilizado: idiomaSelecionado
        });
    }
    let textoFiltrado = texto;
    const palavroesEncontrados = [];
    const textoNormalizado = normalizarTexto(texto);
    textoFiltrado = texto;
    let lastIndex = 0;
    // Substituição considerando fill_word ou fill_char
    textoFiltrado = textoNormalizado.replace(regexPalavroesAtual, (match, ...args) => {
        const offset = args[args.length - 2];
        const palavraOriginal = texto.slice(offset, offset + match.length);
        const lowerMatch = palavraOriginal.toLowerCase();
        if (!palavroesEncontrados.includes(lowerMatch)) {
            palavroesEncontrados.push(lowerMatch);
        }
        if (fill_word) {
            return `${fill_word}`;
        } else {
            return fill_char.repeat(palavraOriginal.length);
        }
    });
    // Se fill_word foi usado, precisamos reconstruir o texto original com as substituições
    if (fill_word) {
        // Reconstrói o texto original substituindo os palavrões por [fill_word]
        let textoFinal = '';
        let idx = 0;
        textoNormalizarLoop: while (idx < texto.length) {
            let found = false;
            for (const palavra of listaDePalavroesAtual) {
                const palavraNorm = normalizarTexto(palavra);
                if (normalizarTexto(texto.substr(idx, palavra.length)).toLowerCase() === palavraNorm.toLowerCase()) {
                    textoFinal += `${fill_word}`;
                    idx += palavra.length;
                    found = true;
                    break;
                }
            }
            if (!found) {
                textoFinal += texto[idx];
                idx++;
            }
        }
        textoFiltrado = textoFinal;
    }
    const contemPalavrao = palavroesEncontrados.length > 0;
    res.status(200).json({
        original_text: texto,
        filtered_text: textoFiltrado,
        isFiltered: contemPalavrao,
        words_found: palavroesEncontrados,
        lang: idiomaSelecionado,
        fill_char: fill_char,
        fill_word: fill_word,
        extra_words: extras
    });
}

// Endpoint da API para filtrar palavrões (GET e POST)
app.get('/filter', filtrarHandler);
app.post('/filter', filtrarHandler);

// Rota para listar os idiomas suportados
app.get('/languages', (req, res) => {
    res.status(200).json({
        suported_lang: ['pt-br', 'en-us', 'es-es', 'fr-fr', 'de-de'],
        default_lang: IDIOMA_PADRAO
    });
});

// Rota de exemplo para testar se a API está no ar
app.get('/', (req, res) => {
    res.status(200).json({ status: "API is ready!" });
});

// Inicia o servidor
if (require.main === module) {
    app.listen(port, () => {
        console.log(`API is ready at http://localhost:${port}`);
    });
}

module.exports = app;
