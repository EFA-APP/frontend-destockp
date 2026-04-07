import { useFacturas } from "../../../../Backend/hooks/Ventas/Facturas/useFacturas";
import Select from "../../../UI/Select/Select";
import DataTable from "../../../UI/DataTable/DataTable";
import TarjetaInformacion from "../../../UI/TarjetaInformacion/TarjetaInformacion";
import { columnasComprobantes } from "./ColumnaComprobantes";
import { useMemo, useState, useEffect } from "react";
import ModalDetalleGenerico from "../../../UI/ModalDetalleBase/ModalDetalleGenerico";
import { facturaConfig } from "../../../Modales/Ventas/ConfigFactura";
import FechaInput from "../../../UI/FechaInput/FechaInput";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { ObtenerTiposComprobanteApi } from "../../../../Backend/Arca/api/arca.api";
import { useArcaStore } from "../../../../store/useArcaStore";
import { accionesComprobantes } from "./AccionesComprobantes";
import { ComprobanteIcono, VentasIcono, DineroIcono } from "../../../../assets/Icons";
import { TrendingUp, LayoutGrid, Calendar } from "lucide-react";
import ComprobantePDF from "./ComprobantePDF";
import { pdf } from "@react-pdf/renderer";

const TablaComprobantes = () => {
  const { usuario, unidadActiva } = useAuthStore();
  const {
    facturas,
    meta,
    isLoading,
    busqueda,
    setBusqueda,
    tipoFactura,
    setTypeFactura,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    isFiscal,
    setIsFiscal,
  } = useFacturas();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);

  const handleVerDetalle = (fila) => {
    setSeleccionado(fila);
    setModalAbierto(true);
  };

  const handleVerAdjuntos = async (fila) => {
    // Generar PDF y descargar usando implementación nativa para evitar dependencias externas
    try {
      const blob = await pdf(
        <ComprobantePDF 
          comprobante={fila} 
          vendedorConfig={usuario} 
          arcaConfig={arcaConfig}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Comprobante-${fila.ptoVenta}-${fila.numeroComprobante}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generando PDF:", error);
    }
  };

  // Datos dinámicos de ARCA
  const [tiposARCA, setTiposARCA] = useState([]);
  const [cargandoTipos, setCargandoTipos] = useState(false);

  // 1. Carga de Tipos de Comprobante Dinámicos 
  const { arcaConfig } = useArcaStore(); // Consumimos el encabezado precargado desde el store

  useEffect(() => {
    const fetchDatosArca = async () => {
      if (usuario?.conexionArca) {
        setCargandoTipos(true);
        try {
          const resTipos = await ObtenerTiposComprobanteApi();
          const dataRaw = Array.isArray(resTipos) ? resTipos : (resTipos?.data || []);
          const vouchersReal = Array.isArray(dataRaw) ? dataRaw : (dataRaw?.data || []);
          if (Array.isArray(vouchersReal)) {
            setTiposARCA(vouchersReal.map(t => ({ valor: String(t.Id), texto: t.Desc })));
          }
        } catch (e) {
          console.error("Error cargando tipos ARCA:", e);
        } finally {
          setCargandoTipos(false);
        }
      }
    };
    fetchDatosArca();
  }, [usuario?.id]);

  // 2. Lógica de visibilidad del filtro fiscal (Detección Real)
  const tieneConexionArca = useMemo(() => {
    return !!usuario?.conexionArca;
  }, [usuario]);

  // 3. Totales
  const totalFacturadoFacturas = useMemo(() => {
    return facturas?.reduce((acc, f) => acc + (f.total || 0), 0) || 0;
  }, [facturas]);

  // 4. Opciones de Clase (Mezcla estáticas + ARCA)
  const opcionesClase = useMemo(() => {
    if (tiposARCA.length > 0) {
      return [{ valor: "TODAS", texto: "TODOS LOS COMPROBANTES" }, ...tiposARCA];
    }
    return [
      { valor: "TODAS", texto: "Todos los Comprobantes" },
      { valor: "99", texto: "Ticket No Fiscal" },
    ];
  }, [tiposARCA]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ModalDetalleGenerico
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        data={seleccionado}
        {...facturaConfig}
      />

      {/* Tarjetas con Colores de Empresa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-white/5 p-6 rounded-md shadow-2xl transition-all hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/10 blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-[var(--primary)]/20 transition-all duration-700" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center border border-[var(--primary)]/20 text-[var(--primary)]">
              <DineroIcono size={24} />
            </div>
            <div>
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Facturación Listada</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white italic tracking-tighter">
                  ${totalFacturadoFacturas.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </span>
                <TrendingUp size={14} className="text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative group overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-white/5 p-6 rounded-md shadow-2xl transition-all hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-400">
              <LayoutGrid size={24} />
            </div>
            <div>
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Total Registros</h3>
              <span className="text-2xl font-black text-white italic tracking-tighter">
                {meta.totalItems || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="relative group overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-white/5 p-6 rounded-md shadow-2xl transition-all hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 text-emerald-400">
              <VentasIcono size={24} />
            </div>
            <div>
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Ticket Promedio</h3>
              <span className="text-2xl font-black text-white italic tracking-tighter">
                ${(totalFacturadoFacturas / (meta.totalItems || 1)).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla Maestra con Diseño Identitario */}
      <div className="rounded-2xl overflow-hidden shadow-2xl">
        <DataTable
          id_tabla="comprobantes_final_v1"
          llaveTituloMobile="numeroComprobante"
          columnas={columnasComprobantes}
          datos={facturas}
          cargando={isLoading}
          mostrarBuscador
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          mostrarAcciones={true}
          acciones={accionesComprobantes({
            handleVerDetalle,
            handleVerAdjuntos
          })}
          placeholderBuscador="Factura, Receptor, Fecha..."
          mostrarFiltros={true}
          textoFiltros="Opciones de Busqueda"
          filtrosAbiertosInicial={false}
          filtrosElementos={
            <div className="flex flex-wrap items-center gap-8 p-6 bg-[var(--fill-secondary)] rounded-2xl border border-[var(--border-medium)] mt-4 shadow-inner">

              {/* SELECTORES CON COLORES DINÁMICOS - SOLO SI HAY AFIP */}
              {tieneConexionArca && (
                <>
                  {isFiscal !== "INTERNA" && (
                    <div className="flex-1 min-w-[240px]">
                      <Select
                        valor={tipoFactura}
                        label={"Tipo de Comprobante / Clase:"}
                        setValor={setTypeFactura}
                        options={opcionesClase}
                        cargando={cargandoTipos}
                      />
                    </div>
                  )}

                  <div className="min-w-[220px]">
                    <Select
                      valor={isFiscal}
                      label={"Condición Fiscal:"}
                      setValor={setIsFiscal}
                      options={[
                        { valor: "TODAS", texto: "Fiscal e Interno" },
                        { valor: "FISCAL", texto: "Emitidos vía AFIP" },
                        { valor: "INTERNA", texto: "Ventas Internas" },
                      ]}
                    />
                  </div>
                </>
              )}

              {/* RANGO DE FECHAS PREMIUM */}
              <div className={`flex flex-col gap-2 p-4 bg-[var(--surface)] rounded-2xl border border-[var(--border-gray)] shadow-sm ${!tieneConexionArca ? 'flex-1' : ''}`}>
                <span className="text-[11px] text-[var(--primary)] font-bold uppercase tracking-wider ml-1 opacity-80">Período de Facturación</span>
                <div className="flex items-center gap-4">
                  <FechaInput
                    label="Desde"
                    value={fechaDesde}
                    onChange={setFechaDesde}
                    size="sm"
                  />
                  <div className="h-6 w-px bg-[var(--border-medium)]"></div>
                  <FechaInput
                    label="Hasta"
                    value={fechaHasta}
                    onChange={setFechaHasta}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default TablaComprobantes;
