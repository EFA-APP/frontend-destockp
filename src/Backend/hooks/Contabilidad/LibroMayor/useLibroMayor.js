import { useState, useCallback, useEffect } from "react";
import { reportesContablesApi } from "../../../Contabilidad/api/reportes.api";
import { useAlertas } from "../../../../store/useAlertas";
import { useAuthStore } from "../../../Autenticacion/store/authenticacion.store";

export const useLibroMayor = () => {
  const { usuario } = useAuthStore();
  const codigoEmpresa = usuario?.codigoEmpresa;

  const [codigoCuenta, setCodigoCuenta] = useState(null);
  const [codigoContacto, setCodigoContacto] = useState(null);
  const [datosMayor, setDatosMayor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fechaDesde, setFechaDesde] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().split("T")[0];
  });
  const [fechaHasta, setFechaHasta] = useState(() =>
    new Date().toISOString().split("T")[0],
  );
  const { agregarAlerta } = useAlertas();

  const cargarLibroMayor = useCallback(async () => {
    if (!codigoCuenta || !codigoEmpresa) return;

    setLoading(true);
    try {
      const data = await reportesContablesApi.obtenerLibroMayor({
        codigoEmpresa,
        codigoCuentaContable: Number(codigoCuenta),
        codigoContacto: codigoContacto ? Number(codigoContacto) : undefined,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
      });
      setDatosMayor(data);
    } catch (error) {
      agregarAlerta({ type: "error", message: "Error al cargar el libro mayor" });
    } finally {
      setLoading(false);
    }
  }, [codigoCuenta, codigoContacto, codigoEmpresa, fechaDesde, fechaHasta, agregarAlerta]);

  useEffect(() => {
    if (codigoCuenta) {
      cargarLibroMayor();
    }
  }, [codigoCuenta, codigoContacto, fechaDesde, fechaHasta, cargarLibroMayor]);

  return {
    codigoCuenta,
    setCodigoCuenta,
    codigoContacto,
    setCodigoContacto,
    datosMayor,
    loading,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    recargar: cargarLibroMayor,
  };
};
