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
        warning: (reqLang, defLang) => `La lingua richiesta '${reqLang}' non è disponibile. È stata utilizzata la lingua predefinita '${defLang}'.`
    }
};
