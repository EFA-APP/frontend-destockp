import { useMemo, useState } from "react";
import { HandCoins, CheckCircle2, FileText, Banknote, Search, ArrowRight, ChevronRight, XCircle } from "lucide-react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useAlertas } from "../../../../store/useAlertas";
import { useCuentasBancariasQuery } from "../../../../Backend/Tesoreria/queries/useCuentasBancarias.query";
import { useCrearDepositoMutation } from "../../../../Backend/Tesoreria/queries/useDepositos.query";
import { useChequeTerceroDisponiblesQuery } from "../../../../Backend/Comprobantes/queries/useChequeTerceroDisponiblesQuery";
import { formatPrice } from "../../../../utils/formatters";

const FieldLabel = ({ children, className = "" }) => (
  <span className={`text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-2 ${className}`}>
    {children}
  </span>
);

const hoyISO = () => new Date().toISOString().slice(0, 10);

const Depositos = () => {
  const { usuario, unidadActiva } = useAuthStore();
  const codigoEmpresa = usuario?.codigoEmpresa;
  const agregarAlerta = useAlertas((s) => s.agregarAlerta);

  const [codigoCuentaBancaria, setCodigoCuentaBancaria] = useState("");
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const [fecha, setFecha] = useState(hoyISO());
  const [descripcion, setDescripcion] = useState("");
  const [busquedaCheques, setBusquedaCheques] = useState("");
  const [chequesSeleccionados, setChequesSeleccionados] = useState([]);
  const [ultimoDeposito, setUltimoDeposito] = useState(null);

  const { data: cuentas = [] } = useCuentasBancariasQuery({ codigoEmpresa, activa: true });
  const { data: chequesData, isLoading: isLoadingCheques } = useChequeTerceroDisponiblesQuery(busquedaCheques);
  const cheques = Array.isArray(chequesData) ? chequesData : (chequesData?.data || []);

  const mDeposito = useCrearDepositoMutation();

  const totalCheques = useMemo(
    () => chequesSeleccionados.reduce((acc, ch) => acc + (ch.importe || 0), 0),
    [chequesSeleccionados],
  );
  const totalDeposito = (Number(montoEfectivo) || 0) + totalCheques;

  const toggleCheque = (cheque) => {
    setChequesSeleccionados((prev) =>
      prev.some((c) => c.codigo === cheque.codigo)
        ? prev.filter((c) => c.codigo !== cheque.codigo)
        : [...prev, cheque],
    );
  };

  const removeCheque = (codigo) => {
    setChequesSeleccionados(prev => prev.filter(c => c.codigo !== codigo));
  };

  const resetForm = () => {
    setCodigoCuentaBancaria("");
    setMontoEfectivo("");
    setFecha(hoyISO());
    setDescripcion("");
    setChequesSeleccionados([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!codigoCuentaBancaria) {
      agregarAlerta({ type: "error", message: "Debe seleccionar la cuenta destino" });
      return;
    }
    const efectivoNumerico = Number(montoEfectivo) || 0;
    if (efectivoNumerico <= 0 && chequesSeleccionados.length === 0) {
      agregarAlerta({ type: "error", message: "Debe incluir efectivo y/o al menos un cheque" });
      return;
    }

    mDeposito.mutate(
      {
        payload: {
          codigoCuentaBancaria: Number(codigoCuentaBancaria),
          montoEfectivo: efectivoNumerico || undefined,
          codigosChequesTerceros: chequesSeleccionados.map((c) => c.codigo),
          fecha,
          descripcion: descripcion.trim() || undefined,
        },
        contexto: { codigoEmpresa, codigoUnidadNegocio: unidadActiva?.codigo },
      },
      {
        onSuccess: (data) => {
          agregarAlerta({ type: "success", message: "Depósito registrado exitosamente" });
          setUltimoDeposito(data);
          resetForm();
        },
        onError: (err) => agregarAlerta({ type: "error", message: err?.response?.data?.message || err.message }),
      },
    );
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6 lg:px-8 space-y-8 bg-[#F8FAFC] min-h-[calc(100vh-64px)]">
      
      {/* HEADER PREMIUM */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
            <span>Tesorería</span>
            <ChevronRight size={12} />
            <span>Bancos</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <HandCoins className="text-[#1FAE6D]" size={28} strokeWidth={2.5} />
            Boleta de Depósito
          </h1>
          <p className="text-sm font-medium text-gray-500 max-w-2xl">
            Prepará y registrá depósitos agrupando efectivo y valores (cheques de terceros) en una cuenta.
          </p>
        </div>
      </div>

      {ultimoDeposito && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 rounded-md p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 text-emerald-800">
            <CheckCircle2 size={20} strokeWidth={2.5} />
            <div>
              <p className="text-sm font-bold">Depósito #{ultimoDeposito.codigo} confirmado</p>
              <p className="text-xs font-medium text-emerald-600 mt-0.5">Se registró exitosamente por un total de {formatPrice(ultimoDeposito.total)}</p>
            </div>
          </div>
          <button onClick={() => setUltimoDeposito(null)} className="text-emerald-600 hover:text-emerald-900 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-md hover:bg-emerald-100/50 transition-colors">
            Cerrar
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative pb-32">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Data Form */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white border border-gray-200 rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Banknote className="text-gray-400" size={18} />
                  Información del Depósito
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <FieldLabel>Cuenta Destino</FieldLabel>
                  <select
                    value={codigoCuentaBancaria}
                    onChange={(e) => setCodigoCuentaBancaria(e.target.value)}
                    className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm font-bold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all shadow-sm"
                  >
                    <option value="">Seleccione una cuenta...</option>
                    {cuentas.map((c) => (
                      <option key={c.codigo} value={c.codigo}>{c.banco?.nombre} — {c.numeroCuenta} {c.alias ? `(${c.alias})` : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel>Fecha Contable</FieldLabel>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full h-11 px-3 border border-gray-300 rounded-md text-sm font-bold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all shadow-sm"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <FieldLabel>Monto en Efectivo</FieldLabel>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={montoEfectivo}
                      onChange={(e) => setMontoEfectivo(e.target.value)}
                      className="w-full h-14 pl-9 pr-4 border border-gray-300 rounded-md text-2xl font-black text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all shadow-sm placeholder:text-gray-300"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium mt-2">Opcional si solo se depositan cheques.</p>
                </div>

                <div>
                  <FieldLabel>Referencia / Descripción</FieldLabel>
                  <textarea
                    rows={2}
                    placeholder="Nota interna..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all shadow-sm resize-none placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Valores */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            
            {/* Resumen de Selección Activa (Floating Bar style) */}
            {chequesSeleccionados.length > 0 && (
              <div className="bg-gray-900 rounded-md p-4 shadow-lg flex items-center justify-between text-white animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <FileText size={20} className="text-[#1FAE6D]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Valores Seleccionados</p>
                    <p className="text-xl font-black">{chequesSeleccionados.length} cheques listos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Subtotal Valores</p>
                  <p className="text-2xl font-black text-[#1FAE6D]">{formatPrice(totalCheques)}</p>
                </div>
              </div>
            )}

            {/* Cheques Selection Card */}
            <div className="bg-white border border-gray-200 rounded-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col min-h-[500px]">
              
              <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="text-gray-400" size={18} />
                    Cartera de Valores
                  </h2>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={busquedaCheques}
                    onChange={(e) => setBusquedaCheques(e.target.value)}
                    placeholder="Buscar cheque..."
                    className="w-full h-9 pl-9 pr-3 border border-gray-300 rounded-md text-xs font-bold text-gray-800 bg-white focus:outline-none focus:border-gray-900 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 bg-gray-50/50 custom-scrollbar">
                {isLoadingCheques ? (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400 gap-4">
                    <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin" />
                    <p className="font-bold text-xs tracking-widest uppercase">Buscando valores...</p>
                  </div>
                ) : cheques.length === 0 ? (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400 gap-3">
                    <FileText size={40} strokeWidth={1} className="text-gray-300 mb-2" />
                    <p className="font-bold text-gray-600">No hay cheques disponibles</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                    {cheques.map((ch) => {
                      const seleccionado = chequesSeleccionados.some((c) => c.codigo === ch.codigo);
                      return (
                        <div
                          key={ch.codigo}
                          onClick={() => toggleCheque(ch)}
                          className={`
                            relative flex flex-col p-4 rounded-md cursor-pointer transition-all duration-200 border-2
                            ${seleccionado ? "border-gray-900 bg-white shadow-md" : "border-transparent bg-white shadow-sm hover:border-gray-300"}
                          `}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${seleccionado ? 'bg-gray-900 border-gray-900' : 'border-gray-300 bg-gray-50'}`}>
                                {seleccionado && <CheckCircle2 size={14} className="text-white" strokeWidth={3} />}
                              </div>
                              <span className="text-sm font-bold text-gray-900">{ch.banco}</span>
                            </div>
                            <span className="text-lg font-black text-gray-900">{formatPrice(ch.importe)}</span>
                          </div>
                          
                          <div className="pl-8 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nº</span>
                              <span className="text-xs font-bold text-gray-700 font-mono">{ch.numero}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Titular</span>
                              <span className="text-xs font-semibold text-gray-600 truncate">{ch.titular}</span>
                            </div>
                            {ch.fechaPago && (
                              <div className="mt-2 inline-block">
                                <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  Vence: {new Date(ch.fechaPago).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ULTRA PROFESSIONAL STICKY FOOTER */}
        <div className="fixed bottom-0 left-0 md:left-[88px] lg:left-64 right-0 bg-gray-900 text-white shadow-[0_-10px_30px_rgba(0,0,0,0.15)] z-40">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Efectivo Depositado
                </span>
                <span className="text-xl font-bold text-white">
                  {formatPrice(Number(montoEfectivo) || 0)}
                </span>
              </div>
              <div className="text-gray-600 text-3xl font-light">+</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Total Valores ({chequesSeleccionados.length})
                </span>
                <span className="text-xl font-bold text-white">
                  {formatPrice(totalCheques)}
                </span>
              </div>
              <div className="hidden sm:block text-gray-600 text-3xl font-light mx-2">=</div>
              <div className="flex flex-col bg-black/40 px-6 py-2 rounded-md border border-gray-700">
                <span className="text-[10px] font-bold text-[#1FAE6D] uppercase tracking-widest mb-1">
                  Total de la Boleta
                </span>
                <span className="text-3xl font-black text-white leading-none">
                  {formatPrice(totalDeposito)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={mDeposito.isPending || totalDeposito <= 0}
              className="flex items-center justify-center gap-3 px-8 py-4 text-sm font-bold text-gray-900 rounded-md shadow-lg bg-[#1FAE6D] hover:bg-[#178F58] hover:text-white transition-all disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed w-full md:w-auto"
            >
              {mDeposito.isPending ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  PROCESANDO...
                </>
              ) : (
                <>
                  CONFIRMAR DEPÓSITO
                  <ArrowRight size={18} strokeWidth={3} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Depositos;
