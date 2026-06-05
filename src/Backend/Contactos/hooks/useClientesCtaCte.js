import { useMemo, useState, useEffect } from "react";
import { useDebounce } from "../../../hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { useAlertas } from "../../../store/useAlertas";
import { useContactos } from "./useContactos";
import { useObtenerEnviosNoFacturados } from "../../Articulos/queries/Transporte/useTransporte";
import { ListarMovimientosApi } from "../api/contactos.api";
import { usePersistentState } from "../../../hooks/usePersistentState";
import { useAuthStore } from "../../Autenticacion/store/authenticacion.store";

export const useClientesCtaCte = () => {
  const { agregarAlerta } = useAlertas();
  const usuario = useAuthStore((state) => state.usuario);
  const codigoCtaCte =
    usuario?.configuracion?.cuentas?.deudoresFletes ||
    usuario?.configuracion?.cuentas?.codigoCuentaDeudor ||
    "1105";
  const [busqueda, setBusqueda] = usePersistentState("clientes_busqueda", "");
  const [pagina, setPagina] = useState(1);

  // Debounce para la búsqueda
  const [busquedaDebounced] = useDebounce(busqueda, 500);

  // Resetear a página 1 cuando cambia la búsqueda
  useEffect(() => {
    setPagina(1);
  }, [busquedaDebounced]);

  // 1. Obtener contactos de clientes (tipoEntidad: "CLIE")
  const {
    contactos: clientes = [],
    cargandoContactos,
    refetch,
    total,
    paginas,
    paginaActual,
  } = useContactos({
    tipoEntidad: "CLIE",
    busqueda: busquedaDebounced,
    pagina,
    limite: 15,
    codigoCuenta: codigoCtaCte,
  });

  // 2. Obtener envíos no facturados de transporte (guías impagas)
  const { data: enviosNoFacturados = [], isLoading: cargandoEnvios } =
    useObtenerEnviosNoFacturados();

  // 3. Obtener todos los movimientos contables de la cuenta Deudores por Fletes
  const {
    data: responseMovimientos,
    isLoading: cargandoMovimientos,
    refetch: refetchMovs,
  } = useQuery({
    queryKey: ["movimientos_clientes", busquedaDebounced, codigoCtaCte],
    queryFn: () =>
      ListarMovimientosApi(null, {
        busqueda: busquedaDebounced,
        limite: 2000,
        codigoCuenta: codigoCtaCte,
      }),
    showLoader: false,
    enabled: !!clientes.length,
  });

  const todosLosMovimientos = responseMovimientos?.data || [];

  // 4. Consolidar e integrar datos por cada cliente de forma reactiva
  const clientesProcesados = useMemo(() => {
    return (clientes || []).map((cliente) => {
      // Filtrar envíos no facturados pertenecientes a este remitente
      const envios = enviosNoFacturados.filter(
        (e) => Number(e.codigoRemitente) === Number(cliente.codigoSecuencial),
      );

      // El saldo real contable viene inyectado directamente en el contacto por el backend (cuenta 1105)
      const saldoBase = Number(cliente.atributos?.saldo || 0);

      // Determinar estado semántico contable
      let estado = "AL_DIA"; // Verde
      let estadoLabel = "Al Día";
      let badgeStyle =
        "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";

      if (saldoBase > 0) {
        estado = "CON_DEUDA"; // Amarillo/Naranja
        estadoLabel = "Deuda Pendiente";
        badgeStyle = "bg-amber-500/10 text-amber-600 border-amber-500/20";
      }

      return {
        ...cliente,
        clienteId: cliente.codigoSecuencial,
        nombre:
          cliente.razonSocial ||
          `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim() ||
          `Cliente #${cliente.codigoSecuencial}`,
        cuit: cliente.documento || "SIN DNI/CUIT",
        cliente: cliente,
        envios,
        totalDeuda: saldoBase, // Usar saldo contable base
        saldoBase,
        estado,
        estadoLabel,
        badgeStyle,
      };
    });
  }, [clientes, enviosNoFacturados]);

  // Estadísticas globales contables consolidadas
  const metricas = useMemo(() => {
    let totalClientesDeudores = 0;
    let totalDeudaConsolidada = 0;
    let totalGuiasPendientes = enviosNoFacturados.length;

    clientesProcesados.forEach((c) => {
      if (c.saldoBase > 0) {
        totalClientesDeudores++;
        totalDeudaConsolidada += c.saldoBase;
      }
    });

    return {
      totalClientesDeudores,
      totalGuiasPendientes,
      totalDeudaConsolidada,
      totalClientes: clientes.length,
    };
  }, [clientesProcesados, clientes, enviosNoFacturados]);

  return {
    clientes: clientesProcesados,
    cargandoClientes:
      cargandoContactos || cargandoMovimientos || cargandoEnvios,
    metricas,
    busqueda,
    setBusqueda,
    refetchClientes: refetch,
    refetchMovimientos: refetchMovs,
    movimientos: todosLosMovimientos,
    paginas,
    paginaActual,
    total,
    setPagina,
    codigoCtaCte,
  };
};
