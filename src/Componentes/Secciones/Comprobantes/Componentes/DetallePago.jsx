import { useState } from "react";
import {
  Banknote,
  ArrowLeftRight,
  CreditCard,
  FileText,
  FileCheck,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { formatPrice } from "../../../../utils/formatters";
import { BorrarIcono } from "../../../../assets/Icons";
import { useObtenerDescendientesImputablesQuery } from "../../../../Backend/Contabilidad/queries/useCuentas.query";

// Ajustá este código al que corresponda a la cuenta "Bancos" en tu plan de cuentas
const CODIGO_CUENTA_BANCOS = "1102";

const METODOS = [
  {
    value: "EFECTIVO",
    label: "Efectivo",
    Icon: Banknote,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    value: "TRANSFERENCIA",
    label: "Transf.",
    Icon: ArrowLeftRight,
    color: "text-sky-600 bg-sky-50",
  },
  {
    value: "TARJETA_DEBITO",
    label: "T. Débito",
    Icon: CreditCard,
    color: "text-violet-600 bg-violet-50",
  },
  {
    value: "TARJETA_CREDITO",
    label: "T. Crédito",
    Icon: CreditCard,
    color: "text-orange-600 bg-orange-50",
  },
  {
    value: "CHEQUE_TERCERO",
    label: "Ch. Tercero",
    Icon: FileText,
    color: "text-amber-600 bg-amber-50",
  },
  {
    value: "CHEQUE_PROPIO",
    label: "Ch. Propio",
    Icon: FileCheck,
    color: "text-rose-600 bg-rose-50",
  },
];

const METODOS_VUELTO = [
  { value: "EFECTIVO", label: "Efectivo", Icon: Banknote },
  { value: "TRANSFERENCIA", label: "Transferencia", Icon: ArrowLeftRight },
];

const datosTarjetaInit = {
  marca: "",
  cantidadCuotas: 1,
  recargo: 0,
  cupon: "",
  lote: "",
  autorizacion: "",
  fechaAcreditacion: "",
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
  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1 block">
    {children}
  </span>
);

const InputField = ({ label, ...props }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <input
      {...props}
      className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs font-bold text-gray-900 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
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

export const DetallePago = ({
  totalComprobante = 0,
  tipoOperacion = "INGRESO",
}) => {
  const { data: bancos = [] } =
    useObtenerDescendientesImputablesQuery(CODIGO_CUENTA_BANCOS);

  // ── Form nuevo pago ──
  const [tipoPago, setTipoPago] = useState("EFECTIVO");
  const [montoPago, setMontoPago] = useState("");
  const [referencia, setReferencia] = useState("");
  const [codigoBanco, setCodigoBanco] = useState("");
  const [tarjeta, setTarjeta] = useState(datosTarjetaInit);
  const [chequeTercero, setChequeTercero] = useState(chequeTerceroInit);
  const [chequePropio, setChequePropio] = useState(chequesPropioInit);

  const [pagos, setPagos] = useState([]);

  // ── Vuelto ──
  const [tipoVuelto, setTipoVuelto] = useState("EFECTIVO");
  const [montoVuelto, setMontoVuelto] = useState("");
  const [bancoVuelto, setBancoVuelto] = useState("");
  const [vueltos, setVueltos] = useState([]);

  // ── Totales ──
  const totalPagado = pagos.reduce((s, p) => s + p.monto, 0);
  const totalVuelto = vueltos.reduce((s, v) => s + v.monto, 0);
  const excedente = totalPagado - totalVuelto - totalComprobante;
  const hayExcedente = tipoOperacion === "INGRESO" && excedente > 0.001;
  const estaCompleto = excedente >= -0.001;

  const resetForm = () => {
    setMontoPago("");
    setReferencia("");
    setCodigoBanco("");
    setTarjeta(datosTarjetaInit);
    setChequeTercero(chequeTerceroInit);
    setChequePropio(chequesPropioInit);
  };

  const handleAgregarPago = () => {
    const monto = parseFloat(montoPago) || 0;
    if (monto <= 0) return;

    const pago = {
      id: Date.now(),
      tipoMetodoPago: tipoPago,
      monto,
      referencia,
      codigoBancoDestino: Number(codigoBanco) || 0,
      nombreBanco:
        bancos.find((b) => b.codigoSecuencial === Number(codigoBanco))
          ?.nombre || "",
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
    const monto = parseFloat(montoVuelto) || 0;
    if (monto <= 0) return;
    setVueltos((prev) => [
      ...prev,
      {
        id: Date.now(),
        tipoMetodoPago: tipoVuelto,
        monto,
        codigoBancoDestino: Number(bancoVuelto) || 0,
        nombreBanco:
          bancos.find((b) => b.codigoSecuencial === Number(bancoVuelto))
            ?.nombre || "",
      },
    ]);
    setMontoVuelto("");
    setBancoVuelto("");
  };

  const isTarjeta = ["TARJETA_DEBITO", "TARJETA_CREDITO"].includes(tipoPago);

  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {/* ────────── HEADER ────────── */}
      <div className="flex items-center gap-2 pt-1">
        <Banknote size={16} className="text-[var(--primary)]" />
        <span className="text-xs font-black uppercase tracking-wider text-gray-700">
          Forma de Pago
        </span>
      </div>

      {/* ────────── SELECTOR DE MÉTODO ────────── */}
      <div className="flex flex-wrap gap-2">
        {METODOS.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTipoPago(value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wide border transition-all cursor-pointer ${
              tipoPago === value
                ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-[var(--primary)]/40 hover:text-[var(--primary)]"
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* ────────── FORMULARIO CONTEXTUAL ────────── */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
        {/* Campos comunes: monto */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-28">
            <FieldLabel>Monto</FieldLabel>
            <input
              type="number"
              min="0"
              step="0.01"
              value={montoPago}
              onChange={(e) => setMontoPago(e.target.value)}
              placeholder="0.00"
              className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm font-black text-gray-900 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20"
            />
          </div>

          {/* TRANSFERENCIA: banco + referencia */}
          {tipoPago === "TRANSFERENCIA" && (
            <>
              <div className="flex-1 min-w-[160px]">
                <FieldLabel>Banco destino</FieldLabel>
                <select
                  value={codigoBanco}
                  onChange={(e) => setCodigoBanco(e.target.value)}
                  className="w-full h-[30px] px-2 border border-gray-200 rounded-md text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-[var(--primary)] cursor-pointer"
                >
                  <option value="">— Seleccionar banco —</option>
                  {bancos.map((b) => (
                    <option key={b.codigoSecuencial} value={b.codigoSecuencial}>
                      {b.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-36">
                <FieldLabel>Nro. referencia</FieldLabel>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Nro. transferencia"
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs font-bold text-gray-900 focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </>
          )}

          <button
            type="button"
            onClick={handleAgregarPago}
            disabled={!montoPago || parseFloat(montoPago) <= 0}
            className="h-[30px] px-4 rounded-md bg-[var(--primary)] text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-[var(--primary)]/90 transition active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={13} strokeWidth={3} />
            Agregar
          </button>
        </div>

        {/* TARJETA */}
        {isTarjeta && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100">
            <InputField
              label="Marca"
              type="text"
              value={tarjeta.marca}
              onChange={(e) =>
                setTarjeta((p) => ({ ...p, marca: e.target.value }))
              }
              placeholder="Visa, Master..."
            />
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
            <InputField
              label="Autorización"
              type="text"
              value={tarjeta.autorizacion}
              onChange={(e) =>
                setTarjeta((p) => ({ ...p, autorizacion: e.target.value }))
              }
            />
            <InputField
              label="Fecha acreditación"
              type="date"
              value={tarjeta.fechaAcreditacion}
              onChange={(e) =>
                setTarjeta((p) => ({ ...p, fechaAcreditacion: e.target.value }))
              }
            />
          </div>
        )}

        {/* CHEQUE TERCERO */}
        {tipoPago === "CHEQUE_TERCERO" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-100">
            <InputField
              label="Banco"
              type="text"
              value={chequeTercero.banco}
              onChange={(e) =>
                setChequeTercero((p) => ({ ...p, banco: e.target.value }))
              }
            />
            <InputField
              label="Nro. cheque"
              type="text"
              value={chequeTercero.numero}
              onChange={(e) =>
                setChequeTercero((p) => ({ ...p, numero: e.target.value }))
              }
            />
            <InputField
              label="CUIT emisor"
              type="text"
              value={chequeTercero.cuitEmisor}
              onChange={(e) =>
                setChequeTercero((p) => ({ ...p, cuitEmisor: e.target.value }))
              }
            />
            <InputField
              label="Titular"
              type="text"
              value={chequeTercero.titular}
              onChange={(e) =>
                setChequeTercero((p) => ({ ...p, titular: e.target.value }))
              }
            />
            <InputField
              label="Fecha emisión"
              type="date"
              value={chequeTercero.fechaEmision}
              onChange={(e) =>
                setChequeTercero((p) => ({
                  ...p,
                  fechaEmision: e.target.value,
                }))
              }
            />
            <InputField
              label="Fecha pago"
              type="date"
              value={chequeTercero.fechaPago}
              onChange={(e) =>
                setChequeTercero((p) => ({ ...p, fechaPago: e.target.value }))
              }
            />
          </div>
        )}

        {/* CHEQUE PROPIO */}
        {tipoPago === "CHEQUE_PROPIO" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-100">
            <div>
              <FieldLabel>Tipo</FieldLabel>
              <select
                value={chequePropio.tipoCheque}
                onChange={(e) =>
                  setChequePropio((p) => ({ ...p, tipoCheque: e.target.value }))
                }
                className="w-full h-[30px] px-2 border border-gray-200 rounded-md text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-[var(--primary)] cursor-pointer"
              >
                <option value="CORRIENTE">Corriente</option>
                <option value="DIFERIDO">Diferido (Pago diferido)</option>
              </select>
            </div>
            <InputField
              label="Banco"
              type="text"
              value={chequePropio.banco}
              onChange={(e) =>
                setChequePropio((p) => ({ ...p, banco: e.target.value }))
              }
            />
            <InputField
              label="Sucursal"
              type="text"
              value={chequePropio.sucursal}
              onChange={(e) =>
                setChequePropio((p) => ({ ...p, sucursal: e.target.value }))
              }
            />
            <InputField
              label="Nro. cheque"
              type="text"
              value={chequePropio.numero}
              onChange={(e) =>
                setChequePropio((p) => ({ ...p, numero: e.target.value }))
              }
            />
            <InputField
              label="Cuenta"
              type="text"
              value={chequePropio.cuenta}
              onChange={(e) =>
                setChequePropio((p) => ({ ...p, cuenta: e.target.value }))
              }
            />
            <InputField
              label="Fecha emisión"
              type="date"
              value={chequePropio.fechaEmision}
              onChange={(e) =>
                setChequePropio((p) => ({ ...p, fechaEmision: e.target.value }))
              }
            />
            <InputField
              label="Fecha pago"
              type="date"
              value={chequePropio.fechaPago}
              onChange={(e) =>
                setChequePropio((p) => ({ ...p, fechaPago: e.target.value }))
              }
            />
          </div>
        )}
      </div>

      {/* ────────── LISTA DE PAGOS ────────── */}
      {pagos.length > 0 && (
        <div className="flex flex-col gap-2">
          {pagos.map((pago) => (
            <div
              key={pago.id}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm gap-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`shrink-0 flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${badgeColor(pago.tipoMetodoPago)}`}
                >
                  <IconMetodo metodo={pago.tipoMetodoPago} size={10} />
                  {labelMetodo(pago.tipoMetodoPago)}
                </span>
                {pago.nombreBanco && (
                  <span className="text-[10px] font-semibold text-gray-500 truncate">
                    {pago.nombreBanco}
                  </span>
                )}
                {pago.referencia && (
                  <span className="text-[10px] font-semibold text-gray-400 truncate">
                    Ref: {pago.referencia}
                  </span>
                )}
                {pago.datosTarjeta?.marca && (
                  <span className="text-[10px] font-semibold text-gray-500">
                    {pago.datosTarjeta.marca} ·{" "}
                    {pago.datosTarjeta.cantidadCuotas}c
                  </span>
                )}
                {pago.chequeTercero?.numero && (
                  <span className="text-[10px] font-semibold text-gray-500 truncate">
                    {pago.chequeTercero.banco} #{pago.chequeTercero.numero}
                  </span>
                )}
                {pago.chequePropio?.numero && (
                  <span className="text-[10px] font-semibold text-gray-500 truncate">
                    {pago.chequePropio.tipoCheque === "DIFERIDO"
                      ? "Dif."
                      : "Cte."}{" "}
                    #{pago.chequePropio.numero}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-black text-gray-900">
                  {formatPrice(pago.monto)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPagos((prev) => prev.filter((p) => p.id !== pago.id))
                  }
                  className="p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
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
        <div className="border border-gray-100 rounded-xl bg-white shadow-sm">
          <div className="px-4 py-3 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Total comprobante
              </span>
              <span className="text-xs font-bold text-gray-700">
                {formatPrice(totalComprobante)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Total pagado
              </span>
              <span className="text-xs font-bold text-gray-700">
                {formatPrice(totalPagado)}
              </span>
            </div>
            {vueltos.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Total vuelto
                </span>
                <span className="text-xs font-bold text-gray-700">
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
                <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
                  {hayExcedente
                    ? "Excedente"
                    : estaCompleto
                      ? "Saldado"
                      : "Pendiente"}
                </span>
              </div>
              <span
                className={`text-sm font-black ${hayExcedente ? "text-amber-600" : estaCompleto ? "text-emerald-600" : "text-rose-500"}`}
              >
                {formatPrice(Math.abs(excedente))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ────────── VUELTO (solo INGRESO cuando hay excedente) ────────── */}
      {hayExcedente && (
        <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <RotateCcw size={14} className="text-amber-600" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-700">
              Vuelto — Excedente {formatPrice(excedente)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {METODOS_VUELTO.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTipoVuelto(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wide border transition-all cursor-pointer ${
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
                type="number"
                min="0"
                step="0.01"
                value={montoVuelto}
                onChange={(e) => setMontoVuelto(e.target.value)}
                placeholder="0.00"
                className="w-full px-2 py-1.5 border border-amber-200 rounded-md text-sm font-black text-gray-900 focus:outline-none focus:border-amber-400"
              />
            </div>
            {tipoVuelto === "TRANSFERENCIA" && (
              <div className="flex-1 min-w-[160px]">
                <FieldLabel>Banco destino</FieldLabel>
                <select
                  value={bancoVuelto}
                  onChange={(e) => setBancoVuelto(e.target.value)}
                  className="w-full h-[30px] px-2 border border-amber-200 rounded-md text-xs font-bold text-gray-700 bg-white focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="">— Seleccionar banco —</option>
                  {bancos.map((b) => (
                    <option key={b.codigoSecuencial} value={b.codigoSecuencial}>
                      {b.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="button"
              onClick={handleAgregarVuelto}
              disabled={!montoVuelto || parseFloat(montoVuelto) <= 0}
              className="h-[30px] px-4 rounded-md bg-amber-500 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:bg-amber-600 transition active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={13} strokeWidth={3} />
              Agregar vuelto
            </button>
          </div>

          {vueltos.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between bg-white border border-amber-100 rounded-lg px-3 py-2 gap-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider text-amber-700 bg-amber-100">
                  {labelMetodo(v.tipoMetodoPago)}
                </span>
                {v.nombreBanco && (
                  <span className="text-[10px] font-semibold text-gray-500">
                    {v.nombreBanco}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-black text-amber-700">
                  {formatPrice(v.monto)}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setVueltos((prev) => prev.filter((x) => x.id !== v.id))
                  }
                  className="p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
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
