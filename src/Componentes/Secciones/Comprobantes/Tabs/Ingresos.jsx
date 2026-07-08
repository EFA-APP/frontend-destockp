import { useState, useEffect } from "react";
import { Save, FileText, Printer } from "lucide-react";
import { useLocation } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import BuscadorDetalle from "../Componentes/BuscadorDetalle";
import CabeceraComprobante from "../Componentes/CabeceraComprobante";
import ModalExitoComprobante from "../Componentes/ModalExitoComprobante";
import ComprobantePDF from "../../../Tablas/Ventas/Comprobantes/ComprobantePDF";
import { useCabeceraComprobante } from "../../../../Backend/Comprobantes/useCabeceraComprobante";
import { useDetalleComprobante } from "../../../../Backend/Comprobantes/useDetalleComprobante";
import { useGenerarComprobante } from "../../../../Backend/Ventas/queries/Comprobante/useGenerarComprobante.mutation";
import { obtenerComprobantePorCodigo } from "../../../../Backend/Ventas/api/Comprobante/comprobante.api";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { requierePago } from "../utils/condicionMetodoPago.js";

const TIPO_DESCRIPCION_MAP = {
  1: "FACTURA",
  2: "NOTA_DEBITO",
  3: "NOTA_CREDITO",
  6: "FACTURA",
  7: "NOTA_DEBITO",
  8: "NOTA_CREDITO",
  11: "FACTURA",
  12: "NOTA_DEBITO",
  13: "NOTA_CREDITO",
  991: "FACTURA",
  992: "RECIBO",
  993: "ORDEN_PAGO",
  994: "NOTA_CREDITO",
  995: "NOTA_DEBITO",
};

