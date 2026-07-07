import { useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Scale,
  Lock,
  Unlock,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useMovimientosTesoreriaQuery } from "../../../../Backend/Tesoreria/queries/useMovimientosTesoreria.query";
import { formatPrice } from "../../../../utils/formatters";
import { BilleteraIcono } from "../../../../assets/Icons";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import ModalAperturaCaja from "./ModalAperturaCaja";
import ModalCierreCaja from "./ModalCierreCaja";
import HistorialCajasDiarias from "./HistorialCajasDiarias";

const hoyISO = () => new Date().toISOString().slice(0, 10);

const fmtFecha = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

// Datos de ejemplo sembrados en estado local (R17): no existe persistencia
// de aperturas/cierres de caja en backend (tesoreria-ms no tiene ningún
// modelo de este tipo hoy, ver design.md §0).
const HISTORIAL_EJEMPLO = [
  {
    fecha: "2026-07-03",
    fondoInicial: 50000,
    ingresos: 320000,
    egresos: 145000,
    saldoEsperado: 225000,
    saldoContado: 225000,
    diferencia: 0,
    estado: "cerrada",
  },
  {
    fecha: "2026-07-04",
    fondoInicial: 50000,
    ingresos: 180500,
    egresos: 92000,
    saldoEsperado: 138500,
    saldoContado: 137000,
    diferencia: -1500,
    estado: "cerrada",
  },
];

const ResumenCard = ({ titulo, monto, icono, colorClass }) => (
  <div className="bg-white border border-[var(--border-subtle)] rounded-md p-5 flex items-center gap-4 shadow-sm hover:border-gray-300 transition-colors">
    <div className={`p-3 rounded-md bg-black/[0.03] ${colorClass} shrink-0`}>
      {icono}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
        {titulo}
      </p>
      <p
        className={`text-2xl font-black leading-none tracking-tight ${colorClass}`}
      >
        {formatPrice(monto)}
      </p>
    </div>
  </div>
);

