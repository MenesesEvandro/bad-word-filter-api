module.exports = {
    name: 'Deutsch (Deutschland)',
    profanityList: [
        "arsch", "arschloch", "arschlocher",
        "schlampe", "schlampen",
        "hure", "huren", "hurensohn", "hurensohne",
        "fotze", "fotzen",
        "scheisse", "scheiss", "scheissen",
        "schwanz", "schwanze",
        "schwuchtel", "schwuchteln",
        "wichser", "wichsen", "wixer", "wixen",
        "fick", "ficken", "gefickt",
        "nutte", "nutten",
        "sau", "drecksau",
        "miststuck", "miststucke",
        "kacke", "kacken",
        "pisse", "pissen",
        "muschi", "muschis",
        "trottel", "trotteln",
        "depp", "deppen",
        "idiot", "idioten",
        "bastard", "bastarde",
        "vollidiot", "vollidioten",
        "dummkopf", "dummkopfe",
        "blodsinn", "blodsinnig",
        "hurenbock", "hurenbocke",
        "wixer", "wichser",
        "pisser", "pisser",
        "kotze", "kotzen",
        "titten", "mopse",
        "heilige scheisse", "heilige kacke",
        "verdammt", "verdammte"
    ],
    messages: {
        required: "Parameter oder Feld 'text' ist erforderlich.",
        string: "Der Wert von 'text' muss eine Zeichenkette sein.",
        warning: (reqLang, defLang) => `Die angeforderte Sprache '${reqLang}' ist nicht verfügbar. Die Standardsprache '${defLang}' wurde verwendet.`,
        input_required: "Der Eingabetext muss eine nicht-leere Zeichenkette sein.",
        input_too_long: "Der Eingabetext überschreitet die maximale Länge von {max} Zeichen.",
        fill_char_invalid: "Das Ersetzungszeichen muss ein einzelnes Zeichen sein.",
        fill_word_profane: "Das Ersetzungswort darf keine Schimpfwörter enthalten."
    }
};
