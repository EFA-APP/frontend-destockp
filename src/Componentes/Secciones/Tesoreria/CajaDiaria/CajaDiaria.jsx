import { useState, useEffect, useMemo } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Scale,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useAlertas } from "../../../../store/useAlertas";
import { useObtenerUnidadesNegocio } from "../../../../Backend/Autenticacion/queries/UnidadNegocio/useObtenerUnidadesNegocio.query";
import { useMovimientosTesoreriaQuery } from "../../../../Backend/Tesoreria/queries/useMovimientosTesoreria.query";
import { formatPrice } from "../../../../utils/formatters";
import { BilleteraIcono } from "../../../../assets/Icons";
import ModalAperturaCaja from "./ModalAperturaCaja";
import ModalCierreCaja from "./ModalCierreCaja";
import HistorialCajasDiarias from "./HistorialCajasDiarias";
import { useCajaDiariaAbiertaQuery } from "../../../../Backend/Tesoreria/queries/useCajaDiariaAbierta.query";
import { useHistorialCajaDiariaQuery } from "../../../../Backend/Tesoreria/queries/useHistorialCajaDiaria.query";
import { useAbrirCajaDiariaMutation } from "../../../../Backend/Tesoreria/queries/useAbrirCajaDiaria.mutation";
import { useCerrarCajaDiariaMutation } from "../../../../Backend/Tesoreria/queries/useCerrarCajaDiaria.mutation";
import { useObtenerCuentasPorCodigosQuery } from "../../../../Backend/Contabilidad/queries/useCuentas.query";
import ModalIngresoEgresoCaja from "./ModalIngresoEgresoCaja";

const hoyISO = () => new Date().toISOString().slice(0, 10);

const fmtFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

