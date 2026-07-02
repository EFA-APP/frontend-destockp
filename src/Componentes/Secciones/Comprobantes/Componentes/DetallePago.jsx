import { useState, useEffect, useRef } from "react";
import {
  Banknote,
  ArrowLeftRight,
  CreditCard,
  FileText,
  FileCheck,
  Plus,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  X,
} from "lucide-react";
import {
  formatPrice,
  formatNumber,
  parseCurrency,
} from "../../../../utils/formatters";
import { BorrarIcono } from "../../../../assets/Icons";
import { useObtenerCuentasImputablesQuery } from "../../../../Backend/Contabilidad/queries/useCuentas.query";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { obtenerMetodosPermitidos } from "../utils/condicionMetodoPago.js";

const METODOS = [
  {
    value: "EFECTIVO",
    label: "EFECTIVO",
    Icon: Banknote,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    value: "TRANSFERENCIA",
    label: "Transferencia",
    Icon: ArrowLeftRight,
    color: "text-sky-600 bg-sky-50",
  },
  {
    value: "TARJETA_DEBITO",
    label: "Tarjeta débito",
    Icon: CreditCard,
    color: "text-violet-600 bg-violet-50",
  },
  {
    value: "TARJETA_CREDITO",
    label: "Tarjeta Crédito",
    Icon: CreditCard,
    color: "text-orange-600 bg-orange-50",
  },
  {
    value: "CHEQUE_TERCERO",
    label: "Cheque tercero",
    Icon: FileText,
    color: "text-amber-600 bg-amber-50",
  },
  {
    value: "CHEQUE_PROPIO",
    label: "Cheque propio",
    Icon: FileCheck,
    color: "text-rose-600 bg-rose-50",
  },
];

const METODOS_VUELTO = [
  { value: "EFECTIVO", label: "Efectivo", Icon: Banknote },
  { value: "TRANSFERENCIA", label: "Transferencia", Icon: ArrowLeftRight },
];

const MARCAS_TARJETA = {
  TARJETA_CREDITO: [
    "Visa",
    "Mastercard",
    "American Express",
    "Naranja",
    "Naranja X",
    "Cabal",
    "Diners Club",
    "Tarjeta Shopping",
    "Tuya",
    "Nativa (Banco Nación)",
    "Nevada",
    "Patagonia 365",
    "Otra",
  ],
  TARJETA_DEBITO: [
    "Visa Débito",
    "Mastercard Débito",
    "Maestro",
    "Cabal Débito",
    "Naranja X",
    "Otra",
  ],
};

const datosTarjetaInit = {
  marca: "",
  cantidadCuotas: 1,
  recargo: 0,
  cupon: "",
  lote: "",
};
const chequeTerceroInit = {
  banco: "",
  numero: "",
  cuitEmisor: "",
  titular: "",
  fechaEmision: "",
  fechaPago: "",
};
const chequesPropioInit = {
  tipoCheque: "CORRIENTE",
  banco: "",
  sucursal: "",
  numero: "",
  cuenta: "",
  fechaEmision: "",
  fechaPago: "",
};

const FieldLabel = ({ children }) => (
  <span className="text-md font-bold text-gray-400 uppercase tracking-widest leading-none mb-1 block">
    {children}
  </span>
);

