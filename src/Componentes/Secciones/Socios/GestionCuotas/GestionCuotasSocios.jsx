import { useState, useMemo, useEffect, useRef } from "react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import {
  CuotasIcono,
  EmitirCuotasIcono,
  ArcaIcono,
} from "../../../../assets/Icons";
import { Eye, EyeOff } from "lucide-react";
import { useListarCuotas } from "../../../../Backend/Escuela/hooks/useListarCuotas";
import { useResumenCuotas } from "../../../../Backend/Escuela/hooks/useResumenCuotas";
import { useReglasCuota } from "../../../../Backend/Escuela/hooks/useReglasCuota";
import { useUltimoLoteCuotas } from "../../../../Backend/Escuela/hooks/useUltimoLoteCuotas";
import { useLoteCuotas } from "../../../../Backend/Escuela/hooks/useLoteCuotas";
import TablaCuotasSocios from "./TablaCuotasSocios";
import ModalEmitirLote from "../../Escuela/GestionCuotas/ModalEmitirLote";
import ModalReglasCuota from "../../Escuela/GestionCuotas/ModalReglasCuota";
import ModalProgresoLoteCuotas from "../../Escuela/GestionCuotas/ModalProgresoLoteCuotas";
import BannerLoteCuotas from "../../Escuela/GestionCuotas/BannerLoteCuotas";
import { useConfiguracionContactos } from "../../../../Backend/Contactos/hooks/useConfiguracionContactos";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const anioActual = new Date().getFullYear();
const ANIOS = [
  anioActual - 2,
  anioActual - 1,
  anioActual,
  anioActual + 1,
  anioActual + 2,
];

// R9: constante fija, no seleccionable desde la UI (mismo criterio que
// TIPO_ENTIDAD_OBLIGADO = "ALUM" en GestionCuotas.jsx).
const TIPO_ENTIDAD_OBLIGADO = "SOCI";

// R1: cuenta contable fija (ya no seleccionable desde la UI). Reemplaza a
// useCuentasTipoCuota + estado codigoCuentaContable para esta pantalla.
const CUENTA_CONTABLE_FIJA = {
  codigoSecuencial: 539,
  codigo: 4111,
  nombre: "INGRESO POR CUOTAS SOCIETARIAS",
};

/**
 * Calco estructural de GestionCuotas.jsx (Escuela/Alumnos), parametrizado
 * para tipoEntidadObligado = "SOCI" (feature 21, socios-gestion-cuotas).
 *
 * A propósito NO importa useConfigCuota (R8): su único consumidor final es
 * ModalCambioTipoAlumno.jsx, que esta pantalla no usa (R6), por lo que
 * `formula`/`tipoOpciones` no hacen falta acá.
 *
 * Usa una clave de localStorage propia (R17) para no colisionar con la
 * preferencia guardada por la pantalla de Alumnos.
 */
