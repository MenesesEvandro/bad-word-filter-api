// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Create the Express application
const app = express();
// Define the port where the API will run
const port = process.env.PORT || 3000;

// Middleware to allow the API to understand JSON in request bodies
app.use(bodyParser.json());

// Middleware de compressão para todas as respostas
app.use(compression());

// Middleware de rate limiting to avoid abuse
// This is a simple rate limiter to prevent abuse of the API
const isTestEnv = process.env.NODE_ENV === 'test';
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isTestEnv ? 10000 : 200, // limit for test environment
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

// Default language if none is specified or the specified one is not supported
const DEFAULT_LANGUAGE = "en";

// Character for profanity replacement
const REPLACEMENT_CHAR = '*';

// Limit for extra words
const EXTRA_WORDS_LIMIT = 10;

// Maximum limit for input text length
const MAX_TEXT_LENGTH = 10000;

/**
 * Removes accents and special characters from a string
 * @param {string} text - The text to be normalized
 * @returns {string} - The text without accents
 */
function normalizeText(text) {
    // First convert to lowercase for case-insensitive matching
    let normalized = text.toLowerCase();

    // Map special characters before normalization
    const specialChars = {
        'ß': 'ss',    // German eszett
        'æ': 'ae',    // ae ligature
        'œ': 'oe',    // oe ligature
        'ø': 'o',     // Danish/Norwegian o with stroke
        'ñ': 'n',     // Spanish n with tilde
        'ç': 'c'      // c cedilla
    };

    // Replace special characters
    for (const [char, replacement] of Object.entries(specialChars)) {
        normalized = normalized.replace(new RegExp(char, 'g'), replacement);
    }

    // Normalize unicode characters and remove diacritics
    normalized = normalized
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '');

    return normalized;
}

// Cache for compiled regex patterns
const regexCache = new Map();

/**
 * Builds a regular expression to find any of the profanities in the list.
 * Uses \b to ensure only whole words are matched.
 * The 'gi' flag makes the regex global (finds all occurrences) and case-insensitive.
 * @param {string[]} profanityList - The list of profanities for the selected language.
 * @returns {RegExp | null} - The compiled regular expression or null if the list is empty/invalid.
 */
