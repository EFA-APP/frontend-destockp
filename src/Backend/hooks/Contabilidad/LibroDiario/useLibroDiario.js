import { useState, useCallback, useEffect } from "react";
import { listarAsientos } from "../../../Contabilidad/api/asientos.api";
import { useAlertas } from "../../../../store/useAlertas";
import { useAuthStore } from "../../../Autenticacion/store/authenticacion.store";

export const useLibroDiario = () => {
  const { usuario } = useAuthStore();
  const codigoEmpresa = usuario?.codigoEmpresa;
  const { agregarAlerta } = useAlertas();

  const [loading, setLoading] = useState(false);
  const [asientos, setAsientos] = useState([]);
  const [fechaDesde, setFechaDesde] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [fechaHasta, setFechaHasta] = useState(() =>
    new Date().toISOString().split("T")[0],
  );
  const [origen, setOrigen] = useState("TODOS");

  const cargarAsientos = useCallback(async () => {
    if (!codigoEmpresa) return;

    setLoading(true);
    try {
      const data = await listarAsientos({
        codigoEmpresa,
        origenModulo: origen,
        fechaDesde,
        fechaHasta: fechaHasta
          ? (() => {
              const d = new Date(fechaHasta);
              d.setDate(d.getDate() + 1);
              return d.toISOString().split("T")[0];
            })()
          : undefined,
      });
      setAsientos(data);
    } catch (error) {
      agregarAlerta({ type: "error", message: "Error al cargar el libro diario" });
    } finally {
      setLoading(false);
    }
  }, [codigoEmpresa, origen, fechaDesde, fechaHasta, agregarAlerta]);

  useEffect(() => {
    cargarAsientos();
  }, [cargarAsientos]);

  const totales = asientos.reduce(
    (acc, asiento) => {
      (asiento.detalles || []).forEach((mov) => {
        acc.debe += Number(mov.debe) || 0;
        acc.haber += Number(mov.haber) || 0;
      });
      return acc;
    },
    { debe: 0, haber: 0 },
  );

  return {
    loading,
    asientos,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    origen,
    setOrigen,
    totales,
    recargar: cargarAsientos,
  };
};
