import { useState, useCallback, useEffect } from "react";
import { reportesContablesApi } from "../../../Contabilidad/api/reportes.api";
import { useAlertas } from "../../../../store/useAlertas";
import { useAuthStore } from "../../../Autenticacion/store/authenticacion.store";

export const useLibroMayor = () => {
  const { usuario } = useAuthStore();
  const codigoEmpresa = usuario?.codigoEmpresa;

  const [codigoCuenta, setCodigoCuenta] = useState(null);
  const [codigoContacto, setCodigoContacto] = useState(null);
  const [codigoUnidadNegocio, setCodigoUnidadNegocio] = useState("");
  const [datosMayor, setDatosMayor] = useState(null);
  const [cuentasConMovimientos, setCuentasConMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCuentas, setLoadingCuentas] = useState(false);
  const [fechaDesde, setFechaDesde] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [fechaHasta, setFechaHasta] = useState(() =>
    new Date().toISOString().split("T")[0],
  );
  const { agregarAlerta } = useAlertas();

  const cargarCuentasConMovimientos = useCallback(async () => {
    if (!codigoEmpresa) return;

    setLoadingCuentas(true);
    try {
      const data = await reportesContablesApi.obtenerCuentasConMovimientos({
        codigoEmpresa,
        codigoUnidadNegocio: codigoUnidadNegocio ? Number(codigoUnidadNegocio) : undefined,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
      });
      setCuentasConMovimientos(data);
    } catch (error) {
      agregarAlerta({ type: "error", message: "Error al cargar cuentas con movimientos" });
    } finally {
      setLoadingCuentas(false);
    }
  }, [codigoEmpresa, codigoUnidadNegocio, fechaDesde, fechaHasta, agregarAlerta]);

  useEffect(() => {
    cargarCuentasConMovimientos();
  }, [cargarCuentasConMovimientos]);

  const cargarLibroMayor = useCallback(async () => {
    if (!codigoCuenta || !codigoEmpresa) return;

    setLoading(true);
    try {
      const data = await reportesContablesApi.obtenerLibroMayor({
        codigoEmpresa,
        codigoCuentaContable: Number(codigoCuenta),
        codigoUnidadNegocio: codigoUnidadNegocio ? Number(codigoUnidadNegocio) : undefined,
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
  }, [codigoCuenta, codigoContacto, codigoUnidadNegocio, codigoEmpresa, fechaDesde, fechaHasta, agregarAlerta]);

  useEffect(() => {
    if (codigoCuenta) {
      cargarLibroMayor();
    } else {
      setDatosMayor(null);
    }
  }, [codigoCuenta, codigoContacto, codigoUnidadNegocio, fechaDesde, fechaHasta, cargarLibroMayor]);

  return {
    codigoCuenta,
    setCodigoCuenta,
    codigoContacto,
    setCodigoContacto,
    codigoUnidadNegocio,
    setCodigoUnidadNegocio,
    cuentasConMovimientos,
    loadingCuentas,
    datosMayor,
    loading,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    cargarLibroMayor,
    cargarCuentasConMovimientos,
  };
};
