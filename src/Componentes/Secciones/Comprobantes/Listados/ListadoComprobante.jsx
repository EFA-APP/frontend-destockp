import { useState, useEffect } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Link,
  FileCheck,
  FileText,
  Receipt,
  CreditCard,
  FileX,
  Filter,
  Eye,
} from "lucide-react";
import { useObtenerComprobantesQuery } from "../../../../Backend/Ventas/queries/Comprobante/useObtenerComprobantes.query";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { obtenerComprobantePorCodigo } from "../../../../Backend/Ventas/api/Comprobante/comprobante.api";
import { formatPrice } from "../../../../utils/formatters";
import DetalleComprobanteDrawer from "../../../Tablas/Ventas/Comprobantes/DetalleComprobanteDrawer";
import DateRangePicker from "../../../UI/DateRangePicker/DateRangePicker";

// ─────────────────────────────── constantes ───────────────────────────────

const TIPOS_DESCRIPCION = [
  { value: "", label: "Todos los tipos" },
  { value: "FACTURA", label: "Factura" },
  { value: "NOTA_CREDITO", label: "Nota de Crédito" },
  { value: "NOTA_DEBITO", label: "Nota de Débito" },
  { value: "RECIBO", label: "Recibo" },
  { value: "ORDEN_PAGO", label: "Orden de Pago" },
];

const LETRA_MAP = {
  1: "A",
  2: "A",
  3: "A",
  6: "B",
  7: "B",
  8: "B",
  11: "C",
  12: "C",
  13: "C",
};

const ESTADO_STYLE = {
  BORRADOR: "bg-gray-100 text-gray-600 border-gray-200",
  CONFIRMADO: "bg-blue-50 text-blue-700 border-blue-200",
  PENDIENTE_PAGO: "bg-amber-50 text-amber-700 border-amber-200",
  PARCIALMENTE_ABONADO: "bg-orange-50 text-orange-700 border-orange-200",
  ABONADO: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ANULADO: "bg-red-50 text-red-600 border-red-200",
};

const ESTADO_LABEL = {
  BORRADOR: "Borrador",
  CONFIRMADO: "Confirmado",
  PENDIENTE_PAGO: "Pendiente",
  PARCIALMENTE_ABONADO: "Parcial",
  ABONADO: "Abonado",
  ANULADO: "Anulado",
};

const TIPO_ICON = {
  FACTURA: FileCheck,
  NOTA_CREDITO: FileX,
  NOTA_DEBITO: FileText,
  RECIBO: Receipt,
  ORDEN_PAGO: CreditCard,
};

const TIPO_COLOR = {
  FACTURA: "bg-blue-50 text-blue-700 border-blue-100",
  NOTA_CREDITO: "bg-rose-50 text-rose-700 border-rose-100",
  NOTA_DEBITO: "bg-amber-50 text-amber-700 border-amber-100",
  RECIBO: "bg-violet-50 text-violet-700 border-violet-100",
  ORDEN_PAGO: "bg-cyan-50 text-cyan-700 border-cyan-100",
};

const TIPO_ACCENT = {
  FACTURA: "bg-blue-400",
  NOTA_CREDITO: "bg-rose-400",
  NOTA_DEBITO: "bg-amber-400",
  RECIBO: "bg-violet-400",
  ORDEN_PAGO: "bg-cyan-400",
};

const TIPO_LABEL_SHORT = {
  FACTURA: "FAC",
  NOTA_CREDITO: "NC",
  NOTA_DEBITO: "ND",
  RECIBO: "REC",
  ORDEN_PAGO: "OP",
};

// ─────────────────────────────── helpers ──────────────────────────────────

const fmtNro = (pv, nro) =>
  `${String(pv || 0).padStart(5, "0")}-${String(nro || 0).padStart(8, "0")}`;

const fmtFecha = (iso) =>
  iso ? new Date(iso).toLocaleDateString("es-AR", { timeZone: "UTC" }) : "—";

