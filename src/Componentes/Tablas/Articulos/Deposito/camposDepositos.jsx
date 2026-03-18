export const camposDeposito = [
    {
        name: "nombre",
        label: "Nombre del Depósito",
        type: "text",
        required: true,
        section: "Identificación"
    },
    {
        name: "descripcion",
        label: "Descripción / Notas",
        type: "textarea",
        required: false,
        section: "Identificación"
    },
    {
        name: "responsable",
        label: "Responsable / Encargado",
        type: "text",
        required: false,
        section: "Contacto"
    },
    {
        name: "direccion",
        label: "Dirección",
        type: "text",
        required: false,
        section: "Ubicación"
    },
    {
        name: "ciudad",
        label: "Ciudad / Localidad",
        type: "text",
        required: false,
        section: "Ubicación"
    },
    {
        name: "telefono",
        label: "Teléfono de Contacto",
        type: "text",
        required: false,
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