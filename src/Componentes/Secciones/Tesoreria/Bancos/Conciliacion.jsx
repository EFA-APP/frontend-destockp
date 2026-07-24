import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldCheck, Upload, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, FileSpreadsheet, Search } from "lucide-react";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useAlertas } from "../../../../store/useAlertas";
import { useCuentaBancariaQuery } from "../../../../Backend/Tesoreria/queries/useCuentasBancarias.query";
import { useMovimientosBancariosQuery } from "../../../../Backend/Tesoreria/queries/useMovimientosBancarios.query";
import {
  useConciliarExtractoExcelMutation,
  useConciliarMovimientosManualMutation,
} from "../../../../Backend/Tesoreria/queries/useConciliacion.query";
import { formatPrice } from "../../../../utils/formatters";

const fmtFecha = (iso) =>
  iso ? new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

const hoyISO = () => new Date().toISOString().slice(0, 10);

const leerArchivoComoBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const Conciliacion = () => {
  const { codigo } = useParams();
  const { usuario } = useAuthStore();
  const codigoEmpresa = usuario?.codigoEmpresa;
  const agregarAlerta = useAlertas((s) => s.agregarAlerta);

  const { data: cuenta } = useCuentaBancariaQuery(codigo, codigoEmpresa);

  const [fechaCorte, setFechaCorte] = useState(hoyISO());
  const [seleccionados, setSeleccionados] = useState([]);
  const [resultadoExcel, setResultadoExcel] = useState(null);
  const [archivo, setArchivo] = useState(null);

  const { data, isLoading } = useMovimientosBancariosQuery(codigo, {
    estadoConciliacion: "PENDIENTE",
    limite: 100,
  });
  const pendientes = data?.data ?? [];

  const mConciliarManual = useConciliarMovimientosManualMutation();
  const mConciliarExcel = useConciliarExtractoExcelMutation();

  const toggleSeleccion = (codigoMov) => {
    setSeleccionados((prev) =>
      prev.includes(codigoMov) ? prev.filter((c) => c !== codigoMov) : [...prev, codigoMov],
    );
  };

  const handleConciliarManual = () => {
    if (seleccionados.length === 0) {
      agregarAlerta({ type: "error", message: "Seleccione al menos un movimiento" });
      return;
    }

    mConciliarManual.mutate(
      {
        codigoCuenta: codigo,
        payload: { fechaCorte, codigosMovimientos: seleccionados },
        contexto: { codigoEmpresa },
      },
      {
        onSuccess: () => {
          agregarAlerta({ type: "success", message: `${seleccionados.length} movimiento(s) conciliado(s)` });
          setSeleccionados([]);
        },
        onError: (err) =>
          agregarAlerta({ type: "error", message: err?.response?.data?.message || err.message }),
      },
    );
  };

  const handleSubirExcel = async (e) => {
    e.preventDefault();
    if (!archivo) {
      agregarAlerta({ type: "error", message: "Seleccione un archivo Excel" });
      return;
    }

    const archivoBase64 = await leerArchivoComoBase64(archivo);

    mConciliarExcel.mutate(
      {
        codigoCuenta: codigo,
        payload: { archivoBase64, nombreArchivo: archivo.name, fechaCorte },
        contexto: { codigoEmpresa },
      },
      {
        onSuccess: (resultado) => {
          setResultadoExcel(resultado);
          agregarAlerta({
            type: "success",
            message: `Extracto procesado: ${resultado.conciliados?.length || 0} conciliados de ${resultado.totalLineas || 0} líneas`,
          });
          setArchivo(null);
        },
        onError: (err) =>
          agregarAlerta({ type: "error", message: err?.response?.data?.message || err.message }),
      },
    );
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto py-8 px-6 lg:px-8 space-y-8 bg-[#F8FAFC] min-h-[calc(100vh-64px)]">
      
      {/* NAVEGACIÓN Y HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200/80">
        <div className="space-y-1">
          <Link
            to={`/panel/tesoreria/bancos/cuentas/${codigo}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Volver al Libro Banco
          </Link>
          
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-[#1FAE6D]" size={28} strokeWidth={2.5} />
            Auditoría y Conciliación
          </h1>
          <p className="text-sm font-medium text-gray-500 max-w-2xl">
            Sincronizá los movimientos registrados en el sistema con el extracto bancario real. Cuenta: <span className="font-bold text-gray-700">{cuenta?.alias || cuenta?.numeroCuenta || "..."}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: Herramientas (Excel) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900 rounded-md p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <FileSpreadsheet size={100} />
            </div>
            
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-6 relative z-10">
              <Upload size={18} className="text-[#1FAE6D]" strokeWidth={2.5} />
              Carga Masiva (Extracto)
            </h2>
            
            <form onSubmit={handleSubirExcel} className="space-y-5 relative z-10">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Fecha de corte</label>
                <input
                  type="date"
                  value={fechaCorte}
                  onChange={(e) => setFechaCorte(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-700 rounded-md text-sm font-bold text-white bg-gray-800 focus:outline-none focus:border-gray-500 transition-all shadow-sm"
                />
              </div>
              
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Archivo Excel (.xlsx, .xls)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                    className="w-full h-11 px-3 py-2.5 border border-gray-700 rounded-md text-xs font-semibold text-gray-300 bg-gray-800 file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#1FAE6D] file:text-white hover:file:bg-[#178F58] file:cursor-pointer file:transition-colors focus:outline-none"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={mConciliarExcel.isPending}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-md bg-[#1FAE6D] hover:bg-[#178F58] text-white text-sm font-bold shadow-lg shadow-[#1FAE6D]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {mConciliarExcel.isPending ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    PROCESANDO...
                  </>
                ) : (
                  <>
                    Sincronizar Extracto
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          </div>

          {resultadoExcel && (
            <div className="bg-white border border-gray-200 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.03)] overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Resultados del Proceso</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-md bg-emerald-50 border border-emerald-100">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">Conciliados (Match)</span>
                  <span className="text-xl font-black text-emerald-700">{resultadoExcel.conciliados?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-amber-50 border border-amber-100">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">Candidatos (Inciertos)</span>
                  <span className="text-xl font-black text-amber-700">{resultadoExcel.sinMatch?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-md bg-rose-50 border border-rose-100">
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-widest flex items-center gap-1">
                    <AlertTriangle size={12} strokeWidth={2.5} /> Diferencias
                  </span>
                  <span className="text-xl font-black text-rose-700">{resultadoExcel.diferencias?.length || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: Conciliación Manual (Tabla) */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-gray-200 rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex flex-col h-full overflow-hidden">
            
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-gray-400" />
                Pendientes de Conciliar
              </h2>
              
              <button
                onClick={handleConciliarManual}
                disabled={seleccionados.length === 0 || mConciliarManual.isPending}
                className="flex items-center gap-2 h-10 px-5 rounded-md bg-gray-900 text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {mConciliarManual.isPending ? (
                  <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                ) : (
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                )}
                Conciliar Manual ({seleccionados.length})
              </button>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-200">
                    <th className="px-6 py-4 w-10">
                      {/* Placeholder para checkbox general si se quiere, por ahora vacío para alinear */}
                    </th>
                    {["Fecha", "Tipo", "Concepto", "Importe"].map((col, i) => (
                      <th 
                        key={i} 
                        className={`px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap bg-gray-50/30 ${i === 3 ? "text-right" : ""}`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400 gap-4">
                          <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                          <p className="font-bold text-sm tracking-wide text-gray-500">CARGANDO PENDIENTES...</p>
                        </div>
                      </td>
                    </tr>
                  ) : pendientes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400 gap-3">
                          <CheckCircle2 size={40} strokeWidth={1} className="text-gray-300 mb-2" />
                          <p className="font-bold text-gray-600">Al día</p>
                          <p className="text-sm text-gray-500 max-w-sm mx-auto">
                            No hay movimientos pendientes de conciliar en esta cuenta.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pendientes.map((mov) => {
                      const isSelected = seleccionados.includes(mov.codigo);
                      
                      return (
                        <tr 
                          key={mov.codigo} 
                          className={`transition-colors group cursor-pointer ${isSelected ? "bg-gray-50/80" : "hover:bg-gray-50/50"}`}
                          onClick={() => toggleSeleccion(mov.codigo)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center">
                              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? "bg-gray-900 border-gray-900" : "border-gray-300 bg-white"}`}>
                                {isSelected && <CheckCircle2 size={14} className="text-white" strokeWidth={3} />}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-gray-700 whitespace-nowrap font-mono">
                              {fmtFecha(mov.fecha)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded-md">
                              {mov.tipoMovimiento?.nombre ?? `Tipo ${mov.codigoTipoMovimiento}`}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-gray-900 max-w-[250px] truncate block">
                              {mov.concepto || "Sin concepto"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`text-base font-black whitespace-nowrap tabular-nums tracking-tight ${mov.importe >= 0 ? "text-[#1FAE6D]" : "text-gray-900"}`}>
                              {mov.importe >= 0 ? "+" : ""}
                              {formatPrice(mov.importe)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conciliacion;
