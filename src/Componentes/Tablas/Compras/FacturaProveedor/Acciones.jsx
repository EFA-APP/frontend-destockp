import { accionesReutilizables } from "../../../UI/AccionesReutilizables";

  export const accionesFacturaProveedor =  ({handleVerDetalle }) => [
    {
      ...accionesReutilizables.verDetalle,
      onClick: handleVerDetalle,
    }
  ];