const GestionCuotasSocios = () => {
  const hoy = new Date();
  const [mesSeleccionado, setMesSeleccionado] = useState(hoy.getMonth() + 1);
  const [anioSeleccionado, setAnioSeleccionado] = useState(hoy.getFullYear());
  const [verModalLote, setVerModalLote] = useState(false);
  const [verModalReglas, setVerModalReglas] = useState(false);
  const [codigoUnidadNegocio, setCodigoUnidadNegocio] = useState("");
  const [codigoLoteDetalle, setCodigoLoteDetalle] = useState(null);
  const [loteDescartadoCodigo, setLoteDescartadoCodigo] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  // R16: dashboard oculto por defecto en cada montaje.
  const [verMetricas, setVerMetricas] = useState(false);

  // Optimización de performance (2026-07-14, PARTE 2/2 frontend, ver
  // progress/impl_cuotas-listado-performance-backend.md — mismo patrón que
  // GestionCuotas.jsx/Alumnos y ListadoComprobante.jsx): estado de
  // paginación y búsqueda subido acá.
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");

  const { configs } = useConfiguracionContactos();
  const opcionesTipoSocio = useMemo(() => {
    const config = configs.find((c) => c.claveCampo === "tipo_socio" && c.entidadClave === "SOCI");
    return config?.opciones || [];
  }, [configs]);

  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busqueda), 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  useEffect(() => {
    setPagina(1);
  }, [
    mesSeleccionado,
    anioSeleccionado,
    codigoUnidadNegocio,
    filtroEstado,
    filtroTipo,
    busquedaDebounced,
  ]);

  const { usuario } = useAuthStore();
  const unidadesNegocio = usuario?.unidadesNegocio || [];

  // Autoselección de la primera Unidad de Negocio del usuario (mismo patrón
  // que GestionCuotas.jsx) — siempre opera sobre una unidad real.
  useEffect(() => {
    if (unidadesNegocio.length > 0 && !codigoUnidadNegocio) {
      setCodigoUnidadNegocio(String(unidadesNegocio[0].codigo));
    }
  }, [unidadesNegocio]);

  // R1/R5: cuenta contable fija, ya no derivada de useCuentasTipoCuota.
  const cuentaSeleccionada = CUENTA_CONTABLE_FIJA;

  const { items, total, paginas, cargandoCuotas, errorCuotas, refetch } =
    useListarCuotas({
      codigoCuentaContable: cuentaSeleccionada.codigoSecuencial,
      tipoEntidadObligado: TIPO_ENTIDAD_OBLIGADO,
      mes: mesSeleccionado,
      anio: anioSeleccionado,
      codigoUnidadNegocio,
      pagina,
      busqueda: busquedaDebounced,
      // Optimización de performance (PARTE 3): el filtro de Estado ahora lo
      // resuelve el backend (universo completo, filtra y RECIÉN AHÍ pagina) —
      // ya no se filtra en memoria en TablaCuotasSocios.jsx.
      filtroEstado,
      filtroTipo,
    });

  // KPIs del dashboard (universo completo, no varía con `pagina`/`busqueda`
  // — ver useResumenCuotas.js). Se pide acá (además de en
  // TablaCuotasSocios.jsx) porque ModalEmitirLote.jsx necesita
  // `resumen.sinEmitir`/`totalContactos` para el conteo de preview.
  const { resumen } = useResumenCuotas({
    codigoCuentaContable: cuentaSeleccionada.codigoSecuencial,
    tipoEntidadObligado: TIPO_ENTIDAD_OBLIGADO,
    mes: mesSeleccionado,
    anio: anioSeleccionado,
    codigoUnidadNegocio,
    filtroTipo,
  });

  // Historial de lotes del scope exacto, para no perder el progreso/
  // resultado de "Generar cuotas para todos" al cambiar de sección — mismo
  // mecanismo ya probado en GestionCuotas.jsx (Alumnos).
  const { ultimoLote, refetchUltimoLote } = useUltimoLoteCuotas({
    codigoCuentaContable: cuentaSeleccionada.codigoSecuencial,
    codigoUnidadNegocio,
    mes: mesSeleccionado,
    anio: anioSeleccionado,
  });

  const loteEnProcesoCodigo =
    ultimoLote?.estado === "EN_PROCESO" ? ultimoLote.codigo : null;
  const { lote: loteEnProceso } = useLoteCuotas(loteEnProcesoCodigo);

  const loteMostrado = useMemo(() => {
    if (!ultimoLote) return null;
    if (loteEnProceso && loteEnProceso.codigo === ultimoLote.codigo) {
      return loteEnProceso;
    }
    return ultimoLote;
  }, [ultimoLote, loteEnProceso]);

  const estadoLoteAnteriorRef = useRef(null);
  useEffect(() => {
    if (!loteMostrado) return;
    if (
      estadoLoteAnteriorRef.current === "EN_PROCESO" &&
      loteMostrado.estado === "FINALIZADO"
    ) {
      refetch();
      refetchUltimoLote();
    }
    estadoLoteAnteriorRef.current = loteMostrado.estado;
  }, [loteMostrado?.codigo, loteMostrado?.estado]);

  const { reglas } = useReglasCuota(cuentaSeleccionada.codigoSecuencial);
  const contactosConReglaPropia = useMemo(
    () =>
      new Set(
        (reglas ?? [])
          .filter((r) => r.tipoMatch === "CONTACTO")
          .map((r) => r.codigoContacto),
      ),
    [reglas],
  );

  const filas = useMemo(
    () =>
      items.map((item) => ({
        ...item.contacto,
        codigoUnidadNegocio: Number(codigoUnidadNegocio),
        codigo: item.codigoContacto,
        estado: item.estado,
        // Optimización de performance (PARTE 3): estado YA derivado por el
        // backend (`ListarCuotas.casodeuso.ts`), mismo criterio exacto que
        // antes se recalculaba en `filasEnriquecidas` (TablaCuotasSocios.jsx).
        estadoMostrado: item.estadoMostrado,
        codigoComprobante: item.codigoComprobante,
        puntoVenta: item.puntoVenta,
        numeroComprobante: item.numeroComprobante,
        total: item.total,
        saldoPendiente: item.saldoPendiente,
        fechaVto: item.fechaVto,
        montoSugerido: item.montoSugerido,
        tieneReglaContacto: contactosConReglaPropia.has(item.codigoContacto),
      })),
    [items, contactosConReglaPropia, codigoUnidadNegocio],
  );

  if (errorCuotas) {
    return (
      <div className="w-full py-6 px-6">
        <EncabezadoSeccion
          ruta="CUOTAS DE SOCIOS"
          icono={<CuotasIcono size={20} color={"var(--primary)"} />}
        />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-rose-600 font-bold text-[13px] uppercase tracking-widest">
            Error al cargar cuotas
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2.5 bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-widest rounded-md hover:brightness-110 transition-all cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6 lg:px-8 space-y-6 bg-[#F8FAFC] min-h-[calc(100vh-64px)]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            <span>Socios</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Cuotas</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <CuotasIcono color={"var(--primary)"} size={28} />
            Gestión de Cuotas de Socios
          </h1>
          <p className="text-sm font-medium text-gray-500 max-w-2xl">
            Centro de control para la emisión, seguimiento y reglas de cuotas
            societarias.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setVerMetricas((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-[11px] font-black uppercase tracking-widest border transition-all cursor-pointer shadow-sm ${
              verMetricas
                ? "bg-gray-900 text-white border-gray-900 hover:bg-black"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {verMetricas ? <EyeOff size={14} /> : <Eye size={14} />}
            {verMetricas ? "Ocultar métricas" : "Ver métricas"}
          </button>

          <button
            onClick={() => setVerModalReglas(true)}
            disabled={!cuentaSeleccionada}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md text-[11px] font-black border uppercase tracking-widest bg-white text-gray-700 border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer"
          >
            <ArcaIcono size={12} />
            Reglas de monto
          </button>

          <button
            onClick={() => setVerModalLote(true)}
            disabled={!cuentaSeleccionada}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md text-[11px] font-black uppercase tracking-widest bg-gray-900 text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
          >
            <EmitirCuotasIcono size={14} />
            Generar cuotas para todos
          </button>
        </div>
      </div>

      {/* Selectores de período + unidad de negocio: mismo panel que
          GestionCuotas.jsx (Alumnos). */}
      <div className="bg-white border border-gray-200 rounded-md p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div
          className={`grid grid-cols-2 gap-4 ${
            unidadesNegocio.length > 1 ? "lg:grid-cols-4" : "lg:grid-cols-3"
          }`}
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cuotas-socios-mes"
              className="text-[10px] font-black uppercase tracking-widest text-gray-500"
            >
              Mes
            </label>
            <select
              id="cuotas-socios-mes"
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(Number(e.target.value))}
              className="text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-2.5 outline-none cursor-pointer focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 shadow-sm transition-all"
            >
              {MESES.map((nombre, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cuotas-socios-anio"
              className="text-[10px] font-black uppercase tracking-widest text-gray-500"
            >
              Año
            </label>
            <select
              id="cuotas-socios-anio"
              value={anioSeleccionado}
              onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
              className="text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-2.5 outline-none cursor-pointer focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 shadow-sm transition-all"
            >
              {ANIOS.map((anio) => (
                <option key={anio} value={anio}>
                  {anio}
                </option>
              ))}
            </select>
          </div>

          {unidadesNegocio.length > 1 && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cuotas-socios-unidad"
                className="text-[10px] font-black uppercase tracking-widest text-gray-500"
              >
                Unidad de Negocio
              </label>
              <select
                id="cuotas-socios-unidad"
                value={codigoUnidadNegocio}
                onChange={(e) => setCodigoUnidadNegocio(e.target.value)}
                className="text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-2.5 outline-none cursor-pointer focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 shadow-sm transition-all"
              >
                {unidadesNegocio.map((u) => (
                  <option key={u.codigo} value={u.codigo}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cuotas-socios-tipo"
              className="text-[10px] font-black uppercase tracking-widest text-gray-500"
            >
              Tipo de Socio
            </label>
            <select
              id="cuotas-socios-tipo"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-2.5 outline-none cursor-pointer focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 shadow-sm transition-all"
            >
              <option value="TODOS">Todos</option>
              {opcionesTipoSocio.map((opcion, idx) => (
                <option key={idx} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cuotas-socios-estado"
              className="text-[10px] font-black uppercase tracking-widest text-gray-500"
            >
              Estado
            </label>
            <select
              id="cuotas-socios-estado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-2.5 outline-none cursor-pointer focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 shadow-sm transition-all"
            >
              <option value="TODOS">Todos</option>
              <option value="SIN_EMITIR">Sin Emitir</option>
              <option value="EMITIDA">Emitida (Impaga)</option>
              <option value="VENCIDA">Vencida</option>
              <option value="PARCIALMENTE_ABONADO">Parcial</option>
              <option value="ABONADO">Pagada</option>
              <option value="ANULADO">Anulada</option>
            </select>
          </div>
        </div>
      </div>
      {loteMostrado && loteMostrado.codigo !== loteDescartadoCodigo && (
        <BannerLoteCuotas
          lote={loteMostrado}
          onVerDetalle={() => setCodigoLoteDetalle(loteMostrado.codigo)}
          onDescartar={() => setLoteDescartadoCodigo(loteMostrado.codigo)}
        />
      )}

      <TablaCuotasSocios
        filas={filas}
        cargando={cargandoCuotas}
        cuentaSeleccionada={cuentaSeleccionada}
        tipoEntidadObligado={TIPO_ENTIDAD_OBLIGADO}
        mes={mesSeleccionado}
        anio={anioSeleccionado}
        codigoUnidadNegocio={codigoUnidadNegocio}
        refetch={refetch}
        busqueda={busqueda}
        onCambiarBusqueda={setBusqueda}
        pagina={pagina}
        totalPaginas={paginas}
        totalRegistros={total}
        onCambiarPagina={setPagina}
        mostrarDashboard={verMetricas}
      />

      {verModalLote && cuentaSeleccionada && (
        <ModalEmitirLote
          resumen={resumen}
          cuenta={cuentaSeleccionada}
          tipoEntidadObligado={TIPO_ENTIDAD_OBLIGADO}
          mes={mesSeleccionado}
          anio={anioSeleccionado}
          codigoUnidadNegocio={codigoUnidadNegocio}
          onClose={() => {
            setVerModalLote(false);
            refetchUltimoLote();
          }}
          onExito={() => {
            setVerModalLote(false);
            setLoteDescartadoCodigo(null);
            refetch();
            refetchUltimoLote();
          }}
        />
      )}

      {codigoLoteDetalle && (
        <ModalProgresoLoteCuotas
          codigoLote={codigoLoteDetalle}
          onClose={() => setCodigoLoteDetalle(null)}
          onFinalizado={() => {
            refetch();
            refetchUltimoLote();
          }}
        />
      )}

      {verModalReglas && cuentaSeleccionada && (
        <ModalReglasCuota
          cuenta={cuentaSeleccionada}
          tipoEntidadObligado={TIPO_ENTIDAD_OBLIGADO}
          onClose={() => {
            setVerModalReglas(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default GestionCuotasSocios;
