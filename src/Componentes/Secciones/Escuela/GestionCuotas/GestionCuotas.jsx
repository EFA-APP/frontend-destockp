import { useState, useMemo, useEffect, useRef } from "react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import {
  CuotasIcono,
  ConfiguracionIcono,
  EmitirCuotasIcono,
  ArcaIcono,
} from "../../../../assets/Icons";
import { Eye, EyeOff } from "lucide-react";
import { useListarCuotas } from "../../../../Backend/Escuela/hooks/useListarCuotas";
import { useResumenCuotas } from "../../../../Backend/Escuela/hooks/useResumenCuotas";
import { useReglasCuota } from "../../../../Backend/Escuela/hooks/useReglasCuota";
import { useUltimoLoteCuotas } from "../../../../Backend/Escuela/hooks/useUltimoLoteCuotas";
import { useLoteCuotas } from "../../../../Backend/Escuela/hooks/useLoteCuotas";
import TablaCuotas from "./TablaCuotas";
import ModalEmitirLote from "./ModalEmitirLote";
import ModalReglasCuota from "./ModalReglasCuota";
import ModalProgresoLoteCuotas from "./ModalProgresoLoteCuotas";
import BannerLoteCuotas from "./BannerLoteCuotas";
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

const TIPO_ENTIDAD_OBLIGADO = "ALUM";

// R2: cuenta contable fija (ya no seleccionable desde la UI).
const CUENTA_CONTABLE_FIJA = {
  codigoSecuencial: 460,
  codigo: 4106,
  nombre: "INGRESO POR CUOTAS",
};

