import React from "react";
import * as XLSX from "xlsx";
import ModalPacientesNoEncontrados from "./ModalPacientesNoEncontrados";
import ModalDetalleSaldo from "./ModalDetalleSaldo";
import {
  recalcularFilasPorMargen,
  calcularTotales,
} from "./reglaComunCalculo.utils";

// Mejora obra-sociales-margen-editable: default de respaldo si por algún
// motivo la previsualización no trajo margenGanancia (compatibilidad con
// una respuesta vieja del backend) — mismo default que usa
// PrevisualizarImportacionObraSocialCasoDeUso del lado del servidor.
const MARGEN_GANANCIA_DEFAULT = 15;

const PasoPrevisualizacion = ({
  datosProcesados,
  onVolver,
  onImportar,
  isIntegrated = false,
}) => {
  const filasOriginales = datosProcesados?.filas || [];
  const redondeoEntero = datosProcesados?.redondeoEntero ?? false;

  // R3 (mejora obra-sociales-margen-editable): el input arranca precargado
  // con el margen real que ya se usó para ESTA previsualización — NO se
  // guarda como nuevo default de la Obra Social, es un ajuste puntual de
  // esta importación (ver ConfiguracionCampoContacto, que no se toca acá).
  const [margenGanancia, setMargenGanancia] = React.useState(
    datosProcesados?.margenGanancia ?? MARGEN_GANANCIA_DEFAULT,
  );

  // Recálculo INSTANTÁNEO client-side (R1, R4): se recalculan las 4
  // columnas derivadas de TODAS las filas (no solo la página visible, la
  // paginación es solo de presentación) cada vez que cambia el margen.
  // Esta es la fuente de verdad para todo lo que se renderiza y para lo
  // que se manda al confirmar — no el prop original `datosProcesados.filas`.
  const filas = React.useMemo(
    () => recalcularFilasPorMargen(filasOriginales, margenGanancia, redondeoEntero),
    [filasOriginales, margenGanancia, redondeoEntero],
  );

  const validas = filas.filter((f) => f.se_factura);
  const invalidas = filas.filter((f) => !f.se_factura);

  // R4: los totales del header dependen de se_factura/total_facturar por
  // fila, así que se recalculan en el mismo useMemo que las filas.
  const totales = React.useMemo(() => calcularTotales(filas), [filas]);

  // Ganancia total (no forma parte de `totales`, que replica 1:1 la forma
  // que ya devuelve el backend en la previsualización — este stat es
  // solo de presentación, para que el efecto de cambiar el margen se vea
  // también agregado, no solo fila por fila).
  const gananciaTotal = React.useMemo(
    () => filas.reduce((acc, f) => acc + (f.ganancia || 0), 0),
    [filas],
  );

  // Feature 27 (obra-sociales-facturacion-por-paciente): separar, de las
  // filas facturables, las que matchean un Contacto existente por
  // documento (R1) de las que no (R4). `contactoEncontrado` viaja ya
  // adjunto a cada fila desde la previsualización del backend.
  const matcheadas = validas.filter((f) => f.contactoEncontrado);
  const noEncontradas = validas.filter((f) => !f.contactoEncontrado);

  // R8: opt-in explícito, no opt-out — mientras el usuario no marque una
  // fila sin match, se trata como NO autorizada a crear.
  const [decisionesCrear, setDecisionesCrear] = React.useState({});

  const toggleDecisionCrear = (idCliente) => {
    setDecisionesCrear((prev) => ({ ...prev, [idCliente]: !prev[idCliente] }));
  };

  const marcarTodos = (marcar) => {
    const siguiente = {};
    noEncontradas.forEach((f) => {
      siguiente[f.id_cliente] = marcar;
    });
    setDecisionesCrear(siguiente);
  };

  const todosMarcados =
    noEncontradas.length > 0 &&
    noEncontradas.every((f) => decisionesCrear[f.id_cliente]);

  // R9: conteo separado de "a facturar" (matcheadas + marcadas para crear)
  // vs "se omitirán" (no matcheadas y no marcadas), recalculado en vivo.
  const noEncontradasMarcadas = noEncontradas.filter(
    (f) => decisionesCrear[f.id_cliente],
  );
  const noEncontradasOmitidas = noEncontradas.filter(
    (f) => !decisionesCrear[f.id_cliente],
  );
  const cantidadAFacturar = matcheadas.length + noEncontradasMarcadas.length;
  const cantidadAOmitir = noEncontradasOmitidas.length;

  const handleConfirmarImportar = () => {
    // T13: cada fila de `validas` viaja con `crearComoClie` resuelto desde
    // `decisionesCrear` (false para las matcheadas, irrelevante pero
    // explícito).
    const filasConDecision = validas.map((f) => ({
      ...f,
      crearComoClie: f.contactoEncontrado
        ? false
        : !!decisionesCrear[f.id_cliente],
    }));
    onImportar(filasConDecision);
  };

  const handleDescargarErrores = () => {
    if (invalidas.length === 0) return;

    // Crear un nuevo workbook solo con los saldos a favor o no facturables
    const ws = XLSX.utils.json_to_sheet(
      invalidas.map((inv) => ({
        ID_Cliente: inv.id_cliente,
        Paciente: inv.nombre,
        DNI: inv.documento,
        Plan: inv.plan,
        SaldoAFavor: inv.saldo_a_favor,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Saldos_A_Favor");
    XLSX.writeFile(wb, `Saldos_A_Favor_OS_${new Date().getTime()}.xlsx`);
  };

  const [paginaActual, setPaginaActual] = React.useState(1);
  const [modalPacientesAbierto, setModalPacientesAbierto] = React.useState(
    () => noEncontradas.length > 0,
  );
  // Bugfix: "Revisar Saldo" no tenía onClick, no hacía nada al apretarlo.
  const [filaSaldoSeleccionada, setFilaSaldoSeleccionada] = React.useState(null);
  const itemsPorPagina = 10;

  const totalPaginas = Math.ceil(filas.length / itemsPorPagina);
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const filasPaginadas = filas.slice(
    indiceInicio,
    indiceInicio + itemsPorPagina,
  );

  return (
    <>
      <div className="flex flex-col h-full bg-white rounded-xl">
        {/* HEADER SECTION (Wizard only) */}
        {!isIntegrated && (
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button
                onClick={onVolver}
                className="w-8 h-8 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] flex items-center justify-center hover:bg-[var(--color-brand-primary)]/20 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h2 className="text-[28px] font-black text-gray-900 tracking-tight">
                Previsualizar Resultados
              </h2>
            </div>

            <div className="flex items-center gap-6 text-[14px] font-semibold text-gray-500">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Archivo:{" "}
                <span className="text-[var(--color-brand-primary)] cursor-pointer hover:underline">
                  {datosProcesados?.archivoNombre}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Total Facturable:{" "}
                <span className="text-gray-900">
                  $
                  {totales.montoTotalFacturar.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* HEADER INFO FOR INTEGRATED LAYOUT */}
        {isIntegrated && (
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-gray-100 gap-4">
            <div className="flex items-center gap-2 text-[14px] text-gray-500 font-semibold">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Archivo: </span>
              <span className="text-[var(--color-brand-primary)] font-bold">
                {datosProcesados?.archivoNombre}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-emerald-200/60 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Facturables: <span>{totales.facturables}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-amber-200/60 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Saldos A Favor: <span>{totales.saldoAFavor}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-blue-200/60 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Total a Facturar:{" "}
                <span>
                  $
                  {totales.montoTotalFacturar.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-purple-200/60 bg-purple-50 text-purple-700 text-[10px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Ganancia Total:{" "}
                <span>
                  $
                  {gananciaTotal.toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TOOLBAR */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <h3 className="text-[22px] font-black text-gray-900">
              {filas.length} items
            </h3>

            {/* Mejora obra-sociales-margen-editable: recálculo instantáneo
              client-side de ganancia/total_facturar/saldo_a_favor/se_factura
              de TODAS las filas — ajuste puntual de esta importación, no
              modifica el margen configurado en la Obra Social. */}
            <label className="flex items-center gap-2 text-[13px] font-bold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              <span className="text-gray-500">Margen de ganancia</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={margenGanancia}
                onChange={(e) =>
                  setMargenGanancia(
                    e.target.value === "" ? 0 : Number(e.target.value),
                  )
                }
                className="w-16 bg-transparent text-right font-black text-gray-900 focus:outline-none"
              />
              <span className="text-gray-500">%</span>
            </label>
          </div>

          <div className="flex items-center gap-4">
            {/* PAGINATION CONTROLS */}
            {totalPaginas > 1 && (
              <div className="flex items-center gap-3 text-[14px] font-bold text-gray-600">
                <button
                  onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="text-[var(--color-brand-primary)] disabled:text-gray-300 hover:text-[var(--color-brand-hover)] transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <span>
                  {paginaActual} / {totalPaginas}
                </span>
                <button
                  onClick={() =>
                    setPaginaActual((p) => Math.min(totalPaginas, p + 1))
                  }
                  disabled={paginaActual === totalPaginas}
                  className="text-[var(--color-brand-primary)] disabled:text-gray-300 hover:text-[var(--color-brand-hover)] transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* EXPORT BUTTON */}
            {invalidas.length > 0 && (
              <button
                onClick={handleDescargarErrores}
                className="flex items-center gap-2 text-[14px] font-bold bg-[#48C479] text-white px-5 py-2 rounded-full hover:bg-[#3ba865] transition-colors shadow-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Exportar Errores
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-[12px] font-black uppercase text-gray-800">
                  Estado / Fecha
                </th>
                <th className="px-4 py-3 text-[12px] font-black uppercase text-gray-800">
                  Paciente
                </th>
                <th className="px-4 py-3 text-[12px] font-black uppercase text-gray-800">
                  Total
                </th>
                <th className="px-4 py-3 text-[12px] font-black uppercase text-gray-800">
                  Ganancia
                </th>
                <th className="px-4 py-3 text-[12px] font-black uppercase text-gray-800">
                  Cliente ID
                </th>
                <th className="px-4 py-3 text-[12px] font-black uppercase text-gray-800">
                  Base / Aporte
                </th>
                <th className="px-4 py-3 text-[12px] font-black uppercase text-gray-800 text-right">
                  Saldo a Favor
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filasPaginadas.map((f, i) => (
                <tr
                  key={indiceInicio + i}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {f.se_factura && !f.contactoEncontrado ? (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 whitespace-nowrap">
                          Sin Registro
                        </span>
                      ) : (
                        <div
                          className={`w-2 h-2 rounded-sm ${f.se_factura ? "bg-[#48C479]" : "bg-[#EF4444]"}`}
                        />
                      )}
                      <span className="text-[13px] font-bold text-gray-500">
                        {new Date().toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[14px] font-bold text-[#3B82F6] cursor-pointer hover:underline">
                    {f.nombre || "-"}
                  </td>
                  <td className="px-4 py-4 text-[14px] font-black text-gray-900">
                    $
                    {(f.total_facturar || 0).toLocaleString("es-AR", {
                      minimumFractionDigits: 0,
                    })}
                  </td>
                  <td className="px-4 py-4 text-[13px] font-bold text-purple-600">
                    {f.se_factura
                      ? `$${(f.ganancia || 0).toLocaleString("es-AR", { minimumFractionDigits: 0 })}`
                      : "—"}
                  </td>
                  <td className="px-4 py-4 text-[13px] font-semibold text-gray-400">
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-yellow-500 transition-opacity"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      {f.id_cliente}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[13px] font-bold text-gray-500">
                    <span className="text-gray-900">
                      $
                      {(f.base_calculo || 0).toLocaleString("es-AR", {
                        minimumFractionDigits: 0,
                      })}
                    </span>
                    <span className="text-gray-300 mx-1">/</span>
                    <span className="text-gray-400">
                      $
                      {(f.aporte || 0).toLocaleString("es-AR", {
                        minimumFractionDigits: 0,
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {f.saldo_a_favor > 0 ? (
                      <button
                        type="button"
                        onClick={() => setFilaSaldoSeleccionada(f)}
                        className="text-[12px] font-bold text-blue-500 cursor-pointer hover:underline"
                      >
                        Revisar Saldo
                      </button>
                    ) : (
                      <span className="text-[12px] font-bold text-gray-300">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filasPaginadas.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-gray-400 font-semibold text-[14px]"
                  >
                    No hay registros para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PACIENTES NO ENCONTRADOS (R4-R9): bloque separado, no mezclado con
          la tabla principal. Solo se muestra si hay filas facturables sin
          match por documento. */}
        {noEncontradas.length > 0 && (
          <div className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h4 className="text-[15px] font-black text-amber-900">
                Pacientes no encontrados ({noEncontradas.length})
              </h4>
              <p className="text-[13px] font-bold text-amber-800">
                {cantidadAFacturar} se facturarán, {cantidadAOmitir} quedarán
                omitidas
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalPacientesAbierto(true)}
              className="px-3 py-1.5 rounded-md border border-amber-300 bg-amber-50 hover:bg-amber-100 text-[10px] uppercase font-bold text-amber-800 transition-colors"
            >
              Revisar pacientes
            </button>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="mt-6 flex items-center justify-end">
          <button
            onClick={handleConfirmarImportar}
            disabled={validas.length === 0}
            className="bg-[#1FAE6D] hover:bg-[#178F58] text-white px-6 py-2.5 rounded-md font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm cursor-pointer"
          >
            Confirmar e Importar
          </button>
        </div>
      </div>

      {modalPacientesAbierto && (
        <ModalPacientesNoEncontrados
          noEncontradas={noEncontradas}
          decisionesCrear={decisionesCrear}
          toggleDecisionCrear={toggleDecisionCrear}
          marcarTodos={marcarTodos}
          todosMarcados={todosMarcados}
          cantidadAFacturar={cantidadAFacturar}
          cantidadAOmitir={cantidadAOmitir}
          onClose={() => setModalPacientesAbierto(false)}
        />
      )}

      {filaSaldoSeleccionada && (
        <ModalDetalleSaldo
          fila={filaSaldoSeleccionada}
          onClose={() => setFilaSaldoSeleccionada(null)}
        />
      )}
    </>
  );
};

export default PasoPrevisualizacion;
