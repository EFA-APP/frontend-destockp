import { useState, useEffect, useRef } from "react";
import { Save, FileText, Printer } from "lucide-react";
import { useLocation } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import BuscadorDetalle from "../Componentes/BuscadorDetalle";
import CabeceraComprobante from "../Componentes/CabeceraComprobante";
import ModalExitoComprobante from "../Componentes/ModalExitoComprobante";
import ModalReintentarComprobante from "../Componentes/ModalReintentarComprobante";
import ModalError from "../../../Modales/ModalError";
import ModalConfirmacion from "../../../UI/ModalConfirmacion/ModalConfirmacion";
import ModalPagoRapido from "../Componentes/ModalPagoRapido";
import ModalSugerirSaldoAFavor from "../Componentes/ModalSugerirSaldoAFavor";
import ComprobantePDF from "../../../Tablas/Ventas/Comprobantes/ComprobantePDF";
import { useCabeceraComprobante } from "../../../../Backend/Comprobantes/useCabeceraComprobante";
import { useDetalleComprobante } from "../../../../Backend/Comprobantes/useDetalleComprobante";
import { useGenerarComprobante } from "../../../../Backend/Ventas/queries/Comprobante/useGenerarComprobante.mutation";
import { obtenerComprobantePorCodigo } from "../../../../Backend/Ventas/api/Comprobante/comprobante.api";
import { obtenerCuentasPorCodigos } from "../../../../Backend/Contabilidad/api/cuentas.api";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
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
  const tipoOpFinal = esNota ? "ANULACION_INGRESO" : tipoOperacion;

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
    // Bugfix post-implementación #3 (feature "bancos", R24): sin este
    // campo tesoreria-ms nunca crea el MovimientoBancario, aunque el
    // usuario haya elegido una CuentaBancaria real en DetallePago.jsx.
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
    ...(p.chequeTercero && {
      chequeTercero: {
        numero: p.chequeTercero.numero || "",
        banco: p.chequeTercero.banco || "",
        // Ronda 7: código BCRA real del banco (catálogo tesoreria-ms),
        // capturado por el selector de ModalCheque en DetallePago.jsx.
        codigoBancoBcra: p.chequeTercero.codigoBancoBcra || undefined,
        cuitEmisor: p.chequeTercero.cuitEmisor || "",
        titular: p.chequeTercero.titular || "",
        fechaEmision: p.chequeTercero.fechaEmision || "",
        fechaPago: p.chequeTercero.fechaPago || "",
        importe: p.monto,
        // `estado` (Ronda 7): eliminado. Era un campo vestigial que
        // ningún lado del backend usaba (tesoreria-ms siempre fuerza
        // EN_CARTERA en el alta, R10) — ver progress/impl_cheques-terceros-tesoreria.md.
      },
    }),
    ...(p.chequePropio && { chequePropio: p.chequePropio }),
  }));

  const vueltosPayload = vueltos.map((v) => ({
    fechaEntregado: cabecera.fechaInicio,
    tipoMetodoPago: v.tipoMetodoPago,
    monto: v.monto,
    ...(v.codigoBancoDestino && { codigoBancoDestino: v.codigoBancoDestino }),
    // Bugfix post-implementación #3 (feature "bancos", R24).
    ...(v.codigoCuentaBancaria && { codigoCuentaBancaria: v.codigoCuentaBancaria }),
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
              Number((subtotalSinIva + totalIva + (otrosTributos || 0)).toFixed(2)),
            codigoUnidadNegocio: Number(cabecera.unidadNegocioSeleccionada),
            // Comprobante cargado manualmente (no existe en la base, ver
            // SelectorComprobanteModal.jsx): se manda `manual: true` y
            // `puntoVenta` directo, porque el backend no tiene ningún
            // comprobante real del cual resolverlo. Ver
            // progress/impl_comprobante-asociado-manual.md.
            ...(cabecera.comprobanteAsociado.manual && {
              manual: true,
              puntoVenta: cabecera.comprobanteAsociado.puntoVenta,
            }),
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
    entidadReceptor: receptor?.tipoEntidad || "CLIE",
    codigoTipoComprobante: codigoTipo,
    // Feature 7 (comprobante-pago-desacoplado, R6, R7): puertas adentro,
    // una FACTURA CONTADO se persiste/contabiliza siempre como
    // CUENTA_CORRIENTE (el pago llega después vía Recibo rápido) — ver
    // design.md §1 sobre por qué esto no rompe el asiento contable. El
    // resto de las condiciones (y el resto de los tipos) viajan sin cambios.
    condicionComprobante:
      tipoDescripcion === "FACTURA" && cabecera.condicionComprobante === "CONTADO"
        ? "CUENTA_CORRIENTE"
        : cabecera.condicionComprobante,
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
  // Feature 30 (comprobante-reintentar-tesoreria-contabilidad), R34: el
  // comprobante SÍ se generó pero falló tesorería o contabilidad — abre
  // ModalReintentarComprobante en vez del toast genérico (ver R32, hook).
  const [comprobanteConError, setComprobanteConError] = useState(null);
  const [confirmacionStock, setConfirmacionStock] = useState(null);
  const [highlightStock, setHighlightStock] = useState(0);
  const [generandoPDF, setGenerandoPDF] = useState(false);
  const [errorModalMsg, setErrorModalMsg] = useState("");
  // Feature 7 (comprobante-pago-desacoplado, R8, R10, R12): factura
  // FACTURA/CONTADO recién guardada, pendiente de cobro rápido vía
  // <ModalPagoRapido/>. `null` = modal cerrado.
  const [facturaParaPagoRapido, setFacturaParaPagoRapido] = useState(null);
  const [facturaParaSugerirSaldo, setFacturaParaSugerirSaldo] = useState(null);

  const { mutate: crearComprobante, isPending } = useGenerarComprobante();

  // Precarga desde "Cobrar" de /panel/escuela/cuotas (ModalSeleccionarCobro.jsx):
  // navega con location.state = { origen: "ESCUELA_CUOTAS", cliente, itemsCobro,
  // observaciones }. Se consume una sola vez (guard con ref) para no duplicar
  // ítems del carrito si el componente vuelve a renderizar.
  const precargaEscuelaCuotasAplicada = useRef(false);
  useEffect(() => {
    if (precargaEscuelaCuotasAplicada.current) return;
    if (location.state?.origen !== "ESCUELA_CUOTAS") return;
    precargaEscuelaCuotasAplicada.current = true;

    if (location.state.cliente) {
      cabecera.setClienteSeleccionado(location.state.cliente);
    }
    if (location.state.itemsCobro?.length) {
      detalle.setItems(location.state.itemsCobro);
    }
    if (location.state.observaciones) {
      cabecera.setObservaciones(location.state.observaciones);
    }
  }, [location.state]);

  // Cuando se selecciona un comprobante para asociar, cargar todos sus datos.
  // Si el comprobante fue cargado MANUALMENTE (no existe en la base, ver
  // SelectorComprobanteModal.jsx / progress/impl_comprobante-asociado-manual.md)
  // no hay `codigo` real que buscar — llamar a este endpoint fallaría.
  useEffect(() => {
    const comp = cabecera.comprobanteAsociado;
    if (!comp || comp.manual === true) return;

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
  // Feature 7 (comprobante-pago-desacoplado, R1, R2): FACTURA desacopla el
  // pago del guardado — mismo `TIPO_DESCRIPCION_MAP` que `construirPayload`.
  const tipoDescripcionActual = TIPO_DESCRIPCION_MAP[codigoTipo] || "FACTURA";
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

    // Feature 7 (comprobante-pago-desacoplado, R2): FACTURA desacopla el
    // pago del guardado (se registra después vía Recibo rápido, R10) — este
    // gate ya no aplica para ese tipo, sin importar la condición elegida
    // (R3 sigue exigiendo pago para NOTA_CREDITO/NOTA_DEBITO).
    if (
      tipoDescripcionActual !== "FACTURA" &&
      requierePago(condicion) &&
      pagos.length === 0
    ) {
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
      // Feature 7 (comprobante-pago-desacoplado, R23): un comprobante
      // ABONADO (pagado vía Recibo/Orden de Pago) tiene `saldoPendiente: 0`
      // por diseño — eso NO significa que no se le pueda emitir una Nota de
      // Crédito, así que el máximo permitido pasa a ser el `total` en ese
      // caso (en vez de `saldoPendiente ?? total`, que bloqueaba siempre).
      const maximo =
        cabecera.comprobanteAsociado.estado === "ABONADO"
          ? cabecera.comprobanteAsociado.total
          : (cabecera.comprobanteAsociado.saldoPendiente ??
            cabecera.comprobanteAsociado.total);
      const importe = Number((detalle.subtotalSinIva + detalle.totalIva + (cabecera.otrosTributos || 0)).toFixed(2));
      if (importe <= 0 || importe > maximo) {
        setErrorModalMsg(
          `El total de la Nota de Crédito ($${importe}) debe ser mayor a 0 y no puede superar el saldo pendiente del comprobante asociado ($${maximo}).`,
        );
        return;
      }
    }

    if (tipoDescripcion === "NOTA_CREDITO") {
      const tieneProductos = detalle.items.some((i) => i.tipoDetalle !== "CUENTA_CONTABLE");
      
      if (tieneProductos) {
        const algunaDevolucion = detalle.items.some((i) => i.devolverAStock);
        setConfirmacionStock({
          tipo: algunaDevolucion ? "DEVOLVER" : "NO_DEVOLVER"
        });
        return;
      }
    }

    ejecutarGuardado();
  };

  const ejecutarGuardado = () => {
    setConfirmacionStock(null);

    // Feature 7 (comprobante-pago-desacoplado, R8): condición ORIGINALMENTE
    // elegida por el usuario, leída ANTES del remapeo de `construirPayload`
    // (R6) y del reset de `cabecera` en `onSuccess` — determina si
    // corresponde abrir el modal de Recibo rápido (R10/R12).
    const condicionOriginal = cabecera.condicionComprobante || "CONTADO";

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
          // Feature 7 (comprobante-pago-desacoplado, R10, R12): una FACTURA
          // guardada con CONTADO originalmente elegido dispara el modal de
          // Recibo rápido EN VEZ DEL flujo de éxito existente (Ver PDF/
          // Imprimir/Enviar) — el cobro es la acción inmediata prioritaria.
          // Con CUENTA_CORRIENTE/CREDITO_X_DIAS (R12) no se abre nada nuevo,
          // se preserva el comportamiento actual.
          if (tipo === "FACTURA" && condicionOriginal === "CONTADO") {
            setFacturaParaPagoRapido({
              ...data?.comprobante,
              tipoOperacion,
            });
          } else if (tipo === "FACTURA" && condicionOriginal === "CUENTA_CORRIENTE") {
            setFacturaParaSugerirSaldo({
              ...data?.comprobante,
              tipoOperacion,
            });
          } else if (tipo === "FACTURA" || tipo === "RECIBO") {
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
        // Feature 30 (comprobante-reintentar-tesoreria-contabilidad), R34:
        // el comprobante YA quedó persistido (con esos datos) — el
        // formulario NO se limpia acá (a diferencia de onSuccess) porque el
        // usuario podría necesitar reintentar, y limpiar es cosmético.
        onError: (error) => {
          const data = error?.response?.data;
          if (
            data?.code === "MOVIMIENTO_FINANCIERO_FALLIDO" ||
            data?.code === "ASIENTO_CONTABLE_FALLIDO"
          ) {
            setComprobanteConError({
              codigo: data.codigoComprobante,
              numeroComprobante: data.numeroComprobante,
              puntoVenta: data.puntoVenta,
              tipoDescripcionComprobante: data.tipoDescripcionComprobante,
              pasoFallido:
                data.code === "MOVIMIENTO_FINANCIERO_FALLIDO"
                  ? "TESORERIA"
                  : "CONTABILIDAD",
              codigoReceptor: payload.codigoReceptor,
            });
          }
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
      <CabeceraComprobante 
        tipoOperacion={tipoOperacion} 
        cabecera={cabecera} 
        importeAplicarCalculado={Number((detalle.subtotalSinIva + detalle.totalIva + (cabecera.otrosTributos || 0)).toFixed(2))}
      />
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
        highlightStock={highlightStock}
        condicionComprobante={cabecera.condicionComprobante}
        ocultarDetallePago={tipoDescripcionActual === "FACTURA"}
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
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1FAE6D] hover:bg-[#178F58] text-white text-xs font-bold uppercase tracking-wider rounded-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Save size={16} />
            {isPending ? "Guardando..." : "Guardar Comprobante"}
          </button>
        )}
      </div>

      {isPending && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center transition-all">
          <div className="bg-white p-6 rounded-[16px] shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-sm font-black text-slate-800 uppercase tracking-wider">Generando Comprobante</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-1">Aguarde un momento por favor...</p>
            </div>
          </div>
        </div>
      )}

      {comprobanteExito && (
        <ModalExitoComprobante
          comprobante={comprobanteExito}
          onClose={() => setComprobanteExito(null)}
        />
      )}
      <ModalPagoRapido
        factura={facturaParaPagoRapido}
        onClose={() => setFacturaParaPagoRapido(null)}
      />
      <ModalSugerirSaldoAFavor
        factura={facturaParaSugerirSaldo}
        onClose={() => {
          // Al cerrar, continuamos con el modal de éxito de comprobante
          const cbte = facturaParaSugerirSaldo;
          setFacturaParaSugerirSaldo(null);
          setComprobanteExito({
            codigo: cbte?.codigo,
            codigoReceptor: cbte?.codigoReceptor,
            tipoDescripcion: cbte?.tipoDescripcionComprobante || "FACTURA",
            puntoVenta: cbte?.puntoVenta || 1,
            numeroComprobante: cbte?.numeroComprobante,
          });
        }}
      />
      {comprobanteConError && (
        <ModalReintentarComprobante
          codigo={comprobanteConError.codigo}
          numeroComprobante={comprobanteConError.numeroComprobante}
          puntoVenta={comprobanteConError.puntoVenta}
          tipoDescripcionComprobante={comprobanteConError.tipoDescripcionComprobante}
          codigoReceptor={comprobanteConError.codigoReceptor}
          pasoFallido={comprobanteConError.pasoFallido}
          onClose={() => setComprobanteConError(null)}
        />
      )}
      <ModalError
        isOpen={!!errorModalMsg}
        onClose={() => setErrorModalMsg("")}
        titulo="Error de validación"
        mensaje={errorModalMsg}
      />
      
      <ModalConfirmacion
        open={!!confirmacionStock}
        titulo={confirmacionStock?.tipo === "DEVOLVER" ? "¿Quieres devolver stock?" : "¿Estás seguro de no devolver stock?"}
        mensaje={confirmacionStock?.tipo === "DEVOLVER" ? "Has indicado que algunos ítems deben devolver stock." : "Ningún ítem está marcado para devolver stock."}
        textoConfirmar="Sí, guardar comprobante"
        textoCancelar="No, revisar"
        colorConfirmar={confirmacionStock?.tipo === "DEVOLVER" ? "primary" : "amber"}
        onConfirm={ejecutarGuardado}
        onClose={() => {
          setConfirmacionStock(null);
          setHighlightStock(Date.now());
        }}
      />
    </div>
  );
};

export default Ingresos;
