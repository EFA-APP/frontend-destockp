import { useState, useEffect, useMemo } from "react";
import { ObtenerTiposComprobanteApi } from "../../../../../Backend/Arca/api/arca.api";

export const useVentaFiscal = (usuario, arcaConectado) => {
  const [tiposComprobanteRaw, setTiposComprobanteRaw] = useState([]);
  const [cargandoVouchers, setCargandoVouchers] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState(99);
  const [enBlanco, setEnBlanco] = useState("si");

  const aplicaIva = useMemo(() => {
    if (!arcaConectado || enBlanco !== "si") return false;
    // Comprobantes que NO llevan IVA (Monotributo/Exento): 11(Factura C), 12(ND C), 13(NC C), 15(Recibo C)
    const tiposSinIva = [11, 12, 13, 15];
    return !tiposSinIva.includes(Number(tipoDocumento));
  }, [arcaConectado, enBlanco, tipoDocumento]);

  // Carga inicial de todos los tipos soportados por AFIP para este usuario
  useEffect(() => {
    const cargarVouchers = async () => {
      if (usuario?.conexionArca || usuario?.configuracionArca?.activo) {
        setCargandoVouchers(true);
        try {
          const res = await ObtenerTiposComprobanteApi();
          const vouchersRaw = Array.isArray(res) ? res : res?.data;
          if (Array.isArray(vouchersRaw)) {
            setTiposComprobanteRaw(vouchersRaw);
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

  // Se eliminó el filtrado dinámico local. Ahora se confía en la respuesta de la API.
  // Se eliminó el filtrado dinámico local. Ahora se confía en la respuesta de la API.
  const tiposComprobante = useMemo(() => {
    if (enBlanco === "no") {
      return [
        { id: 991, label: "COMPROBANTE DE VENTA (I)" },
        { id: 992, label: "RECIBO DE COBRO (I)" },
        { id: 993, label: "NOTA DE CRÉDITO (I)" },
        { id: 994, label: "NOTA DE DÉBITO (I)" },
      ];
    }

    return tiposComprobanteRaw.map((v) => ({
      id: v.Id,
      label: v.Desc,
    }));
  }, [tiposComprobanteRaw, enBlanco]);

  // Sincronizar tipoDocumento cuando cambia la lista de permitidos
  useEffect(() => {
    if (enBlanco === "no") {
      const IDsInternos = [991, 995, 996];
      if (!IDsInternos.includes(Number(tipoDocumento))) {
        setTipoDocumento(991);
      }
    } else if (enBlanco === "si") {
      if (tiposComprobante.length > 0) {
        const IDs = tiposComprobante.map((t) => Number(t.id));
        if (!IDs.includes(Number(tipoDocumento))) {
          setTipoDocumento(tiposComprobante[0].id);
        }
      }
    }
  }, [enBlanco, tiposComprobante, tipoDocumento]);

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
