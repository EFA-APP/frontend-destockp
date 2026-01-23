import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesNotaDebito = ({ handleVerDetalle }) => [
  {
    ...accionesReutilizables.verDetalle,
    onClick: handleVerDetalle,
  },
  {
    ...accionesReutilizables.descargar,
    onClick: () => console.log("Descargando"),
  },
];
