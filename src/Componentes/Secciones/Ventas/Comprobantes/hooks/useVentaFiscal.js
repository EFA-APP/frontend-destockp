import { useState, useEffect } from "react";
import { ObtenerTiposComprobanteApi } from "../../../../../Backend/Arca/api/arca.api";

export const useVentaFiscal = (usuario, arcaConectado, infoIva) => {
  const [tiposComprobante, setTiposComprobante] = useState([]);
  const [cargandoVouchers, setCargandoVouchers] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState(99);
  const [enBlanco, setEnBlanco] = useState("si");

  const aplicaIva = arcaConectado && enBlanco === "si";

  useEffect(() => {
    const cargarVouchers = async () => {
      if (usuario?.conexionArca || usuario?.configuracionArca?.activo) {
        setCargandoVouchers(true);
        try {
          const res = await ObtenerTiposComprobanteApi();
          const vouchersRaw = Array.isArray(res) ? res : res?.data;
          if (Array.isArray(vouchersRaw)) {
            const filtrados = vouchersRaw.map((v) => ({
              id: v.Id,
              label: v.Desc,
            }));
            setTiposComprobante(filtrados);
            if (filtrados.length > 0 && !tipoDocumento)
              setTipoDocumento(filtrados[0].id);
          }
        } catch (e) {
          console.error("Error vouchers:", e);
        } finally {
          setCargandoVouchers(false);
        }
      }
    };
    cargarVouchers();
  }, [usuario]);

  useEffect(() => {
    if (enBlanco === "no") {
      setTipoDocumento(99);
    } else if (enBlanco === "si" && tipoDocumento === 99) {
      if (tiposComprobante.length > 0) setTipoDocumento(tiposComprobante[0].id);
    }
  }, [enBlanco, tiposComprobante]);

  useEffect(() => {
    if (arcaConectado && infoIva?.tipoFacturaDefault) {
      setTipoDocumento(infoIva.tipoFacturaDefault);
    }
  }, [arcaConectado, infoIva]);

  return {
    tiposComprobante,
    cargandoVouchers,
    tipoDocumento,
    setTipoDocumento,
    enBlanco,
    setEnBlanco,
    aplicaIva,
  };
};
