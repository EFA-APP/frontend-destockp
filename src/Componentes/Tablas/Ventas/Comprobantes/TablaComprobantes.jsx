import { useFacturas } from "../../../../Backend/hooks/Ventas/Facturas/useFacturas";
import Select from "../../../UI/Select/Select";
import DataTable from "../../../UI/DataTable/DataTable";
import { columnasComprobantes } from "./ColumnaComprobantes";
import { useMemo, useState, useEffect } from "react";
import FechaInput from "../../../UI/FechaInput/FechaInput";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import { accionesComprobantes } from "./AccionesComprobantes";
import { LayoutGrid } from "lucide-react";
import ComprobantePDF from "./ComprobantePDF";
import { pdf } from "@react-pdf/renderer";

import DetalleComprobanteDrawer from "./DetalleComprobanteDrawer";

const TablaComprobantes = () => {
  const { usuario, unidadActiva } = useAuthStore();
  const {
    facturas,
    isLoading,
    isFetching,
    busqueda,
    setBusqueda,
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

  // 2. Lógica de visibilidad del filtro fiscal (Detección Real)
  const tieneConexionArca = useMemo(() => {
    return !!usuario?.conexionArca;
  }, [usuario]);

  const renderizarDetalles = (fila) => {
    if (!fila.detalles || fila.detalles.length === 0) {
      return (
        <div className="text-center py-4 text-[var(--text-muted)] font-medium text-[13px]">
          No hay productos asociados a este comprobante.
        </div>
      );
    }

    const formatearMonto = (monto) => {
      return Number(monto || 0).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    return (
      <div className="bg-[var(--surface)] rounded-md border border-[var(--border-subtle)] overflow-hidden shadow-sm">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[var(--primary)]/5 text-[10px] text-[var(--primary)]/60 font-black uppercase tracking-widest border-b border-[var(--border-subtle)]">
            <tr>
              <th className="px-6 py-4">Descripción</th>
              <th className="px-6 py-4 text-center">Cant.</th>
              <th className="px-6 py-4 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {fila.detalles.map((item, idx) => (
              <tr
                key={idx}
                className="group hover:bg-[var(--primary)]/5 transition-colors"
              >
                <td className="px-6 py-5">
                  <p className="font-black text-[var(--primary)] uppercase leading-none mb-1">
                    {item.nombre}
                  </p>
                  <p className="text-[10px] font-bold text-[var(--primary)]/60 uppercase tracking-widest">
                    P. Unitario: ${formatearMonto(item.precioUnitario)}
                  </p>
                </td>
                <td className="px-6 py-5 text-center font-black text-[var(--text-muted)]">
                  {item.cantidad}
                </td>
                <td className="px-6 py-5 text-right font-black text-[var(--primary)] tabular-nums">
                  ${formatearMonto(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

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
            todasExpandidas={true}
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
        renderDetalle={renderizarDetalles}
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
