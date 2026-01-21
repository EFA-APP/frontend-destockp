import { PersonaIcono } from "../../../assets/Icons";

const clienteConfig = {
    title: "Detalle del producto",
    icon: <PersonaIcono size={18} />,
    sections: [
        {
            label: "Nombre",
            key: "nombre",
            sub: (p) => `Documento: ${p.documento}`,
            editable: true,
        },
        {
            label: "Email",
            key: "email",
            sub: (p) => `Telefono: ${p.telefono}`,
            editable: true,
        },
        { label: "Documento", key: "documento", editable: true, ocultar: true },
        { label: "Direccion", key: "direccion", editable: true, ocultar: true },
        { label: "Condicion I.V.A", key: "condicionIVA", editable: true, ocultar: true },
    ],
    metrics: [
        { label: "Direccion", value: "direccion" },
        { label: "Condicion I.V.A", value: "condicionIVA" },
    ],
};

export default clienteConfig;
