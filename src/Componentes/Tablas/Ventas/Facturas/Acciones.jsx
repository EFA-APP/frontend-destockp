import { accionesReutilizables } from "../../../UI/AccionesReutilizables";

  export const accionesFactura =  ({handleVerDetalle }) => [
    {
      ...accionesReutilizables.verDetalle,
      onClick: handleVerDetalle,
    }
  ];