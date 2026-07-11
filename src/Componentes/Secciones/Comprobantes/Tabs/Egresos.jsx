import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import BuscadorDetalle from "../Componentes/BuscadorDetalle";
import CabeceraComprobante from "../Componentes/CabeceraComprobante";
import ModalExitoComprobante from "../Componentes/ModalExitoComprobante";
import ModalError from "../../../Modales/ModalError";
import { useCabeceraComprobante } from "../../../../Backend/Comprobantes/useCabeceraComprobante";
import { useDetalleComprobante } from "../../../../Backend/Comprobantes/useDetalleComprobante";
import { useGenerarComprobante } from "../../../../Backend/Ventas/queries/Comprobante/useGenerarComprobante.mutation";
import { obtenerComprobantePorCodigo } from "../../../../Backend/Ventas/api/Comprobante/comprobante.api";
import { obtenerCuentasPorCodigos } from "../../../../Backend/Contabilidad/api/cuentas.api";
import { requierePago } from "../utils/condicionMetodoPago.js";
import {
  mapearPagosPrecargaAsociado,
  obtenerCodigosBancoUnicos,
  construirMapaCuentasPorCodigo,
} from "../../../../Backend/Comprobantes/pagoComprobante.utils.js";

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
  const tipoOpFinal = esNota ? "ANULACION_EGRESO" : tipoOperacion;

  const receptor =
    cabecera.clienteSeleccionado?.enteFacturacion ||
    cabecera.clienteSeleccionado;

  const detalle = items.map((item) => ({
    tipoDetalle: item.tipoDetalle,
    codigoDetalle:
      item.tipoDetalle === "CUENTA_CONTABLE"
        ? item.codigoSecuencial || item.codigo || 0
        : item.codigo,
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
    devolverAStock: item.devolverAStock === true,
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
    ...(p.endosoChequeTercero && {
      endosoChequeTercero: p.endosoChequeTercero,
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
            codigoComprobante: cabecera.comprobanteAsociado.codigo,
            tipoDescripcionComprobante:
              cabecera.comprobanteAsociado.tipoDescripcionComprobante,
            tipoRelacion: tipoDescripcion,
            numeroComprobante: cabecera.comprobanteAsociado.numeroComprobante,
            codigoTipoComprobante:
              cabecera.comprobanteAsociado.codigoTipoComprobante,
            importeAplicado:
              cabecera.importeAplicadoManual ??
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
    codigoReceptor: receptor?.codigo,
    entidadReceptor: receptor?.tipoEntidad || "PROV",
    codigoTipoComprobante: codigoTipo,
    condicionComprobante: cabecera.condicionComprobante,
    ...(cabecera.numeroComprobanteEgreso && {
      numeroComprobante: Number(cabecera.numeroComprobanteEgreso),
    }),
    ...(cabecera.cae && { cae: cabecera.cae }),
    ...(cabecera.vtoCae && { vtoCae: cabecera.vtoCae }),
    ...(cabecera.observaciones && { observaciones: cabecera.observaciones }),
    subtotal: Number(subtotalSinIva.toFixed(2)),
    iva: Number(totalIva.toFixed(2)),
    otrosTributos: Number((otrosTributos ?? 0).toFixed(2)),
    total: Number(
      (subtotalSinIva + totalIva + (otrosTributos || 0)).toFixed(2),
    ),
    detalle,
    ...(detallePagos.length > 0 && {
      detallePagos: detallePagos.map((dp) => {
        if (dp.endosoChequeTercero) {
          const { _chequeOriginal, ...endosoLimpio } = dp.endosoChequeTercero;
          return { ...dp, endosoChequeTercero: endosoLimpio };
        }
        return dp;
      }),
    }),
    ...(vueltosPayload.length > 0 && { vueltos: vueltosPayload }),
    ...(comprobantesAsociados && { comprobantesAsociados }),
  };
};

const Egresos = ({ tipoOperacion, arcaData = null }) => {
  const cabecera = useCabeceraComprobante({
    esFiscal: arcaData ? true : undefined,
    codigoTipo: arcaData?.codigoTipo,
    puntoVenta: arcaData?.puntoVenta,
    numeroComprobante: arcaData?.numeroComprobante,
    cae: arcaData?.cae,
    vtoCae: arcaData?.vtoCae,
    fecha: arcaData?.fecha,
    otrosTributos: arcaData?.otrosTributos ?? 0,
  });
  const detalle = useDetalleComprobante(tipoOperacion);
  const [pagos, setPagos] = useState([]);
  const [vueltos, setVueltos] = useState([]);
  const [comprobanteExito, setComprobanteExito] = useState(null);
  const [errorModalMsg, setErrorModalMsg] = useState("");

  const { mutate: crearComprobante, isPending } = useGenerarComprobante();

  // Cuando se selecciona un comprobante para asociar, cargar todos sus datos
  useEffect(() => {
    const comp = cabecera.comprobanteAsociado;
    if (!comp) return;

    (async () => {
      const full = await obtenerComprobantePorCodigo(comp.codigo);
      if (!full) return;

      // Cargar items del detalle
      if (full.detalles?.length) {
        detalle.setItems(
          full.detalles.map((d) => ({
            codigo: d.codigoDetalle,
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
          codigo: full.codigoReceptor,
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
      // Bugfix: precargar las observaciones del comprobante original (p. ej.
      // "CUOTA-{codigo}-{anio}-{mes}" cuando se cobró una cuota escolar,
      // ver ModalSeleccionarCobro.jsx) para que el backend
      // (VentaNotaCreditoStrategy) pueda marcar el asiento de la NC con la
      // misma referencia y origenModulo "ESCUELA" que el cobro original.
      if (full.observaciones) {
        cabecera.setObservaciones(full.observaciones);
      }

      // Cargar el detalle de pago del comprobante asociado (mismo criterio
      // que el detalle de ítems de arriba). El nombre de banco no viene
      // persistido junto al pago (solo el código numérico de cuenta), se
      // resuelve con el mismo endpoint batch que ya usa Caja Diaria.
      if (full.pagos?.length) {
        const codigosBanco = obtenerCodigosBancoUnicos(full.pagos);
        let mapaCuentas = new Map();
        if (codigosBanco.length) {
          try {
            const cuentas = await obtenerCuentasPorCodigos(codigosBanco);
            mapaCuentas = construirMapaCuentasPorCodigo(cuentas);
          } catch (e) {
            console.error(
              "Error resolviendo nombres de banco para la precarga de pagos",
              e,
            );
          }
        }
        setPagos(mapearPagosPrecargaAsociado(full.pagos, mapaCuentas));
      }
    })();
  }, [cabecera.comprobanteAsociado]);

  const codigoTipo = Number(cabecera.tipoComprobante);
  const itemsGravadoSinIva = detalle.items.filter(
    (i) =>
      (!i.tipoFiscal || i.tipoFiscal === "GRAVADO") && (i.tasaIva || 0) === 0,
  );
  const requiereIva = codigoTipo === 1 && itemsGravadoSinIva.length > 0;

  const handleGuardar = () => {
    const condicion = cabecera.condicionComprobante || "CONTADO";

    if (condicion === "CUENTA_CORRIENTE" && !cabecera.clienteSeleccionado) {
      setErrorModalMsg(
        "Debe seleccionar un contacto si la condición del comprobante es Cuenta Corriente.",
      );
      return;
    }

    if (requierePago(condicion) && pagos.length === 0) {
      setErrorModalMsg(
        "Esta condición de comprobante requiere al menos un método de pago.",
      );
      return;
    }

    if (requiereIva) {
      setErrorModalMsg(
        `Factura A requiere IVA en todos los ítems gravados.\nCompletá la alícuota en: ${itemsGravadoSinIva.map((i) => i.nombre).join(", ")}`,
      );
      return;
    }

    const tipoDescripcion = TIPO_DESCRIPCION_MAP[codigoTipo] || "FACTURA";
    if (tipoDescripcion === "NOTA_CREDITO" && cabecera.comprobanteAsociado) {
      const maximo =
        cabecera.comprobanteAsociado.saldoPendiente ??
        cabecera.comprobanteAsociado.total;
      const importe = cabecera.importeAplicadoManual ?? maximo;
      if (importe <= 0 || importe > maximo) {
        setErrorModalMsg(
          `El importe a aplicar debe ser mayor a 0 y no puede superar el saldo pendiente ($${maximo}).`,
        );
        return;
      }
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
          if (payload.tipoDescripcionComprobante === "ORDEN_PAGO") {
            setComprobanteExito({
              codigo: data?.comprobante?.codigo,
              codigoReceptor:
                data?.comprobante?.codigoReceptor ?? payload.codigoReceptor,
              tipoDescripcion: "ORDEN_PAGO",
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

  return (
    <div className="h-full w-full">
      <CabeceraComprobante
        tipoOperacion={tipoOperacion}
        cabecera={cabecera}
        arcaData={arcaData}
      />
      <BuscadorDetalle
        tipoOperacion={tipoOperacion}
        detalle={detalle}
        pagos={pagos}
        setPagos={setPagos}
        vueltos={vueltos}
        setVueltos={setVueltos}
        codigoTipoComprobante={cabecera.tipoComprobante}
        montoPreCargado={
          arcaData?.montosSugeridos?.length > 0
            ? null
            : (arcaData?.total ?? null)
        }
        montosSugeridos={arcaData?.montosSugeridos ?? []}
        otrosTributos={cabecera.otrosTributos}
        setOtrosTributos={cabecera.setOtrosTributos}
        condicionComprobante={cabecera.condicionComprobante}
      />

      {/* BOTON GUARDAR */}
      <div className="flex justify-end px-4 pb-4 pt-2">
        <button
          type="button"
          onClick={handleGuardar}
          disabled={isPending || detalle.items.length === 0 || requiereIva}
          className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-brand-primary)] text-white text-[13px] font-bold uppercase tracking-wider rounded-[8px] hover:brightness-110 transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Save size={16} />
          {isPending ? "Guardando..." : "Guardar Comprobante"}
        </button>
      </div>

      {comprobanteExito && (
        <ModalExitoComprobante
          comprobante={comprobanteExito}
          onClose={() => setComprobanteExito(null)}
        />
      )}
      <ModalError
        isOpen={!!errorModalMsg}
        onClose={() => setErrorModalMsg("")}
        titulo="Error de validación"
        mensaje={errorModalMsg}
      />
    </div>
  );
};

export default Egresos;
