import { useState, useEffect, useMemo } from "react";
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
import { useAlertas } from "../../../../store/useAlertas";
import { useObtenerUnidadesNegocio } from "../../../../Backend/Autenticacion/queries/UnidadNegocio/useObtenerUnidadesNegocio.query";
import { useMovimientosTesoreriaQuery } from "../../../../Backend/Tesoreria/queries/useMovimientosTesoreria.query";
import { formatPrice } from "../../../../utils/formatters";
import { BilleteraIcono } from "../../../../assets/Icons";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
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

const ResumenCard = ({ titulo, monto, icono, colorFondo, colorIcono }) => (
  <div className="bg-white rounded-[16px] p-5 xl:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all flex flex-col justify-between h-[130px] relative">
    <div className="flex justify-between items-start w-full">
      <p className="text-[13px] font-medium text-[#6B7472] max-w-[70%] leading-tight">
        {titulo}
      </p>
      <div className={`p-2 rounded-xl ${colorFondo} ${colorIcono} shrink-0`}>
        {icono}
      </div>
    </div>
    <div>
      <p className="text-[24px] xl:text-[28px] font-bold text-[#1A1D1C] leading-none tracking-tight">
        {formatPrice(monto)}
      </p>
    </div>
  </div>
);

const CajaDiaria = () => {
  const { usuario, unidadActiva } = useAuthStore();
  const hoy = hoyISO();

  const [filtroUnidadNegocio, setFiltroUnidadNegocio] = useState(
    unidadActiva?.codigoSecuencial || ""
  );

  useEffect(() => {
    if (unidadActiva?.codigoSecuencial) {
      setFiltroUnidadNegocio(unidadActiva.codigoSecuencial);
    }
  }, [unidadActiva?.codigoSecuencial]);

  const [modalAperturaAbierto, setModalAperturaAbierto] = useState(false);
  const [modalCierreAbierto, setModalCierreAbierto] = useState(false);
  const [modalMovimiento, setModalMovimiento] = useState({ isOpen: false, tipoOperacion: "INGRESO" });
  
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);

  const { data: unidades = [] } = useObtenerUnidadesNegocio({
    codigoEmpresa: usuario?.codigoEmpresa,
  });

  const { mutate: abrirCaja } = useAbrirCajaDiariaMutation();
  const { mutate: cerrarCaja } = useCerrarCajaDiariaMutation();

  const codUnidad = Number(filtroUnidadNegocio) || 0;

  const { data: cajaAbiertaData } = useCajaDiariaAbiertaQuery(
    usuario?.codigoEmpresa ? codUnidad : null
  );
  
  const cajaObj = cajaAbiertaData?.data ?? cajaAbiertaData;
  const cajaAbierta = !!cajaObj && typeof cajaObj === 'object' && Object.keys(cajaObj).length > 0;
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
    return new Map(cuentas.map((c) => [c.codigoSecuencial, c]));
  }, [cuentasImputadasData]);

  return (
    <div className="w-full py-6 px-6 space-y-6">
      <EncabezadoSeccion
        ruta="Tesorería / Caja Diaria"
        icono={<BilleteraIcono size={20} />}
      >
        <div className="flex gap-3 items-center">
          <select
            value={filtroUnidadNegocio}
            onChange={(e) => setFiltroUnidadNegocio(e.target.value)}
            className="h-10 px-4 rounded-[10px] border border-[#E9EDEC] bg-[#F5F7F6] text-[#1A1D1C] text-[13px] font-medium focus:outline-none focus:border-[#1FAE6D] focus:ring-1 focus:ring-[#1FAE6D] cursor-pointer mr-2"
          >
            <option value="">Seleccione Unidad de Negocio</option>
            {unidades.map((u) => (
              <option key={u.codigoSecuencial} value={u.codigoSecuencial}>
                {u.nombre}
              </option>
            ))}
          </select>

          {cajaAbierta && (
            <>
              <button
                onClick={() => setModalMovimiento({ isOpen: true, tipoOperacion: "INGRESO" })}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E8F7EF] text-[#178F58] text-sm font-semibold hover:bg-[#1FAE6D] hover:text-white transition-colors cursor-pointer"
              >
                <TrendingUp size={18} />
                Ingreso
              </button>
              <button
                onClick={() => setModalMovimiento({ isOpen: true, tipoOperacion: "EGRESO" })}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E9EDEC] text-[#1A1D1C] text-sm font-semibold hover:bg-[#F5F7F6] transition-colors cursor-pointer"
              >
                <TrendingDown size={18} />
                Egreso
              </button>
              <div className="w-px bg-[#E9EDEC] mx-2 my-1"></div>
            </>
          )}

          {!cajaAbierta ? (
            <button
              onClick={() => setModalAperturaAbierto(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1FAE6D] text-white text-sm font-semibold shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:bg-[#178F58] transition-colors cursor-pointer"
            >
              <Unlock size={18} />
              Abrir Caja
            </button>
          ) : (
            <button
              onClick={() => setModalCierreAbierto(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E9EDEC] text-[#EF5A5A] text-sm font-semibold hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Lock size={18} />
              Cerrar Caja
            </button>
          )}
        </div>
      </EncabezadoSeccion>

      {!cajaAbierta && (
        <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#F5B944]/10 border border-[#F5B944]/20 text-[#1A1D1C]">
          <AlertTriangle size={20} className="shrink-0 text-[#F5B944]" />
          <span className="text-sm font-medium">
            La caja del día no fue abierta. Ingrese el fondo inicial para
            poder realizar el cierre de caja.
          </span>
        </div>
      )}

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
                  agregarAlerta(error?.message || "Error al abrir la caja", "error");
                }
              }
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
                  agregarAlerta(error?.message || "Error al cerrar la caja", "error");
                }
              }
            );
          }}
        />
      )}

      {modalMovimiento.isOpen && (
        <ModalIngresoEgresoCaja
          tipoOperacion={modalMovimiento.tipoOperacion}
          onClose={() => setModalMovimiento({ isOpen: false, tipoOperacion: "INGRESO" })}
        />
      )}

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ResumenCard
          titulo="Fondo Inicial"
          monto={fondoInicial}
          icono={<Wallet size={20} />}
          colorFondo="bg-[#F5F7F6]"
          colorIcono="text-[#6B7472]"
        />
        <ResumenCard
          titulo="Ingresos Efectivo"
          monto={ingresosEfectivo}
          icono={<TrendingUp size={20} />}
          colorFondo="bg-[#E8F7EF]"
          colorIcono="text-[#1FAE6D]"
        />
        <ResumenCard
          titulo="Egresos Efectivo"
          monto={egresosEfectivo}
          icono={<TrendingDown size={20} />}
          colorFondo="bg-[#EF5A5A]/10"
          colorIcono="text-[#EF5A5A]"
        />
        <ResumenCard
          titulo="Saldo Teórico Esperado"
          monto={saldoTeorico}
          icono={<Scale size={20} />}
          colorFondo={saldoTeorico >= 0 ? "bg-[#E8F7EF]" : "bg-[#EF5A5A]/10"}
          colorIcono={saldoTeorico >= 0 ? "text-[#1FAE6D]" : "text-[#EF5A5A]"}
        />
      </div>

      {/* Panel Principal: Tabla de movimientos en efectivo del día */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.05)] flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E9EDEC]">
          <span className="text-[15px] font-semibold text-[#1A1D1C]">
            Movimientos en Efectivo — {fmtFecha(hoy)}
          </span>
        </div>

        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                {[
                  "Fecha",
                  "Tipo",
                  "Descripción movimiento",
                  "Comprobante",
                  "Importe",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-4 text-[13px] font-medium text-[#6B7472] whitespace-nowrap border-b border-[#E9EDEC]"
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
                    className="px-6 py-12 text-center text-sm font-medium text-[#6B7472]"
                  >
                    Cargando movimientos…
                  </td>
                </tr>
              ) : movimientosEfectivo.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm font-medium text-[#6B7472]"
                  >
                    No se encontraron movimientos en efectivo hoy
                  </td>
                </tr>
              ) : (
                movimientosEfectivo.map((mov) => (
                  <tr
                    key={mov.codigo}
                    className="border-b border-[#E9EDEC] hover:bg-[#F5F7F6] transition-colors cursor-default"
                  >
                    <td className="px-6 py-4 text-sm font-normal text-[#1A1D1C] whitespace-nowrap">
                      {fmtFecha(mov.fecha)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                          mov.tipoOperacion === "INGRESO"
                            ? "bg-[#E8F7EF] text-[#178F58] border-transparent"
                            : "bg-[#EF5A5A]/10 text-[#EF5A5A] border-transparent"
                        }`}
                      >
                        {mov.tipoOperacion === "INGRESO" ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingDown size={14} />
                        )}
                        <span className="capitalize">{mov.tipoOperacion.toLowerCase()}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#1A1D1C]">
                      <div>
                        {mov._comprobante?.razonSocial ??
                          mov.descripcion ??
                          mov.tipoMovimiento?.nombre ??
                          "—"}
                      </div>
                      {mov.codigoCuentaImputada &&
                        mapaCuentasImputadas.get(mov.codigoCuentaImputada) && (
                          <div className="text-xs text-[#6B7472] mt-0.5">
                            Cuenta:{" "}
                            {
                              mapaCuentasImputadas.get(mov.codigoCuentaImputada)
                                .nombre
                            }
                          </div>
                        )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B7472] whitespace-nowrap">
                      {mov._comprobante ? (
                        <span className="flex items-center gap-1.5">
                          <span className="uppercase text-xs font-medium">
                            {mov._comprobante.tipoDescripcionComprobante?.substring(
                              0,
                              3,
                            )}
                          </span>
                          <span className="tabular-nums">
                            {mov._comprobante.puntoVenta &&
                            mov._comprobante.numeroComprobante
                              ? `${String(mov._comprobante.puntoVenta).padStart(4, "0")}-${String(mov._comprobante.numeroComprobante).padStart(8, "0")}`
                              : `#${mov.codigoComprobante}`}
                          </span>
                        </span>
                      ) : mov.codigoComprobante ? (
                        <span className="tabular-nums">
                          #{mov.codigoComprobante}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4 text-[15px] font-semibold whitespace-nowrap tabular-nums">
                      <span
                        className={
                          mov.tipoOperacion === "INGRESO"
                            ? "text-[#1FAE6D]"
                            : "text-[#EF5A5A]"
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
