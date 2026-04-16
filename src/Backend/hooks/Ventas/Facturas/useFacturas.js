import { useMemo, useState } from "react";
import { useAuthStore } from "../../../Autenticacion/store/authenticacion.store";
import { useObtenerComprobantesQuery } from "../../../Ventas/queries/Comprobante/useObtenerComprobantes.query";
import { usePersistentState } from "../../../../hooks/usePersistentState";

export const useFacturas = (prefijoKey = "") => {
  const { unidadActiva } = useAuthStore();

  // Cálculo del mes actual para el rango predeterminado
  const getRangoMesActual = () => {
    const ahora = new Date();
    const primero = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const ultimo = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);

    // Formatear a YYYY-MM-DD para el input tipo date
    const fv = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    return { desde: fv(primero), hasta: fv(ultimo) };
  };

  const rangoInicial = getRangoMesActual();

  // Filtros de UI
  const [pagina, setPagina] = useState(1);
  const [limite, setLimite] = useState(20);
  const [tipoFactura, setTypeFactura] = useState("TODAS");
  const [busqueda, setBusqueda] = usePersistentState(
    `${prefijoKey}facturas_busqueda`,
    "",
  );
  const [fechaDesde, setFechaDesde] = useState(rangoInicial.desde);
  const [fechaHasta, setFechaHasta] = useState(rangoInicial.hasta);

  // UNIDAD DE NEGOCIO SELECCIONADA
  const [unidadNegocio, setUnidadNegocio] = useState(
    unidadActiva?.codigoSecuencial || null,
  );

  // NUEVO FILTRO FISCAL
  const [isFiscal, setIsFiscal] = useState("TODAS");

  // NUEVO FILTRO CONDICIÓN DE VENTA
  const [condicionVenta, setCondicionVenta] = useState("TODAS");

  // QUERY REAL: El corazón del listado
  const {
    data: respuesta,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useObtenerComprobantesQuery({
    pagina,
    limite,
    codigoUnidadNegocio: unidadNegocio,
    tipoDocumento: tipoFactura === "TODAS" ? undefined : Number(tipoFactura),
    fechaDesde,
    fechaHasta,
    buscarReceptor: busqueda,
    // Convertimos el estado del select "TODAS/FISCAL/INTERNAS" al booleano esperado por el backend
    fiscal:
      isFiscal === "TODAS" ? undefined : isFiscal === "FISCAL" ? true : false,
    condicionVenta: condicionVenta === "TODAS" ? undefined : condicionVenta,
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
    isFetching,
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
    condicionVenta,
    setCondicionVenta,
    unidadNegocio,
    setUnidadNegocio,
    manejarDetalle,
    manejarEditar,
    manejarEliminar,
    refetch,
  };
};
