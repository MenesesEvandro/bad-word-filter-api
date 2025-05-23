module.exports = {
    name: 'Español (España)',
    profanityList: [
        "cabron", "cabrona", "cabrones", "cabronas",
        "puta", "putas", "putita", "putitas", "putona", "putonas",
        "puto", "putos", "putito", "putitos", "puton", "putones",
        "mierda", "mierdas", "mierdita", "mierditas",
        "cono", "conos", "conito", "conitos",
        "cojon", "cojones", "cojonudo", "cojonudos",
        "joder", "jodido", "jodida", "jodidos", "jodidas",
        "follar", "follado", "follada", "follados", "folladas",
        "maricon", "maricones", "marica", "maricas",
        "pendejo", "pendeja", "pendejos", "pendejas",
        "gilipollas", "gilipolleces",
        "hostia", "hostias", "hostion",
        "verga", "vergas", "vergon", "vergones",
        "polla", "pollas", "pollon", "pollones",
        "chingar", "chingado", "chingada", "chingados", "chingadas",
        "cagar", "cagado", "cagada", "cagados", "cagadas",
        "imbecil", "imbeciles",
        "idiota", "idiotas",
        "tonto", "tonta", "tontos", "tontas",
        "bastardo", "bastarda", "bastardos", "bastardas",
        "hijoputa", "hijoputo", "hijasdeputa", "hijosdeputa",
        "malparido", "malparida", "malparidos", "malparidas",
        "culero", "culera", "culeros", "culeras",
        "mamada", "mamadas", "mamar", "mamando",
        "capullo", "capulla", "capullos", "capullas",
        "carajo", "carajos", "carajito", "carajitos",
        "comemierda", "comemierdas",
        "lameculos", "lameculo",
        "pinche", "pinches",
        "puto", "putos", "putito", "putitos",
        "zorra", "zorras", "zorrita", "zorritas"
    ],
    messages: {
        required: "El parámetro o campo 'text' es obligatorio.",
        string: "El valor de 'text' debe ser una cadena de texto.",
        warning: (reqLang, defLang) => `El idioma solicitado '${reqLang}' no está disponible. Se utilizó el idioma predeterminado '${defLang}'.`,
        input_required: "El texto de entrada debe ser una cadena no vacía.",
        input_too_long: "El texto de entrada supera el tamaño máximo de {max} caracteres.",
        fill_char_invalid: "El carácter de relleno debe ser un solo carácter.",
        fill_word_profane: "La palabra de relleno no puede contener palabras prohibidas."
    }
};
