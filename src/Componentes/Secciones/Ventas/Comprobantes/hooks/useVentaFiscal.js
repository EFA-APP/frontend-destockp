import { useState, useEffect, useMemo } from "react";
import { ObtenerTiposComprobanteApi } from "../../../../../Backend/Arca/api/arca.api";
import { obtenerComprobantesPermitidos } from "../reglas/reglasComprobantes";
import { CONDICION_IVA } from "../reglas/reglasFiscales";

export const useVentaFiscal = (usuario, arcaConectado, infoIva, clienteSeleccionado) => {
  const [tiposComprobanteRaw, setTiposComprobanteRaw] = useState([]);
  const [cargandoVouchers, setCargandoVouchers] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState(99);
  const [enBlanco, setEnBlanco] = useState("si");

  const aplicaIva = arcaConectado && enBlanco === "si";

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

  // Filtrado DINÁMICO de comprobantes según reglas fiscales
  const tiposComprobante = useMemo(() => {
    if (enBlanco === "no") {
      return [{ id: 99, label: "COMPROBANTE INTERNO" }];
    }

    const emisorIva = infoIva?.condicionIvaId || CONDICION_IVA.RI;
    const receptorIva = clienteSeleccionado?.CondicionIVAReceptorId || CONDICION_IVA.CF;

    const permitidosIds = obtenerComprobantesPermitidos(emisorIva, receptorIva);
    
    let filtrados = tiposComprobanteRaw
      .filter(v => permitidosIds.includes(Number(v.Id)))
      .map((v) => ({
        id: v.Id,
        label: v.Desc,
      }));

    // FALLBACK: Si el filtro es demasiado restrictivo o infoIva aún no cargó 
    // y no hay resultados, mostrar todos los disponibles para no bloquear la UI.
    if (filtrados.length === 0 && tiposComprobanteRaw.length > 0) {
       return tiposComprobanteRaw.map(v => ({ id: v.Id, label: v.Desc }));
    }

    return filtrados;
  }, [tiposComprobanteRaw, infoIva, clienteSeleccionado, enBlanco]);

  // Sincronizar tipoDocumento cuando cambia la lista de permitidos
  useEffect(() => {
    if (enBlanco === "no") {
      setTipoDocumento(99);
    } else if (enBlanco === "si") {
       if (tiposComprobante.length > 0) {
          const IDs = tiposComprobante.map(t => Number(t.id));
          if (!IDs.includes(Number(tipoDocumento))) {
            setTipoDocumento(tiposComprobante[0].id);
          }
       }
    }
  }, [enBlanco, tiposComprobante, tipoDocumento]);

  useEffect(() => {
    if (arcaConectado && infoIva?.tipoFacturaDefault && tiposComprobante.some(t => t.id === infoIva.tipoFacturaDefault)) {
      setTipoDocumento(infoIva.tipoFacturaDefault);
    }
  }, [arcaConectado, infoIva, tiposComprobante]);

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
