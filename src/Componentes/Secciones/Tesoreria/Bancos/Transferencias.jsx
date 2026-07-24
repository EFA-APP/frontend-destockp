import { useState } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  CheckCircle2,
  Building2,
  ArrowDownUp,
} from "lucide-react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useAlertas } from "../../../../store/useAlertas";
import { useCuentasBancariasQuery } from "../../../../Backend/Tesoreria/queries/useCuentasBancarias.query";
import { useCrearTransferenciaMutation } from "../../../../Backend/Tesoreria/queries/useTransferencias.query";
import { formatPrice } from "../../../../utils/formatters";

const FieldLabel = ({ children, className = "" }) => (
  <span
    className={`text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2 ${className}`}
  >
    {children}
  </span>
);

const hoyISO = () => new Date().toISOString().slice(0, 10);

const Transferencias = () => {
  const { usuario, unidadActiva } = useAuthStore();
  const codigoEmpresa = usuario?.codigoEmpresa;
  const agregarAlerta = useAlertas((s) => s.agregarAlerta);

  const [codigoCuentaOrigen, setCodigoCuentaOrigen] = useState("");
  const [codigoCuentaDestino, setCodigoCuentaDestino] = useState("");
  const [importe, setImporte] = useState("");
  const [fecha, setFecha] = useState(hoyISO());
  const [descripcion, setDescripcion] = useState("");

  const { data: cuentas = [] } = useCuentasBancariasQuery({
    codigoEmpresa,
    activa: true,
  });
  const mTransferencia = useCrearTransferenciaMutation();

  const resetForm = () => {
    setCodigoCuentaOrigen("");
    setCodigoCuentaDestino("");
    setImporte("");
    setFecha(hoyISO());
    setDescripcion("");
  };

  const nombreCuenta = (c) =>
    `${c.banco?.nombre} — ${c.numeroCuenta} ${c.alias ? `(${c.alias})` : ""}`;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!codigoCuentaOrigen || !codigoCuentaDestino) {
      agregarAlerta({
        type: "error",
        message: "Debe seleccionar cuenta origen y destino",
      });
      return;
    }
    if (codigoCuentaOrigen === codigoCuentaDestino) {
      agregarAlerta({
        type: "error",
        message: "La cuenta origen y destino no pueden ser la misma",
      });
      return;
    }
    const montoNumerico = Number(importe);
    if (!montoNumerico || montoNumerico <= 0) {
      agregarAlerta({
        type: "error",
        message: "El importe debe ser mayor a 0",
      });
      return;
    }

    mTransferencia.mutate(
      {
        payload: {
          codigoCuentaOrigen: Number(codigoCuentaOrigen),
          codigoCuentaDestino: Number(codigoCuentaDestino),
          importe: montoNumerico,
          fecha,
          descripcion: descripcion.trim() || undefined,
        },
        contexto: { codigoEmpresa, codigoUnidadNegocio: unidadActiva?.codigo },
      },
      {
        onSuccess: (data) => {
          agregarAlerta({
            type: "success",
            message: "Transferencia registrada correctamente",
          });
          resetForm();
        },
        onError: (err) =>
          agregarAlerta({
            type: "error",
            message: err?.response?.data?.message || err.message,
          }),
      },
    );
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto py-12 px-6 lg:px-8 space-y-8 bg-[#F8FAFC] min-h-[calc(100vh-64px)]">
      {/* HEADER PREMIUM */}
      <div className="flex flex-col items-center justify-center text-center space-y-3 pb-8">
        <div className="w-14 h-14 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-lg mb-2">
          <ArrowLeftRight size={24} className="text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Transferencias Propias
        </h1>
        <p className="text-sm font-medium text-gray-500 max-w-md mx-auto">
          Registrá movimientos de fondos entre las cuentas bancarias de la
          empresa.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
        <form onSubmit={handleSubmit} onKeyDown={(e) => {
          if (e.key === "Enter" && e.target.tagName !== "BUTTON" && e.target.type !== "submit") {
            e.preventDefault();
            const form = e.currentTarget;
            const focusables = Array.from(
              form.querySelectorAll("select:not([disabled]), input:not([disabled]), button:not([disabled])")
            );
            const idx = focusables.indexOf(e.target);
            if (idx >= 0 && idx < focusables.length - 1) {
              focusables[idx + 1].focus();
              if (focusables[idx + 1].select) focusables[idx + 1].select();
            }
          }
        }}>
          {/* SECCIÓN ORIGEN -> DESTINO (Visualmente destacada) */}
          <div className="p-8 border-b border-gray-100 bg-gray-50/30">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 w-full bg-white p-5 rounded-md border border-gray-200 shadow-sm relative">
                <span className="absolute -top-2.5 left-4 bg-white px-2 text-[10px] font-black text-rose-500 uppercase tracking-widest">
                  Origen (Sale)
                </span>
                <div className="flex items-center gap-3 mb-3">
                  <Building2 size={18} className="text-gray-400" />
                  <select
                    value={codigoCuentaOrigen}
                    onChange={(e) => setCodigoCuentaOrigen(e.target.value)}
                    className="w-full text-sm font-bold text-gray-900 bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="">Seleccione cuenta origen...</option>
                    {cuentas.map((c) => (
                      <option key={c.codigo} value={c.codigo}>
                        {nombreCuenta(c)}
                      </option>
                    ))}
                  </select>
                </div>
                {codigoCuentaOrigen && (
                  <p className="text-xs text-gray-500 font-medium pl-7">
                    Saldo disponible:{" "}
                    <span className="font-bold text-gray-900">
                      {formatPrice(
                        cuentas.find(
                          (c) => c.codigo.toString() === codigoCuentaOrigen,
                        )?.saldo || 0,
                      )}
                    </span>
                  </p>
                )}
              </div>

              <div className="w-10 h-10 shrink-0 rounded-full bg-gray-900 flex items-center justify-center shadow-md rotate-90 md:rotate-0">
                <ArrowRight size={18} className="text-white" strokeWidth={3} />
              </div>

              <div className="flex-1 w-full bg-white p-5 rounded-md border border-gray-200 shadow-sm relative">
                <span className="absolute -top-2.5 left-4 bg-white px-2 text-[10px] font-black text-[#1FAE6D] uppercase tracking-widest">
                  Destino (Entra)
                </span>
                <div className="flex items-center gap-3 mb-3">
                  <Building2 size={18} className="text-gray-400" />
                  <select
                    value={codigoCuentaDestino}
                    onChange={(e) => setCodigoCuentaDestino(e.target.value)}
                    className="w-full text-sm font-bold text-gray-900 bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="">Seleccione cuenta destino...</option>
                    {cuentas.map((c) => (
                      <option key={c.codigo} value={c.codigo}>
                        {nombreCuenta(c)}
                      </option>
                    ))}
                  </select>
                </div>
                {codigoCuentaDestino && (
                  <p className="text-xs text-gray-500 font-medium pl-7">
                    Saldo actual:{" "}
                    <span className="font-bold text-gray-900">
                      {formatPrice(
                        cuentas.find(
                          (c) => c.codigo.toString() === codigoCuentaDestino,
                        )?.saldo || 0,
                      )}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* DATOS COMPLEMENTARIOS */}
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <FieldLabel>Importe a Transferir</FieldLabel>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">
                    $
                  </span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={importe}
                    onChange={(e) => setImporte(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-full h-16 pl-9 pr-4 border-b-2 border-gray-200 bg-transparent text-3xl font-black text-gray-900 focus:outline-none focus:border-gray-900 transition-colors placeholder:text-gray-300 rounded-none"
                  />
                </div>
              </div>

              <div>
                <FieldLabel>Fecha de Operación</FieldLabel>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="w-full h-16 px-4 border-b-2 border-gray-200 bg-transparent text-lg font-bold text-gray-900 focus:outline-none focus:border-gray-900 transition-colors rounded-none"
                />
              </div>
            </div>

            <div>
              <FieldLabel>Referencia / Descripción</FieldLabel>
              <input
                type="text"
                placeholder="Motivo de la transferencia..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full h-12 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
            <button
              type="submit"
              disabled={
                mTransferencia.isPending ||
                !codigoCuentaOrigen ||
                !codigoCuentaDestino ||
                !importe
              }
              className="flex items-center justify-center gap-3 px-8 py-3.5 text-sm font-bold text-white rounded-md shadow-lg bg-gray-900 hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {mTransferencia.isPending ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  PROCESANDO...
                </>
              ) : (
                <>
                  CONFIRMAR TRANSFERENCIA
                  <ArrowRight size={18} strokeWidth={3} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Transferencias;
