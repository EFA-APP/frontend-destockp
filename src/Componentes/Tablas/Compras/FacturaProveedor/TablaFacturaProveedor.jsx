import { useFacturasProveedor } from "../../../../Backend/hooks/Compras/FacturasProveedor/useFacturaProveedor";
import FechaInput from "../../../UI/FechaInput/FechaInput";
import Select from "../../../UI/Select/Select";
import DataTable from "../../../UI/DataTable/DataTable";
import { accionesFacturaProveedor } from "./AccionesFacturaProveedor";
import { columnasFacturasProveedor } from "./ColumnasFacturaProveedor";
import { LayoutGrid, FileText, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { pdf } from "@react-pdf/renderer";
import ComprobantePDF from "../../Ventas/Comprobantes/ComprobantePDF";
import { ObtenerTiposComprobanteApi } from "../../../../Backend/Arca/api/arca.api";
import { useAuthStore } from "../../../../Backend/Autenticacion/store/authenticacion.store";
import DetalleComprobanteDrawer from "../../Ventas/Comprobantes/DetalleComprobanteDrawer";
import React, { useEffect, useMemo, useState } from "react";

const TablaFacturasProveedor = () => {
  const navigate = useNavigate();
  const { usuario, unidadActiva } = useAuthStore();
  const facturasData = useFacturasProveedor();
  const {
    facturas,
    busqueda,
    setBusqueda,
    tipoFactura,
    setTypeFactura,
    estadoFactura,
    setEstadoFactura,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    isBlanco,
    setIsBlanco,
    meta,
    isLoading,
    setPagina,
    unidadNegocio,
    setUnidadNegocio,
  } = facturasData;

  const [tiposComprobante, setTiposComprobante] = useState([]);
  const [cargandoTipos, setCargandoTipos] = useState(false);

  useEffect(() => {
    const cargarTipos = async () => {
      setCargandoTipos(true);
      try {
        const res = await ObtenerTiposComprobanteApi();
        const raw = Array.isArray(res) ? res : res?.data || [];

        const mapeados = raw.map((v) => ({
          valor: v.Id,
          texto: v.Desc,
        }));

        // Agregar Internos
        const internos = [
          { valor: 991, texto: "COMPROBANTE VENTA (I)" },
          { valor: 992, texto: "RECIBO COBRO (I)" },
          { valor: 993, texto: "NOTA CRÉDITO (I)" },
          { valor: 994, texto: "NOTA DÉBITO (I)" },
        ];

        setTiposComprobante([
          { valor: "TODAS", texto: "TODOS LOS COMP." },
          ...mapeados,
          ...internos,
        ]);
      } catch (error) {
        console.error("Error cargando tipos comprobante:", error);
        // Fallback solo internos
        setTiposComprobante([
          { valor: "TODAS", texto: "TODOS LOS COMP." },
          { valor: 991, texto: "COMPROBANTE VENTA (I)" },
          { valor: 992, texto: "RECIBO COBRO (I)" },
          { valor: 993, texto: "NOTA CRÉDITO (I)" },
          { valor: 994, texto: "NOTA DÉBITO (I)" },
        ]);
      } finally {
        setCargandoTipos(false);
      }
    };
    cargarTipos();
  }, []);

  const opcionesUnidad = useMemo(() => {
    return (usuario?.unidadesNegocio || []).map((un) => ({
      valor: un.codigoSecuencial,
      texto: un.nombre,
    }));
  }, [usuario]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);

  const handleVerDetalle = (fila) => {
    setSeleccionado(fila);
    setModalAbierto(true);
  };

  const handleVerAdjuntos = async (fila) => {
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

  const handleEmitirPago = (fila, modo = "PAGO") => {
    navigate("/panel/compras/factura-proveedor", {
      state: {
        comprobanteAsociado: fila,
        emitirPago: modo === "PAGO",
        emitirNC: modo === "NC",
        emitirND: modo === "ND",
      },
    });
  };

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
          const active = facturasData.condicionVenta === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => facturasData.setCondicionVenta(opt.id)}
              className={`
                relative px-4 py-1.5 rounded-md text-[12px] font-black uppercase tracking-widest cursor-pointer
                ${
                  active
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

  const tieneConexionArca = useMemo(() => {
    return !!usuario?.conexionArca;
  }, [usuario]);

  useEffect(() => {
    if (!tieneConexionArca) {
      setIsBlanco("INTERNA");
    }
  }, [tieneConexionArca, setIsBlanco]);

  const renderizarDetalles = (fila) => {
    const formatearMonto = (monto) => {
      return Number(monto || 0).toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    return (
      <div className="bg-[var(--surface)] rounded-md border border-[var(--border-subtle)] overflow-hidden shadow-sm m-2">
        {!fila.detalles || fila.detalles.length === 0 ? (
          <div className="text-center py-4 text-[var(--text-muted)] font-medium text-[13px]">
            No hay productos asociados a este comprobante.
          </div>
        ) : (
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
        )}
      </div>
    );
  };

  if (!unidadNegocio) {
    return (
      <div className="space-y-8 mt-4">
        <div className="rounded-md">
          <DataTable
            id_tabla="comprobantes_prov_placeholder"
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
          <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-md flex items-center justify-center mb-6 border border-[var(--primary)]/20 rotate-3">
            <LayoutGrid size={40} className="text-[var(--primary)]" />
          </div>
          <h2 className="text-2xl font-black text-black italic tracking-tighter mb-2">
            Contexto <span className="text-[var(--primary)]">Requerido</span>
          </h2>
          <p className="text-black/40 text-sm font-medium uppercase tracking-[0.2em] max-w-[300px] text-center">
            Debe seleccionar una unidad de negocio para visualizar el listado de
            facturas de proveedor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-4">
      {/* Tabla */}
      <DataTable
        id_tabla="facturaproveedor_v1"
        columnas={columnasFacturasProveedor}
        datos={facturas}
        loading={isLoading}
        isFetching={facturasData.isFetching}
        meta={meta}
        onPageChange={(p) => facturasData.setPagina(p)}
        onLimitChange={(l) => {
          facturasData.setLimite(l);
          facturasData.setPagina(1);
        }}
        mostrarBuscador
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        acciones={accionesFacturaProveedor({
          handleVerDetalle,
          handleVerAdjuntos,
          handleEmitirPago,
        })}
        mostrarAcciones={true}
        placeholderBuscador="Buscar por número o proveedor..."
        mostrarFiltros={false}
        renderDetalle={renderizarDetalles}
        todasExpandidas={false}
        elementosSuperior={
          <div className="flex flex-wrap items-center gap-3">
            {/* SELECTOR DE UNIDAD DE NEGOCIO */}
            <div className="w-[180px]">
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

            {/* TIPO DE COMPROBANTE */}
            <div className="w-[180px]">
              <Select
                valor={tipoFactura}
                setValor={setTypeFactura}
                options={tiposComprobante}
                loading={cargandoTipos}
              />
            </div>

            {/* CONDICIÓN FISCAL / BLANCO-NEGRO */}
            {tieneConexionArca && (
              <div className="w-[160px]">
                <Select
                  valor={isBlanco}
                  setValor={setIsBlanco}
                  options={[
                    { valor: "TODAS", texto: "TODOS LOS REG." },
                    { valor: "FISCAL", texto: "VÍA AFIP" },
                    { valor: "INTERNA", texto: "INTERNAS" },
                  ]}
                />
              </div>
            )}

            {/* CONDICIÓN DE VENTA (TABS) */}
            <CondicionVentaTabs />

            {/* RANGO DE FECHAS */}
            <div className="flex items-center gap-1 bg-[var(--surface)] border border-[var(--border-subtle)] px-2 rounded-md h-[42px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[var(--primary)]/30 transition-colors">
              <FechaInput
                value={fechaDesde}
                onChange={setFechaDesde}
                size="sm"
                className="bg-transparent! border-none! shadow-none! min-w-[110px] text-xs!"
              />
              <div className="w-px h-4 bg-black/10"></div>
              <FechaInput
                value={fechaHasta}
                onChange={setFechaHasta}
                size="sm"
                className="bg-transparent! border-none! shadow-none! min-w-[110px] text-xs!"
              />
            </div>
          </div>
        }
      />
      <DetalleComprobanteDrawer
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        data={seleccionado}
        usuario={usuario}
      />
    </div>
  );
};

export default TablaFacturasProveedor;
