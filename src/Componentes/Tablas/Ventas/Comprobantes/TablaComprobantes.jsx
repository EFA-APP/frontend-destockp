import { useFacturas } from "../../../../Backend/hooks/Ventas/Facturas/useFacturas";
import Select from "../../../UI/Select/Select";
import DataTable from "../../../UI/DataTable/DataTable";
import { columnasComprobantes } from "./ColumnaComprobantes";
import { useMemo, useState, useEffect } from "react";
import FechaInput from "../../../UI/FechaInput/FechaInput";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { ObtenerTiposComprobanteApi } from "../../../../Backend/Arca/api/arca.api";
import { accionesComprobantes } from "./AccionesComprobantes";
import { VentasIcono, DineroIcono } from "../../../../assets/Icons";
import { TrendingUp, LayoutGrid } from "lucide-react";
import ComprobantePDF from "./ComprobantePDF";
import { pdf } from "@react-pdf/renderer";

import DetalleComprobanteDrawer from "./DetalleComprobanteDrawer";

const TablaComprobantes = () => {
  const { usuario, unidadActiva } = useAuthStore();
  const {
    facturas,
    meta,
    isLoading,
    isFetching,
    isError,
    pagina,
    setPagina,
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
    condicionVenta,
    setCondicionVenta,
    unidadNegocio,
    setUnidadNegocio,
    manejarDetalle,
    manejarEditar,
    manejarEliminar,
    refetch,
  } = useFacturas();

  const opcionesUnidad = useMemo(() => {
    return (usuario?.unidadesNegocio || []).map((un) => ({
      valor: un.codigoSecuencial,
      texto: un.nombre,
    }));
  }, [usuario]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);

  // --- SUBCOMPONENTE DE TABS PREMIUM ---
  const CondicionVentaTabs = () => {
    const options = [
      { id: "TODAS", label: "Todos", icon: null },
      { id: "contado", label: "Contado", icon: null },
      { id: "cuenta_corriente", label: "Cta. Cte.", icon: null },
    ];

    return (
      <div className="flex">
        {options.map((opt) => {
          const active = condicionVenta === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setCondicionVenta(opt.id)}
              className={`
                relative px-4  py-1.5 rounded-md text-[12px] font-black uppercase tracking-widest   cursor-pointer
                ${active
                  ? "text-[var(--primary)] shadow-xl shadow-[var(--primary)]/10"
                  : "text-[var(--primary)]/60 hover:text-[var(--primary)]/60 hover:bg-[var(--primary)]/5"
                }
              `}
            >
              {active && (
                <div className="absolute inset-0 bg-[var(--primary)]/10 rounded-md border-2 border-[var(--primary)]/20" />
              )}
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  };

  const handleVerDetalle = (fila) => {
    setSeleccionado(fila);
    setModalAbierto(true);
  };

  const handleVerAdjuntos = async (fila) => {
    // Generar PDF y descargar usando implementación nativa
    try {
      const blob = await pdf(
        <ComprobantePDF comprobante={fila} usuario={usuario} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const fileName = `${fila.cae || "SIN_CAE"}-${String(fila.puntoVenta || 1).padStart(5, "0")}-${String(fila.numeroComprobante || 0).padStart(8, "0")}.pdf`;
      link.download = fileName;
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
  useEffect(() => {
    const fetchDatosArca = async () => {
      if (usuario?.conexionArca) {
        setCargandoTipos(true);
        try {
          const resTipos = await ObtenerTiposComprobanteApi();

          // Procesar Tipos
          const dataRaw = Array.isArray(resTipos)
            ? resTipos
            : resTipos?.data || [];
          const vouchersReal = Array.isArray(dataRaw)
            ? dataRaw
            : dataRaw?.data || [];
          if (Array.isArray(vouchersReal)) {
            setTiposARCA(
              vouchersReal.map((t) => ({ valor: String(t.Id), texto: t.Desc })),
            );
          }
        } catch (e) {
          console.error("Error cargando tipos de ARCA:", e);
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
    return [
      { valor: "TODAS", texto: "Todos los Comprobantes" },
      { valor: "99", texto: "Ticket No Fiscal" },
    ];
  }, [tiposARCA]);

  if (!unidadNegocio) {
    return (
      <div className="space-y-8">
        <div className="rounded-md">
          <DataTable
            id_tabla="comprobantes_placeholder"
            columnas={[]}
            datos={[]}
            loading={false}
            mostrarBuscador={false}
            elementosSuperior={
              <div className="flex flex-wrap items-center gap-4 bg-zinc-950/40 backdrop-blur-md border border-black/5 p-2 rounded-2xl shadow-2xl">
                <div className="min-w-[220px]">
                  <Select
                    valor={unidadNegocio}
                    setValor={setUnidadNegocio}
                    options={[
                      { valor: null, texto: "SELECCIONE UNA UNIDAD" },
                      ...opcionesUnidad,
                    ]}
                  />
                </div>
              </div>
            }
          />
        </div>

        <div className="flex flex-col items-center justify-center py-32 rounded-3xl bg-zinc-950/20 border border-black/5 border-dashed">
          <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-[2.5rem] flex items-center justify-center mb-6 border border-[var(--primary)]/20 rotate-3">
            <LayoutGrid size={40} className="text-[var(--primary)]" />
          </div>
          <h2 className="text-2xl font-black text-black italic tracking-tighter mb-2">
            Contexto <span className="text-[var(--primary)]">Requerido</span>
          </h2>
          <p className="text-black/40 text-sm font-medium uppercase tracking-[0.2em] max-w-[300px] text-center">
            Debe seleccionar una unidad de negocio para visualizar el listado de
            comprobantes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8  mt-4 ">
      <DetalleComprobanteDrawer
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        data={seleccionado}
        usuario={usuario}
      />

      {/* Tabla Maestra con Diseño Identitario */}
      <DataTable
        id_tabla="comprobantes_final_v1"
        llaveTituloMobile="numeroComprobante"
        columnas={columnasComprobantes}
        datos={facturas}
        loading={isLoading}
        isFetching={isFetching}
        mostrarBuscador
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        mostrarAcciones={true}
        acciones={accionesComprobantes({
          handleVerDetalle,
          handleVerAdjuntos,
        })}
        mostrarFiltros={false}
        todasExpandidas={true}
        elementosSuperior={
          <div className="flex flex-wrap items-center gap-3 bg-[var(--fill)] p-1 rounded-md shadow-2xl p-3 ">
            {/* SELECTOR DE UNIDAD DE NEGOCIO */}
            <div className="w-auto">
              <Select
                valor={unidadNegocio}
                setValor={setUnidadNegocio}
                options={[
                  { valor: null, texto: "SIN UNIDAD SELECCIONADA" },
                  ...opcionesUnidad,
                ]}
                placeholder="Elegir Unidad..."
              />
            </div>

            <div className="w-px h-8 bg-[var(--primary)]/20 mx-1 "></div>

            {/* TABS DE CONDICIÓN DE VENTA */}
            <CondicionVentaTabs />

            <div className="w-px h-8 bg-[var(--primary)]/20 mx-1 "></div>

            {/* SELECTORES FISCALES */}
            {tieneConexionArca && (
              <>
                <div className="min-w-[170px]">
                  <Select
                    valor={isFiscal}
                    setValor={setIsFiscal}
                    options={[
                      { valor: "TODAS", texto: "TODOS LOS REGISTROS" },
                      { valor: "FISCAL", texto: "VÍA AFIP" },
                      { valor: "INTERNA", texto: "INTERNAS" },
                    ]}
                  />
                </div>
              </>
            )}

            {/* RANGO DE FECHAS */}
            <div className="flex flex-wrap md:flex-nowrap items-center gap-1 bg-[var(--primary)]/10 p-1 rounded-md shadow-inner">
              <div className="flex items-center">
                <FechaInput
                  value={fechaDesde}
                  onChange={setFechaDesde}
                  size="sm"
                  className="bg-transparent! border-none! min-w-[115px]"
                />
              </div>
              <div className="w-px h-6 bg-black/10 mx-1"></div>
              <div className="flex items-center">
                <FechaInput
                  value={fechaHasta}
                  onChange={setFechaHasta}
                  size="sm"
                  className="bg-transparent! border-none! min-w-[115px]"
                />
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default TablaComprobantes;
