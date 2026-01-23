import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";

export const accionesOrdenDeVenta = ({ handleVerDetalle }) => [
  {
    ...accionesReutilizables.verDetalle,
    onClick: handleVerDetalle,
  },
  {
    ...accionesReutilizables.descargar,
    onClick: () => console.log("Descargando"),
  },
];
