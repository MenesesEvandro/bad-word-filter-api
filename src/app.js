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
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
    // Escape regex special characters in the words and normalize accents
    const escapedWords = profanityList.map(p =>
        normalizeText(p).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );
    // Create the regex with \b to ensure only whole words are captured
    // and ignore case differences
    const pattern = `\\b(${escapedWords.join('|')})\\b`;
    return new RegExp(pattern, 'gi'); // 'g' for global, 'i' for case-insensitive
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

// Utility function to get text, language, replacement character, and extra words from the request
function extractParams(req) {
    // Support for GET (query) and POST (body)
    const isGet = req.method === 'GET';
    const text = isGet ? req.query.text : req.body.text;
    const language = (isGet ? req.query.lang : req.body.lang) || DEFAULT_LANGUAGE;
    const fill_char = (isGet ? req.query.fill_char : req.body.fill_char) || REPLACEMENT_CHAR;
    const fill_word = (isGet ? req.query.fill_word : req.body.fill_word) || null;
    let extras = isGet ? req.query.extras : req.body.extras;
    // Allow extras as comma-separated string or array
    if (typeof extras === 'string') {
        extras = extras.split(',').map(p => p.trim()).filter(Boolean);
    } else if (!Array.isArray(extras)) {
        extras = [];
    }
    // Limit to 10 words
    extras = extras.slice(0, EXTRA_WORDS_LIMIT);
    return { text, language, fill_char, fill_word, extras };
}

// Shared handler for GET and POST
function filterHandler(req, res) {
    const { text, language, fill_char, fill_word, extras } = extractParams(req);
    const requestedLanguage = typeof language === 'string' ? language.toLowerCase() : DEFAULT_LANGUAGE;
    const languageFile = loadLanguageFile(requestedLanguage);
    const languageAvailable = !!languageFile;
    const selectedLanguage = languageAvailable ? requestedLanguage : DEFAULT_LANGUAGE;
    const selectedLangFile = languageFile || loadLanguageFile(DEFAULT_LANGUAGE);
    const messages = selectedLangFile.messages;

    if (typeof text === 'undefined') {
        return res.status(400).json({ error: messages.required });
    }
    if (typeof text !== 'string') {
        return res.status(400).json({ error: messages.string });
    }
    
    let warning = undefined;
    if (!languageAvailable && requestedLanguage !== DEFAULT_LANGUAGE) {
        warning = messages.warning(requestedLanguage, DEFAULT_LANGUAGE);
    }
    
    let currentProfanityList = languageFile?.profanityList || [];
    // Add extras, avoiding duplicates
    if (extras && extras.length > 0) {
        currentProfanityList = [...new Set([...currentProfanityList, ...extras.map(p => p.toLowerCase())])];
    }
    
    if (!currentProfanityList || currentProfanityList.length === 0) {
        const response = {
            original_text: text,
            filtered_text: text,
            isFiltered: false,
            words_found: [],
            lang: selectedLanguage
        };
        if (warning) response.warning = warning;
        return res.status(200).json(response);
    }
    
    const currentRegex = buildProfanityRegex(currentProfanityList);
    if (!currentRegex) {
        const response = {
            original_text: text,
            filtered_text: text,
            isFiltered: false,
            words_found: [],
            lang: selectedLanguage
        };
        if (warning) response.warning = warning;
        return res.status(200).json(response);
    }
    
    let filteredText = text;
    const foundWords = [];
    const normalizedText = normalizeText(text);
    
    // Substitution considering fill_word or fill_char
    filteredText = normalizedText.replace(currentRegex, (match, ...args) => {
        const offset = args[args.length - 2];
        const originalWord = text.slice(offset, offset + match.length);
        const lowerMatch = originalWord.toLowerCase();
        if (!foundWords.includes(lowerMatch)) {
            foundWords.push(lowerMatch);
        }
        if (fill_word) {
            return `${fill_word}`;
        } else {
            return fill_char.repeat(originalWord.length);
        }
    });
    
    // If fill_word was used, we need to reconstruct the original text with the replacements
    if (fill_word) {
        // Reconstruct the original text replacing profanities with [fill_word]
        let finalText = '';
        let idx = 0;
        while (idx < text.length) {
            let found = false;
            for (const word of currentProfanityList) {
                const wordNorm = normalizeText(word);
                if (normalizeText(text.substr(idx, word.length)).toLowerCase() === wordNorm.toLowerCase()) {
                    finalText += `${fill_word}`;
                    idx += word.length;
                    found = true;
                    break;
                }
            }
            if (!found) {
                finalText += text[idx];
                idx++;
            }
        }
        filteredText = finalText;
    }
    
    const hasProfanity = foundWords.length > 0;
    const response = {
        original_text: text,
        filtered_text: filteredText,
        isFiltered: hasProfanity,
        words_found: foundWords,
        lang: selectedLanguage,
        fill_char: fill_char,
        fill_word: fill_word,
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
        { code: 'de-de', name: 'Deutsch (Deutschland)' }
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