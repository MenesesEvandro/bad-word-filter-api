module.exports = {
    name: 'Italiano (Italia)',
    profanityList: [
        "affanculo", "affanculare",
        "bagascia", "baldracca",
        "bastardo", "bastarda", "bastardi",
        "bocchino", "bocchini",
        "cacca", "caccati", "cazzo", "cazzi", "cazzata", "cazzate",
        "culo", "culi", "culone",
        "dio porco", "dio cane",
        "fanculo", "fancazzo",
        "fica", "figa", "figlio di puttana",
        "fottere", "fottiti", "fottuto", "fottuta",
        "inculare", "inculato", "inculata",
        "merda", "merde", "merdoso", "merdosa",
        "minchia", "minkia",
        "porca madonna", "porca miseria", "porca puttana",
        "porco dio",
        "puttana", "puttane", "puttaniere",
        "sborra", "sborrata", "sborrone",
        "stronzata", "stronzate", "stronzo", "stronza", "stronzi",
        "testa di cazzo", "tette",
        "troia", "troie", "vaffanculo",
        "zoccola", "zoccole"
    ],
    messages: {
        required: "Il parametro o campo 'text' è obbligatorio.",
        string: "Il valore di 'text' deve essere una stringa.",
        warning: (reqLang, defLang) => `La lingua richiesta '${reqLang}' non è disponibile. È stata utilizzata la lingua predefinita '${defLang}'.`,
        input_required: "Il testo di input deve essere una stringa non vuota.",
        input_too_long: "Il testo di input supera la lunghezza massima di {max} caratteri.",
        fill_char_invalid: "Il carattere di riempimento deve essere un solo carattere.",
        fill_word_profane: "La parola di riempimento non può contenere parole vietate."
    }
};