const CajaDiaria = () => {
  const { usuario } = useAuthStore();
  const hoy = hoyISO();

  // Estado local de apertura/cierre/arqueo de caja (sin persistencia,
  // sin llamadas NATS nuevas — limitación aceptada, ver design.md §0, R11,
  // R14, R15).
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [fondoInicial, setFondoInicial] = useState(0);
  const [modalAperturaAbierto, setModalAperturaAbierto] = useState(false);
  const [modalCierreAbierto, setModalCierreAbierto] = useState(false);
  const [historial, setHistorial] = useState(HISTORIAL_EJEMPLO);

  const { data, isLoading } = useMovimientosTesoreriaQuery({
    codigoEmpresa: usuario?.codigoEmpresa,
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

  return (
    <div className="w-full py-6 px-6 space-y-6">
      <EncabezadoSeccion
        ruta="Tesorería / Caja Diaria"
        icono={<BilleteraIcono size={20} />}
      >
        {!cajaAbierta ? (
          <button
            onClick={() => setModalAperturaAbierto(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-[var(--primary)] text-white text-xs font-black uppercase tracking-wider shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Unlock size={16} />
            Abrir Caja
          </button>
        ) : (
          <button
            onClick={() => setModalCierreAbierto(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-rose-600 text-white text-xs font-black uppercase tracking-wider shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Lock size={16} />
            Cerrar Caja
          </button>
        )}
      </EncabezadoSeccion>

      {!cajaAbierta && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800">
          <AlertTriangle size={18} className="shrink-0" />
          <span className="text-xs font-bold">
            La caja del día no fue abierta. Ingrese el fondo inicial para
            poder realizar el cierre de caja.
          </span>
        </div>
      )}

      {modalAperturaAbierto && (
        <ModalAperturaCaja
          onConfirmar={(monto) => {
            setFondoInicial(monto);
            setCajaAbierta(true);
            setModalAperturaAbierto(false);
          }}
          onClose={() => setModalAperturaAbierto(false)}
        />
      )}

      {modalCierreAbierto && (
        <ModalCierreCaja
          saldoTeorico={saldoTeorico}
          onConfirmar={(resultadoCierre) => {
            setHistorial((prev) => [
              {
                fecha: hoy,
                fondoInicial,
                ingresos: ingresosEfectivo,
                egresos: egresosEfectivo,
                saldoEsperado: saldoTeorico,
                saldoContado: resultadoCierre.totalContado,
                diferencia: resultadoCierre.diferencia,
                estado: "cerrada",
              },
              ...prev,
            ]);
            setCajaAbierta(false);
            setModalCierreAbierto(false);
          }}
          onClose={() => setModalCierreAbierto(false)}
        />
      )}

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ResumenCard
          titulo="Fondo Inicial"
          monto={fondoInicial}
          icono={<Wallet size={18} />}
          colorClass="text-gray-700"
        />
        <ResumenCard
          titulo="Ingresos Efectivo"
          monto={ingresosEfectivo}
          icono={<TrendingUp size={18} />}
          colorClass="text-emerald-600"
        />
        <ResumenCard
          titulo="Egresos Efectivo"
          monto={egresosEfectivo}
          icono={<TrendingDown size={18} />}
          colorClass="text-rose-600"
        />
        <ResumenCard
          titulo="Saldo Teórico Esperado"
          monto={saldoTeorico}
          icono={<Scale size={18} />}
          colorClass={saldoTeorico >= 0 ? "text-emerald-600" : "text-rose-600"}
        />
      </div>

      {/* Panel Principal: Tabla de movimientos en efectivo del día */}
      <div className="bg-[var(--surface)] border border-[var(--border-subtle)] rounded-md shadow-sm flex-1 flex flex-col">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-black/[0.01]">
          <span className="text-xs font-black text-black/40 uppercase tracking-widest">
            Movimientos en Efectivo — {fmtFecha(hoy)}
          </span>
        </div>

        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/[0.02] border-b border-[var(--border-subtle)]">
                {[
                  "Fecha",
                  "Tipo",
                  "Descripción movimiento",
                  "Comprobante",
                  "Importe",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3.5 text-[9px] font-black text-black/40 uppercase tracking-[0.18em] whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm font-semibold text-black/40"
                  >
                    Cargando movimientos…
                  </td>
                </tr>
              ) : movimientosEfectivo.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm font-semibold text-black/40"
                  >
                    No se encontraron movimientos en efectivo hoy
                  </td>
                </tr>
              ) : (
                movimientosEfectivo.map((mov) => (
                  <tr
                    key={mov.codigo}
                    className="border-b border-[var(--border-subtle)]/60 hover:bg-[var(--primary)]/[0.02] transition-colors cursor-default"
                  >
                    <td className="px-5 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">
                      {fmtFecha(mov.fecha)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                          mov.tipoOperacion === "INGRESO"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {mov.tipoOperacion === "INGRESO" ? (
                          <TrendingUp size={12} />
                        ) : (
                          <TrendingDown size={12} />
                        )}
                        {mov.tipoOperacion}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-gray-800">
                      {mov._comprobante?.razonSocial ??
                        mov.descripcion ??
                        mov.tipoMovimiento?.nombre ??
                        "—"}
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-gray-500 whitespace-nowrap">
                      {mov._comprobante ? (
                        <span className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                            {mov._comprobante.tipoDescripcionComprobante?.substring(
                              0,
                              3,
                            )}
                          </span>
                          <span className="font-mono tabular-nums">
                            {mov._comprobante.puntoVenta &&
                            mov._comprobante.numeroComprobante
                              ? `${String(mov._comprobante.puntoVenta).padStart(4, "0")}-${String(mov._comprobante.numeroComprobante).padStart(8, "0")}`
                              : `#${mov.codigoComprobante}`}
                          </span>
                        </span>
                      ) : mov.codigoComprobante ? (
                        <span className="font-mono tabular-nums">
                          #{mov.codigoComprobante}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm font-black whitespace-nowrap tabular-nums">
                      <span
                        className={
                          mov.tipoOperacion === "INGRESO"
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }
                      >
                        {mov.tipoOperacion === "EGRESO" ? "−" : "+"}
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

      {/* Historial de Cajas Anteriores */}
      <HistorialCajasDiarias historial={historial} />
    </div>
  );
};

export default CajaDiaria;