// Adapta el comprobante DB al shape esperado por DetalleComprobanteDrawer / ComprobantePDF
const isoToAfip = (iso) => {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (isNaN(d)) return undefined;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}${m}${dd}`;
};

const adaptarParaDrawer = (full) => {
  const letraComprobante =
    full.letraComprobante || LETRA_MAP[full.codigoTipoComprobante] || "";
  return {
    tipoDocumento: full.codigoTipoComprobante,
    letraComprobante,
    puntoVenta: full.puntoVenta,
    numeroComprobante: full.numeroComprobante,
    fechaEmision: full.fechaEmision,
    fechaVto: full.fechaVto,
    estado: full.estado,
    condicionVenta: full.condicionComprobante,
    cae: full.cae,
    vtoCae: isoToAfip(full.vtoCae), // PDF espera YYYYMMDD
    fiscal: !!full.cae,
    total: full.total,
    subtotal: full.subtotal,
    iva: full.iva,
    qrCodeImage: full.qrCode ?? undefined,
    receptor: {
      razonSocial: full.razonSocial,
      DocNro: full.numeroDocumento,
      DocTipo: 80,
      condicionIva: full.condicionIvaReceptor,
      codigoReceptor: full.codigoReceptor,
    },
    detalles: (full.detalles || []).map((d) => ({
      nombre: d.descripcion,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
      tasaIva: d.tasaIva,
      subtotal:
        d.subtotal ?? d.precioUnitario * d.cantidad - (d.descuento || 0),
    })),
    pagos: (full.pagos || []).map((p) => ({
      metodo: p.tipoMetodoPago, // campo real en DB
      monto: p.monto,
      referencia: p.referencia,
      fechaPago: p.fechaPago,
      codigoBancoDestino: p.codigoBancoDestino,
    })),
    ajustes: [],
    cbtesAsoc: (full.comprobantesAsociados || []).map((a) => ({
      tipo: a.tipoDescripcionComprobanteOrigen ?? a.codigoTipoComprobanteAsociado ?? a.tipoRelacion,
      ptoVta: a.puntoVentaOrigen ?? a.puntoVenta ?? 0,
      nro: a.numeroComprobanteOrigenDisplay ?? a.numeroComprobanteAsociado ?? a.numeroComprobanteOrigen,
      total: a.importeAplicado,
      codigo: a.numeroComprobanteOrigen,
    })),
  };
};

// ─────────────────────────────── sub-componentes ──────────────────────────

const FieldLabel = ({ children }) => (
  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
    {children}
  </span>
);

const SelectFiltro = ({ label, value, onChange, options }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 px-2 border border-gray-200 rounded-md text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-[var(--primary)] cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

const FilaBadge = ({
  tipoDescripcion,
  codigoTipoComprobante,
  letraComprobante,
}) => {
  const Icon = TIPO_ICON[tipoDescripcion] || FileText;
  const color =
    TIPO_COLOR[tipoDescripcion] || "bg-gray-50 text-gray-600 border-gray-100";
  const label = TIPO_LABEL_SHORT[tipoDescripcion] || tipoDescripcion;
  const letra = letraComprobante || LETRA_MAP[codigoTipoComprobante] || "";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${color}`}
    >
      <Icon size={10} />
      {label}
      {letra ? ` ${letra}` : ""}
    </span>
  );
};

// ─────────────────────────────── skeleton de carga ────────────────────────

const SkeletonFila = () => (
  <div className="flex items-stretch border-b border-gray-100 last:border-0">
    <div className="w-1 shrink-0 bg-gray-100" />
    <div className="flex flex-1 items-center gap-4 px-4 py-4">
      <div className="w-[140px] shrink-0 space-y-2">
        <div className="h-4 bg-gray-100 rounded animate-pulse w-14" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-28" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/4" />
      </div>
      <div className="w-24 hidden sm:block space-y-2">
        <div className="h-3 bg-gray-100 rounded animate-pulse" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
      </div>
      <div className="w-[90px] hidden md:block">
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="w-[100px] space-y-2 shrink-0">
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3 ml-auto" />
      </div>
      <div className="w-8 shrink-0" />
    </div>
  </div>
);

// ─────────────────────────────── fila individual ──────────────────────────

