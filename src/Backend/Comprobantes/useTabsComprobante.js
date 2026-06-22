import { useState } from "react";

export const useTabsComprobante = () => {
  const [tipoOperacion, setTipoOperacion] = useState("INGRESO");
  const [tipoDetalle, setTipoDetalle] = useState("PRODUCTO"); // PRODUCTO / CUENTA_CONTABLE / MATERIA_PRIMA

  return {
    tipoOperacion,
    setTipoOperacion,
    tipoDetalle,
    setTipoDetalle,
  };
};
