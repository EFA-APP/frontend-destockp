import React, { useState } from "react";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { BalanceIcono, DescargarIcono } from "../../../../assets/Icons";
import FechaInput from "../../../UI/FechaInput/FechaInput";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { useBalanceGeneralQuery } from "../../../../Backend/Contabilidad/queries/useReportes.query";
import { PDFDownloadLink } from "@react-pdf/renderer";
import BalancePDF from "./BalancePDF";

const Balance = () => {
  const { usuario } = useAuthStore();

  // Función corregida para obtener la fecha LOCAL en formato YYYY-MM-DD
  const getHoyStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getPrimerDiaAnioStr = () => {
    return `${new Date().getFullYear()}-01-01`;
  };

  const [filtros, setFiltros] = useState({
    fechaDesde: getPrimerDiaAnioStr(),
    fechaHasta: getHoyStr(),
  });

  const { data: balance, isLoading } = useBalanceGeneralQuery({
    codigoEmpresa: usuario?.codigoEmpresa,
    ...filtros,
  });

  const handleFechaChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium animate-pulse">
          Procesando estados contables...
        </p>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-700">
      {/* Card principal */}
      <div className="rounded-2xl shadow-2xl border border-gray-700/30 bg-[var(--fill)] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-700/20 bg-gradient-to-r from-gray-50/50 to-transparent">
          <EncabezadoSeccion
            ruta={"Balance General"}
            icono={<BalanceIcono size={24} className="text-[var(--primary)]" />}
          />
        </div>

        {/* Filtros Modernos */}
        <div className="px-8 py-6 flex flex-wrap gap-6 items-end bg-gray-50/30">
          <div className="space-y-1">
            <FechaInput
              label="Desde"
              value={filtros.fechaDesde}
              onChange={(valor) => handleFechaChange("fechaDesde", valor)}
              size="sm"
            />
          </div>
          <div className="space-y-1">
            <FechaInput
              label="Hasta"
              value={filtros.fechaHasta}
              onChange={(valor) => handleFechaChange("fechaHasta", valor)}
              size="sm"
            />
          </div>

          <div className="flex-1" />

          {balance && (
            <PDFDownloadLink
              document={
                <BalancePDF
                  balance={balance}
                  empresa={{ nombre: usuario?.nombreEmpresa }}
                  filtros={filtros}
                />
              }
              fileName={`Balance_${filtros.fechaHasta}.pdf`}
              className="h-10 px-6 text-sm font-bold text-white rounded-md bg-[var(--primary)] hover:bg-[var(--primary-dark)] shadow-lg shadow-[var(--primary)]/20 transition-all flex items-center gap-2 active:scale-95 no-underline"
            >
              {({ loading }) => (
                <>
                  <DescargarIcono size={18} />
                  {loading ? "Generando..." : "Exportar PDF"}
                </>
              )}
            </PDFDownloadLink>
          )}
        </div>

        {/* Contenido en Dos Columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-8 bg-white">
          {/* COLUMNA ACTIVO */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b-2 border-blue-500/20">
              <div className="w-2 h-5 bg-blue-500 rounded-full"></div>
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">
                Activo
              </h3>
            </div>

            <div className="rounded-md border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
              {balance?.activo.items.map((item) => (
                <FilaCuenta
                  key={item.codigo}
                  label={item.nombre}
                  monto={item.saldo}
                  codigo={item.codigo}
                />
              ))}

              {balance?.activo.items.length === 0 && (
                <div className="p-10 text-center text-gray-400 italic text-sm">
                  Sin movimientos
                </div>
              )}

              <div className="bg-blue-50/50 p-4">
                <FilaTotal
                  label="TOTAL ACTIVO"
                  monto={balance?.activo.total || 0}
                  color="text-blue-600"
                />
              </div>
            </div>
          </div>

          {/* COLUMNA PASIVO + PATRIMONIO */}
          <div className="space-y-8">
            {/* PASIVO */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-orange-500/20">
                <div className="w-2 h-5 bg-orange-500 rounded-full"></div>
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">
                  Pasivo
                </h3>
              </div>
              <div className="rounded-md border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
                {balance?.pasivo.items.map((item) => (
                  <FilaCuenta
                    key={item.codigo}
                    label={item.nombre}
                    monto={item.saldo}
                    codigo={item.codigo}
                  />
                ))}
                {balance?.pasivo.items.length === 0 && (
                  <div className="p-4 text-center text-gray-400 text-xs">
                    Sin obligaciones
                  </div>
                )}
                <div className="bg-orange-50/50 p-3">
                  <FilaTotal
                    label="Total Pasivo"
                    monto={balance?.pasivo.total || 0}
                    color="text-orange-600"
                    size="sm"
                  />
                </div>
              </div>
            </div>

            {/* PATRIMONIO */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b-2 border-purple-500/20">
                <div className="w-2 h-5 bg-purple-500 rounded-full"></div>
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">
                  Patrimonio Neto
                </h3>
              </div>
              <div className="rounded-md border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
                {balance?.patrimonio.items.map((item) => (
                  <FilaCuenta
                    key={item.codigo}
                    label={item.nombre}
                    monto={item.saldo}
                    codigo={item.codigo}
                  />
                ))}
                <FilaCuenta
                  label="Resultado del Ejercicio"
                  monto={balance?.patrimonio.resultadoEjercicio || 0}
                  isSpecial
                />
                <div className="bg-purple-50/50 p-3">
                  <FilaTotal
                    label="Total Patrimonio"
                    monto={balance?.patrimonio.total || 0}
                    color="text-purple-600"
                    size="sm"
                  />
                </div>
              </div>
            </div>

            {/* SUMA FINAL PASIVO + PN */}
            <div className="p-4 bg-gray-900 rounded-md shadow-lg shadow-gray-900/20">
              <FilaTotal
                label="TOTAL PASIVO + PN"
                monto={
                  (balance?.pasivo.total || 0) +
                  (balance?.patrimonio.total || 0)
                }
                color="text-white"
              />
            </div>
          </div>
        </div>

        {/* Estado del balance Barra Inferior */}
        <div
          className={`mx-8 mb-8 p-5 rounded-2xl border-2 flex flex-col md:flex-row justify-between items-center gap-4 ${
            balance?.estaBalanceado
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${balance?.estaBalanceado ? "bg-green-400" : "bg-red-400"}`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${balance?.estaBalanceado ? "bg-green-500" : "bg-red-500"}`}
              ></span>
            </div>
            <div>
              <p
                className={`text-xs font-black uppercase tracking-widest ${balance?.estaBalanceado ? "text-green-600" : "text-red-600"}`}
              >
                Estado Contable
              </p>
              <p
                className={`text-xl font-black ${balance?.estaBalanceado ? "text-green-800" : "text-red-800"}`}
              >
                {balance?.estaBalanceado
                  ? "SITUACIÓN EQUILIBRADA"
                  : "DESCUADRE DETECTADO"}
              </p>
            </div>
          </div>

          <div className="flex gap-8 items-center bg-white/50 px-6 py-2 rounded-md border border-white">
            <div className="text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Total Activo
              </p>
              <p className="text-lg font-bold text-gray-800">
                $
                {(balance?.activo.total || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Pasivo + PN
              </p>
              <p className="text-lg font-bold text-gray-800">
                $
                {(
                  (balance?.pasivo.total || 0) +
                  (balance?.patrimonio.total || 0)
                ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Diferencia
            </p>
            <p
              className={`text-xl font-black ${balance?.estaBalanceado ? "text-green-600" : "text-red-600"}`}
            >
              $
              {Math.abs(balance?.diferencia || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ───────────── Subcomponentes ───────────── */

const FilaCuenta = ({ label, monto, codigo, isSpecial }) => (
  <div
    className={`flex justify-between items-center px-6 py-3 hover:bg-gray-50 transition-colors group ${isSpecial ? "bg-indigo-50/30" : ""}`}
  >
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-gray-700 group-hover:text-[var(--primary)] transition-colors">
        {label}
      </span>
      {codigo && (
        <span className="text-[10px] text-gray-400 font-mono">{codigo}</span>
      )}
    </div>
    <span
      className={`text-sm font-bold ${isSpecial ? "text-indigo-600" : "text-gray-900"}`}
    >
      ${monto.toLocaleString(undefined, { minimumFractionDigits: 2 })}
    </span>
  </div>
);

const FilaTotal = ({ label, monto, isFinal, color }) => (
  <div className={`flex justify-between items-center ${isFinal ? "py-1" : ""}`}>
    <span
      className={`text-sm font-black uppercase tracking-tight ${color || "text-gray-600"}`}
    >
      {label}
    </span>
    <span className={`text-lg font-black ${color || "text-gray-900"}`}>
      ${monto.toLocaleString(undefined, { minimumFractionDigits: 2 })}
    </span>
  </div>
);

export default Balance;
