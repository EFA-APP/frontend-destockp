import { ProveedoresIcono } from "../../../assets/Icons";

const proveedorConfig = {
    title: "Detalle del producto",
    icon: <ProveedoresIcono size={18} />,
    sections: [
        {
            label: "Razon Social",
            key: "razonSocial",
            sub: (p) => `C.U.I.T: ${p.cuit}`,
            editable: true,
        },
        {
            label: "Email",
            key: "email",
            sub: (p) => `Telefono: ${p.telefono}`,
            editable: true,
        },
        { label: "Rubro", key: "rubro", editable: true },
        { label: "Documento", key: "documento", editable: true, ocultar: true },
        { label: "Direccion", key: "direccion", editable: true, ocultar: true },
        { label: "Condicion I.V.A", key: "condicionIVA", editable: true, ocultar: true },
    ],
    metrics: [
        { label: "Direccion", value: "direccion" },
        { label: "Condicion I.V.A", value: "condicionIVA" },
    ],
};

export default proveedorConfig;
