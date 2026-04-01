import { useState, useMemo } from "react";
import { usePersistentState } from "../../../../hooks/usePersistentState";
import { useObtenerComprobantesQuery } from "../../../Ventas/queries/Comprobante/useObtenerComprobantes.query";

export const useFacturas = () => {
  // Filtros de UI
  const [pagina, setPagina] = useState(1);
  const [limite, setLimite] = useState(20);
  const [tipoFactura, setTypeFactura] = useState("TODAS");
  const [busqueda, setBusqueda] = usePersistentState("facturas_busqueda", "");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  
  // NUEVO FILTRO FISCAL
  const [isFiscal, setIsFiscal] = useState("TODAS"); 

  // QUERY REAL: El corazón del listado
  const { data: respuesta, isLoading, isError, refetch } = useObtenerComprobantesQuery({
    pagina,
    limite,
    tipoDocumento: tipoFactura === "TODAS" ? undefined : Number(tipoFactura),
    fechaDesde,
    fechaHasta,
    buscarReceptor: busqueda,
    // Convertimos el estado del select "TODAS/FISCAL/INTERNAS" al booleano esperado por el backend
    fiscal: isFiscal === "TODAS" ? undefined : (isFiscal === "FISCAL" ? true : false)
  });

  const facturas = useMemo(() => respuesta?.data || [], [respuesta]);
  const meta = useMemo(() => respuesta?.meta || {}, [respuesta]);

  const manejarDetalle = (id) => {
    console.log("Visualizando detalle:", id);
  };

  const manejarEditar = (factura) => {
    console.log("Editando:", factura);
  };

  const manejarEliminar = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este comprobante?")) {
        // TODO: Implementar eliminarMutation
    }
  };

  return {
    facturas,
    meta,
    isLoading,
    isError,
    pagina,
    setPagina,
    busqueda,
    setBusqueda,
    tipoFactura,
    setTypeFactura,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    isFiscal,
    setIsFiscal,
    manejarDetalle,
    manejarEditar,
    manejarEliminar,
    refetch
  };
};
