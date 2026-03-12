export const camposDeposito = [
    {
        name: "nombre",
        label: "Nombre del Depósito",
        type: "text",
        required: true,
        placeholder: "Ej: Sucursal Oeste",
        section: "Identificación"
    },
    {
        name: "descripcion",
        label: "Descripción / Notas",
        type: "textarea",
        required: false,
        placeholder: "Detalles adicionales del depósito...",
        section: "Identificación"
    },
    {
        name: "responsable",
        label: "Responsable / Encargado",
        type: "text",
        required: false,
        placeholder: "Nombre completo",
        section: "Contacto"
    },
    {
        name: "direccion",
        label: "Dirección",
        type: "text",
        required: false,
        placeholder: "Ej: Av. Always Alive 123",
        section: "Ubicación"
    },
    {
        name: "ciudad",
        label: "Ciudad / Localidad",
        type: "text",
        required: false,
        placeholder: "Ej: Buenos Aires",
        section: "Ubicación"
    },
    {
        name: "telefono",
        label: "Teléfono de Contacto",
        type: "text",
        required: false,
        placeholder: "Ej: +54 9 11...",
        section: "Contacto"
    },
    {
        name: "principal",
        label: "¿Es el Depósito Principal?",
        type: "switch",
        defaultValue: false,
        required: false,
        section: "Configuración"
    },
    {
        name: "activo",
        label: "Depósito Activo",
        type: "switch",
        required: false,
        defaultValue: true,
        hidden: (data) => !data?.codigoSecuencial,
        section: "Configuración"
    }
];