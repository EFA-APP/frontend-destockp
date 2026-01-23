import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesFacturaProveedor = ({ handleVerDetalle }) => [
  {
    ...accionesReutilizables.verDetalle,
    onClick: handleVerDetalle,
  },
  {
    ...accionesReutilizables.descargar,
    onClick: () => console.log("Descargando"),
  },
];
