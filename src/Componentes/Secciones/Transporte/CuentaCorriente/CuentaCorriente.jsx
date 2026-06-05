import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAlertas } from "../../../../store/useAlertas";
import { useClientesCtaCte } from "../../../../Backend/Contactos/hooks/useClientesCtaCte";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import {
  Truck,
  User,
  X,
  Search,
  AlertCircle,
  ArrowRight,
  Loader,
  FileText,
  BookOpen,
  Printer,
} from "lucide-react";
import { createPortal } from "react-dom";
import ModalPagoGuia from "./ModalPagoGuia";
import { DineroIcono } from "../../../../assets/Icons";
import { ListarMovimientosApi } from "../../../../Backend/Contactos/api/contactos.api";
import DataTable from "../../../UI/DataTable/DataTable";
import { accionesReutilizables } from "../../../UI/AccionesReutilizables/accionesReutilizables";

const CuentaCorrienteTransporte = () => {
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const location = useLocation();
  const {
    clientes: clientesProcesados,
    cargandoClientes,
    metricas,
    busqueda,
    setBusqueda,
    refetchClientes,
    refetchMovimientos,
    paginas,
    paginaActual,
    total,
    setPagina,
    codigoCtaCte,
  } = useClientesCtaCte();

  // Filtros rápidos locales
  const [filtroEstado, setFiltroEstado] = useState("TODOS"); // TODOS, CON_DEUDA, AL_DIA
  const [clienteSeleccionadoPago, setClienteSeleccionadoPago] = useState(null);
  const [clienteSeleccionadoDetalle, setClienteSeleccionadoDetalle] =
    useState(null);

  // Estados para el Libro Mayor del Cliente (cuenta 1105)
  const [movimientosMayor, setMovimientosMayor] = useState([]);
  const [cargandoMayor, setCargandoMayor] = useState(false);
  const [mesSeleccionadoMayor, setMesSeleccionadoMayor] = useState("TODOS");
  const [anioSeleccionadoMayor, setAnioSeleccionadoMayor] = useState("TODOS");

  // Recargar datos cuando cambia de vista
  useEffect(() => {
    refetchClientes();
    refetchMovimientos();
  }, [location.pathname]);

  // Aplicar filtro de estado
  const clientesFiltrados = useMemo(() => {
    if (filtroEstado === "TODOS") return clientesProcesados;
    if (filtroEstado === "CON_DEUDA") {
      return clientesProcesados.filter((c) => c.saldoBase > 0);
    }
    if (filtroEstado === "AL_DIA") {
      return clientesProcesados.filter((c) => c.saldoBase <= 0);
    }
    return clientesProcesados;
  }, [clientesProcesados, filtroEstado]);

  const formatARS = (val) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val || 0);
  };

  const columnasClientes = [
    {
      key: "clienteId",
      etiqueta: "ID",
      renderizar: (val) => (
        <span className="text-[10px] font-black text-black/30">
          {String(val).padStart(4, "0")}
        </span>
      ),
    },
    {
      key: "nombre",
      etiqueta: "Cliente deudor",
      renderizar: (val) => (
        <span className="font-black text-slate-800 uppercase text-[13px]">
          {val}
        </span>
      ),
    },
    {
      key: "cuit",
      etiqueta: "Identificación",
      renderizar: (val) => (
        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10.5px] font-black">
          {val}
        </span>
      ),
    },
    {
      key: "envios",
      etiqueta: "Guías impagas",
      renderizar: (val) => (
        <span className="font-extrabold text-amber-600 text-[13px]">
          {val ? `${val.length} guías` : "0 guías"}
        </span>
      ),
    },
    {
      key: "saldoBase",
      etiqueta: `Saldo Contable (${codigoCtaCte})`,
      renderizar: (val) => (
        <div className="text-right font-black text-[14px] text-emerald-600">
          {formatARS(val)}
        </div>
      ),
    },
    {
      key: "estado",
      etiqueta: "Estado",
      renderizar: (_, cliente) => (
        <div className="text-center">
          <span
            className={`inline-block px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${cliente.badgeStyle}`}
          >
            {cliente.estadoLabel}
          </span>
        </div>
      ),
    },
  ];

  const accionesClientes = [
    {
      ...accionesReutilizables.registrarPago,
      label: "Registrar Pago de Guías",
      onClick: (cliente) => setClienteSeleccionadoPago(cliente),
      mostrar: (cliente) => cliente.envios?.length > 0,
    },
    {
      ...accionesReutilizables.verCuentaCorriente,
      label: "Ver Cuenta Corriente Contable",
      onClick: (cliente) => handleAbrirLibroMayor(cliente),
    },
  ];

  // Cargar Libro Mayor contable del cliente para el Drawer
  const handleAbrirLibroMayor = async (cliente) => {
    setClienteSeleccionadoDetalle(cliente);
    setCargandoMayor(true);
    // Establecer por defecto ver todos los movimientos (historial completo)
    setMesSeleccionadoMayor("TODOS");
    setAnioSeleccionadoMayor("TODOS");
    try {
      const res = await ListarMovimientosApi(cliente.clienteId, {
        limite: 500,
        codigoCuenta: codigoCtaCte, // Usar cuenta corriente configurada
      });
      setMovimientosMayor(res || []);
    } catch (e) {
      console.error("Error al cargar libro mayor de transporte:", e);
      setMovimientosMayor([]);
    } finally {
      setCargandoMayor(false);
    }
  };

  // Filtrar los movimientos del Libro Mayor en tiempo real
  const movimientosMayorFiltrados = useMemo(() => {
    return movimientosMayor.filter((mov) => {
      let m, y;
      if (
        mov.periodo &&
        typeof mov.periodo === "string" &&
        mov.periodo.includes("-")
      ) {
        const parts = mov.periodo.split("-");
        y = Number(parts[0]);
        m = Number(parts[1]) - 1;
      } else if (mov.fecha) {
        const fMov = new Date(mov.fecha);
        m = fMov.getMonth();
        y = fMov.getFullYear();
      } else {
        return true;
      }
      const coincideMes =
        mesSeleccionadoMayor === "TODOS" || m === Number(mesSeleccionadoMayor);
      const coincideAnio =
        anioSeleccionadoMayor === "TODOS" ||
        y === Number(anioSeleccionadoMayor);
      return coincideMes && coincideAnio;
    });
  }, [movimientosMayor, mesSeleccionadoMayor, anioSeleccionadoMayor]);

  return (
    <div className="flex flex-col min-h-screen text-black p-4">
      <EncabezadoSeccion
        ruta="CUENTAS CORRIENTES"
        icono={<DineroIcono size={18} />}
      />

      {/* METRICAS SUPERIORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Clientes Deudores */}
        <div className="p-5 bg-white  rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest leading-none">
              Clientes Deudores Contables
            </span>
            <span className="text-[26px] font-black text-slate-800 mt-2 leading-none">
              {metricas.totalClientesDeudores}
            </span>
            <span className="text-[10px] text-black/30 font-bold mt-2 lowercase">
              con saldo de fletes en cuenta {codigoCtaCte}
            </span>
          </div>
        </div>

        {/* Total Guías Impagas */}
        <div className="p-5 bg-white  rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest leading-none">
              Guías Sin Facturar
            </span>
            <span className="text-[26px] font-black text-amber-600 mt-2 leading-none">
              {metricas.totalGuiasPendientes}
            </span>
            <span className="text-[10px] text-amber-500 font-bold mt-2 lowercase">
              guías cargadas pendientes de cobro
            </span>
          </div>
        </div>

        {/* Deuda Total Consolidada */}
        <div className="p-5 bg-white  rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest leading-none">
              Deuda Total Consolidada
            </span>
            <span className="text-[26px] font-black text-emerald-600 mt-2 leading-none">
              {formatARS(metricas.totalDeudaConsolidada)}
            </span>
            <span className="text-[10px] text-emerald-500/60 font-bold mt-2 lowercase">
              saldo consolidado real ({codigoCtaCte})
            </span>
          </div>
        </div>
      </div>

      <DataTable
        id_tabla="tabla-cuentacorriente-transporte"
        columnas={columnasClientes}
        datos={clientesFiltrados}
        loading={cargandoClientes}
        mostrarBuscador={true}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        placeholderBuscador="Buscar por cliente, razón social, CUIT o ID..."
        meta={{
          total: total,
          currentPage: paginaActual,
          lastPage: paginas,
          prev: paginaActual > 1 ? paginaActual - 1 : null,
          next: paginaActual < paginas ? paginaActual + 1 : null,
        }}
        onPageChange={(page) => setPagina(page)}
        mostrarAcciones={true}
        acciones={accionesClientes}
        elementosSuperior={
          <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl overflow-x-auto self-start lg:self-auto">
            {[
              { id: "TODOS", label: "Todos" },
              { id: "CON_DEUDA", label: "Con Deuda" },
              { id: "AL_DIA", label: "Al Día" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFiltroEstado(tab.id)}
                className={`px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  filtroEstado === tab.id
                    ? "bg-white text-black shadow-sm"
                    : "text-black/50 hover:text-black hover:bg-white/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        }
        emptyMessage="No se encontraron cuentas corrientes con los filtros seleccionados"
        llaveTituloMobile="nombre"
      />

      {/* MODAL DE PAGO */}
      {clienteSeleccionadoPago && (
        <ModalPagoGuia
          cliente={clienteSeleccionadoPago}
          onClose={() => {
            setClienteSeleccionadoPago(null);
            refetchClientes();
            refetchMovimientos();
          }}
        />
      )}

      {/* DRAWER LATERAL DE DETALLE - LIBRO MAYOR CONTABLE (CUENTA 1105) */}
      {clienteSeleccionadoDetalle &&
        createPortal(
          <div className="fixed inset-0 z-[99999999] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
              className="absolute inset-0 h-full w-full"
              onClick={() => setClienteSeleccionadoDetalle(null)}
            />
            <div
              className="relative z-10 bg-white border-l border-black/10 w-full max-w-3xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
              style={{ minHeight: "100vh" }}
            >
              {/* Header Drawer */}
              <div className="p-6 border-b border-black/5 flex items-center justify-between bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-orange-500/15 text-orange-600 rounded-md">
                    <BookOpen size={20} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[16px] font-black text-slate-800 uppercase tracking-tight leading-none">
                      Cuenta Corriente Contable (Fletes)
                    </h3>
                    <span className="text-[11px] font-bold text-black/40 uppercase tracking-widest mt-1">
                      {clienteSeleccionadoDetalle.nombre} (Legajo:{" "}
                      {clienteSeleccionadoDetalle.clienteId})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setClienteSeleccionadoDetalle(null)}
                  className="p-2 hover:bg-black/5 rounded-full text-black/20 hover:text-black/60 transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Contenido / Libro Mayor */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {cargandoMayor ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader
                      size={30}
                      className="text-orange-500 animate-spin"
                    />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Cargando Libro Mayor General...
                    </span>
                  </div>
                ) : movimientosMayor.length === 0 ? (
                  <div className="p-10 text-center bg-black/5 rounded-2xl border border-dashed border-black/10">
                    <AlertCircle
                      size={40}
                      className="mx-auto text-black/20 mb-3"
                    />
                    <p className="text-[11px] font-black text-black/40 uppercase tracking-widest">
                      Sin movimientos registrados en cuenta contable{" "}
                      {codigoCtaCte}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Tarjeta de Saldo */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-orange-500/5 p-4 rounded-xl border border-orange-500/10 gap-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-orange-600 uppercase tracking-wider">
                          Saldo Contable Real ({codigoCtaCte})
                        </span>
                        <span className="text-[20px] font-black text-orange-700 leading-none mt-1">
                          {formatARS(clienteSeleccionadoDetalle.saldoBase)}
                        </span>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-black/5 border border-black/10 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer self-start sm:self-auto"
                      >
                        <Printer size={12} />
                        <span>Imprimir Ficha</span>
                      </button>
                    </div>

                    {/* Filtro de Período Premium */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-4 rounded-xl border border-black/5">
                      <div className="flex items-center gap-2 bg-white border border-black/10 rounded-xl px-4 py-2 w-full sm:w-auto justify-center shadow-sm">
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider whitespace-nowrap">
                          Filtrar Período:
                        </span>
                        <select
                          value={mesSeleccionadoMayor}
                          onChange={(e) =>
                            setMesSeleccionadoMayor(
                              e.target.value === "TODOS"
                                ? "TODOS"
                                : Number(e.target.value),
                            )
                          }
                          className="bg-transparent border-none text-[12px] font-bold text-black/80 outline-none cursor-pointer focus:ring-0 py-0 pr-8 pl-1"
                        >
                          <option value="TODOS">Todos los meses</option>
                          {meses.map((mes, idx) => (
                            <option key={idx} value={idx}>
                              {mes}
                            </option>
                          ))}
                        </select>
                        <select
                          value={anioSeleccionadoMayor}
                          onChange={(e) =>
                            setAnioSeleccionadoMayor(
                              e.target.value === "TODOS"
                                ? "TODOS"
                                : Number(e.target.value),
                            )
                          }
                          className="bg-transparent border-none text-[12px] font-bold text-black/80 outline-none cursor-pointer focus:ring-0 py-0 pr-8 pl-1 border-l border-black/10"
                        >
                          <option value="TODOS">Todos los años</option>
                          {[-2, -1, 0, 1, 2].map((offset) => {
                            const yr = new Date().getFullYear() + offset;
                            return (
                              <option key={yr} value={yr}>
                                {yr}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>

                    {/* Tabla de Libro Mayor */}
                    <div className="overflow-hidden border border-black/5 rounded-xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-black/[0.01] border-b border-black/5 text-[9px] font-black text-slate-700 uppercase tracking-wider select-none">
                            <th className="p-3">Fecha</th>
                            <th className="p-3">Concepto</th>
                            <th className="p-3">Ref / Asiento</th>
                            <th className="p-3 text-right">Debe</th>
                            <th className="p-3 text-right">Haber</th>
                            <th className="p-3 text-right">Saldo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5 text-[11px] font-bold text-black/75">
                          {movimientosMayorFiltrados.length === 0 ? (
                            <tr>
                              <td
                                colSpan={6}
                                className="p-8 text-center text-black/30 font-black uppercase text-[10px] tracking-wider"
                              >
                                No hay movimientos registrados en el rango de
                                fechas seleccionado
                              </td>
                            </tr>
                          ) : (
                            movimientosMayorFiltrados.map((mov, idx) => (
                              <tr key={idx} className="hover:bg-black/[0.005]">
                                <td className="p-3 font-mono text-black/50">
                                  {new Date(mov.fecha).toLocaleDateString(
                                    "es-AR",
                                  )}
                                </td>
                                <td
                                  className="p-3 max-w-[200px] truncate"
                                  title={mov.concepto}
                                >
                                  {mov.concepto}
                                </td>
                                <td className="p-3 font-mono text-slate-500 text-[10px] select-all">
                                  {mov.referencia || `-`}
                                </td>
                                <td className="p-3 text-right text-emerald-600 font-bold">
                                  {mov.monto > 0 ? formatARS(mov.monto) : "-"}
                                </td>
                                <td className="p-3 text-right text-slate-500">
                                  {mov.monto < 0
                                    ? formatARS(Math.abs(mov.monto))
                                    : "-"}
                                </td>
                                <td className="p-3 text-right font-black text-slate-900">
                                  {formatARS(mov.saldoResultante)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Drawer */}
              <div className="p-6 border-t border-black/5 bg-black/[0.02] flex items-center justify-between">
                <span className="text-[9px] font-black text-black/30 uppercase tracking-widest">
                  General Ledger audit track (EFA Engine)
                </span>
                <button
                  onClick={() => setClienteSeleccionadoDetalle(null)}
                  className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cerrar Ficha
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default CuentaCorrienteTransporte;