const construirPayload = ({
  cabecera,
  items,
  subtotalSinIva,
  totalIva,
  totalGeneral,
  otrosTributos,
  pagos,
  vueltos,
  tipoOperacion,
}) => {
  const codigoTipo = Number(cabecera.tipoComprobante);
  const tipoDescripcion = TIPO_DESCRIPCION_MAP[codigoTipo] || "FACTURA";
  const esNota =
    tipoDescripcion === "NOTA_CREDITO" || tipoDescripcion === "NOTA_DEBITO";
  const tipoOpFinal = esNota ? "ANULACION_INGRESO" : tipoOperacion;

  const receptor =
    cabecera.clienteSeleccionado?.enteFacturacion ||
    cabecera.clienteSeleccionado;

  const detalle = items.map((item) => ({
    tipoDetalle: item.tipoDetalle,
    codigoDetalle: item.codigoSecuencial,
    descripcion: [item.nombre, item.descripcion].filter(Boolean).join(" - "),
    ...(item.tipoDetalle !== "CUENTA_CONTABLE" &&
      item.codigoDeposito != null && {
        codigoDeposito: item.codigoDeposito,
      }),
    cantidad: item.cantidad,
    descuento: item.descuento || 0,
    precioUnitario: item.precioUnitario,
    iva: item.tasaIva || 0,
    tipoFiscal: item.tipoFiscal || "GRAVADO",
    subtotal: item.precioUnitario * item.cantidad - (item.descuento || 0),
  }));

  const detallePagos = pagos.map((p) => ({
    metodoPago: p.tipoMetodoPago,
    monto: p.monto,
    fechaPago: cabecera.fechaInicio,
    ...(p.tipoMetodoPago !== "EFECTIVO" &&
      p.codigoBancoDestino && {
        codigoBancoDestino: p.codigoBancoDestino,
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
    ...(p.chequeTercero && {
      chequeTercero: {
        numero: p.chequeTercero.numero || "",
        banco: p.chequeTercero.banco || "",
        cuitEmisor: p.chequeTercero.cuitEmisor || "",
        titular: p.chequeTercero.titular || "",
        fechaEmision: p.chequeTercero.fechaEmision || "",
        fechaPago: p.chequeTercero.fechaPago || "",
        importe: p.monto,
        estado: "RECIBIDO",
      },
    }),
    ...(p.chequePropio && { chequePropio: p.chequePropio }),
  }));

  const vueltosPayload = vueltos.map((v) => ({
    fechaEntregado: cabecera.fechaInicio,
    tipoMetodoPago: v.tipoMetodoPago,
    monto: v.monto,
    ...(v.codigoBancoDestino && { codigoBancoDestino: v.codigoBancoDestino }),
  }));

  const comprobantesAsociados =
    esNota && cabecera.comprobanteAsociado
      ? [
          {
            codigoComprobante: cabecera.comprobanteAsociado.codigoSecuencial,
            tipoDescripcionComprobante:
              cabecera.comprobanteAsociado.tipoDescripcionComprobante,
            tipoRelacion: tipoDescripcion,
            numeroComprobante: cabecera.comprobanteAsociado.numeroComprobante,
            codigoTipoComprobante:
              cabecera.comprobanteAsociado.codigoTipoComprobante,
            importeAplicado:
              cabecera.comprobanteAsociado.saldoPendiente ??
              cabecera.comprobanteAsociado.total,
            codigoUnidadNegocio: Number(cabecera.unidadNegocioSeleccionada),
          },
        ]
      : undefined;

  return {
    tipoDescripcionComprobante: tipoDescripcion,
    tipoOperacion: tipoOpFinal,
    fechaEmision: cabecera.fechaInicio,
    fechaVto: cabecera.fechaVencimiento,
    puntoVenta: Number(cabecera.puntoVenta) || 1,
    codigoReceptor: receptor?.codigoSecuencial,
    entidadReceptor: receptor?.tipoEntidad || "CLIE",
    codigoTipoComprobante: codigoTipo,
    condicionComprobante: cabecera.condicionComprobante,
    ...(cabecera.observaciones && { observaciones: cabecera.observaciones }),
    subtotal: subtotalSinIva,
    iva: totalIva,
    otrosTributos: otrosTributos ?? 0,
    total: Number(
      (subtotalSinIva + totalIva + (otrosTributos || 0)).toFixed(2),
    ),
    detalle,
    ...(detallePagos.length > 0 && { detallePagos }),
    ...(vueltosPayload.length > 0 && { vueltos: vueltosPayload }),
    ...(comprobantesAsociados && { comprobantesAsociados }),
  };
};

const LABEL_METODO = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA_DEBITO: "Tarjeta débito",
  TARJETA_CREDITO: "Tarjeta crédito",
  CHEQUE_TERCERO: "Cheque tercero",
  CHEQUE_PROPIO: "Cheque propio",
};

const Ingresos = ({ tipoOperacion }) => {
  const location = useLocation();
  const usuario = useAuthStore((s) => s.usuario);
  const cabecera = useCabeceraComprobante();
  const detalle = useDetalleComprobante(tipoOperacion);
  const [pagos, setPagos] = useState([]);
  const [vueltos, setVueltos] = useState([]);
  const [comprobanteExito, setComprobanteExito] = useState(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  const { mutate: crearComprobante, isPending } = useGenerarComprobante();



  // Cuando se selecciona un comprobante para asociar, cargar todos sus datos
  useEffect(() => {
    const comp = cabecera.comprobanteAsociado;
    if (!comp) return;

    obtenerComprobantePorCodigo(comp.codigo).then((full) => {
      if (!full) return;

      // Cargar items del detalle
      if (full.detalles?.length) {
        detalle.setItems(
          full.detalles.map((d) => ({
            codigoSecuencial: d.codigoDetalle,
            nombre: d.descripcion,
            tipoDetalle: d.tipoDetalle,
            cantidad: d.cantidad,
            precioUnitario: d.precioUnitario,
            descuento: d.descuento || 0,
            tasaIva: d.tasaIva || 0,
            codigoDeposito: d.codigoDeposito || 0,
          })),
        );
      }

      // Cargar contacto desde los datos del comprobante
      if (full.codigoReceptor) {
        cabecera.setClienteSeleccionado({
          codigoSecuencial: full.codigoReceptor,
          razonSocial: full.razonSocial,
          tipoEntidad: full.entidadReceptor,
          condicionIva: full.condicionIvaReceptor,
          documento: full.numeroDocumento,
        });
        cabecera.setBusquedaCliente(full.razonSocial || "");
      }

      // Cargar datos de cabecera
      if (full.condicionComprobante) {
        cabecera.setCondicionComprobante(full.condicionComprobante);
      }
      if (full.puntoVenta) {
        cabecera.setPuntoVenta(String(full.puntoVenta));
      }
      if (full.codigoUnidadNegocio) {
        cabecera.setUnidadNegocioSeleccionada(String(full.codigoUnidadNegocio));
      }
    });
  }, [cabecera.comprobanteAsociado]);

  const codigoTipo = Number(cabecera.tipoComprobante);
  const itemsGravadoSinIva = detalle.items.filter(
    (i) =>
      (!i.tipoFiscal || i.tipoFiscal === "GRAVADO") && (i.tasaIva || 0) === 0,
  );
  const requiereIva = codigoTipo === 1 && itemsGravadoSinIva.length > 0;

  const handleGuardar = () => {
    const condicion = cabecera.condicionComprobante || "CONTADO";
    if (requierePago(condicion) && pagos.length === 0) {
      alert(
        "⚠️ Esta condición de comprobante requiere al menos un método de pago.",
      );
      return;
    }

    if (requiereIva) {
      alert(
        `⚠️ Factura A requiere IVA en todos los ítems gravados.\n` +
          `Completá la alícuota en: ${itemsGravadoSinIva.map((i) => i.nombre).join(", ")}`,
      );
      return;
    }

    const payload = construirPayload({
      cabecera,
      items: detalle.items,
      subtotalSinIva: detalle.subtotalSinIva,
      totalIva: detalle.totalIva,
      totalGeneral: detalle.totalGeneral,
      otrosTributos: cabecera.otrosTributos,
      pagos,
      vueltos,
      tipoOperacion,
    });
    crearComprobante(
      {
        dto: payload,
        codigoUnidadNegocio: Number(cabecera.unidadNegocioSeleccionada),
      },
      {
        onSuccess: (data) => {
          const tipo = payload.tipoDescripcionComprobante;
          if (tipo === "FACTURA" || tipo === "RECIBO") {
            setComprobanteExito({
              codigo: data?.comprobante?.codigo,
              codigoReceptor:
                data?.comprobante?.codigoReceptor ?? payload.codigoReceptor,
              tipoDescripcion: tipo,
              puntoVenta: payload.puntoVenta,
              numeroComprobante: data?.comprobante?.numeroComprobante,
            });
          }

          // El formulario se limpia siempre que la mutación fue exitosa,
          // independientemente del tipo de comprobante generado.
          cabecera.reset();
          detalle.reset();
          setPagos([]);
          setVueltos([]);
        },
      },
    );
  };

  const handlePresupuesto = async (accion = "ver") => {
    const receptor =
      cabecera.clienteSeleccionado?.enteFacturacion ||
      cabecera.clienteSeleccionado;

    const totalRecargo = pagos.reduce((sum, p) => {
      const r = parseFloat(p.datosTarjeta?.recargo) || 0;
      if (r <= 0) return sum;
      return sum + p.monto - p.monto / (1 + r / 100);
    }, 0);

    const pagosDesc = pagos
      .map((p) => {
        const label = LABEL_METODO[p.tipoMetodoPago] || p.tipoMetodoPago;
        const cuotas =
          p.datosTarjeta?.cantidadCuotas > 1
            ? ` (${p.datosTarjeta.cantidadCuotas} cuotas)`
            : "";
        const recargoStr =
          p.datosTarjeta?.recargo > 0 ? ` +${p.datosTarjeta.recargo}%` : "";
        return `${label}${cuotas}${recargoStr}: $${p.monto.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
      })
      .join(" | ");

    const obsPartes = [
      cabecera.observaciones,
      pagosDesc ? `Forma de pago: ${pagosDesc}` : null,
    ].filter(Boolean);

    const comprobantePresupuesto = {
      tipoDocumento: 995,
      letraComprobante: "X",
      puntoVenta: Number(cabecera.puntoVenta) || 1,
      numeroComprobante: 0,
      fechaEmision: cabecera.fechaInicio || new Date().toISOString(),
      fechaVto: cabecera.fechaVencimiento,
      condicionVenta: cabecera.condicionComprobante || "CONTADO",
      fiscal: false,
      total: detalle.totalGeneral,
      subtotal: detalle.subtotalSinIva,
      iva: detalle.totalIva,
      recargo: totalRecargo > 0 ? totalRecargo : undefined,
      observaciones: obsPartes.length > 0 ? obsPartes.join(" | ") : undefined,
      receptor: {
        razonSocial: receptor?.razonSocial || "CONSUMIDOR FINAL",
        DocNro: receptor?.documento || receptor?.cuit || "",
        condicionIva: receptor?.condicionIva || "CF",
        domicilio: receptor?.domicilio || "",
      },
      detalles: detalle.items.map((item) => ({
        nombre: [item.nombre, item.descripcion].filter(Boolean).join(" - "),
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.precioUnitario * item.cantidad - (item.descuento || 0),
      })),
      cbtesAsoc: [],
      ajustes: [],
    };

    setGenerandoPDF(true);
    try {
      const blob = await pdf(
        <ComprobantePDF
          comprobante={comprobantePresupuesto}
          usuario={usuario}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      if (accion === "imprimir") win?.print();
    } catch (e) {
      console.error("Error generando presupuesto PDF", e);
    } finally {
      setGenerandoPDF(false);
    }
  };

  return (
    <div className="h-full w-full">
      <CabeceraComprobante tipoOperacion={tipoOperacion} cabecera={cabecera} />
      <BuscadorDetalle
        tipoOperacion={tipoOperacion}
        detalle={detalle}
        pagos={pagos}
        setPagos={setPagos}
        vueltos={vueltos}
        setVueltos={setVueltos}
        codigoTipoComprobante={cabecera.tipoComprobante}
        otrosTributos={cabecera.otrosTributos}
        setOtrosTributos={cabecera.setOtrosTributos}
        condicionComprobante={cabecera.condicionComprobante}
      />

      {/* BOTON GUARDAR / PRESUPUESTO */}
      <div className="flex justify-end px-4 pb-4 pt-2 gap-2">
        {cabecera.esPresupuesto ? (
          <>
            <button
              type="button"
              onClick={() => handlePresupuesto("ver")}
              disabled={generandoPDF || detalle.items.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white text-[13px] font-bold uppercase tracking-wider rounded-[8px] hover:bg-amber-600 transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <FileText size={16} />
              {generandoPDF ? "Generando..." : "Ver Presupuesto"}
            </button>
            <button
              type="button"
              onClick={() => handlePresupuesto("imprimir")}
              disabled={generandoPDF || detalle.items.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 bg-white border border-amber-400 text-amber-700 text-[13px] font-bold uppercase tracking-wider rounded-[8px] hover:bg-amber-50 transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Printer size={16} />
              Imprimir
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleGuardar}
            disabled={isPending || detalle.items.length === 0 || requiereIva}
            className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-brand-primary)] text-white text-[13px] font-bold uppercase tracking-wider rounded-[8px] hover:brightness-110 transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Save size={16} />
            {isPending ? "Guardando..." : "Guardar Comprobante"}
          </button>
        )}
      </div>

      {comprobanteExito && (
        <ModalExitoComprobante
          comprobante={comprobanteExito}
          onClose={() => setComprobanteExito(null)}
        />
      )}
    </div>
  );
};

export default Ingresos;