const GestionCuotas = () => {
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
  // progress/impl_cuotas-listado-performance-backend.md para el contrato de
  // backend ya verificado): estado de paginación y búsqueda subido acá
  // (antes vivían dentro de TablaCuotas.jsx filtrando en memoria) — mismo
  // patrón que ListadoComprobante.jsx (busqueda + busquedaDebounced +
  // pagina, con useEffect de reset de página al cambiar cualquier filtro).
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");

  const { configs } = useConfiguracionContactos();
  const opcionesTipoAlumno = useMemo(() => {
    const config = configs.find((c) => c.claveCampo === "tipo_alumno" && c.entidadClave === "ALUM");
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
  // que ListadoComprobante.jsx) — esta pantalla ya no ofrece "Todas las
  // Unidades", siempre opera sobre una unidad real.
  useEffect(() => {
    if (unidadesNegocio.length > 0 && !codigoUnidadNegocio) {
      setCodigoUnidadNegocio(String(unidadesNegocio[0].codigo));
    }
  }, [unidadesNegocio]);

  // R2/R5: cuenta contable fija, ya no derivada de useCuentasTipoCuota.
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
      // ya no se filtra en memoria en TablaCuotas.jsx (ver comentario ahí).
      filtroEstado,
      filtroTipo,
    });

  // KPIs del dashboard (universo completo, no varía con `pagina`/`busqueda`
  // — ver useResumenCuotas.js). Se pide acá (además de en TablaCuotas.jsx)
  // porque ModalEmitirLote.jsx necesita `resumen.sinEmitir`/`totalContactos`
  // para el conteo de preview de emisión masiva.
  const { resumen } = useResumenCuotas({
    codigoCuentaContable: cuentaSeleccionada.codigoSecuencial,
    tipoEntidadObligado: TIPO_ENTIDAD_OBLIGADO,
    mes: mesSeleccionado,
    anio: anioSeleccionado,
    codigoUnidadNegocio,
    filtroTipo,
  });

  // Historial de lotes del scope exacto (R48), para no perder el
  // progreso/resultado de "Generar cuotas para todos" al cambiar de
  // sección — fuente de verdad siempre el backend, ver
  // progress/impl_cuotas-lote-persistencia-refetch.md.
  const { ultimoLote, refetchUltimoLote } = useUltimoLoteCuotas({
    codigoCuentaContable: cuentaSeleccionada.codigoSecuencial,
    codigoUnidadNegocio,
    mes: mesSeleccionado,
    anio: anioSeleccionado,
  });

  // Mientras el lote más reciente conocido siga EN_PROCESO, se pollea en
  // vivo (mismo hook que usa el modal de detalle) para poder disparar un
  // refetch automático de la tabla de cuotas apenas termine, sin depender
  // de que el usuario tenga el modal abierto ni haga clic en "Cerrar".
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
        // antes se recalculaba en `filasEnriquecidas` (TablaCuotas.jsx).
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
        <EncabezadoSeccion ruta="CUOTAS" icono={<CuotasIcono size={20} />} />
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
            <span>Escuela</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>Cuotas</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <CuotasIcono
              className="text-gray-900"
              size={28}
              color={"var(--primary)"}
            />
            Gestión de Cuotas
          </h1>
          <p className="text-sm font-medium text-gray-500 max-w-2xl">
            Centro de control para la emisión, seguimiento y reglas de cuotas de
            alumnos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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

      {/* Selectores de período + unidad de negocio */}
      <div className="bg-white border border-gray-200 rounded-md p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div
          className={`grid grid-cols-2 gap-6 ${
            unidadesNegocio.length > 1 ? "lg:grid-cols-4" : "lg:grid-cols-3"
          }`}
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="cuotas-mes"
              className="text-[10px] font-black uppercase tracking-widest text-gray-500"
            >
              Mes
            </label>
            <select
              id="cuotas-mes"
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(Number(e.target.value))}
              className="h-11 px-3 border border-gray-300 rounded-md text-sm font-semibold bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm cursor-pointer outline-none transition-all text-gray-800 uppercase"
            >
              {MESES.map((nombre, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="cuotas-anio"
              className="text-[10px] font-black uppercase tracking-widest text-gray-500"
            >
              Año
            </label>
            <select
              id="cuotas-anio"
              value={anioSeleccionado}
              onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
              className="h-11 px-3 border border-gray-300 rounded-md text-sm font-semibold bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm cursor-pointer outline-none transition-all text-gray-800 uppercase"
            >
              {ANIOS.map((anio) => (
                <option key={anio} value={anio}>
                  {anio}
                </option>
              ))}
            </select>
          </div>

          {unidadesNegocio.length > 1 && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="cuotas-unidad"
                className="text-[10px] font-black uppercase tracking-widest text-gray-500"
              >
                Unidad de Negocio
              </label>
              <select
                id="cuotas-unidad"
                value={codigoUnidadNegocio}
                onChange={(e) => setCodigoUnidadNegocio(e.target.value)}
                className="h-11 px-3 border border-gray-300 rounded-md text-sm font-semibold bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm cursor-pointer outline-none transition-all text-gray-800 uppercase"
              >
                {unidadesNegocio.map((u) => (
                  <option key={u.codigo} value={u.codigo}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="cuotas-tipo"
              className="text-[10px] font-black uppercase tracking-widest text-gray-500"
            >
              Tipo de Alumno
            </label>
            <select
              id="cuotas-tipo"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="h-11 px-3 border border-gray-300 rounded-md text-sm font-semibold bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm cursor-pointer outline-none transition-all text-gray-800 uppercase"
            >
              <option value="TODOS">Todos</option>
              {opcionesTipoAlumno.map((opcion, idx) => (
                <option key={idx} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="cuotas-estado"
              className="text-[10px] font-black uppercase tracking-widest text-gray-500"
            >
              Estado
            </label>
            <select
              id="cuotas-estado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="h-11 px-3 border border-gray-300 rounded-md text-sm font-semibold bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm cursor-pointer outline-none transition-all text-gray-800 uppercase"
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

      <TablaCuotas
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
            // El cierre dispara este handler tanto si el lote ya terminó
            // como si el usuario eligió "Seguir en segundo plano" — en
            // ambos casos refrescamos el historial para que el banner
            // persistente (R48) recoja de inmediato un lote recién creado
            // que siga EN_PROCESO en el servidor, sin depender de
            // desmontar/remontar esta pantalla.
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

      {/* Reapertura del detalle de un lote ya conocido (banner "Ver
          progreso"/"Ver detalle"), desacoplada del flujo de disparo de
          ModalEmitirLote.jsx — mismo componente, `codigoLote` ya conocido
          de antemano en vez de recién emitido en este montaje. */}
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

export default GestionCuotas;