const ResumenCard = ({
  titulo,
  monto,
  icono,
  isDark = false,
  highlightColor = "",
}) => (
  <div
    className={`rounded-md p-6 border ${isDark ? "bg-gray-900 border-gray-800 shadow-xl" : "bg-white border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"} relative overflow-hidden group flex flex-col justify-between h-[140px]`}
  >
    {isDark && (
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        {icono}
      </div>
    )}
    <div className="flex justify-between items-start w-full relative z-10">
      <p
        className={`text-[11px] font-bold uppercase tracking-widest ${isDark ? "text-gray-400" : "text-gray-500"}`}
      >
        {titulo}
      </p>
      {!isDark && (
        <div className={`p-2 rounded-md ${highlightColor} shrink-0`}>
          {icono}
        </div>
      )}
    </div>
    <div className="relative z-10 mt-2">
      <p
        className={`text-3xl lg:text-4xl font-black leading-none tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}
      >
        {formatPrice(monto)}
      </p>
    </div>
  </div>
);

const CajaDiaria = () => {
  const { usuario, unidadActiva } = useAuthStore();
  const hoy = hoyISO();

  const [filtroUnidadNegocio, setFiltroUnidadNegocio] = useState(
    unidadActiva?.codigo || "",
  );

  useEffect(() => {
    if (unidadActiva?.codigo) {
      setFiltroUnidadNegocio(unidadActiva.codigo);
    }
  }, [unidadActiva?.codigo]);

  const [modalAperturaAbierto, setModalAperturaAbierto] = useState(false);
  const [modalCierreAbierto, setModalCierreAbierto] = useState(false);
  const [modalMovimiento, setModalMovimiento] = useState({
    isOpen: false,
    tipoOperacion: "INGRESO",
  });

  const agregarAlerta = useAlertas((state) => state.agregarAlerta);

  const { data: unidades = [] } = useObtenerUnidadesNegocio({
    codigoEmpresa: usuario?.codigoEmpresa,
  });

  const { mutate: abrirCaja } = useAbrirCajaDiariaMutation();
  const { mutate: cerrarCaja } = useCerrarCajaDiariaMutation();

  const codUnidad = Number(filtroUnidadNegocio) || 0;

  const { data: cajaAbiertaData } = useCajaDiariaAbiertaQuery(
    usuario?.codigoEmpresa ? codUnidad : null,
  );

  const cajaObj = cajaAbiertaData?.data ?? cajaAbiertaData;
  const cajaAbierta =
    !!cajaObj && typeof cajaObj === "object" && Object.keys(cajaObj).length > 0;
  const fondoInicial = cajaObj?.fondoInicial || 0;

  const { data: historialData } = useHistorialCajaDiariaQuery({
    codigoUnidadNegocio: codUnidad,
  });

  const historial = (historialData?.data || []).map((caja) => ({
    fecha: caja.fechaApertura,
    fondoInicial: caja.fondoInicial,
    ingresos: null,
    egresos: null,
    saldoEsperado: caja.estado === "ABIERTA" ? null : caja.saldoTeoricoFinal,
    saldoContado: caja.estado === "ABIERTA" ? null : caja.saldoContadoFinal,
    diferencia: caja.estado === "ABIERTA" ? null : caja.diferencia,
    estado: caja.estado?.toLowerCase(),
  }));

  const { data, isLoading } = useMovimientosTesoreriaQuery({
    codigoEmpresa: usuario?.codigoEmpresa,
    codigoUnidadNegocio: codUnidad,
    fechaDesde: hoy,
    fechaHasta: hoy,
    pagina: 1,
    limite: 500,
  });

  const movimientosDelDia = data?.data ?? [];

  const movimientosEfectivo = movimientosDelDia.filter((mov) =>
    (mov.tipoMovimiento?.nombre ?? "").toLowerCase().includes("efectivo"),
  );

  const ingresosEfectivo = movimientosEfectivo
    .filter((m) => m.tipoOperacion === "INGRESO")
    .reduce((acc, m) => acc + m.importe, 0);

  const egresosEfectivo = movimientosEfectivo
    .filter((m) => m.tipoOperacion === "EGRESO")
    .reduce((acc, m) => acc + m.importe, 0);

  const saldoTeorico = fondoInicial + ingresosEfectivo - egresosEfectivo;

  const codigosCuentaImputada = useMemo(() => {
    const codigos = movimientosEfectivo
      .map((m) => m.codigoCuentaImputada)
      .filter((c) => c !== null && c !== undefined);
    return [...new Set(codigos)];
  }, [movimientosEfectivo]);

  const { data: cuentasImputadasData } = useObtenerCuentasPorCodigosQuery(
    codigosCuentaImputada,
  );

  const mapaCuentasImputadas = useMemo(() => {
    const cuentas = cuentasImputadasData?.data ?? cuentasImputadasData ?? [];
    // mov.codigoCuentaImputada guarda el codigoSecuencial (PK numerica) de
    // la cuenta, no el codigo contable (string, ej. "5.1.03") -- la clave
    // del mapa debe coincidir con eso para que el lookup funcione.
    return new Map(cuentas.map((c) => [c.codigoSecuencial, c]));
  }, [cuentasImputadasData]);

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6 lg:px-8 space-y-8 bg-[#F8FAFC] min-h-[calc(100vh-64px)]">
      {/* HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            <span>Tesorería</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className={cajaAbierta ? "text-[#1FAE6D]" : "text-rose-500"}>
              {cajaAbierta ? "CAJA ABIERTA" : "CAJA CERRADA"}
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <BilleteraIcono size={28} color="var(--primary)" />
            Caja Diaria en Efectivo
          </h1>
          <p className="text-sm font-medium text-gray-500 max-w-2xl">
            Control de ingresos, egresos y arqueo de la caja física del día en
            curso.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={filtroUnidadNegocio}
            onChange={(e) => setFiltroUnidadNegocio(e.target.value)}
            className="h-11 px-4 rounded-md border border-gray-300 bg-white text-sm font-semibold text-gray-700 focus:outline-none focus:border-gray-900 shadow-sm cursor-pointer"
          >
            <option value="">Seleccione Unidad de Negocio</option>
            {unidades.map((u) => (
              <option key={u.codigo} value={u.codigo}>
                {u.nombre}
              </option>
            ))}
          </select>

          {cajaAbierta ? (
            <button
              onClick={() => setModalCierreAbierto(true)}
              className="flex items-center gap-2 h-11 px-6 rounded-md bg-gray-900 text-white text-xs font-bold uppercase tracking-wider shadow-[0_2px_12px_rgba(0,0,0,0.15)] hover:bg-black transition-all cursor-pointer"
            >
              <Lock size={16} strokeWidth={2.5} />
              Cerrar Caja
            </button>
          ) : (
            <button
              onClick={() => setModalAperturaAbierto(true)}
              className="flex items-center gap-2 h-11 px-6 rounded-md bg-[#1FAE6D] hover:bg-[#178F58] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1FAE6D]/20 transition-all cursor-pointer"
            >
              <Unlock size={16} strokeWidth={2.5} />
              Abrir Caja
            </button>
          )}
        </div>
      </div>

      {!cajaAbierta && (
        <div className="flex items-center gap-3 px-6 py-5 rounded-md bg-amber-50 border border-amber-200/60 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="p-2 bg-amber-100 rounded-md shrink-0">
            <AlertTriangle
              size={20}
              className="text-amber-600"
              strokeWidth={2.5}
            />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900">
              Apertura Requerida
            </h4>
            <p className="text-[13px] font-medium text-amber-700 mt-0.5">
              La caja del día no fue abierta. Ingresá el fondo inicial para
              poder operar y realizar el cierre.
            </p>
          </div>
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ResumenCard
          titulo="Saldo Teórico Esperado"
          monto={saldoTeorico}
          icono={<Scale size={100} />}
          isDark={true}
        />
        <ResumenCard
          titulo="Fondo Inicial"
          monto={fondoInicial}
          icono={<Wallet size={20} />}
          highlightColor="bg-gray-100 text-gray-500"
        />
        <ResumenCard
          titulo="Ingresos"
          monto={ingresosEfectivo}
          icono={<ArrowDownToLine size={20} />}
          highlightColor="bg-emerald-50 text-emerald-600"
        />
        <ResumenCard
          titulo="Egresos"
          monto={egresosEfectivo}
          icono={<ArrowUpFromLine size={20} />}
          highlightColor="bg-rose-50 text-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* PANEL DE MOVIMIENTOS */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border border-gray-200 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                Movimientos del Día{" "}
                <span className="text-gray-400 font-normal">
                  ({fmtFecha(hoy)})
                </span>
              </h2>

              {cajaAbierta && (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setModalMovimiento({
                        isOpen: true,
                        tipoOperacion: "INGRESO",
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-[10px] font-bold text-gray-700 uppercase tracking-widest hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
                  >
                    <ArrowDownToLine size={14} className="text-emerald-600" />+
                    Ingreso
                  </button>
                  <button
                    onClick={() =>
                      setModalMovimiento({
                        isOpen: true,
                        tipoOperacion: "EGRESO",
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 text-[10px] font-bold text-gray-700 uppercase tracking-widest hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
                  >
                    <ArrowUpFromLine size={14} className="text-rose-600" />-
                    Egreso
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-white border-b border-gray-200">
                    {["Hora/Fecha", "Tipo", "Concepto", "Ref.", "Importe"].map(
                      (col, i) => (
                        <th
                          key={i}
                          className={`px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap bg-gray-50/30 ${i === 4 ? "text-right" : ""}`}
                        >
                          {col}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400 gap-4">
                          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                          <p className="font-bold text-sm tracking-wide text-gray-500">
                            CARGANDO...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : movimientosEfectivo.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                          <BilleteraIcono
                            size={40}
                            className="text-gray-300 mb-2 opacity-50"
                          />
                          <p className="font-bold text-gray-600">
                            Caja sin movimientos
                          </p>
                          <p className="text-sm text-gray-500 max-w-sm mx-auto">
                            Aún no se han registrado ingresos o egresos de
                            efectivo en el día de hoy.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    movimientosEfectivo.map((mov) => (
                      <tr
                        key={mov.codigo}
                        className="hover:bg-gray-50/80 transition-colors group cursor-default"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-gray-700 whitespace-nowrap font-mono">
                            {fmtFecha(mov.fecha)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                              mov.tipoOperacion === "INGRESO"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                                : "bg-rose-50 text-rose-700 border-rose-200/60"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${mov.tipoOperacion === "INGRESO" ? "bg-emerald-500" : "bg-rose-500"}`}
                            />
                            {mov.tipoOperacion === "INGRESO"
                              ? "Ingreso"
                              : "Egreso"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-gray-900 truncate max-w-[250px] block">
                            {mov._comprobante?.razonSocial ??
                              mov.descripcion ??
                              mov.tipoMovimiento?.nombre ??
                              "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {mov._comprobante ? (
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {mov._comprobante.tipoDescripcionComprobante?.substring(
                                  0,
                                  3,
                                )}
                              </span>
                              <span className="text-sm font-bold text-gray-600 font-mono">
                                {mov._comprobante.puntoVenta &&
                                mov._comprobante.numeroComprobante
                                  ? `${String(mov._comprobante.puntoVenta).padStart(4, "0")}-${String(mov._comprobante.numeroComprobante).padStart(8, "0")}`
                                  : `#${mov.codigoComprobante}`}
                              </span>
                            </div>
                          ) : mov.codigoComprobante ? (
                            <span className="text-sm font-bold text-gray-600 font-mono">
                              #{mov.codigoComprobante}
                            </span>
                          ) : mov.codigoCuentaImputada &&
                            mapaCuentasImputadas.get(mov.codigoCuentaImputada) ? (
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                              {
                                mapaCuentasImputadas.get(mov.codigoCuentaImputada)
                                  .nombre
                              }
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`text-base font-black whitespace-nowrap tabular-nums tracking-tight ${
                              mov.tipoOperacion === "INGRESO"
                                ? "text-[#1FAE6D]"
                                : "text-gray-900"
                            }`}
                          >
                            {mov.tipoOperacion === "EGRESO" ? "− " : "+ "}
                            {formatPrice(mov.importe)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: HISTORIAL */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <HistorialCajasDiarias historial={historial} />
        </div>
      </div>

      {modalAperturaAbierto && (
        <ModalAperturaCaja
          onClose={() => setModalAperturaAbierto(false)}
          onConfirmar={(monto) => {
            abrirCaja(
              {
                payload: { fondoInicial: monto },
                query: {
                  codigoEmpresa: usuario?.codigoEmpresa,
                  codigoUnidadNegocio: codUnidad,
                },
              },
              {
                onSuccess: () => {
                  setModalAperturaAbierto(false);
                  agregarAlerta("Caja abierta exitosamente", "success");
                },
                onError: (error) => {
                  agregarAlerta(
                    error?.message || "Error al abrir la caja",
                    "error",
                  );
                },
              },
            );
          }}
        />
      )}

      {modalCierreAbierto && (
        <ModalCierreCaja
          saldoTeorico={saldoTeorico}
          onClose={() => setModalCierreAbierto(false)}
          onConfirmar={(dataCierre) => {
            cerrarCaja(
              {
                payload: dataCierre,
                query: {
                  codigoEmpresa: usuario?.codigoEmpresa,
                  codigoUnidadNegocio: codUnidad,
                },
              },
              {
                onSuccess: () => {
                  setModalCierreAbierto(false);
                  agregarAlerta("Caja cerrada exitosamente", "success");
                },
                onError: (error) => {
                  agregarAlerta(
                    error?.message || "Error al cerrar la caja",
                    "error",
                  );
                },
              },
            );
          }}
        />
      )}

      {modalMovimiento.isOpen && (
        <ModalIngresoEgresoCaja
          tipoOperacion={modalMovimiento.tipoOperacion}
          onClose={() =>
            setModalMovimiento({ isOpen: false, tipoOperacion: "INGRESO" })
          }
        />
      )}
    </div>
  );
};

export default CajaDiaria;
