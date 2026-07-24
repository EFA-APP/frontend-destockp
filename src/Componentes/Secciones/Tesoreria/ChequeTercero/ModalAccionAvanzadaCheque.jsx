import { useState, useMemo } from "react";
import { X, CheckCircle, AlertTriangle } from "lucide-react";
import { useEndosarChequeTerceroMutation } from "../../../../Backend/Comprobantes/queries/useEndosarChequeTercero.mutation";
import { useEntregarChequeATerceroMutation } from "../../../../Backend/Comprobantes/queries/useEntregarChequeATercero.mutation";
import { useDescontarChequeTerceroMutation } from "../../../../Backend/Comprobantes/queries/useDescontarChequeTercero.mutation";
import { useAnularChequeTerceroMutation } from "../../../../Backend/Comprobantes/queries/useAnularChequeTercero.mutation";
import { formatPrice } from "../../../../utils/formatters";
import CuentaBancariaAutocomplete from "../../../UI/Select/CuentaBancariaAutocomplete";

const FieldLabel = ({ children }) => (
  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-2">
    {children}
  </span>
);

const ModalAccionAvanzadaCheque = ({ cheque, accion, onClose }) => {
  const [fechaEndoso, setFechaEndoso] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [cuitEndosado, setCuitEndosado] = useState("");
  const [receptorEndosado, setReceptorEndosado] = useState("");
  const [codigoProveedorEndosado, setCodigoProveedorEndosado] = useState("");

  const [entregadoATercero, setEntregadoATercero] = useState("");

  // R35, R40: selector de CuentaBancaria real de tesoreria-ms (en lugar del
  // plan de cuentas de contabilidad-ms). El estado guarda la CuentaBancaria
  // completa; se convierte a codigoCuentaBancaria (su `codigo`) recién al
  // armar el payload de la mutation.
  const [cuentaBancaria, setCuentaBancaria] = useState(null);
  const [importeCobrado, setImporteCobrado] = useState(String(cheque.importe));

  const comisionCalculada = useMemo(() => {
    const cobrado = Number(importeCobrado);
    if (Number.isNaN(cobrado)) return null;
    return cheque.importe - cobrado;
  }, [cheque.importe, importeCobrado]);

  const mEndosar = useEndosarChequeTerceroMutation();
  const mEntregar = useEntregarChequeATerceroMutation();
  const mDescontar = useDescontarChequeTerceroMutation();
  const mAnular = useAnularChequeTerceroMutation();

  const isPending =
    mEndosar.isPending || mEntregar.isPending || mDescontar.isPending || mAnular.isPending;

  const mostrarAdvertencias = (data) => {
    if (data?.advertencias?.length > 0) {
      alert(`Advertencia:\n\n${data.advertencias.join("\n")}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (accion === "ANULAR") {
      mAnular.mutate(cheque.codigo, {
        onSuccess: (data) => {
          alert("Cheque anulado correctamente");
          mostrarAdvertencias(data);
          onClose();
        },
        onError: (err) => alert(err.message),
      });
      return;
    }

    if (accion === "ENDOSAR") {
      if (!cuitEndosado || !receptorEndosado || !codigoProveedorEndosado) {
        alert("Debe completar CUIT, receptor y código de proveedor");
        return;
      }
      mEndosar.mutate(
        {
          codigo: cheque.codigo,
          fechaEndoso: new Date(fechaEndoso),
          cuitEndosado,
          receptorEndosado,
          codigoProveedorEndosado: Number(codigoProveedorEndosado),
        },
        {
          onSuccess: (data) => {
            alert("Cheque endosado correctamente");
            mostrarAdvertencias(data);
            onClose();
          },
          onError: (err) => alert(err.message),
        },
      );
      return;
    }

    if (accion === "ENTREGAR_A_TERCERO") {
      if (!entregadoATercero) {
        alert("Debe indicar a quién se entrega el cheque");
        return;
      }
      mEntregar.mutate(
        { codigo: cheque.codigo, entregadoATercero },
        {
          onSuccess: (data) => {
            alert("Cheque entregado a tercero correctamente");
            mostrarAdvertencias(data);
            onClose();
          },
          onError: (err) => alert(err.message),
        },
      );
      return;
    }

    if (accion === "DESCONTAR") {
      if (!cuentaBancaria || !importeCobrado) {
        alert("Debe seleccionar una cuenta destino e indicar el importe cobrado");
        return;
      }
      mDescontar.mutate(
        {
          codigo: cheque.codigo,
          codigoCuentaBancaria: cuentaBancaria.codigo,
          importeCobrado: Number(importeCobrado),
        },
        {
          onSuccess: (data) => {
            alert("Cheque descontado correctamente");
            mostrarAdvertencias(data);
            onClose();
          },
          onError: (err) => alert(err.message),
        },
      );
    }
  };

  const accionConfig = {
    ENDOSAR: {
      titulo: "Endosar Cheque",
      color: "text-amber-600",
      btnClass: "bg-amber-600 hover:bg-amber-700",
    },
    ENTREGAR_A_TERCERO: {
      titulo: "Entregar Cheque a Tercero",
      color: "text-cyan-600",
      btnClass: "bg-cyan-600 hover:bg-cyan-700",
    },
    DESCONTAR: {
      titulo: "Descontar Cheque",
      color: "text-indigo-600",
      btnClass: "bg-indigo-600 hover:bg-indigo-700",
    },
    ANULAR: {
      titulo: "Anular Cheque",
      color: "text-gray-600",
      btnClass: "bg-gray-900 hover:bg-black",
    },
  };

  const cfg = accionConfig[accion];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-md shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50 rounded-t-md">
          <h2 className={`text-sm font-black uppercase tracking-widest ${cfg.color}`}>{cfg.titulo}</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Detalle del Cheque</p>
            <p className="text-sm font-bold text-gray-800">
              Banco {cheque.banco} - N° {cheque.numero}
            </p>
            <p className="text-xl font-black text-gray-900 mt-1">{formatPrice(cheque.importe)}</p>
          </div>

          {accion === "ANULAR" ? (
            <div className="flex gap-3 text-sm font-medium text-gray-700 bg-gray-50 p-4 rounded-md border border-gray-200">
              <AlertTriangle size={20} className="shrink-0 text-gray-500" />
              <div>
                <span className="font-bold block mb-1">Confirmación de Anulación</span>
                ¿Está seguro que desea ANULAR este cheque? Esta acción no se
                puede deshacer.
              </div>
            </div>
          ) : (
            <form id="accion-avanzada-cheque-form" onSubmit={handleSubmit} className="space-y-6">
              {accion === "ENDOSAR" && (
                <>
                  <div>
                    <FieldLabel>Fecha de Endoso</FieldLabel>
                    <input
                      type="date"
                      value={fechaEndoso}
                      onChange={(e) => setFechaEndoso(e.target.value)}
                      className="w-full h-11 px-4 bg-white border border-gray-300 rounded-md text-sm font-bold text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <FieldLabel>CUIT del Proveedor</FieldLabel>
                    <input
                      type="text"
                      value={cuitEndosado}
                      onChange={(e) => setCuitEndosado(e.target.value)}
                      placeholder="20111111112"
                      className="w-full h-11 px-4 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all shadow-sm placeholder:font-medium placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <FieldLabel>Razón Social del Proveedor</FieldLabel>
                    <input
                      type="text"
                      value={receptorEndosado}
                      onChange={(e) => setReceptorEndosado(e.target.value)}
                      className="w-full h-11 px-4 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <FieldLabel>Código de Proveedor</FieldLabel>
                    <input
                      type="number"
                      value={codigoProveedorEndosado}
                      onChange={(e) => setCodigoProveedorEndosado(e.target.value)}
                      className="w-full h-11 px-4 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all shadow-sm"
                    />
                  </div>
                </>
              )}

              {accion === "ENTREGAR_A_TERCERO" && (
                <div>
                  <FieldLabel>Entregado a (nombre / razón social)</FieldLabel>
                  <input
                    type="text"
                    value={entregadoATercero}
                    onChange={(e) => setEntregadoATercero(e.target.value)}
                    placeholder="Ej: MOTO SHOPPING"
                    className="w-full h-11 px-4 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all shadow-sm placeholder:font-medium placeholder:text-gray-400"
                  />
                </div>
              )}

              {accion === "DESCONTAR" && (
                <>
                  <div>
                    <CuentaBancariaAutocomplete
                      label="Cuenta Destino"
                      value={cuentaBancaria}
                      onChange={setCuentaBancaria}
                    />
                  </div>
                  <div>
                    <FieldLabel>Importe Cobrado (neto)</FieldLabel>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={importeCobrado}
                        onChange={(e) => setImporteCobrado(e.target.value)}
                        className="w-full h-11 pl-9 pr-4 bg-white border border-gray-300 rounded-md text-sm font-bold text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                  {comisionCalculada !== null && (
                    <div className="flex items-center justify-between text-xs font-bold px-4 py-3 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <span>Comisión del descuento</span>
                      <span className="text-sm font-black">{formatPrice(Math.max(comisionCalculada, 0))}</span>
                    </div>
                  )}
                </>
              )}
            </form>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 rounded-b-md">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors uppercase tracking-wider"
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="accion-avanzada-cheque-form"
            onClick={accion === "ANULAR" ? handleSubmit : undefined}
            disabled={isPending}
            className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white rounded-md shadow-sm transition-all uppercase tracking-wider ${cfg.btnClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPending ? "Procesando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAccionAvanzadaCheque;
