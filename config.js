// ⚠️ CONFIGURACIÓN REQUERIDA
// Completa estos valores con tus credenciales de Google

const CONFIG = {
    // ID de tu Google Sheet
    // Obtén esto de la URL: https://docs.google.com/spreadsheets/d/[ID_AQUI]/edit
    SPREADSHEET_ID: "1lNV4wxCr3xf59Ck5JhYlZbwgXqCC5dTDAPq-NncydMU",

    // Tu Google Client ID (para autenticación OAuth)
    // Obtén esto de: https://console.cloud.google.com
    GOOGLE_CLIENT_ID: "129638172777-dbaq6irclh9jeah8g29e45i7ajufabii.apps.googleusercontent.com",

    // Rango de datos en el Sheet
    SHEET_NAME: "Base de datos Finan-Zas",
    RANGE: "A:F",

    // Nombres de las columnas
    COLUMNS: {
        DATE: 0,
        CATEGORY: 1,
        DESCRIPTION: 2,
        AMOUNT: 3,
        PAID_BY: 4,
        ID: 5
    },

    // Configuración de usuarios
    USERS: {
        USER1: "Geraldine",
        USER2: "Steven"
    },

    // Categorías disponibles
    CATEGORIES: [
        "Comida",
        "Transporte",
        "Compras",
        "Servicios",
        "Entretenimiento",
        "Salud",
        "Otro"
    ]
};

// API scopes necesarios
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
];
