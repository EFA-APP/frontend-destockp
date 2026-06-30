import { useState } from "react";

export const useTabsComprobante = (initialTipoOperacion = "INGRESO") => {
  const [tipoOperacion, setTipoOperacion] = useState(initialTipoOperacion);
  const [tipoDetalle, setTipoDetalle] = useState("PRODUCTO"); // PRODUCTO / CUENTA_CONTABLE / MATERIA_PRIMA

  return {
    tipoOperacion,
    setTipoOperacion,
    tipoDetalle,
    setTipoDetalle,
  };
};
