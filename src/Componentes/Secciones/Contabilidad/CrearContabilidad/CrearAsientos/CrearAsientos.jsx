import React, { useState, useMemo } from "react";
import {
  AgregarIcono,
  BorrarIcono,
  GuardarIcono,
  CalculadoraIcono,
  ContableIcono,
  CalendarioIcono,
} from "../../../../../assets/Icons";
import {
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Hash,
  Tag,
  ArrowRightLeft,
} from "lucide-react";
import EncabezadoSeccion from "../../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { useAsientos } from "../../../../../Backend/hooks/Contabilidad/Asientos/useAsientos";
import { usePlanDeCuentas } from "../../../../../Backend/hooks/Contabilidad/PlanDeCuenta/usePlanDeCuentas";
import SearchableSelect from "../../../../UI/Select/SearchableSelect";
import { formatPrice } from "../../../../../utils/formatters";

const CrearAsiento = () => {
  const { agregarAsiento, isCreando } = useAsientos();
  const { cuentasImputables, isLoading: isLoadingCuentas } = usePlanDeCuentas();

  const [header, setHeader] = useState({
    fecha: new Date().toISOString().split("T")[0],
    descripcion: "",
    origen: "MANUAL",
    comprobante: "",
  });

  const [movimientos, setMovimientos] = useState([
    { id: Date.now(), cuenta: null, debe: 0, haber: 0 },
    { id: Date.now() + 1, cuenta: null, debe: 0, haber: 0 },
  ]);

  /* =========================
     CÁLCULOS
  ========================== */
  const { totalDebe, totalHaber, balance, balanceado } = useMemo(() => {
    const debe = movimientos.reduce((sum, m) => sum + Number(m.debe || 0), 0);
    const haber = movimientos.reduce((sum, m) => sum + Number(m.haber || 0), 0);
    const bal = debe - haber;
    return {
      totalDebe: debe,
      totalHaber: haber,
      balance: bal,
      balanceado: Math.abs(bal) < 0.01 && debe > 0,
    };
  }, [movimientos]);

  /* =========================
     MANEJADORES
  ========================== */
  const handleAddFila = () => {
    setMovimientos([
      ...movimientos,
      { id: Date.now(), cuenta: null, debe: 0, haber: 0 },
    ]);
  };

  const handleRemoveFila = (id) => {
    if (movimientos.length <= 1) return;
    setMovimientos(movimientos.filter((m) => m.id !== id));
  };

  const handleChangeMovimiento = (id, field, value) => {
    setMovimientos(
      movimientos.map((m) => {
        if (m.id === id) {
          const updated = { ...m, [field]: value };
          // Si edita el debe, seteamos el haber a 0 (opcional, depende de la UX)
          if (field === "debe" && Number(value) > 0) updated.haber = 0;
          if (field === "haber" && Number(value) > 0) updated.debe = 0;
          return updated;
        }
        return m;
      }),
    );
  };

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!balanceado) {
      alert("❌ El asiento no está balanceado o no tiene movimientos.");
      return;
    }

    if (!header.descripcion) {
      alert("❌ Ingrese una descripción para el asiento.");
      return;
    }

    const payload = {
      fecha: header.fecha,
      descripcion: header.descripcion,
      origenModulo: header.origen,
      referencia: header.comprobante || null,
      detalles: movimientos
        .filter((m) => m.cuenta && (m.debe > 0 || m.haber > 0))
        .map((m) => ({
          codigoCuentaContable: Number(m.cuenta),
          debe: Number(m.debe || 0),
          haber: Number(m.haber || 0),
        })),
    };

    if (payload.detalles.length < 2) {
      alert("❌ Un asiento contable requiere al menos 2 movimientos.");
      return;
    }

    try {
      await agregarAsiento(payload);
      // Resetear si tiene éxito
      setMovimientos([
        { id: Date.now(), cuenta: null, debe: 0, haber: 0 },
        { id: Date.now() + 1, cuenta: null, debe: 0, haber: 0 },
      ]);
      setHeader((prev) => ({ ...prev, descripcion: "", comprobante: "" }));
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoadingCuentas) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-100/50">
      <EncabezadoSeccion
        ruta="Crear Asiento Manual"
        icono={
          <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-md flex items-center justify-center text-[var(--primary)] shadow-inner">
            <CalculadoraIcono size={20} strokeWidth={2.5} />
          </div>
        }
        volver
        redireccionAnterior="/panel/contabilidad/asientos"
      />

      <div className="flex-1 px-8 pb-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* COLUMNA IZQUIERDA: MOVIMIENTOS */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              <div className="bg-white border border-gray-200 rounded-md shadow-sm ">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-md flex items-center justify-center text-emerald-600">
                      <ArrowRightLeft size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
                        Cuerpo del Asiento
                      </h3>
                      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-tighter">
                        Partida Doble: El total del debe debe igualar al haber
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleAddFila}
                    className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
                  >
                    <Plus size={14} />
                    Agregar Línea
                  </button>
                </div>

                <div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-gray-100">
                        <th className="px-6 py-4 text-[11px] font-black text-[var(--text-theme)] uppercase tracking-widest w-1/2">
                          Cuenta Contable
                        </th>
                        <th className="px-6 py-4 text-[11px] font-black text-[var(--text-theme)] uppercase tracking-widest text-right">
                          Debe
                        </th>
                        <th className="px-6 py-4 text-[11px] font-black text-[var(--text-theme)] uppercase tracking-widest text-right">
                          Haber
                        </th>
                        <th className="px-6 py-4 w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-slate-50/50">
                      {movimientos.map((m, index) => (
                        <tr
                          key={m.id}
                          className="group hover:bg-slate-100/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="bg-white border border-slate-200 rounded-md shadow-sm focus-within:border-[var(--primary)] focus-within:ring-4 focus-within:ring-[var(--primary)]/5 transition-all">
                              <SearchableSelect
                                value={m.cuenta}
                                onChange={(e) =>
                                  handleChangeMovimiento(
                                    m.id,
                                    "cuenta",
                                    e.target.value,
                                  )
                                }
                                options={cuentasImputables}
                                placeholder="Seleccione una cuenta..."
                                className="border-none shadow-none focus:ring-0"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative bg-white border border-slate-200 rounded-md shadow-sm focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all">
                              <input
                                type="number"
                                value={m.debe || ""}
                                onChange={(e) =>
                                  handleChangeMovimiento(
                                    m.id,
                                    "debe",
                                    e.target.value,
                                  )
                                }
                                className="w-full text-right bg-transparent focus:outline-none font-mono font-black text-[14px] text-emerald-600 px-3 py-2.5 transition-all"
                                placeholder="0.00"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative bg-white border border-slate-200 rounded-md shadow-sm focus-within:border-rose-400 focus-within:ring-4 focus-within:ring-rose-500/5 transition-all">
                              <input
                                type="number"
                                value={m.haber || ""}
                                onChange={(e) =>
                                  handleChangeMovimiento(
                                    m.id,
                                    "haber",
                                    e.target.value,
                                  )
                                }
                                className="w-full text-right bg-transparent focus:outline-none font-mono font-black text-[14px] text-rose-600 px-3 py-2.5 transition-all"
                                placeholder="0.00"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleRemoveFila(m.id)}
                              className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                              title="Eliminar fila"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {movimientos.length === 0 && (
                    <div className="p-12 text-center text-[var(--text-theme)] italic text-sm">
                      No hay líneas en este asiento
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: HEADER Y TOTALES */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* CARD DE CABECERA */}
              <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                <div className="p-5 border-b border-gray-100 bg-white">
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} className="text-[var(--primary)]" />
                    Datos del Asiento
                  </h3>
                </div>
                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[var(--text-theme)] uppercase tracking-widest ml-1 flex items-center gap-2">
                      <CalendarioIcono size={12} /> Fecha Contable
                    </label>
                    <input
                      type="date"
                      name="fecha"
                      value={header.fecha}
                      onChange={handleHeaderChange}
                      className="w-full bg-white border border-slate-200 rounded-md px-4 py-2.5 text-base font-bold focus:ring-4 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] focus:outline-none transition-all shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-[var(--text-theme)] uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Tag size={12} /> Descripción / Glosa
                    </label>
                    <textarea
                      name="descripcion"
                      value={header.descripcion}
                      onChange={handleHeaderChange}
                      rows={3}
                      placeholder="Ej: Pago de alquiler oficina central mes de Mayo"
                      className="w-full bg-white border border-slate-200 rounded-md px-4 py-2.5 text-base font-bold focus:ring-4 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] focus:outline-none transition-all resize-none shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-[var(--text-theme)] uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Tag size={12} /> Origen
                      </label>
                      <select
                        name="origen"
                        value={header.origen}
                        onChange={handleHeaderChange}
                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-2.5 text-[12px] font-black uppercase tracking-wider focus:ring-4 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] focus:outline-none transition-all shadow-sm"
                      >
                        <option value="MANUAL">Manual</option>
                        <option value="VENTA">Venta</option>
                        <option value="COMPRA">Compra</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-[var(--text-theme)] uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Hash size={12} /> Referencia
                      </label>
                      <input
                        type="text"
                        name="comprobante"
                        value={header.comprobante}
                        onChange={handleHeaderChange}
                        placeholder="N° Comprobante"
                        className="w-full bg-white border border-slate-200 rounded-md px-4 py-2.5 text-[12px] font-bold focus:ring-4 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] focus:outline-none transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD DE TOTALES */}
              <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <span className="text-[11px] font-black text-[var(--text-theme)] uppercase tracking-widest">
                      Total Debe
                    </span>
                    <span className="text-base font-black text-emerald-600 font-mono">
                      {formatPrice(totalDebe)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <span className="text-[11px] font-black text-[var(--text-theme)] uppercase tracking-widest">
                      Total Haber
                    </span>
                    <span className="text-base font-black text-rose-600 font-mono">
                      {formatPrice(totalHaber)}
                    </span>
                  </div>

                  <div
                    className={`p-4 rounded-md flex flex-col items-center justify-center gap-1 transition-all ${
                      balanceado
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {balanceado ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <AlertCircle size={16} />
                      )}
                      <span className="text-[11px] font-black uppercase tracking-widest">
                        {balanceado
                          ? "Asiento Balanceado"
                          : "Asiento Fuera de Balance"}
                      </span>
                    </div>
                    {!balanceado && totalDebe > 0 && (
                      <span className="text-[10px] font-bold opacity-70">
                        Diferencia: {formatPrice(Math.abs(balance))}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isCreando || !balanceado}
                    className="w-full flex items-center justify-center gap-2 bg-[var(--primary)] text-white py-4 rounded-md text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-[var(--primary)]/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none mt-2"
                  >
                    <GuardarIcono size={18} />
                    {isCreando ? "Registrando..." : "Registrar Asiento"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearAsiento;
