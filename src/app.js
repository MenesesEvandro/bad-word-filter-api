// Import Express framework
const express = require('express');
// Import middleware to parse JSON
const bodyParser = require('body-parser');

// Create the Express application
const app = express();
// Define the port where the API will run
const port = process.env.PORT || 3000;

// Middleware to allow the API to understand JSON in request bodies
app.use(bodyParser.json());

// Default language if none is specified or the specified one is not supported
const DEFAULT_LANGUAGE = "en-us";

// Character for profanity replacement
const REPLACEMENT_CHAR = '*';

// Limit for extra words
const EXTRA_WORDS_LIMIT = 10;

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

/**
 * Builds a regular expression to find any of the profanities in the list.
 * Uses \b to ensure only whole words are matched.
 * The 'gi' flag makes the regex global (finds all occurrences) and case-insensitive.
 * @param {string[]} profanityList - The list of profanities for the selected language.
 * @returns {RegExp | null} - The compiled regular expression or null if the list is empty/invalid.
 */
function buildProfanityRegex(profanityList) {
    if (!profanityList || profanityList.length === 0) {
        return null;
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
    return new RegExp(pattern, 'giu'); // 'g' for global, 'i' for case-insensitive, 'u' for unicode
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
 * @returns {Object} Filtered text result
 */
function processText(text, profanityList, fill_char, fill_word) {
    const currentRegex = buildProfanityRegex(profanityList);
    if (!currentRegex) {
        return {
            filtered_text: text,
            isFiltered: false,
            words_found: []
        };
    }

    let filteredText = text;
    const foundWords = new Set();
    const normalizedText = normalizeText(text);

    // First find all matches in the normalized text
    const matches = [];
    let match;
    while ((match = currentRegex.exec(normalizedText)) !== null) {
        const normalizedWord = match[0];
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

    // Replace each match in the original text
    for (const match of matches) {
        const before = filteredText.slice(0, match.start);
        const after = filteredText.slice(match.end);
        const replacement = fill_word || fill_char.repeat(match.original.length);
        filteredText = before + replacement + after;
    }

    return {
        filtered_text: filteredText,
        isFiltered: foundWords.size > 0,
        words_found: Array.from(foundWords)
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
    
    if (typeof extras === 'string') {
        extras = extras.split(',').map(p => p.trim()).filter(Boolean);
    } else if (!Array.isArray(extras)) {
        extras = [];
    }
    extras = extras.slice(0, EXTRA_WORDS_LIMIT);
    
    return { texts, language, fill_char, fill_word, extras };
}

// Shared handler for GET and POST
function filterHandler(req, res) {
    const { texts, language, fill_char, fill_word, extras } = extractParams(req);
    const requestedLanguage = typeof language === 'string' ? language.toLowerCase() : DEFAULT_LANGUAGE;
    const languageFile = loadLanguageFile(requestedLanguage);
    const defaultLangFile = loadLanguageFile(DEFAULT_LANGUAGE);
    const languageAvailable = !!languageFile;
    const selectedLanguage = languageAvailable ? requestedLanguage : DEFAULT_LANGUAGE;
    const selectedLangFile = languageFile || defaultLangFile;
    const messages = selectedLangFile.messages;

    // Validate input
    if (!texts || texts.length === 0) {
        return res.status(400).json({ error: messages.required });
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
            words_found: []
        }));
        const response = {
            results: texts.length === 1 ? emptyResult[0] : emptyResult,
            lang: selectedLanguage
        };
        if (warning) response.warning = warning;
        return res.status(200).json(response);
    }

    // Process each text
    const results = texts.map(text => {
        const processed = processText(text, currentProfanityList, fill_char, fill_word);
        return {
            original_text: text,
            filtered_text: processed.filtered_text,
            isFiltered: processed.isFiltered,
            words_found: processed.words_found
        };
    });

    // Return single result or array depending on input
    const response = {
        results: texts.length === 1 ? results[0] : results,
        lang: selectedLanguage,
        fill_char,
        fill_word,
        extra_words: extras
    };
    if (warning) response.warning = warning;
    
    res.status(200).json(response);
}

// API endpoint to filter profanities (GET and POST)
app.get('/filter', filterHandler);
app.post('/filter', filterHandler);

// Function to get languages list with native names
function getSupportedLanguages() {
    return [
        { code: 'pt-br', name: 'Português (Brasil)' },
        { code: 'en-us', name: 'English (USA)' },
        { code: 'es-es', name: 'Español (España)' },
        { code: 'fr-fr', name: 'Français (France)' },
        { code: 'de-de', name: 'Deutsch (Deutschland)' },
        { code: 'it-it', name: 'Italiano (Italia)' }
    ];
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