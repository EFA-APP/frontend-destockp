import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../../UI/DataTable/DataTable";
import ContenedorSeccion from "../../ContenidoPanel/ContenedorSeccion";
import {
  useObtenerEnvios,
  useActualizarEstadoEnvio,
} from "../../../Backend/Articulos/queries/Transporte/useTransporte";
import {
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  Receipt,
  FileText,
  Calendar,
  Search,
} from "lucide-react";
import FechaInput from "../../UI/FechaInput/FechaInput";
import EncabezadoSeccion from "../../UI/EncabezadoSeccion/EncabezadoSeccion";
import { NotaDebitoIcono } from "../../../assets/Icons";

const GuiasPendientes = () => {
  const navigate = useNavigate();
  const [fecha, setFecha] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const { data: guias, isLoading } = useObtenerEnvios(fecha);
  const { mutate: actualizarEstado } = useActualizarEstadoEnvio();
  const [busqueda, setBusqueda] = useState("");

  const getBadgeClass = (estado, facturado) => {
    if (facturado) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    switch (estado) {
      case "PENDIENTE":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "ENTREGADO":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CANCELADO":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getIconoEstado = (estado, facturado) => {
    if (facturado) {
      return <CheckCircle2 size={14} className="text-emerald-500" />;
    }
    switch (estado) {
      case "PENDIENTE":
        return <Clock size={14} className="text-amber-500" />;
      case "ENTREGADO":
        return <Truck size={14} className="text-blue-500" />;
      case "CANCELADO":
        return <XCircle size={14} className="text-red-500" />;
      default:
        return <Package size={14} className="text-gray-500" />;
    }
  };

  const getTextoEstado = (estado, facturado) => {
    if (facturado) return "PAGADO / FACTURADO";
    return estado;
  };

  const getFormaPagoBadgeClass = (formaPago) => {
    switch (formaPago) {
      case "EFECTIVO":
        return "bg-teal-50 text-teal-700 border-teal-100";
      case "PAGO_DESTINO":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "CTA_CTE":
        return "bg-orange-50 text-orange-700 border-orange-100 font-extrabold";
      default:
        return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const handleCambiarEstado = (guia, nuevoEstado) => {
    actualizarEstado({
      id: guia.codigoSecuencial,
      estadoDespacho: nuevoEstado,
    });
  };

  const handleCobrarGuia = (guia) => {
    navigate("/panel/ventas/comprobantes", {
      state: {
        origen: "TRANSPORTE_GUIAS",
        clienteId: guia.codigoRemitente,
        guiasIds: [guia.codigoSecuencial],
        importe: guia.totalEnvio,
        detalles: `Servicio Flete Guía #${String(guia.codigoSecuencial).padStart(6, "0")} (${guia.ruta?.origen || "Córdoba"} a ${guia.ruta?.destino || "Villa María"})`,
      },
    });
  };

  const columnas = [
    {
      etiqueta: "Guía #",
      key: "codigoSecuencial",
      renderizar: (val, fila) => (
        <div className="flex flex-col">
          <span className="font-black text-[var(--primary)] text-[14px]">
            #{String(val).padStart(6, "0")}
          </span>
          {fila.fechaEnvio && (
            <span className="text-[10px] text-gray-500 font-bold mt-1">
              {new Date(fila.fechaEnvio).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              hs
            </span>
          )}
        </div>
      ),
    },
    {
      etiqueta: "Trayecto y Clientes",
      key: "ruta",
      renderizar: (val, fila) => (
        <div className="flex flex-col gap-1">
          <span className="font-black text-gray-800 text-[13px] flex items-center gap-1.5">
            {fila.ruta?.origen || "Córdoba"}{" "}
            <ArrowRight size={12} className="text-orange-500" />{" "}
            {fila.ruta?.destino || "Villa María"}
          </span>
          <div className="flex flex-col gap-0.5 text-[11px] text-gray-600 font-semibold">
            <span>
              Remitente:{" "}
              <strong className="text-gray-800">
                {fila.remitente?.razonSocial ||
                  fila.remitente?.nombreCompleto ||
                  fila.remitente?.nombre ||
                  "Desconocido"}
              </strong>
            </span>
            {fila.destinatario &&
              fila.codigoDestinatario !== fila.codigoRemitente && (
                <span>
                  Destinatario:{" "}
                  <strong className="text-gray-800">
                    {fila.destinatario?.razonSocial ||
                      fila.destinatario?.nombreCompleto ||
                      fila.destinatario?.nombre ||
                      "Desconocido"}
                  </strong>
                </span>
              )}
          </div>
          {fila.descripcionPaquete && (
            <span className="text-[10.5px] text-gray-400 italic">
              "{fila.descripcionPaquete}"
            </span>
          )}
        </div>
      ),
    },
    {
      etiqueta: "Importe",
      key: "totalEnvio",
      renderizar: (val, fila) => (
        <div className="flex flex-col items-end">
          <span className="font-black text-emerald-600 bg-emerald-50/80 px-2.5 py-1.5 rounded-md border border-emerald-100 text-[13.5px]">
            $
            {Number(val || 0).toLocaleString("es-AR", {
              minimumFractionDigits: 2,
            })}
          </span>
          <span
            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider mt-1.5 ${getFormaPagoBadgeClass(fila.formaPago)}`}
          >
            {fila.formaPago.replace("_", " ")}
          </span>
        </div>
      ),
    },
    {
      etiqueta: "Estado Despacho",
      key: "estadoDespacho",
      renderizar: (val, fila) => (
        <div className="flex flex-col gap-1">
          <span
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-extrabold border w-max ${getBadgeClass(val, fila.facturado)}`}
          >
            {getIconoEstado(val, fila.facturado)}
            {getTextoEstado(val, fila.facturado)}
          </span>
          {fila.facturado && (
            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
              <FileText size={10} /> Comprobante #
              {fila.codigoComprobante || "Int."}
            </span>
          )}
        </div>
      ),
    },
  ];

  const acciones = [
    {
      icono: <Truck size={16} className="text-blue-500" />,
      label: "Entregado",
      mostrar: (f) => f.estadoDespacho === "PENDIENTE" && !f.facturado,
      onClick: (f) => handleCambiarEstado(f, "ENTREGADO"),
    },
    {
      icono: <XCircle size={16} className="text-red-500" />,
      label: "Cancelar Guía",
      mostrar: (f) => f.estadoDespacho === "PENDIENTE" && !f.facturado,
      onClick: (f) => handleCambiarEstado(f, "CANCELADO"),
    },
  ];

  const guiasFiltrados = guias?.filter((e) => {
    if (!busqueda) return true;
    const s = busqueda.toLowerCase();
    return (
      String(e.codigoSecuencial).includes(s) ||
      e.remitente?.razonSocial?.toLowerCase().includes(s) ||
      e.remitente?.nombreCompleto?.toLowerCase().includes(s) ||
      e.destinatario?.razonSocial?.toLowerCase().includes(s) ||
      e.ruta?.origen?.toLowerCase().includes(s) ||
      e.ruta?.destino?.toLowerCase().includes(s) ||
      e.descripcionPaquete?.toLowerCase().includes(s)
    );
  });

  // Calcular métricas rápidas del día
  const totalGuias = guias?.length || 0;
  const pendientes =
    guias?.filter((g) => g.estadoDespacho === "PENDIENTE" && !g.facturado)
      .length || 0;
  const entregados =
    guias?.filter((g) => g.estadoDespacho === "ENTREGADO" && !g.facturado)
      .length || 0;
  const facturados = guias?.filter((g) => g.facturado).length || 0;

  return (
    <ContenedorSeccion>
      <EncabezadoSeccion
        ruta="GUÍAS PENDIENTES"
        icono={<NotaDebitoIcono size={18} />}
      />
      {/* Tarjetas de Métricas Premium */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-md p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-gray-50 rounded-md text-gray-500">
            <Package size={22} />
          </div>
          <div>
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              Total del Día
            </span>
            <h4 className="text-[20px] font-black text-gray-700 leading-none mt-1">
              {totalGuias}
            </h4>
          </div>
        </div>

        <div className="bg-white border border-amber-100 rounded-md p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-md text-amber-500">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-[11px] font-black text-amber-600/80 uppercase tracking-widest">
              Pendientes Dispatch
            </span>
            <h4 className="text-[20px] font-black text-amber-700 leading-none mt-1">
              {pendientes}
            </h4>
          </div>
        </div>

        <div className="bg-white border border-blue-100 rounded-md p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-md text-blue-500">
            <Truck size={22} />
          </div>
          <div>
            <span className="text-[11px] font-black text-blue-600/80 uppercase tracking-widest">
              Entregados impagos
            </span>
            <h4 className="text-[20px] font-black text-blue-700 leading-none mt-1">
              {entregados}
            </h4>
          </div>
        </div>

        <div className="bg-white border border-emerald-100 rounded-md p-5 shadow-lg flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-md text-emerald-500">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="text-[11px] font-black text-emerald-600/80 uppercase tracking-widest">
              Facturados / Cobrados
            </span>
            <h4 className="text-[20px] font-black text-emerald-700 leading-none mt-1">
              {facturados}
            </h4>
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="bg-white border border-gray-100 rounded-md shadow-xl overflow-hidden p-2">
        <DataTable
          columnas={columnas}
          datos={guiasFiltrados || []}
          loading={isLoading}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          mostrarBuscador={true}
          placeholderBuscador="Buscar por guía, cliente, trayecto..."
          elementosSuperior={
            <div className="w-[200px]">
              <FechaInput
                label="Fecha de Planilla"
                value={fecha}
                onChange={setFecha}
              />
            </div>
          }
          botonAgregar={{
            texto: "Registrar Guía Rápida",
            onClick: () => navigate("/panel/transporte/crear-guia"),
          }}
          acciones={acciones}
        />
      </div>
    </ContenedorSeccion>
  );
};

// Flecha pequeña para la visualización del trayecto
const ArrowRight = ({ size = 16, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default GuiasPendientes;
