import { useState } from "react";
import { useAuthStore } from "../../../Autenticacion/store/authenticacion.store";
import {
  useListarAsientosQuery,
  useCrearAsientoMutation,
} from "../../../Contabilidad/queries/useAsientos.query";
import { useAlertas } from "../../../../store/useAlertas";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../../../../hooks/useDebounce";

export const useAsientos = () => {
  const { usuario } = useAuthStore();
  const { agregarAlerta } = useAlertas();
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState("");
  const [origen, setOrigen] = useState("TODOS");

  const [debouncedBusqueda] = useDebounce(busqueda, 500);

  const filtros = {
    codigoEmpresa: usuario?.codigoEmpresa,
    origenModulo: origen !== "TODOS" ? origen : undefined,
    termino: debouncedBusqueda.trim() || undefined,
  };

  const { data: rawAsientos = [], isLoading } = useListarAsientosQuery(filtros);
  const crearMutation = useCrearAsientoMutation();

  // Normalizar la respuesta del servidor al formato que espera la tabla
  const asientosMapeados = rawAsientos.map((a) => ({
    id: a.codigoSecuencial,
    fecha: a.fecha,
    descripcion: a.descripcion,
    origen: a.origenModulo,
    referencia: a.referencia,
    totalDebe:
      a.detalles?.reduce((sum, d) => sum + Number(d.debe || 0), 0) ?? 0,
    totalHaber:
      a.detalles?.reduce((sum, d) => sum + Number(d.haber || 0), 0) ?? 0,
    movimientos: (a.detalles || []).map((d) => ({
      id: d.codigoSecuencial,
      cuenta: d.codigoCuenta ?? String(d.codigoCuentaContable),
      nombreCuenta: d.nombreCuenta ?? d.nombreCuentaContable ?? "",
      debe: Number(d.debe || 0),
      haber: Number(d.haber || 0),
    })),
  }));

  // Ya no filtramos en el cliente, el backend lo hace.
  // Pero inyectamos el término para el resaltado visual (mark)
  const asientosFinales = asientosMapeados.map((a) => ({
    ...a,
    _terminoBusqueda: busqueda,
  }));

  const agregarAsiento = async (dto) => {
    try {
      await crearMutation.mutateAsync(dto);
      agregarAlerta({
        type: "success",
        message: "Asiento contable creado correctamente.",
      });
      navigate("/panel/contabilidad/asientos");
    } catch (error) {
      agregarAlerta({
        type: "error",
        message: error?.response?.data?.message ?? "Error al crear el asiento.",
      });
      throw error;
    }
  };

  return {
    asientos: asientosFinales,
    isLoading,
    busqueda,
    setBusqueda,
    origen,
    setOrigen,
    agregarAsiento,
    isCreando: crearMutation.isPending,
  };
};
