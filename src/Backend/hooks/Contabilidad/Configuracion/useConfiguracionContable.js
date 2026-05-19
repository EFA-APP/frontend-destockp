import { useState, useCallback } from "react";
import { configuracionApi } from "../../../Contabilidad/api/configuracion.api";
import { useAlertas } from "../../../../store/useAlertas";

export const useConfiguracionContable = () => {
  const [mapeos, setMapeos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { agregarAlerta } = useAlertas();

  const cargarMapeos = useCallback(async (codigoEmpresa, modulo) => {
    setLoading(true);
    try {
      const data = await configuracionApi.obtenerMapeos({ 
        codigoEmpresa, 
        modulo, 
      });
      setMapeos(data);
    } catch (error) {
      agregarAlerta({ type: "error", message: "Error al cargar mapeos contables" });
    } finally {
      setLoading(false);
    }
  }, [agregarAlerta]);

  const guardarMapeo = async (codigoEmpresa, modulo, accion, items, extra = {}) => {
    setLoading(true);
    try {
      // Limpiamos los campos opcionales para no enviar nulls si el backend no los espera
      const payload = {
        modulo,
        accion,
        mapeos: items,
      };

      if (extra.tipoComprobante !== null && extra.tipoComprobante !== undefined) payload.tipoComprobante = Number(extra.tipoComprobante);
      if (extra.metodoPago) payload.metodoPago = extra.metodoPago;
      if (extra.tipoEntidad) payload.tipoEntidad = extra.tipoEntidad;

      await configuracionApi.guardarMapeo(payload, { codigoEmpresa });
      agregarAlerta({ type: "success", message: "Configuración guardada correctamente" });
      await cargarMapeos(codigoEmpresa, modulo);
    } catch (error) {
      console.error("Error en guardarMapeo:", error);
      agregarAlerta({ type: "error", message: "Error al guardar la configuración" });
    } finally {
      setLoading(false);
    }
  };

  const eliminarMapeo = async (codigoEmpresa, modulo, extra = {}) => {
    setLoading(true);
    try {
      const payload = {
        modulo,
        accion: extra.accion,
        tipoComprobante: (extra.tipoComprobante !== undefined && extra.tipoComprobante !== null) ? Number(extra.tipoComprobante) : null,
        metodoPago: extra.metodoPago || null,
        tipoEntidad: extra.tipoEntidad || null
      };

      await configuracionApi.eliminarMapeo(payload, { codigoEmpresa });
      agregarAlerta({ type: "success", message: "Regla eliminada correctamente" });
      await cargarMapeos(codigoEmpresa, modulo);
    } catch (error) {
      console.error("Error en eliminarMapeo:", error);
      agregarAlerta({ type: "error", message: "Error al eliminar la regla" });
    } finally {
      setLoading(false);
    }
  };

  return {
    mapeos,
    loading,
    cargarMapeos,
    guardarMapeo,
    eliminarMapeo
  };
};
