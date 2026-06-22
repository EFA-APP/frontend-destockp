import { useEffect, useRef, useState } from "react";
import { Link } from "lucide-react";
import {
  ArcaIcono,
  BorrarIcono,
  ComprobanteIcono,
  FechaIcono,
  PersonaIcono,
  VentasIcono,
} from "../../../../assets/Icons";
import { useCabeceraComprobante } from "../../../../Backend/Comprobantes/useCabeceraComprobante";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";

// Mapeos cortos solo para mostrar etiquetas más legibles en la UI.
// Si llega un código que no está mapeado, se muestra el código tal cual.
const LABELS_CONDICION_IVA = {
  CF: "Consumidor Final",
  RI: "Responsable Inscripto",
  EX: "Exento",
  MT: "Monotributo",
};

const LABELS_TIPO_ENTIDAD = {
  ALUM: "Alumno",
  PADR: "Padre / Tutor",
  PROV: "Proveedor",
  CLI: "Cliente",
};

const getNombreCompleto = (contacto) => {
  if (!contacto) return "";
  if (contacto.razonSocial?.trim()) return contacto.razonSocial;
  return `${contacto.nombre || ""} ${contacto.apellido || ""}`.trim();
};

const CabeceraComprobante = ({ tipoOperacion }) => {
  const {
    fechaInicio,
    setFechaInicio,
    fechaVencimiento,
    setFechaVencimiento,
    esFiscal,
    setEsFiscal,
    esPresupuesto,
    setEsPresupuesto,
    unidadesNegocio,
    busquedaCliente,
    setBusquedaCliente,
    clienteSeleccionado,
    setClienteSeleccionado,
    tipoComprobante,
    setTipoComprobante,
    comprobanteAsociado,
    setComprobanteAsociado,
    esNotaAsociada,
  } = useCabeceraComprobante();

  // Control local para mostrar/ocultar los resultados mientras se busca
  const [mostrarResultados, setMostrarResultados] = useState(false);
  // Índice del resultado resaltado por teclado (-1 = ninguno resaltado)
  const [indiceActivo, setIndiceActivo] = useState(-1);
  const refsResultados = useRef([]);

  const { contactos: clientesRaw } = useContactos({
    tipoEntidad: tipoOperacion === "EGRESO" ? "PROV" : "",
    busqueda: busquedaCliente,
    limite: 10,
  });

  const enteFacturacion = clienteSeleccionado?.enteFacturacion || null;

  const limpiarSeleccion = () => {
    setClienteSeleccionado(null);
    setBusquedaCliente("");
    setMostrarResultados(false);
  };

  const seleccionarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setBusquedaCliente(getNombreCompleto(cliente));
    setMostrarResultados(false);
    setIndiceActivo(-1);
  };

  // Cada vez que cambian los resultados, volvemos a empezar sin nada resaltado
  useEffect(() => {
    setIndiceActivo(-1);
  }, [clientesRaw]);

  // Mantenemos visible el item resaltado cuando se navega con flechas
  useEffect(() => {
    if (indiceActivo < 0) return;
    refsResultados.current[indiceActivo]?.scrollIntoView({
      block: "nearest",
    });
  }, [indiceActivo]);

  const manejarTeclasBuscador = (e) => {
    if (!mostrarResultados || !clientesRaw || clientesRaw.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceActivo((prev) => (prev < clientesRaw.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceActivo((prev) => (prev > 0 ? prev - 1 : clientesRaw.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (indiceActivo >= 0 && clientesRaw[indiceActivo]) {
        seleccionarCliente(clientesRaw[indiceActivo]);
      }
    } else if (e.key === "Escape") {
      setMostrarResultados(false);
      setIndiceActivo(-1);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 border border-gray-200 ">
      {/* SECCIÓN 1: FECHAS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pb-3 border-b border-gray-700/20 rounded-md w-full">
        {/* FECHA INICIO */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="datepicker-range-start"
            className="flex items-center gap-2 text-md font-semibold uppercase tracking-wider text-gray-900"
          >
            <FechaIcono size={20} className="text-[var(--primary)]" />
            Fecha Inicio
          </label>
          <div className="relative">
            <input
              id="datepicker-range-start"
              name="start"
              type="date"
              className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md font-semibold shadow-sm transition-colors duration-200 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
        </div>

        {/* FECHA VENCIMIENTO */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="datepicker-range-end"
            className="flex items-center gap-2 text-md font-semibold uppercase tracking-wider text-gray-900"
          >
            <FechaIcono size={20} className="text-[var(--primary)]" />
            Fecha Vencimiento
          </label>
          <div className="relative">
            <input
              id="datepicker-range-end"
              name="end"
              type="date"
              className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md font-semibold shadow-sm transition-colors duration-200 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: CONFIGURACIÓN Y TIPO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pb-3 border-b border-gray-700/20 rounded-md w-full">
        {/* NATURALEZA */}
        <div className="flex flex-col gap-2">
          <span className="text-md font-semibold uppercase tracking-wider text-gray-900">
            Naturaleza
          </span>
          <div className="flex bg-gray-100 p-1 rounded-md border border-gray-200 h-[46px] items-center">
            <button
              type="button"
              onClick={() => setEsFiscal(false)}
              className={`flex-1 py-1.5 text-md font-semibold uppercase rounded transition-all duration-300 ${!esFiscal ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-500 hover:text-gray-700"}`}
            >
              Interno
            </button>
            <button
              type="button"
              onClick={() => setEsFiscal(true)}
              className={`flex-1 py-1.5 text-md font-semibold uppercase rounded transition-all duration-300 ${esFiscal ? "bg-blue-500 text-white shadow-sm border border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              Fiscal (ARCA)
            </button>
          </div>
        </div>

        {/* PRESUPUESTO SWITCH */}
        <div className="flex flex-col gap-2">
          <span className="text-md font-semibold uppercase tracking-wider text-gray-900">
            ¿Es Presupuesto?
          </span>
          <div className="flex items-center h-[46px]">
            <button
              type="button"
              onClick={() => setEsPresupuesto(!esPresupuesto)}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                esPresupuesto ? "bg-[var(--primary)]" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  esPresupuesto ? "translate-x-7" : "translate-x-0"
                }`}
              />
            </button>
            <span className="ml-3 text-md font-semibold text-gray-700">
              {esPresupuesto ? "Activo (Sin Validez)" : "Inactivo (Oficial)"}
            </span>
          </div>
        </div>

        {/* TIPO COMPROBANTE */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="tipo-comprobante"
            className="flex items-center gap-2 text-md font-semibold uppercase tracking-wider text-gray-900"
          >
            <ComprobanteIcono size={16} className="text-[var(--primary)]" />
            Tipo Comprobante
          </label>
          <select
            id="tipo-comprobante"
            value={tipoComprobante}
            onChange={(e) => setTipoComprobante(e.target.value)}
            className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md font-semibold shadow-sm transition-colors duration-200 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
          >
            {esFiscal ? (
              <>
                <TieneAccion accion="FACTURA_A">
                  <option value="1">Factura A</option>
                </TieneAccion>
                <TieneAccion accion="FACTURA_B">
                  <option value="6">Factura B</option>
                </TieneAccion>
                <TieneAccion accion="FACTURA_C">
                  <option value="11">Factura C</option>
                </TieneAccion>
                <TieneAccion accion="NOTA_CREDITO_A">
                  <option value="3">Nota Credito A</option>
                </TieneAccion>
                <TieneAccion accion="NOTA_CREDITO_B">
                  <option value="8">Nota Credito B</option>
                </TieneAccion>
                <TieneAccion accion="NOTA_CREDITO_C">
                  <option value="13">Nota Credito C</option>
                </TieneAccion>
                <TieneAccion accion="NOTA_DEBITO_A">
                  <option value="2">Nota Debito A</option>
                </TieneAccion>
                <TieneAccion accion="NOTA_DEBITO_B">
                  <option value="7">Nota Debito B</option>
                </TieneAccion>
                <TieneAccion accion="NOTA_DEBITO_C">
                  <option value="12">Nota Debito C</option>
                </TieneAccion>
              </>
            ) : (
              <>
                <TieneAccion accion="FACTURA_INTERNA">
                  <option value="991">Factura Interna</option>
                </TieneAccion>
                <TieneAccion accion="NOTA_CREDITO_INTERNA">
                  <option value="994">Nota Credito Interna</option>
                </TieneAccion>
                <TieneAccion accion="NOTA_DEBITO_INTERNA">
                  <option value="995">Nota Debito Interna</option>
                </TieneAccion>
              </>
            )}
          </select>
        </div>
      </div>

      {/* SECCION 3: UNIDAD NEGOCIO y CONDICION COMPROBANTE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pb-3 border-b border-gray-700/20 rounded-md w-full">
        {/* CONDICION COMPROBANTE */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="condicion-comprobante"
            className="flex items-center gap-2 text-md font-semibold uppercase tracking-wider text-gray-900"
          >
            <ArcaIcono size={20} className="text-[var(--primary)]" />
            Condicion Comprobante
          </label>
          <select
            id="condicion-comprobante"
            className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-md font-semibold shadow-sm transition-colors duration-200 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
          >
            <option value="CONTADO">CONTADO</option>
            <option value="CUENTA_CORRIENTE">CUENTA CORRIENTE</option>
          </select>
        </div>

        {/* UNIDAD DE NEGOCIO */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="unidad-negocio"
            className="flex items-center gap-2 text-md font-semibold uppercase tracking-wider text-gray-900"
          >
            <VentasIcono size={20} className="text-[var(--primary)]" />
            Unidad de Negocio
          </label>
          <select
            id="unidad-negocio"
            className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-md font-semibold shadow-sm transition-colors duration-200 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
          >
            {unidadesNegocio?.map((unidadNegocio) => (
              <option
                key={unidadNegocio.codigoSecuencial}
                value={unidadNegocio.codigoSecuencial}
              >
                {unidadNegocio.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECCION 4: SELECCION DE CLIENTES */}
      <div className="flex flex-col gap-1.5 relative pb-3 border-b border-gray-700/20 rounded-md w-full">
        <label
          htmlFor="buscador-cliente"
          className="flex items-center gap-2 text-md font-semibold uppercase tracking-wider text-gray-900"
        >
          <PersonaIcono size={20} className="text-[var(--primary)]" />
          {tipoOperacion === "EGRESO" ? "Buscar Proveedor" : "Buscar Cliente"}
        </label>

        {clienteSeleccionado ? (
          // ───────────────── TARJETA DE CONTACTO SELECCIONADO ─────────────────
          <div className="flex rounded-md border border-gray-200 overflow-hidden w-full justify-start gap-3 ">
            {/* Bloque 1: la entidad encontrada en la búsqueda (alumno, proveedor, etc.) */}
            <div className="flex items-start justify-between gap-3 p-3 border-l-4 border-[var(--primary)] bg-white rounded-md">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex items-center justify-center h-9 w-9 rounded-full bg-[var(--primary)]/10 shrink-0">
                  <PersonaIcono size={18} className="text-[var(--primary)]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-900 uppercase">
                      {getNombreCompleto(clienteSeleccionado)}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--primary)] bg-[var(--primary)]/10 px-1.5 py-0.5 rounded">
                      {LABELS_TIPO_ENTIDAD[clienteSeleccionado.tipoEntidad] ||
                        clienteSeleccionado.tipoEntidad}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-md text-gray-700 flex-wrap">
                    {clienteSeleccionado.documento && (
                      <span>Doc: {clienteSeleccionado.documento}</span>
                    )}
                    {clienteSeleccionado.condicionIva && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span>
                          {LABELS_CONDICION_IVA[
                            clienteSeleccionado.condicionIva
                          ] || clienteSeleccionado.condicionIva}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bloque 2: a quién se le factura realmente (si tiene ente facturación) */}
            {enteFacturacion && (
              <div className="flex items-start gap-3 p-3 pl-6 bg-blue-50/60 border-t border-dashed border-gray-200 rounded-md">
                <div className="flex items-center justify-center h-9 w-9 rounded-full bg-blue-100 shrink-0">
                  <ArcaIcono size={16} className="text-blue-600" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                    Se factura a
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-900 uppercase">
                      {getNombreCompleto(enteFacturacion)}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                      {LABELS_TIPO_ENTIDAD[enteFacturacion.tipoEntidad] ||
                        enteFacturacion.tipoEntidad}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-md text-gray-700 flex-wrap">
                    {enteFacturacion.documento && (
                      <span>CUIT/Doc: {enteFacturacion.documento}</span>
                    )}
                    {enteFacturacion.condicionIva && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span>
                          {LABELS_CONDICION_IVA[enteFacturacion.condicionIva] ||
                            enteFacturacion.condicionIva}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={limpiarSeleccion}
              className=" text-md font-semibold text-red-500 hover:text-red-700 transition-colors shrink-0 p-2   cursor-pointer bg-red-500/20 hover:bg-red-700/30 rounded-md"
            >
              <BorrarIcono size={20} />
            </button>
          </div>
        ) : (
          // ───────────────── BUSCADOR (sin selección aún) ─────────────────
          <div className="relative w-full">
            <input
              id="buscador-cliente"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md font-semibold shadow-sm transition-colors duration-200 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 placeholder:text-gray-500"
              placeholder={
                tipoOperacion === "EGRESO"
                  ? "Escribe el nombre del proveedor..."
                  : "Escribe el nombre del cliente..."
              }
              value={busquedaCliente || ""}
              onChange={(e) => {
                setBusquedaCliente(e.target.value);
                setMostrarResultados(true);
              }}
              onFocus={() => setMostrarResultados(true)}
              onKeyDown={manejarTeclasBuscador}
              onBlur={() => setTimeout(() => setMostrarResultados(false), 200)} // Delay pequeño para permitir clics en la lista
            />

            {/* Menú flotante predictivo con los resultados de clientesRaw */}
            {mostrarResultados && clientesRaw && clientesRaw.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg z-50">
                {clientesRaw.map((cliente, index) => (
                  <button
                    key={cliente.id || cliente.codigoSecuencial}
                    ref={(el) => (refsResultados.current[index] = el)}
                    type="button"
                    onClick={() => seleccionarCliente(cliente)}
                    onMouseEnter={() => setIndiceActivo(index)}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-b border-gray-100 last:border-0 ${
                      index === indiceActivo
                        ? "bg-[var(--primary)]/10 text-gray-900"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold">
                        {getNombreCompleto(cliente)}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        {LABELS_TIPO_ENTIDAD[cliente.tipoEntidad] ||
                          cliente.tipoEntidad}
                      </span>
                    </div>
                    {cliente.documento && (
                      <span className="text-md text-gray-700">
                        Doc: {cliente.documento}
                      </span>
                    )}
                    {cliente.enteFacturacion && (
                      <div className="text-[11px] text-blue-600 mt-0.5">
                        Se factura a:{" "}
                        {getNombreCompleto(cliente.enteFacturacion)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECCIÓN 5: COMPROBANTE ASOCIADO (solo para Nota de Crédito / Débito) */}
      {esNotaAsociada && (
        <div className="flex flex-col gap-3 pb-3 border-b border-gray-700/20 rounded-md w-full">
          <label className="flex items-center gap-2 text-md font-semibold uppercase tracking-wider text-gray-900">
            <Link size={16} className="text-[var(--primary)]" />
            Comprobante Asociado
          </label>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide -mt-1">
            Vinculá el comprobante original que origina esta nota
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Nro. Comprobante Origen
              </span>
              <input
                type="number"
                min="1"
                value={comprobanteAsociado.numeroComprobanteOrigen}
                onChange={(e) =>
                  setComprobanteAsociado((p) => ({
                    ...p,
                    numeroComprobanteOrigen: e.target.value,
                  }))
                }
                placeholder="00000001"
                className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md font-semibold shadow-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Punto de Venta
              </span>
              <input
                type="number"
                min="1"
                value={comprobanteAsociado.puntoVenta}
                onChange={(e) =>
                  setComprobanteAsociado((p) => ({
                    ...p,
                    puntoVenta: e.target.value,
                  }))
                }
                placeholder="0001"
                className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md font-semibold shadow-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Tipo Comp. Asociado
              </span>
              <input
                type="number"
                min="1"
                value={comprobanteAsociado.codigoTipoComprobanteAsociado}
                onChange={(e) =>
                  setComprobanteAsociado((p) => ({
                    ...p,
                    codigoTipoComprobanteAsociado: e.target.value,
                  }))
                }
                placeholder="Ej: 1, 6, 11..."
                className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md font-semibold shadow-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Importe Aplicado
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={comprobanteAsociado.importeAplicado}
                onChange={(e) =>
                  setComprobanteAsociado((p) => ({
                    ...p,
                    importeAplicado: e.target.value,
                  }))
                }
                placeholder="0.00"
                className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md font-semibold shadow-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CabeceraComprobante;
