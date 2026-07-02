import { useEffect, useRef, useState } from "react";
import { Link, Search, UserPlus } from "lucide-react";
import {
  ArcaIcono,
  BorrarIcono,
  ComprobanteIcono,
  FechaIcono,
  PersonaIcono,
  VentasIcono,
} from "../../../../assets/Icons";
import { useContactos } from "../../../../Backend/Contactos/hooks/useContactos";
import { ListarContactosApi } from "../../../../Backend/Contactos/api/contactos.api.js";
import { TieneAccion } from "../../../UI/TieneAccion/TieneAccion";
import SelectorComprobanteModal from "./SelectorComprobanteModal";
import FormularioContacto from "../../Contactos/GestionContactos/FormularioContacto";
import { formatPrice } from "../../../../utils/formatters";

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

const CabeceraComprobante = ({ tipoOperacion, cabecera, arcaData = null }) => {
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
    condicionComprobante,
    setCondicionComprobante,
    unidadNegocioSeleccionada,
    setUnidadNegocioSeleccionada,
    puntoVenta,
    setPuntoVenta,
    observaciones,
    setObservaciones,
    busquedaCliente,
    setBusquedaCliente,
    clienteSeleccionado,
    setClienteSeleccionado,
    tipoComprobante,
    setTipoComprobante,
    comprobanteAsociado,
    setComprobanteAsociado,
    esNotaAsociada,
    numeroComprobanteEgreso,
    setNumeroComprobanteEgreso,
    cae,
    setCae,
    vtoCae,
    setVtoCae,
  } = cabecera;

  const [modalComprobanteOpen, setModalComprobanteOpen] = useState(false);
  const [modalCrearContacto, setModalCrearContacto] = useState(false);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(-1);
  const refsResultados = useRef([]);

  const { contactos: contactosFetched } = useContactos({
    tipoEntidad: tipoOperacion === "EGRESO" ? "PROV" : "",
    busqueda: busquedaCliente,
    limite: 10,
  });
  const clientesRaw =
    tipoOperacion !== "EGRESO"
      ? contactosFetched.filter((c) => c.tipoEntidad !== "PROV")
      : contactosFetched;

  // Búsqueda por CUIT para pre-selección automática cuando viene de ARCA
  useEffect(() => {
    if (!arcaData?.cuit) return;
    if (clienteSeleccionado) return;

    const cuitNormalizado = String(arcaData.cuit).replace(/\D/g, "");

    ListarContactosApi({
      documento: cuitNormalizado,
      tipoEntidad: "PROV",
      limite: 5,
    })
      .then((resultado) => {
        const encontrados = resultado?.items ?? resultado ?? [];
        if (Array.isArray(encontrados) && encontrados.length > 0) {
          seleccionarCliente(encontrados[0]);
        } else {
          setModalCrearContacto(true);
        }
      })
      .catch(() => {
        setModalCrearContacto(true);
      });
  }, [arcaData?.cuit, clienteSeleccionado]);

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

  useEffect(() => {
    setIndiceActivo(-1);
  }, [clientesRaw]);

  useEffect(() => {
    if (indiceActivo < 0) return;
    refsResultados.current[indiceActivo]?.scrollIntoView({ block: "nearest" });
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

  const handleEnterNext = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const allInputs = Array.from(
      document.querySelectorAll(
        'input:not([type="hidden"]):not([disabled]), select:not([disabled])',
      ),
    );
    const idx = allInputs.indexOf(e.target);
    if (idx >= 0 && idx < allInputs.length - 1) {
      allInputs[idx + 1].focus();
    }
  };

  return (
    <div className="flex flex-col gap-5 p-4 border border-gray-200 ">
      {/* SECCIÓN 1: FECHAS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pb-3 border-b border-gray-700/20 rounded-md w-full">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="datepicker-range-start"
            className="flex items-center gap-2 text-md font-semibold uppercase tracking-wider text-gray-900"
          >
            <FechaIcono size={20} className="text-[var(--primary)]" />
            Fecha Inicio
          </label>
          <input
            id="datepicker-range-start"
            name="start"
            type="date"
            className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md font-semibold shadow-sm transition-colors duration-200 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            onKeyDown={handleEnterNext}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="datepicker-range-end"
            className="flex items-center gap-2 text-md font-semibold uppercase tracking-wider text-gray-900"
          >
            <FechaIcono size={20} className="text-[var(--primary)]" />
            Fecha Vencimiento
          </label>
          <input
            id="datepicker-range-end"
            name="end"
            type="date"
            className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md font-semibold shadow-sm transition-colors duration-200 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
            value={fechaVencimiento}
            onChange={(e) => setFechaVencimiento(e.target.value)}
            onKeyDown={handleEnterNext}
          />
        </div>
      </div>

      {/* SECCIÓN 2: CONFIGURACIÓN Y TIPO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pb-3 border-b border-gray-700/20 rounded-md w-full">
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

        {tipoOperacion === "INGRESO" && (
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
        )}

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
            onKeyDown={handleEnterNext}
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

      {/* SECCION 3: UNIDAD NEGOCIO y CONDICION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pb-3 border-b border-gray-700/20 rounded-md w-full">
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
            value={condicionComprobante}
            onChange={(e) => setCondicionComprobante(e.target.value)}
            onKeyDown={handleEnterNext}
            className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-md font-semibold shadow-sm transition-colors duration-200 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
          >
            <option value="CONTADO">CONTADO</option>
            <option value="CUENTA_CORRIENTE">CUENTA CORRIENTE</option>
            <option value="CREDITO_30_DIAS">CRÉDITO 30 DÍAS</option>
            <option value="CREDITO_60_DIAS">CRÉDITO 60 DÍAS</option>
            <option value="CREDITO_90_DIAS">CRÉDITO 90 DÍAS</option>
            <option value="TRANSFERENCIA_BANCARIA">TRANSFERENCIA BANCARIA</option>
            <option value="TARJETA_DEBITO">TARJETA DÉBITO</option>
            <option value="TARJETA_CREDITO">TARJETA CRÉDITO</option>
            <option value="CHEQUE">CHEQUE</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="unidad-negocio"
            className="flex items-center gap-2 text-md font-semibold uppercase tracking-wider text-gray-900"
          >
            <VentasIcono size={20} className="text-[var(--primary)]" />
            Unidad de Negocio
            {puntoVenta && (
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] bg-black/5 px-2 py-1 rounded">
                PV: {puntoVenta}
              </span>
            )}
          </label>
          <select
            id="unidad-negocio"
            value={unidadNegocioSeleccionada}
            onChange={(e) => setUnidadNegocioSeleccionada(e.target.value)}
            onKeyDown={handleEnterNext}
            className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-md font-semibold shadow-sm transition-colors duration-200 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
          >
            {unidadesNegocio?.map((u) => (
              <option key={u.codigoSecuencial} value={u.codigoSecuencial}>
                {u.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECCION 4: OBSERVACIONES */}
      <div className="grid grid-cols-1 gap-4 pb-3 border-b border-gray-700/20 rounded-md w-full">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="observaciones"
            className="text-md font-semibold uppercase tracking-wider text-gray-900"
          >
            Observaciones
          </label>
          <input
            id="observaciones"
            type="text"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            onKeyDown={handleEnterNext}
            placeholder="Observaciones opcionales..."
            className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md font-semibold shadow-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 placeholder:text-gray-400 placeholder:font-normal"
          />
        </div>
      </div>

      {/* SECCION 5 (solo EGRESO): Nro. Comprobante + CAE + Vto. CAE */}
      {tipoOperacion === "EGRESO" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-3 border-b border-gray-700/20 rounded-md w-full">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="punto-venta-egreso"
              className="text-md font-semibold uppercase tracking-wider text-gray-900"
            >
              Punto de Venta
            </label>
            <input
              id="punto-venta-egreso"
              type="number"
              min="1"
              value={puntoVenta}
              onChange={(e) => setPuntoVenta(e.target.value)}
              onKeyDown={handleEnterNext}
              placeholder="Ej: 1"
              className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md font-semibold shadow-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="nro-comprobante-egreso"
              className="text-md font-semibold uppercase tracking-wider text-gray-900"
            >
              Nro. Comprobante
            </label>
            <input
              id="nro-comprobante-egreso"
              type="number"
              min="0"
              value={numeroComprobanteEgreso}
              onChange={(e) => setNumeroComprobanteEgreso(e.target.value)}
              onKeyDown={handleEnterNext}
              placeholder="Número del proveedor"
              className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md font-semibold shadow-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="cae"
              className="text-md font-semibold uppercase tracking-wider text-gray-900"
            >
              CAE
            </label>
            <input
              id="cae"
              type="text"
              value={cae}
              onChange={(e) => setCae(e.target.value)}
              onKeyDown={handleEnterNext}
              placeholder="Código de autorización"
              className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md font-semibold shadow-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="vto-cae"
              className="text-md font-semibold uppercase tracking-wider text-gray-900"
            >
              Vto. CAE
            </label>
            <input
              id="vto-cae"
              type="date"
              value={vtoCae}
              onChange={(e) => setVtoCae(e.target.value)}
              onKeyDown={handleEnterNext}
              className="block w-full px-3 py-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md font-semibold shadow-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
            />
          </div>
        </div>
      )}

      {/* SECCION 6: SELECCION DE CLIENTES / PROVEEDORES */}
      <div className="flex flex-col gap-1.5 relative pb-3 border-b border-gray-700/20 rounded-md w-full">
        <div className="flex items-center justify-between">
          <label
            htmlFor="buscador-cliente"
            className="flex items-center gap-2 text-md font-semibold uppercase tracking-wider text-gray-900"
          >
            <PersonaIcono size={20} className="text-[var(--primary)]" />
            {tipoOperacion === "EGRESO" ? "Buscar Proveedor" : "Buscar Cliente"}
          </label>
          {!clienteSeleccionado && (
            <button
              type="button"
              onClick={() => setModalCrearContacto(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-2.5 py-1 rounded-md hover:bg-[var(--primary)]/20 transition-colors cursor-pointer"
            >
              <UserPlus size={12} />
              Crear nuevo
            </button>
          )}
        </div>

        {clienteSeleccionado ? (
          <div className="flex rounded-md border border-gray-200 overflow-hidden w-full justify-start gap-3 ">
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
              onKeyDown={(e) => {
                manejarTeclasBuscador(e);
                if (e.key === "Enter" && indiceActivo < 0) handleEnterNext(e);
              }}
              onBlur={() => setTimeout(() => setMostrarResultados(false), 200)}
            />

            {mostrarResultados &&
              (clientesRaw?.length > 0 || busquedaCliente) && (
                <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  {clientesRaw && clientesRaw.length > 0 ? (
                    <>
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
                      <button
                        type="button"
                        onClick={() => {
                          setMostrarResultados(false);
                          setModalCrearContacto(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[var(--primary)] border-t border-gray-100 hover:bg-[var(--primary)]/5 transition-colors cursor-pointer"
                      >
                        <UserPlus size={14} />
                        Crear nuevo{" "}
                        {tipoOperacion === "EGRESO" ? "proveedor" : "contacto"}
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="px-4 py-2.5 text-sm text-gray-500 italic">
                        Sin resultados para &quot;{busquedaCliente}&quot;
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setMostrarResultados(false);
                          setModalCrearContacto(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[var(--primary)] border-t border-gray-100 hover:bg-[var(--primary)]/5 transition-colors cursor-pointer"
                      >
                        <UserPlus size={14} />
                        Crear &quot;{busquedaCliente}&quot; como nuevo{" "}
                        {tipoOperacion === "EGRESO" ? "proveedor" : "contacto"}
                      </button>
                    </>
                  )}
                </div>
              )}
          </div>
        )}
      </div>

      {/* SECCIÓN 7: COMPROBANTE ASOCIADO (Nota de Crédito / Débito) */}
      {esNotaAsociada && (
        <div className="flex flex-col gap-3 pb-3 border-b border-gray-700/20 rounded-md w-full">
          <label className="flex items-center gap-2 text-md font-semibold uppercase tracking-wider text-gray-900">
            <Link size={16} className="text-[var(--primary)]" />
            Comprobante Asociado
          </label>
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide -mt-1">
            Vinculá el comprobante original que origina esta nota
          </p>

          {comprobanteAsociado ? (
            <div className="flex items-center gap-3 border border-[var(--primary)]/30 bg-[var(--primary)]/5 rounded-md px-4 py-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-[var(--primary)]/10 shrink-0">
                <Link size={16} className="text-[var(--primary)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-100">
                    {comprobanteAsociado.tipoDescripcionComprobante ||
                      "COMPROBANTE"}{" "}
                    {comprobanteAsociado.letraComprobante || ""}
                  </span>
                  <span className="text-sm font-black text-gray-900">
                    {`${String(comprobanteAsociado.puntoVenta || 0).padStart(5, "0")}-${String(comprobanteAsociado.numeroComprobante || 0).padStart(8, "0")}`}
                  </span>
                </div>
                {(comprobanteAsociado.nombreCliente ||
                  comprobanteAsociado.razonSocial) && (
                  <p className="text-[11px] font-semibold text-gray-500 mt-0.5 truncate">
                    {comprobanteAsociado.nombreCliente ||
                      comprobanteAsociado.razonSocial}
                  </p>
                )}
                <p className="text-[11px] font-bold text-gray-700 mt-0.5">
                  Total: {formatPrice(comprobanteAsociado.total || 0)}
                  {comprobanteAsociado.saldoPendiente !== undefined && (
                    <span className="text-amber-600 ml-2">
                      · Saldo: {formatPrice(comprobanteAsociado.saldoPendiente)}
                    </span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setComprobanteAsociado(null)}
                className="p-2 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer shrink-0"
              >
                <BorrarIcono size={18} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setModalComprobanteOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-md text-sm font-bold text-gray-500 hover:border-[var(--primary)]/50 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all cursor-pointer self-start"
            >
              <Search size={16} />
              Buscar comprobante asociado
            </button>
          )}
        </div>
      )}

      <SelectorComprobanteModal
        isOpen={modalComprobanteOpen}
        onClose={() => setModalComprobanteOpen(false)}
        onSeleccionar={setComprobanteAsociado}
        unidadesNegocio={unidadesNegocio}
      />

      {modalCrearContacto && (
        <FormularioContacto
          entidad={
            tipoOperacion === "EGRESO"
              ? { clave: "PROV", nombre: "Proveedor" }
              : null
          }
          datosIniciales={
            arcaData
              ? { razonSocial: arcaData.denominacion, documento: arcaData.cuit }
              : {}
          }
          onClose={() => setModalCrearContacto(false)}
          onExito={(nuevo) => {
            seleccionarCliente(nuevo);
            setModalCrearContacto(false);
          }}
        />
      )}
    </div>
  );
};

export default CabeceraComprobante;