function buildProfanityRegex(profanityList, langCode = '') {
    if (!profanityList || profanityList.length === 0) {
        return null;
    }
    // create a cache key based on the language code and the sorted list of profanities
    // This ensures that the same list of profanities will always generate the same regex
    // and avoids recompiling the regex for the same input
    const cacheKey = langCode + '|' + [...profanityList].sort().join(',');
    if (regexCache.has(cacheKey)) {
        return regexCache.get(cacheKey);
    }
    // Escape regex special characters in the words and normalize them
    const escapedWords = profanityList.map(word => {
        // Normalize the word and escape regex special characters
        const normalized = normalizeText(word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Create alternations for accented characters
        return normalized;
    });
    
    // Create the regex pattern with word boundaries
    const pattern = `\\b(?:${escapedWords.join('|')})\\b`;
    const regex = new RegExp(pattern, 'giu'); // 'g' for global, 'i' for case-insensitive, 'u' for unicode
    regexCache.set(cacheKey, regex);
    return regex;
}

// Function to dynamically load the language file for the requested language
function loadLanguageFile(language) {
    try {
        // Only require the selected language file
        const langFile = `./lang/${language}.js`;
        return require(langFile);
    } catch (e) {
        return null;
    }
}

/**
 * Process a single text string for profanity filtering
 * @param {string} text - Text to be filtered
 * @param {string[]} profanityList - List of words to filter
 * @param {string} fill_char - Character to use for replacement
 * @param {string|null} fill_word - Word to use for replacement
 * @param {string[]} safeWords - List of words that should never be filtered
 * @returns {Object} Filtered text result with statistics
 */
function processText(text, profanityList, fill_char, fill_word, langCode = '', safeWords = []) {
    const currentRegex = buildProfanityRegex(profanityList, langCode);
    if (!currentRegex) {
        return {
            filtered_text: text,
            isFiltered: false,
            words_found: [],
            stats: {
                total_words: text.trim().split(/\s+/).length,
                total_characters: text.length,
                filtered_words: 0,
                filtered_characters: 0,
                filter_ratio: 0,
                safe_words_used: 0
            }
        };
    }

    // Normalize safe words for comparison
    const normalizedSafeWords = new Set(safeWords.map(word => normalizeText(word)));

    let filteredText = text;
    const foundWords = new Set();
    const normalizedText = normalizeText(text);

    // First find all matches in the normalized text
    const matches = [];
    let match;
    while ((match = currentRegex.exec(normalizedText)) !== null) {
        const normalizedWord = match[0];
        
        // Skip if the word is in the safe words list
        if (normalizedSafeWords.has(normalizedWord)) {
            continue;
        }
        
        const startPos = match.index;
        const endPos = startPos + normalizedWord.length;
        
        // Get the original word from the input text
        const originalWord = text.slice(startPos, endPos);
        
        matches.push({
            original: originalWord,
            normalized: normalizedWord,
            start: startPos,
            end: endPos
        });
        
        foundWords.add(normalizedWord);
    }

    // Sort matches by position in reverse order to replace from end to start
    matches.sort((a, b) => b.start - a.start);

    let totalFiltered = 0;
    // Replace each match in the original text
    for (const match of matches) {
        const before = filteredText.slice(0, match.start);
        const after = filteredText.slice(match.end);
        const replacement = fill_word || fill_char.repeat(match.original.length);
        filteredText = before + replacement + after;
        totalFiltered += match.original.length;
    }

    // Calculate detailed statistics
    const words = text.trim().split(/\s+/);
    const filteredWords = matches.length;
    const safeWordsUsed = words.filter(word => normalizedSafeWords.has(normalizeText(word))).length;

    const stats = {
        total_words: words.length,
        total_characters: text.length,
        filtered_words: filteredWords,
        filtered_characters: totalFiltered,
        filter_ratio: text.length > 0 ? totalFiltered / text.length : 0,
        words_ratio: words.length > 0 ? filteredWords / words.length : 0,
        safe_words_used: safeWordsUsed
    };

    return {
        filtered_text: filteredText,
        isFiltered: foundWords.size > 0,
        words_found: Array.from(foundWords),
        stats: stats
    };
}

// Utility function to get text, language, replacement character, and extra words from the request
function extractParams(req) {
    // Support for GET (query) and POST (body)
    const isGet = req.method === 'GET';
    const rawText = isGet ? req.query.text : req.body.text;
    
    // Handle text as string or array of strings
    let texts = [];
    if (Array.isArray(rawText)) {
        texts = rawText.filter(t => typeof t === 'string');
    } else if (typeof rawText === 'string') {
        texts = [rawText];
    }
    
    const language = (isGet ? req.query.lang : req.body.lang) || DEFAULT_LANGUAGE;
    const fill_char = (isGet ? req.query.fill_char : req.body.fill_char) || REPLACEMENT_CHAR;
    const fill_word = (isGet ? req.query.fill_word : req.body.fill_word) || null;
    let extras = isGet ? req.query.extras : req.body.extras;
    let safeWords = isGet ? req.query.safe_words : req.body.safe_words;
    const includeStats = isGet ? 
        req.query.include_stats === 'true' : 
        req.body.include_stats === true;
    
    if (typeof extras === 'string') {
        extras = extras.split(',').map(p => p.trim()).filter(Boolean);
    } else if (!Array.isArray(extras)) {
        extras = [];
    }
    extras = extras.slice(0, EXTRA_WORDS_LIMIT);

    if (typeof safeWords === 'string') {
        safeWords = safeWords.split(',').map(w => w.trim()).filter(Boolean);
    } else if (!Array.isArray(safeWords)) {
        safeWords = [];
    }
    
    return { texts, language, fill_char, fill_word, extras, safeWords, includeStats };
}

function validateInput(text, fill_char, fill_word, profanityList, messages) {
    if (typeof text !== 'string' || text.length === 0) {
        throw new Error(messages.input_required);
    }
    if (text.length > MAX_TEXT_LENGTH) {
        throw new Error(messages.input_too_long?.replace('{max}', MAX_TEXT_LENGTH));
    }
    if (fill_char && fill_char.length !== 1) {
        throw new Error(messages.fill_char_invalid);
    }
    if (fill_word) {
        const normalizedFillWord = normalizeText(fill_word);
        const hasProfanity = profanityList.some(word => normalizedFillWord.includes(normalizeText(word)));
        if (hasProfanity) {
            throw new Error(messages.fill_word_profane);
        }
    }
}

// Simple cache to store results
// This is a simple in-memory cache. In a production environment, consider using a more robust solution like Redis.
const resultCache = new Map();
const RESULT_CACHE_LIMIT = 200;

function getCacheKey({ texts, language, fill_char, fill_word, extras, safeWords, includeStats }) {
    return JSON.stringify({ texts, language, fill_char, fill_word, extras, safeWords, includeStats });
}

function setResultCache(key, value) {
    if (resultCache.size >= RESULT_CACHE_LIMIT) {
        // Remove o item mais antigo
        const firstKey = resultCache.keys().next().value;
        resultCache.delete(firstKey);
    }
    resultCache.set(key, value);
}

// Shared handler for GET and POST
function filterHandler(req, res) {
    const { texts, language, fill_char, fill_word, extras, safeWords, includeStats } = extractParams(req);
    const cacheKey = getCacheKey({ texts, language, fill_char, fill_word, extras, safeWords, includeStats });
    if (resultCache.has(cacheKey)) {
        return res.status(200).json(resultCache.get(cacheKey));
    }

    const requestedLanguage = typeof language === 'string' ? language.toLowerCase() : DEFAULT_LANGUAGE;
    const languageFile = loadLanguageFile(requestedLanguage);
    const defaultLangFile = loadLanguageFile(DEFAULT_LANGUAGE);
    const languageAvailable = !!languageFile;
    const selectedLanguage = languageAvailable ? requestedLanguage : DEFAULT_LANGUAGE;
    const selectedLangFile = languageFile || defaultLangFile;
    const messages = selectedLangFile.messages;

    // Validate input
    try {
        if (!texts || texts.length === 0) {
            return res.status(400).json({ error: messages.required });
        }
        for (const text of texts) {
            validateInput(text, fill_char, fill_word, selectedLangFile.profanityList || [], messages);
        }
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }

    let warning = undefined;
    if (!languageAvailable && requestedLanguage !== DEFAULT_LANGUAGE) {
        warning = messages.warning(requestedLanguage, DEFAULT_LANGUAGE);
    }

    // Get profanity list from selected language and default language if needed
    let currentProfanityList = [];
    if (languageAvailable) {
        currentProfanityList = languageFile.profanityList || [];
    } else {
        currentProfanityList = defaultLangFile.profanityList || [];
    }

    if (extras && extras.length > 0) {
        currentProfanityList = [...new Set([...currentProfanityList, ...extras.map(p => p.toLowerCase())])];
    }

    if (!currentProfanityList || currentProfanityList.length === 0) {
        const emptyResult = texts.map(text => ({
            original_text: text,
            filtered_text: text,
            isFiltered: false,
            words_found: [],
            ...(includeStats && {
                stats: {
                    total_words: text.trim().split(/\s+/).length,
                    total_characters: text.length,
                    filtered_words: 0,
                    filtered_characters: 0,
                    filter_ratio: 0,
                    words_ratio: 0,
                    safe_words_used: 0
                }
            })
        }));

        const response = {
            results: texts.length === 1 ? emptyResult[0] : emptyResult,
            lang: selectedLanguage
        };
        
        if (includeStats) {
            response.aggregate_stats = calculateAggregateStats(emptyResult);
        }
        
        if (warning) response.warning = warning;
        return res.status(200).json(response);
    }

    // Process each text
    const results = texts.map(text => {
        const processed = processText(text, currentProfanityList, fill_char, fill_word, selectedLanguage, safeWords);
        const result = {
            original_text: text,
            filtered_text: processed.filtered_text,
            isFiltered: processed.isFiltered,
            words_found: processed.words_found
        };

        if (includeStats) {
            result.stats = processed.stats;
        }

        return result;
    });

    // Return single result or array depending on input
    const response = {
        results: texts.length === 1 ? results[0] : results,
        lang: selectedLanguage,
        fill_char,
        fill_word,
        extra_words: extras,
        safe_words: safeWords
    };

    if (includeStats) {
        response.aggregate_stats = calculateAggregateStats(results);
    }
    
    if (warning) response.warning = warning;
    setResultCache(cacheKey, response);
    res.status(200).json(response);
}

// API endpoint to filter profanities (GET and POST)
app.get('/filter', filterHandler);
app.post('/filter', filterHandler);

// Function to get languages list with native names
function getSupportedLanguages() {
    const langDir = path.join(__dirname, 'lang');
    const files = fs.readdirSync(langDir);
    
    // Filter for .js files and extract language codes
    const languages = files
        .filter(file => file.endsWith('.js'))
        .map(file => {
            const code = path.basename(file, '.js');
            try {
                // Import the language file
                const langModule = require(path.join(langDir, file));
                // Get the native name from the module if available, or generate a default one
                return {
                    code,
                    name: langModule.name || code.toUpperCase()
                };
            } catch (error) {
                console.warn(`Failed to load language file: ${file}`);
                return null;
            }
        })
        .filter(lang => lang !== null) // Remove any failed imports
        .sort((a, b) => a.code.localeCompare(b.code)); // Sort by language code

    return languages;
}

// Route to list supported languages
app.get('/languages', (req, res) => {
    res.status(200).json({
        languages: getSupportedLanguages(),
        default_lang: DEFAULT_LANGUAGE
    });
});

// Example route to test if the API is up
app.get('/', (req, res) => {
    res.status(200).json({ status: "API is ready!" });
});

// Start the server
if (require.main === module) {
    app.listen(port, () => {
        console.log(`API is ready at http://localhost:${port}`);
    });
}

module.exports = app;

/**
 * Calculate aggregate statistics for multiple processed texts
 * @param {Array} results Array of processed text results
 * @returns {Object} Aggregate statistics
 */
function calculateAggregateStats(results) {
    if (!Array.isArray(results)) {
        results = [results];
    }

    return results.reduce((agg, result) => {
        const stats = result.stats;
        return {
            total_words: agg.total_words + stats.total_words,
            total_characters: agg.total_characters + stats.total_characters,
            filtered_words: agg.filtered_words + stats.filtered_words,
            filtered_characters: agg.filtered_characters + stats.filtered_characters,
            safe_words_used: agg.safe_words_used + stats.safe_words_used,
            average_filter_ratio: results.length > 0 ? 
                results.reduce((sum, r) => sum + r.stats.filter_ratio, 0) / results.length : 0,
            average_words_ratio: results.length > 0 ? 
                results.reduce((sum, r) => sum + r.stats.words_ratio, 0) / results.length : 0
        };
    }, {
        total_words: 0,
        total_characters: 0,
        filtered_words: 0,
        filtered_characters: 0,
        safe_words_used: 0,
        average_filter_ratio: 0,
        average_words_ratio: 0
    });
}