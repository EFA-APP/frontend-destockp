import { useState } from "react";
import { createPortal } from "react-dom";
import { X, Save, HandCoins } from "lucide-react";
import DetallePago from "./DetallePago";
import { useGenerarComprobante } from "../../../../Backend/Ventas/queries/Comprobante/useGenerarComprobante.mutation";

const hoy = () => new Date().toISOString().split("T")[0];

/**
 * Feature 7 (comprobante-pago-desacoplado, R13-R17): modal rápido de
 * Recibo/Orden de Pago, abierto automáticamente después de guardar una
 * FACTURA CONTADO sin pago inline (Ingresos.jsx/Egresos.jsx, R10/R11).
 *
 * Un único componente compartido Ingreso/Egreso (design.md §5.1) — sin
 * buscador de contacto ni `ObtenerDeudasContacto` (§5.2): la "deuda" ya se
 * conoce, es la factura recién creada. El mapeo de `detallePagos` (tarjeta/
 * cheque) replica literal el de `Recibos.jsx`/`OrdenPago.jsx`.
 */
const ModalPagoRapido = ({ factura, onClose }) => {
  const [pagos, setPagos] = useState([]);
  const [vueltos, setVueltos] = useState([]);
  const [fecha, setFecha] = useState(hoy());
  const { mutate: crearComprobante, isPending } = useGenerarComprobante();

  if (!factura) return null;

  const esIngreso = factura.tipoOperacion === "INGRESO";
  const totalPagado = pagos.reduce((s, p) => s + p.monto, 0);
  const nroFmt = `${String(factura.puntoVenta ?? 0).padStart(5, "0")}-${String(factura.numeroComprobante ?? 0).padStart(8, "0")}`;

  const handleConfirmar = () => {
    const detallePagos = pagos.map((p) => ({
      metodoPago: p.tipoMetodoPago,
      monto: p.monto,
      fechaPago: fecha,
      ...(p.tipoMetodoPago !== "EFECTIVO" &&
        p.codigoBancoDestino && {
          codigoBancoDestino: p.codigoBancoDestino,
        }),
      // Bugfix post-implementación #3 (feature "bancos", R24): sin este
      // campo tesoreria-ms nunca crea el MovimientoBancario.
      ...(p.tipoMetodoPago !== "EFECTIVO" &&
        p.codigoCuentaBancaria && {
          codigoCuentaBancaria: p.codigoCuentaBancaria,
        }),
      ...(p.datosTarjeta && {
        datosTarjeta: {
          tipoTarjeta:
            p.tipoMetodoPago === "TARJETA_CREDITO" ? "CREDITO" : "DEBITO",
          marca: p.datosTarjeta.marca || "",
          cantidadCuotas: Number(p.datosTarjeta.cantidadCuotas) || 1,
          recargo: parseFloat(p.datosTarjeta.recargo) || 0,
          cupon: p.datosTarjeta.cupon || "",
          lote: p.datosTarjeta.lote || "",
          autorizacion: p.datosTarjeta.autorizacion || "",
          fechaAcreditacion: p.datosTarjeta.fechaAcreditacion || "",
        },
      }),
      ...(p.chequeTercero && { chequeTercero: p.chequeTercero }),
      ...(p.chequePropio && { chequePropio: p.chequePropio }),
    }));

    crearComprobante(
      {
        dto: {
          tipoDescripcionComprobante: esIngreso ? "RECIBO" : "ORDEN_PAGO",
          tipoOperacion: esIngreso ? "INGRESO" : "EGRESO",
          fechaEmision: fecha,
          fechaVto: fecha,
          puntoVenta: 1,
          codigoReceptor: factura.codigoReceptor,
          entidadReceptor: factura.entidadReceptor,
          codigoTipoComprobante: esIngreso ? 992 : 993,
          condicionComprobante: "CONTADO",
          subtotal: totalPagado,
          iva: 0,
          total: totalPagado,
          detalle: [
            {
              tipoDetalle: "CUENTA_CONTABLE",
              codigoDetalle: 0,
              descripcion: `Pago Factura Nro ${factura.numeroComprobante ?? ""}`.trim(),
              cantidad: 1,
              precioUnitario: totalPagado,
              iva: 0,
              subtotal: totalPagado,
            },
          ],
          detallePagos,
          comprobantesAsociados: [
            {
              tipoDescripcionComprobante: "FACTURA",
              tipoRelacion: "APLICA_PAGO",
              numeroComprobante: factura.numeroComprobante,
              codigoTipoComprobante: factura.codigoTipoComprobante,
              codigoComprobante: factura.codigo,
              importeAplicado: totalPagado,
              codigoUnidadNegocio: factura.codigoUnidadNegocio,
            },
          ],
        },
        codigoUnidadNegocio: factura.codigoUnidadNegocio,
      },
      {
        onSuccess: () => {
          setPagos([]);
          setVueltos([]);
          onClose();
        },
      },
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-emerald-50">
          <div className="flex items-center gap-3">
            <HandCoins size={20} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-black text-gray-900 uppercase tracking-tight">
                {esIngreso ? "Cobrar Factura" : "Pagar Factura"}
              </p>
              <p className="text-[11px] font-bold text-gray-500 font-mono">
                {nroFmt} — ${(factura.total ?? 0).toLocaleString("es-AR")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-gray-500">
              Fecha de Pago
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full sm:w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <DetallePago
            totalComprobante={factura.total}
            tipoOperacion={esIngreso ? "INGRESO" : "EGRESO"}
            pagos={pagos}
            setPagos={setPagos}
            vueltos={vueltos}
            setVueltos={setVueltos}
            // Sin `condicionComprobante`: sin restricción de métodos, igual
            // que Recibos.jsx/OrdenPago.jsx (R14).
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-black uppercase tracking-wider rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            >
              Ahora no
            </button>
            <button
              type="button"
              onClick={handleConfirmar}
              disabled={isPending || pagos.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1FAE6D] hover:bg-[#178F58] text-white text-xs font-bold uppercase tracking-wider rounded-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Save size={16} />
              {isPending
                ? "Guardando..."
                : `Confirmar ${esIngreso ? "Cobro" : "Pago"}`}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ModalPagoRapido;