const BancoAutocomplete = ({ value, onChange }) => {
  const { usuario } = useAuthStore();
  const codigoEmpresa = usuario?.codigoEmpresa;

  const [busqueda, setBusqueda] = useState("");
  const [busquedaDebounced, setBusquedaDebounced] = useState("");
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busqueda), 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: cuentas = [], isFetching } = useObtenerCuentasImputablesQuery(
    busquedaDebounced ? "ACTIVO" : null,
    busquedaDebounced || undefined,
    codigoEmpresa,
  );

  const seleccionar = (cuenta) => {
    onChange(cuenta);
    setBusqueda("");
    setBusquedaDebounced("");
    setAbierto(false);
  };

  return (
    <div ref={ref} className="flex-1 min-w-[180px] relative">
      <FieldLabel>Banco destino</FieldLabel>
      {value ? (
        <div className="flex items-center gap-1.5 px-2 py-1.5 border border-[var(--primary)]/30 bg-[var(--primary)]/5 rounded-md min-h-[30px]">
          <span className="flex-1 text-md font-bold text-gray-900 truncate leading-tight">
            {value.nombre}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-gray-400 hover:text-red-500 cursor-pointer shrink-0"
          >
            <X size={11} />
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setAbierto(true);
            }}
            onFocus={() => setAbierto(true)}
            placeholder="Escribí para buscar..."
            className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-md font-bold text-gray-900 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 placeholder:font-normal"
          />
          {abierto && busqueda && (
            <div className="absolute z-[200] left-0 right-0 mt-0.5 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {isFetching ? (
                <div className="px-3 py-2 text-md font-semibold text-gray-400 uppercase tracking-wider">
                  Buscando...
                </div>
              ) : cuentas.length === 0 ? (
                <div className="px-3 py-2 text-md font-semibold text-gray-400 uppercase tracking-wider">
                  Sin resultados
                </div>
              ) : (
                cuentas.map((c) => (
                  <button
                    key={c.codigoSecuencial}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      seleccionar(c);
                    }}
                    className="w-full text-left px-3 py-2 text-md hover:bg-[var(--primary)]/10 border-b border-gray-100 last:border-0 cursor-pointer"
                  >
                    <div className="font-bold text-gray-900">{c.nombre}</div>
                    <div className="text-md text-gray-400">{c.codigo}</div>
                  </button>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const InputField = ({ label, ...props }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <input
      {...props}
      className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-md font-bold text-gray-900 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
    />
  </div>
);

const badgeColor = (metodo) =>
  METODOS.find((m) => m.value === metodo)?.color || "text-gray-600 bg-gray-100";

const labelMetodo = (metodo) =>
  METODOS.find((m) => m.value === metodo)?.label || metodo;

const IconMetodo = ({ metodo, size = 14 }) => {
  const m = METODOS.find((x) => x.value === metodo);
  if (!m) return null;
  const { Icon } = m;
  return <Icon size={size} />;
};

// ── MODAL TARJETA DE CRÉDITO ──
const ModalTarjeta = ({
  onClose,
  onConfirm,
  tarjeta,
  setTarjeta,
  tipoPago,
}) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white border border-[var(--border-subtle)] rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white z-10 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Diseño visual de Tarjeta */}
        <div
          className={`p-6 pb-8 relative overflow-hidden bg-gradient-to-br ${
            tipoPago === "TARJETA_CREDITO"
              ? "from-orange-500 to-rose-600"
              : "from-violet-500 to-purple-700"
          }`}
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl" />

          <div className="flex justify-between items-start mb-8 relative z-10">
            <div className="w-12 h-8 bg-gradient-to-r from-amber-200 to-yellow-400 rounded-md opacity-90 shadow-sm" />
            <span className="text-white/90 font-black tracking-widest uppercase text-xs">
              {tipoPago === "TARJETA_CREDITO" ? "Crédito" : "Débito"}
            </span>
          </div>

          <div className="flex flex-col gap-1 relative z-10">
            <p className="text-white/60 text-[10px] uppercase font-black tracking-widest">
              Marca / Entidad
            </p>
            <p className="text-2xl font-black text-white tracking-widest uppercase drop-shadow-md">
              {tarjeta.marca || "SELECCIONAR..."}
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="p-6 flex flex-col gap-4 bg-gray-50/50">
          <div>
            <FieldLabel>Marca</FieldLabel>
            <select
              value={tarjeta.marca}
              onChange={(e) =>
                setTarjeta((p) => ({ ...p, marca: e.target.value }))
              }
              className="w-full h-[38px] px-3 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 bg-white focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 cursor-pointer shadow-sm transition-all"
            >
              <option value="">— Seleccioná —</option>
              {(MARCAS_TARJETA[tipoPago] ?? []).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Cuotas"
              type="number"
              min="1"
              value={tarjeta.cantidadCuotas}
              onChange={(e) =>
                setTarjeta((p) => ({ ...p, cantidadCuotas: e.target.value }))
              }
            />
            <InputField
              label="Recargo %"
              type="number"
              min="0"
              step="0.01"
              value={tarjeta.recargo}
              onChange={(e) =>
                setTarjeta((p) => ({ ...p, recargo: e.target.value }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Cupón"
              type="text"
              value={tarjeta.cupon}
              onChange={(e) =>
                setTarjeta((p) => ({ ...p, cupon: e.target.value }))
              }
            />
            <InputField
              label="Lote"
              type="text"
              value={tarjeta.lote}
              onChange={(e) =>
                setTarjeta((p) => ({ ...p, lote: e.target.value }))
              }
            />
          </div>

          <button
            onClick={onConfirm}
            className="w-full py-3 mt-2 rounded-lg bg-[var(--primary)] text-white text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all cursor-pointer shadow-md shadow-[var(--primary)]/20"
          >
            Confirmar Datos
          </button>
        </div>
      </div>
    </div>
  );
};

// ── MODAL CHEQUE ──
const ModalCheque = ({ onClose, onConfirm, cheque, setCheque, tipoPago }) => {
  const esPropio = tipoPago === "CHEQUE_PROPIO";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white border border-[var(--border-subtle)] rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-rose-500 z-10 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Diseño visual de Cheque */}
        <div className="p-6 pb-6 relative overflow-hidden bg-[#faf8f0] border-b border-gray-200">
          {/* Marcas de agua estilo cheque */}
          <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 11px)",
              }}
            />
          </div>

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <FileText className="text-amber-700" size={24} />
              <span className="text-amber-900 font-black tracking-widest uppercase text-sm">
                {esPropio ? "Cheque Propio" : "Cheque de Tercero"}
              </span>
            </div>
            <div className="text-right">
              <p className="text-amber-800/60 text-[10px] uppercase font-black tracking-widest mb-0.5">
                Nro. Cheque
              </p>
              <p className="text-lg font-mono font-bold text-amber-900 tracking-wider">
                {cheque.numero || "00000000"}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-end relative z-10">
            <div className="flex flex-col gap-1">
              <p className="text-amber-800/60 text-[10px] uppercase font-black tracking-widest">
                Banco / Entidad
              </p>
              <p className="text-xl font-black text-amber-900 uppercase drop-shadow-sm">
                {cheque.banco || "___________"}
              </p>
            </div>
            {cheque.fechaPago && (
              <div className="text-right">
                <p className="text-amber-800/60 text-[10px] uppercase font-black tracking-widest">
                  Fecha de Pago
                </p>
                <p className="text-sm font-bold text-amber-900">
                  {new Date(cheque.fechaPago).toLocaleDateString("es-AR", {
                    timeZone: "UTC",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Formulario */}
        <div className="p-6 flex flex-col gap-4 bg-white">
          {esPropio && (
            <div>
              <FieldLabel>Tipo de Cheque</FieldLabel>
              <select
                value={cheque.tipoCheque}
                onChange={(e) =>
                  setCheque((p) => ({ ...p, tipoCheque: e.target.value }))
                }
                className="w-full h-[38px] px-3 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 bg-white focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 cursor-pointer shadow-sm transition-all"
              >
                <option value="CORRIENTE">Corriente</option>
                <option value="DIFERIDO">Diferido (Pago diferido)</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Banco"
              type="text"
              value={cheque.banco}
              onChange={(e) =>
                setCheque((p) => ({ ...p, banco: e.target.value }))
              }
            />
            <InputField
              label="Nro. cheque"
              type="text"
              value={cheque.numero}
              onChange={(e) =>
                setCheque((p) => ({ ...p, numero: e.target.value }))
              }
            />
          </div>

          {!esPropio ? (
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="CUIT emisor"
                type="text"
                value={cheque.cuitEmisor}
                onChange={(e) =>
                  setCheque((p) => ({ ...p, cuitEmisor: e.target.value }))
                }
              />
              <InputField
                label="Titular"
                type="text"
                value={cheque.titular}
                onChange={(e) =>
                  setCheque((p) => ({ ...p, titular: e.target.value }))
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Sucursal"
                type="text"
                value={cheque.sucursal}
                onChange={(e) =>
                  setCheque((p) => ({ ...p, sucursal: e.target.value }))
                }
              />
              <InputField
                label="Cuenta"
                type="text"
                value={cheque.cuenta}
                onChange={(e) =>
                  setCheque((p) => ({ ...p, cuenta: e.target.value }))
                }
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Fecha emisión"
              type="date"
              value={cheque.fechaEmision}
              onChange={(e) =>
                setCheque((p) => ({ ...p, fechaEmision: e.target.value }))
              }
            />
            <InputField
              label="Fecha pago"
              type="date"
              value={cheque.fechaPago}
              onChange={(e) =>
                setCheque((p) => ({ ...p, fechaPago: e.target.value }))
              }
            />
          </div>

          <button
            onClick={onConfirm}
            className="w-full py-3 mt-2 rounded-lg bg-[var(--primary)] text-white text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all cursor-pointer shadow-md shadow-[var(--primary)]/20"
          >
            Confirmar Datos del Cheque
          </button>
        </div>
      </div>
    </div>
  );
};

export const DetallePago = ({
  totalComprobante = 0,
  tipoOperacion = "INGRESO",
  pagos = [],
  setPagos = () => {},
  vueltos = [],
  setVueltos = () => {},
  condicionComprobante = null,
}) => {
  // ── Restricción de método de pago según condición del comprobante ──
  // null = sin restricción (Recibos.jsx / OrdenPago.jsx no pasan la prop, R18)
  const metodosPermitidos = obtenerMetodosPermitidos(condicionComprobante);
  const sinMetodoDisponible =
    metodosPermitidos !== null && metodosPermitidos.length === 0;
  const metodosDisponibles =
    metodosPermitidos === null
      ? METODOS
      : METODOS.filter((m) => metodosPermitidos.includes(m.value));

  // ── Form nuevo pago ──
  const [tipoPago, setTipoPago] = useState("EFECTIVO");
  const [montoPago, setMontoPago] = useState("");
  const [montoPagoFocused, setMontoPagoFocused] = useState(false);
  const [referencia, setReferencia] = useState("");
  const [bancoSeleccionado, setBancoSeleccionado] = useState(null);
  const [tarjeta, setTarjeta] = useState(datosTarjetaInit);
  const [modalTarjetaAbierto, setModalTarjetaAbierto] = useState(false);
  const [modalChequeAbierto, setModalChequeAbierto] = useState(false);
  const [chequeTercero, setChequeTercero] = useState(chequeTerceroInit);
  const [chequePropio, setChequePropio] = useState(chequesPropioInit);

  // ── Vuelto ──
  const [tipoVuelto, setTipoVuelto] = useState("EFECTIVO");
  const [montoVuelto, setMontoVuelto] = useState("");
  const [montoVueltoFocused, setMontoVueltoFocused] = useState(false);
  const [bancoVueltoSeleccionado, setBancoVueltoSeleccionado] = useState(null);

  // ── Totales ──
  const totalPagado = pagos.reduce((s, p) => s + p.monto, 0);
  const totalVuelto = vueltos.reduce((s, v) => s + v.monto, 0);
  // Recargo acumulado de los pagos ya agregados (cada pago guarda su recargo % en datosTarjeta)
  const totalRecargo = pagos.reduce((sum, p) => {
    const r = parseFloat(p.datosTarjeta?.recargo) || 0;
    if (r <= 0) return sum;
    // monto ya incluye el recargo, por lo que base = monto / (1 + r/100)
    return sum + p.monto - p.monto / (1 + r / 100);
  }, 0);
  const totalConRecargo = totalComprobante + totalRecargo;
  const excedente = totalPagado - totalVuelto - totalConRecargo;
  const hayExcedente = tipoOperacion === "INGRESO" && excedente > 0.001;
  const estaCompleto = excedente >= -0.001;

  // Actualizar automáticamente el monto por defecto al cambiar la deuda pendiente
  useEffect(() => {
    if (montoPagoFocused) return;
    // Cuánto del comprobante base ya está cubierto (descontando el recargo de cada pago)
    const cubierto = pagos.reduce((sum, p) => {
      const r = parseFloat(p.datosTarjeta?.recargo) || 0;
      return sum + p.monto / (1 + r / 100);
    }, 0);
    const vueltoCubierto = vueltos.reduce((s, v) => s + v.monto, 0);
    const pendienteFactura = Math.max(
      0,
      totalComprobante - cubierto + vueltoCubierto,
    );

    const esTarjeta = ["TARJETA_DEBITO", "TARJETA_CREDITO"].includes(tipoPago);
    const recargo = esTarjeta ? parseFloat(tarjeta.recargo) || 0 : 0;
    const montoSugerido = pendienteFactura * (1 + recargo / 100);
    setMontoPago(
      montoSugerido > 0 ? montoSugerido.toFixed(2).replace(".", ",") : "",
    );
  }, [
    totalComprobante,
    pagos,
    vueltos,
    montoPagoFocused,
    tipoPago,
    tarjeta.recargo,
  ]);

  // Actualizar automáticamente el vuelto sugerido por defecto si hay excedente
  useEffect(() => {
    if (hayExcedente && !montoVueltoFocused) {
      setMontoVuelto(
        excedente > 0 ? excedente.toFixed(2).replace(".", ",") : "",
      );
    } else if (!hayExcedente) {
      setMontoVuelto("");
    }
  }, [hayExcedente, excedente, montoVueltoFocused]);

  // Reasignar tipoPago cuando la condición cambia y el método actual dejó de
  // estar permitido (R16)
  useEffect(() => {
    if (metodosPermitidos === null || metodosPermitidos.length === 0) return;
    if (!metodosPermitidos.includes(tipoPago)) {
      setTipoPago(metodosPermitidos[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condicionComprobante]);

  // Vaciar pagos/vueltos cuando la condición deja de admitir método de pago
  // (R17)
  useEffect(() => {
    if (!sinMetodoDisponible) return;
    if (pagos.length > 0) setPagos([]);
    if (vueltos.length > 0) setVueltos([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sinMetodoDisponible]);

  const resetForm = () => {
    // montoPago se actualizará automáticamente por el useEffect al cambiar pagos.length
    setReferencia("");
    setBancoSeleccionado(null);
    setTarjeta(datosTarjetaInit);
    setChequeTercero(chequeTerceroInit);
    setChequePropio(chequesPropioInit);
  };

  const handleAgregarPago = () => {
    const monto = parseCurrency(montoPago) || 0;
    if (monto <= 0) return;

    const pago = {
      id: Date.now(),
      tipoMetodoPago: tipoPago,
      monto,
      referencia,
      codigoBancoDestino: bancoSeleccionado?.codigoSecuencial || 0,
      nombreBanco: bancoSeleccionado?.nombre || "",
      ...(["TARJETA_DEBITO", "TARJETA_CREDITO"].includes(tipoPago) && {
        datosTarjeta: {
          ...tarjeta,
          cantidadCuotas: Number(tarjeta.cantidadCuotas),
          recargo: parseFloat(tarjeta.recargo) || 0,
        },
      }),
      ...(tipoPago === "CHEQUE_TERCERO" && {
        chequeTercero: { ...chequeTercero },
      }),
      ...(tipoPago === "CHEQUE_PROPIO" && {
        chequePropio: { ...chequePropio },
      }),
    };

    setPagos((prev) => [...prev, pago]);
    resetForm();
  };

  const handleAgregarVuelto = () => {
    const monto = parseCurrency(montoVuelto) || 0;
    if (monto <= 0) return;
    setVueltos((prev) => [
      ...prev,
      {
        id: Date.now(),
        tipoMetodoPago: tipoVuelto,
        monto,
        codigoBancoDestino: bancoVueltoSeleccionado?.codigoSecuencial || 0,
        nombreBanco: bancoVueltoSeleccionado?.nombre || "",
      },
    ]);
    setMontoVuelto("");
    setBancoVueltoSeleccionado(null);
  };

  const isTarjeta = ["TARJETA_DEBITO", "TARJETA_CREDITO"].includes(tipoPago);

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {/* ────────── HEADER ────────── */}
      <div className="flex items-center gap-2 pt-1">
        <Banknote size={16} className="text-[var(--primary)]" />
        <span className="text-md font-black uppercase tracking-wider text-gray-700">
          Forma de Pago
        </span>
      </div>

      {sinMetodoDisponible ? (
        /* ────────── SIN MÉTODO DE PAGO (R15) ────────── */
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-md font-semibold text-amber-700">
          Esta condición de comprobante no requiere método de pago.
        </div>
      ) : (
        <>
          {/* ────────── SELECTOR DE MÉTODO ────────── */}
          <div className="w-full">
            <select
              value={tipoPago}
              onChange={(e) => setTipoPago(e.target.value)}
              className="w-full px-2 py-3 border border-gray-200 uppercase rounded-md text-md font-bold text-gray-900 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 bg-white cursor-pointer"
            >
              {metodosDisponibles.map(({ value, label }) => (
                <option key={value} value={value} className="h-10 uppercase">
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* ────────── FORMULARIO CONTEXTUAL ────────── */}
          <div className="bg-gray-50 border border-gray-100 rounded-md p-4 flex flex-col gap-3">
            {/* Campos comunes: monto */}
            <div className="flex flex-wrap gap-3 items-end">
              <div className="w-28">
                <FieldLabel>Monto</FieldLabel>
                <input
                  type="text"
                  value={
                    montoPagoFocused
                      ? typeof montoPago === "string"
                        ? montoPago.replace(".", ",")
                        : montoPago
                      : montoPago
                        ? formatNumber(montoPago)
                        : ""
                  }
                  onFocus={() => setMontoPagoFocused(true)}
                  onBlur={() => setMontoPagoFocused(false)}
                  onChange={(e) => setMontoPago(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-md font-black text-gray-900 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
                />
              </div>

              {/* Banco destino: todos los métodos excepto EFECTIVO */}
              {tipoPago !== "EFECTIVO" && (
                <BancoAutocomplete
                  value={bancoSeleccionado}
                  onChange={setBancoSeleccionado}
                />
              )}

              {/* Referencia: solo TRANSFERENCIA */}
              {tipoPago === "TRANSFERENCIA" && (
                <div className="w-36">
                  <FieldLabel>Nro. referencia</FieldLabel>
                  <input
                    type="text"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    placeholder="Nro. transferencia"
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-md font-bold text-gray-900 focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleAgregarPago}
                disabled={!montoPago || parseCurrency(montoPago) <= 0}
                className="h-[30px] px-4 rounded-md bg-[var(--primary)] text-white text-md font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-[var(--primary)]/90 transition active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={13} strokeWidth={3} />
                Agregar
              </button>
            </div>

            {/* TARJETA */}
            {isTarjeta && (
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalTarjetaAbierto(true)}
                  className="flex-1 py-2.5 rounded-md bg-white border border-[var(--border-subtle)] text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <CreditCard
                    size={16}
                    className={
                      tipoPago === "TARJETA_CREDITO"
                        ? "text-orange-500"
                        : "text-violet-500"
                    }
                  />
                  {tarjeta.marca
                    ? `Tarjeta: ${tarjeta.marca} (${tarjeta.cantidadCuotas} cuotas)`
                    : "Completar Datos de Tarjeta"}
                </button>
                {tarjeta.recargo > 0 && (
                  <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded">
                    +{tarjeta.recargo}% Recargo
                  </span>
                )}
              </div>
            )}

            {modalTarjetaAbierto && (
              <ModalTarjeta
                onClose={() => setModalTarjetaAbierto(false)}
                onConfirm={() => setModalTarjetaAbierto(false)}
                tarjeta={tarjeta}
                setTarjeta={setTarjeta}
                tipoPago={tipoPago}
              />
            )}

            {/* CHEQUES (Tercero y Propio) */}
            {(tipoPago === "CHEQUE_TERCERO" || tipoPago === "CHEQUE_PROPIO") && (
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalChequeAbierto(true)}
                  className="flex-1 py-2.5 rounded-md bg-white border border-[var(--border-subtle)] text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <FileText
                    size={16}
                    className={
                      tipoPago === "CHEQUE_PROPIO"
                        ? "text-rose-500"
                        : "text-amber-500"
                    }
                  />
                  {(tipoPago === "CHEQUE_TERCERO" && chequeTercero.numero) ||
                  (tipoPago === "CHEQUE_PROPIO" && chequePropio.numero)
                    ? `Cheque: ${tipoPago === "CHEQUE_TERCERO" ? chequeTercero.banco : chequePropio.banco} #${tipoPago === "CHEQUE_TERCERO" ? chequeTercero.numero : chequePropio.numero}`
                    : "Completar Datos del Cheque"}
                </button>
              </div>
            )}

            {modalChequeAbierto && (
              <ModalCheque
                onClose={() => setModalChequeAbierto(false)}
                onConfirm={() => setModalChequeAbierto(false)}
                cheque={
                  tipoPago === "CHEQUE_PROPIO" ? chequePropio : chequeTercero
                }
                setCheque={
                  tipoPago === "CHEQUE_PROPIO"
                    ? setChequePropio
                    : setChequeTercero
                }
                tipoPago={tipoPago}
              />
            )}
          </div>
        </>
      )}

      {/* ────────── LISTA DE PAGOS ────────── */}
      {pagos.length > 0 && (
        <div className="flex flex-col gap-2">
          {pagos.map((pago) => (
            <div
              key={pago.id}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-md px-3 py-2.5 shadow-sm gap-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`shrink-0 flex items-center gap-1 text-md font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${badgeColor(pago.tipoMetodoPago)}`}
                >
                  <IconMetodo metodo={pago.tipoMetodoPago} size={10} />
                  {labelMetodo(pago.tipoMetodoPago)}
                </span>
                {pago.nombreBanco && (
                  <span className="text-md font-semibold text-gray-500 truncate">
                    {pago.nombreBanco}
                  </span>
                )}
                {pago.referencia && (
                  <span className="text-md font-semibold text-gray-400 truncate">
                    Ref: {pago.referencia}
                  </span>
                )}
                {pago.datosTarjeta?.marca && (
                  <span className="text-md font-semibold text-gray-500">
                    {pago.datosTarjeta.marca} ·{" "}
                    {pago.datosTarjeta.cantidadCuotas}c
                  </span>
                )}
                {pago.chequeTercero?.numero && (
                  <span className="text-md font-semibold text-gray-500 truncate">
                    {pago.chequeTercero.banco} #{pago.chequeTercero.numero}
                  </span>
                )}
                {pago.chequePropio?.numero && (
                  <span className="text-md font-semibold text-gray-500 truncate">
                    {pago.chequePropio.tipoCheque === "DIFERIDO"
                      ? "Dif."
                      : "Cte."}{" "}
                    #{pago.chequePropio.numero}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-md font-black text-gray-900">
                  {formatPrice(pago.monto)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPagos((prev) => prev.filter((p) => p.id !== pago.id))
                  }
                  className="p-1 rounded-md text-gray-500 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                >
                  <BorrarIcono size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ────────── TOTALES ────────── */}
      {pagos.length > 0 && (
        <div className="border border-gray-100 rounded-md bg-white shadow-sm">
          <div className="px-4 py-3 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-md font-bold text-gray-500 uppercase tracking-wider">
                Total comprobante
              </span>
              <span className="text-md font-bold text-gray-700">
                {formatPrice(totalComprobante)}
              </span>
            </div>
            {totalRecargo > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-md font-bold text-orange-500 uppercase tracking-wider">
                    Recargo tarjeta
                  </span>
                  <span className="text-md font-bold text-orange-500">
                    +{formatPrice(totalRecargo)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-md font-bold text-gray-700 uppercase tracking-wider">
                    Total a cobrar
                  </span>
                  <span className="text-md font-black text-gray-900">
                    {formatPrice(totalConRecargo)}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center">
              <span className="text-md font-bold text-gray-500 uppercase tracking-wider">
                Total pagado
              </span>
              <span className="text-md font-bold text-gray-700">
                {formatPrice(totalPagado)}
              </span>
            </div>
            {vueltos.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-md font-bold text-gray-500 uppercase tracking-wider">
                  Total vuelto
                </span>
                <span className="text-md font-bold text-gray-700">
                  {formatPrice(totalVuelto)}
                </span>
              </div>
            )}
            <div className="h-px bg-gray-100" />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                {estaCompleto ? (
                  <CheckCircle2 size={13} className="text-emerald-500" />
                ) : (
                  <AlertCircle size={13} className="text-amber-500" />
                )}
                <span className="text-md font-black text-gray-900 uppercase tracking-wider">
                  {hayExcedente
                    ? "Excedente"
                    : estaCompleto
                      ? "Saldado"
                      : "Pendiente"}
                </span>
              </div>
              <span
                className={`text-md font-black ${hayExcedente ? "text-amber-600" : estaCompleto ? "text-emerald-600" : "text-rose-500"}`}
              >
                {formatPrice(Math.abs(excedente))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ────────── VUELTO (solo INGRESO cuando hay excedente) ────────── */}
      {hayExcedente && (
        <div className="border border-amber-200 bg-amber-50/50 rounded-md p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <RotateCcw size={14} className="text-amber-600" />
            <span className="text-md font-black uppercase tracking-wider text-amber-700">
              Vuelto — Excedente {formatPrice(excedente)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {METODOS_VUELTO.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTipoVuelto(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-md font-black uppercase tracking-wide border transition-all cursor-pointer ${
                  tipoVuelto === value
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-amber-400"
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="w-28">
              <FieldLabel>Monto vuelto</FieldLabel>
              <input
                type="text"
                value={
                  montoVueltoFocused
                    ? typeof montoVuelto === "string"
                      ? montoVuelto.replace(".", ",")
                      : montoVuelto
                    : montoVuelto
                      ? formatNumber(montoVuelto)
                      : ""
                }
                onFocus={() => setMontoVueltoFocused(true)}
                onBlur={() => setMontoVueltoFocused(false)}
                onChange={(e) => setMontoVuelto(e.target.value)}
                placeholder="0,00"
                className="w-full px-2 py-1.5 border border-amber-200 rounded-md text-md font-black text-gray-900 focus:outline-none focus:border-amber-400"
              />
            </div>
            {tipoVuelto === "TRANSFERENCIA" && (
              <BancoAutocomplete
                value={bancoVueltoSeleccionado}
                onChange={setBancoVueltoSeleccionado}
              />
            )}
            <button
              type="button"
              onClick={handleAgregarVuelto}
              disabled={!montoVuelto || parseCurrency(montoVuelto) <= 0}
              className="h-[30px] px-4 rounded-md bg-amber-500 text-white text-md font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-amber-600 transition active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={13} strokeWidth={3} />
              Agregar vuelto
            </button>
          </div>

          {vueltos.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between bg-white border border-amber-100 rounded-md px-3 py-2 gap-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-md font-black px-1.5 py-0.5 rounded uppercase tracking-wider text-amber-700 bg-amber-100">
                  {labelMetodo(v.tipoMetodoPago)}
                </span>
                {v.nombreBanco && (
                  <span className="text-md font-semibold text-gray-500">
                    {v.nombreBanco}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-md font-black text-amber-700">
                  {formatPrice(v.monto)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setVueltos((prev) => prev.filter((x) => x.id !== v.id))
                  }
                  className="p-1 rounded-md text-gray-500 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                >
                  <BorrarIcono size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DetallePago;