const FilaComprobante = ({ comp, onClick, isLoading }) => {
  const letra =
    comp.letraComprobante || LETRA_MAP[comp.codigoTipoComprobante] || "";
  const tieneAsociados = comp.comprobantesAsociados?.length > 0;
  const esFiscal = !!comp.cae;
  const esAnulacion =
    comp.tipoOperacion === "ANULACION_INGRESO" ||
    comp.tipoOperacion === "ANULACION_EGRESO";
  const accent = TIPO_ACCENT[comp.tipoDescripcionComprobante] || "bg-gray-200";

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-stretch border-b border-gray-100/80 last:border-0 transition-colors
        ${isLoading ? "opacity-60 cursor-wait" : "cursor-pointer hover:bg-[var(--primary)]/[0.025]"}
        ${esAnulacion ? "opacity-70" : ""}`}
    >
      {/* Accent strip — se ensancha en hover */}
      <div
        className={`w-[3px] shrink-0 ${accent} transition-all duration-200 group-hover:w-[5px]`}
      />

      {/* Contenido de la fila */}
      <div className="flex flex-1 items-center gap-4 px-4 py-3.5 min-w-0">
        {/* Col 1: Tipo + Número */}
        <div className="shrink-0 w-[140px]">
          <div className="flex items-center gap-1 flex-wrap mb-1.5">
            <FilaBadge
              tipoDescripcion={comp.tipoDescripcionComprobante}
              codigoTipoComprobante={comp.codigoTipoComprobante}
              letraComprobante={letra}
            />
            {esAnulacion && (
              <span className="text-[8px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 border border-rose-100 px-1 py-0.5 rounded">
                ANUL.
              </span>
            )}
          </div>
          <p className="text-[11px] font-black text-gray-700 tabular-nums tracking-tight font-mono">
            {fmtNro(comp.puntoVenta, comp.numeroComprobante)}
          </p>
        </div>

        {/* Col 2: Receptor */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-900 truncate leading-snug">
            {comp.razonSocial || (
              <span className="text-gray-300 font-normal italic">
                Sin receptor
              </span>
            )}
          </p>
          <p className="text-[10px] font-semibold text-gray-400 mt-0.5 uppercase tracking-tight">
            {comp.condicionComprobante?.replace(/_/g, " ") || "—"}
          </p>
        </div>

        {/* Col 3: Fechas */}
        <div className="shrink-0 w-24 hidden sm:block">
          <p className="text-[11px] font-bold text-gray-700 tabular-nums">
            {fmtFecha(comp.fechaEmision)}
          </p>
          {comp.fechaVto && (
            <p className="text-[9px] font-semibold text-gray-400 mt-0.5">
              Vto {fmtFecha(comp.fechaVto)}
            </p>
          )}
        </div>

        {/* Col 4: Estado + Badges */}
        <div className="shrink-0 hidden md:flex flex-col items-end gap-1.5 w-[100px]">
          {comp.estado && (
            <span
              className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                ESTADO_STYLE[comp.estado] ||
                "bg-gray-100 text-gray-500 border-gray-200"
              }`}
            >
              {ESTADO_LABEL[comp.estado] || comp.estado}
            </span>
          )}
          <div className="flex items-center gap-1 flex-wrap justify-end">
            {esFiscal && (
              <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-100">
                CAE
              </span>
            )}
            {tieneAsociados && (
              <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase tracking-wider px-1 py-0.5 rounded border bg-sky-50 text-sky-700 border-sky-100">
                <Link size={7} />
                Asoc.
              </span>
            )}
          </div>
        </div>

        {/* Col 5: Total */}
        <div className="shrink-0 text-right w-[100px]">
          <p className="text-sm font-black text-gray-900 tabular-nums">
            {formatPrice(comp.total || 0)}
          </p>
          {comp.iva > 0 && (
            <p className="text-[9px] font-semibold text-gray-400 tabular-nums">
              IVA {formatPrice(comp.iva)}
            </p>
          )}
        </div>

        {/* Col 6: Acción */}
        <div className="shrink-0 w-8 flex items-center justify-center">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
          ) : (
            <Eye
              size={15}
              className="text-gray-300 group-hover:text-[var(--primary)] transition-colors duration-200"
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────── componente principal ─────────────────────

const ListadoComprobante = () => {
  const usuario = useAuthStore((s) => s.usuario);
  const unidadesNegocio = usuario?.unidadesNegocio || [];

  // ── Tabs ──
  const [tipoOperacion, setTipoOperacion] = useState("INGRESO");

  // ── Filtros ──
  const [unidadNegocio, setUnidadNegocio] = useState("");
  const [tipo, setTipo] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [fiscal, setFiscal] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");
  const [pagina, setPagina] = useState(1);
  const LIMITE = 15;

  // ── Drawer de detalle ──
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [comprobanteDetalle, setComprobanteDetalle] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(null);

  useEffect(() => {
    if (unidadesNegocio.length > 0 && !unidadNegocio) {
      setUnidadNegocio(String(unidadesNegocio[0].codigoSecuencial));
    }
  }, [unidadesNegocio]);

  useEffect(() => {
    setPagina(1);
  }, [
    tipoOperacion,
    unidadNegocio,
    tipo,
    fechaDesde,
    fechaHasta,
    fiscal,
    busquedaDebounced,
  ]);

  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busqueda), 400);
    return () => clearTimeout(t);
  }, [busqueda]);

  const filtros = {
    codigoUnidadNegocio: unidadNegocio || undefined,
    tipoOperacion,
    ...(tipo && { tipo }),
    ...(fechaDesde && { fechaDesde }),
    ...(fechaHasta && { fechaHasta }),
    ...(fiscal !== "" && { fiscal }),
    ...(busquedaDebounced && { busqueda: busquedaDebounced }),
    pagina,
    limite: LIMITE,
  };

  const { data, isLoading, isFetching } = useObtenerComprobantesQuery(filtros);

  const comprobantes = Array.isArray(data) ? data : (data?.data ?? []);
  const totalPaginas = data?.totalPaginas ?? 1;
  const totalRegistros = data?.total ?? 0;

  const limpiarFiltros = () => {
    setTipo("");
    setFechaDesde("");
    setFechaHasta("");
    setFiscal("");
    setBusqueda("");
  };

  const hayFiltros =
    tipo || fechaDesde || fechaHasta || fiscal !== "" || busqueda;

  const handleAbrirDetalle = async (comp) => {
    if (cargandoDetalle) return;
    setCargandoDetalle(comp.codigo);
    try {
      const full = await obtenerComprobantePorCodigo(comp.codigo);
      if (full) {
        setComprobanteDetalle(adaptarParaDrawer(full));
        setDrawerOpen(true);
      }
    } catch (e) {
      console.error("[ListadoComprobante] Error al cargar detalle:", e);
    } finally {
      setCargandoDetalle(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] w-full p-3 md:p-6 font-sans overflow-x-hidden">
      {/* ── TABS ── */}
      <div className="flex bg-gray-200/60 p-1.5 rounded-md border border-gray-200 w-full sm:w-fit mb-5 shadow-inner">
        {["INGRESO", "EGRESO"].map((tab) => (
          <button
            key={tab}
            onClick={() => setTipoOperacion(tab)}
            className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-md text-xs font-black uppercase tracking-wider transition-all duration-200 ${
              tipoOperacion === tab
                ? "bg-white text-gray-900 shadow-sm border border-gray-200/50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "INGRESO" ? "Ventas (Ingresos)" : "Compras (Egresos)"}
          </button>
        ))}
      </div>

      {/* ── PANEL DE FILTROS ── */}
      <div className="bg-white border border-gray-200 rounded-md p-4 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={13} className="text-[var(--primary)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Filtros
          </span>
          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="ml-auto flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-500 hover:text-rose-700 transition cursor-pointer"
            >
              <X size={11} />
              Limpiar
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Unidad de negocio */}
          <div className="col-span-2 sm:col-span-1">
            <FieldLabel>Unidad de Negocio</FieldLabel>
            <select
              value={unidadNegocio}
              onChange={(e) => setUnidadNegocio(e.target.value)}
              className="w-full h-9 px-2 border border-gray-200 rounded-md text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-[var(--primary)] cursor-pointer"
            >
              {unidadesNegocio.map((u) => (
                <option key={u.codigoSecuencial} value={u.codigoSecuencial}>
                  {u.nombre}
                </option>
              ))}
            </select>
          </div>

          <SelectFiltro
            label="Tipo Comprobante"
            value={tipo}
            onChange={setTipo}
            options={TIPOS_DESCRIPCION}
          />

          <div>
            <FieldLabel>Naturaleza</FieldLabel>
            <select
              value={fiscal}
              onChange={(e) => setFiscal(e.target.value)}
              className="w-full h-9 px-2 border border-gray-200 rounded-md text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-[var(--primary)] cursor-pointer"
            >
              <option value="">Todos</option>
              <option value="true">Fiscal (con CAE)</option>
              <option value="false">Interno (sin CAE)</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1 lg:col-span-2">
            <FieldLabel>Rango de Fechas</FieldLabel>
            <DateRangePicker 
               fechaDesde={fechaDesde} 
               fechaHasta={fechaHasta} 
               onChange={(desde, hasta) => {
                  setFechaDesde(desde);
                  setFechaHasta(hasta);
               }}
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <FieldLabel>Buscar</FieldLabel>
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Razón social, número..."
                className="w-full h-9 pl-7 pr-7 border border-gray-200 rounded-md text-xs font-bold text-gray-700 focus:outline-none focus:border-[var(--primary)] placeholder:font-normal"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── TABLA ── */}
      <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden flex-1">
        {/* Info bar */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            {isFetching && !isLoading
              ? "Actualizando..."
              : `${totalRegistros} comprobante${totalRegistros !== 1 ? "s" : ""}`}
          </span>
          {totalPaginas > 1 && (
            <span className="text-[10px] font-bold text-gray-400">
              Pág. {pagina} / {totalPaginas}
            </span>
          )}
        </div>

        {/* Cabecera de columnas */}
        <div className="hidden md:flex items-center gap-4 pl-[19px] pr-4 py-2.5 border-b border-gray-100 bg-gray-50/80">
          <div className="w-[140px] shrink-0 text-[9px] font-black uppercase tracking-widest text-gray-400">
            Comprobante
          </div>
          <div className="flex-1 text-[9px] font-black uppercase tracking-widest text-gray-400">
            Receptor
          </div>
          <div className="w-24 shrink-0 text-[9px] font-black uppercase tracking-widest text-gray-400">
            Fecha Emis.
          </div>
          <div className="w-[100px] shrink-0 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">
            Estado
          </div>
          <div className="w-[100px] shrink-0 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">
            Total
          </div>
          <div className="w-8 shrink-0" />
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonFila key={i} />
            ))}
          </div>
        ) : !unidadNegocio ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Filter size={22} className="text-gray-300" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              Seleccioná una unidad de negocio
            </p>
          </div>
        ) : comprobantes.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Search size={22} className="text-gray-300" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">
              Sin resultados
            </p>
            <p className="text-[10px] font-semibold uppercase text-gray-300">
              Probá con otros filtros
            </p>
          </div>
        ) : (
          <div>
            {comprobantes.map((comp) => (
              <FilaComprobante
                key={comp.codigo}
                comp={comp}
                onClick={() => handleAbrirDetalle(comp)}
                isLoading={cargandoDetalle === comp.codigo}
              />
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <button
              disabled={pagina <= 1}
              onClick={() => setPagina((p) => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={13} />
              Anterior
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPaginas, 7) }, (_, i) => {
                let page = i + 1;
                if (totalPaginas > 7) {
                  if (pagina <= 4) page = i + 1;
                  else if (pagina >= totalPaginas - 3)
                    page = totalPaginas - 6 + i;
                  else page = pagina - 3 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setPagina(page)}
                    className={`w-7 h-7 rounded-md text-[11px] font-black transition cursor-pointer ${
                      page === pagina
                        ? "bg-[var(--primary)] text-white shadow-sm"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              disabled={pagina >= totalPaginas}
              onClick={() => setPagina((p) => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Siguiente
              <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* ── DRAWER DE DETALLE Y PDF ── */}
      {comprobanteDetalle && (
        <DetalleComprobanteDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          data={comprobanteDetalle}
          usuario={usuario}
        />
      )}
    </div>
  );
};

export default ListadoComprobante;
