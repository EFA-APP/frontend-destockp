import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesNotaCredito = ({ handleVerDetalle }) => [
  {
    ...accionesReutilizables.verDetalle,
    onClick: handleVerDetalle,
  },
  {
    ...accionesReutilizables.descargar,
    onClick: () => console.log("Descargando"),
  },
];
