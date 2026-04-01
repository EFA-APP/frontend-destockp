import { useFacturas } from "../../../../Backend/hooks/Ventas/Facturas/useFacturas";
import Select from "../../../UI/Select/Select";
import DataTable from "../../../UI/DataTable/DataTable";
import TarjetaInformacion from "../../../UI/TarjetaInformacion/TarjetaInformacion";
import { columnasComprobantes } from "./ColumnaComprobantes";
import { useState } from "react";
import ModalDetalleGenerico from "../../../UI/ModalDetalleBase/ModalDetalleGenerico";
import { facturaConfig } from "../../../Modales/Ventas/ConfigFactura";
import FechaInput from "../../../UI/FechaInput/FechaInput";

const TablaComprobantes = () => {
  const {
    facturas,
    meta,
    isLoading,
    isError,
    busqueda,
    setBusqueda,
    tipoFactura,
    setTypeFactura,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    isFiscal,      // NUEVO
    setIsFiscal,   // NUEVO
    setPagina,
    pagina
  } = useFacturas();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);


  // Cálculo de totales desde los datos reales de la query
  const totalFacturadoFacturas = facturas?.reduce((acc, f) => acc + (f.total || 0), 0) || 0;

  return (
    <div className="space-y-4">
      {/* Modal de Detalle */}
      <ModalDetalleGenerico
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        data={seleccionado}
        {...facturaConfig}
      />

      {/* Tarjetas de Resumen Dinámicas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TarjetaInformacion
          titulo="Total de esta vista"
          color="text-emerald-400"
          valorMoneda
          numero={totalFacturadoFacturas}
          cargando={isLoading}
        />

        <TarjetaInformacion
          titulo="Resultados"
          color="text-indigo-400"
          numero={meta.totalItems || 0}
          cargando={isLoading}
        />

        <TarjetaInformacion
          titulo="Periodo Actual"
          color="text-amber-400"
          valorMoneda
          numero={totalFacturadoFacturas}
          cargando={isLoading}
        />
      </div>

      {/* Tabla Maestra */}
      <DataTable
        id_tabla="comprobantes_v2"
        llaveTituloMobile="numeroComprobante"
        columnas={columnasComprobantes}
        datos={facturas}
        cargando={isLoading}
        mostrarBuscador
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        mostrarAcciones={false}
        placeholderBuscador="Búscar por número, receptor o cliente..."
        botonAgregar={{
          texto: "Nuevo Comprobante",
          ruta: "/panel/ventas/facturas/nueva",
        }}
        mostrarFiltros={true}
        textoFiltros="Filtros por Período y Estado"
        filtrosAbiertosInicial={false}
        filtrosElementos={
          <>
            <Select
              valor={tipoFactura}
              label={"Clase:"}
              setValor={setTypeFactura}
              options={[
                { valor: "TODAS", texto: "Todas las Clases" },
                { valor: "1", texto: "Facturas A (1)" },
                { valor: "6", texto: "Facturas B (6)" },
                { valor: "11", texto: "Facturas C (11)" },
              ]}
            />

            {/* FILTRO FISCAL INTEGRADO */}
            <Select
              valor={isFiscal}
              label={"Condición Doc:"}
              setValor={setIsFiscal}
              options={[
                { valor: "TODAS", texto: "Todos (Fiscal e Interno)" },
                { valor: "FISCAL", texto: "Facturas Registradas (Fiscal)" },
                { valor: "INTERNA", texto: "Solo Internas" },
              ]}
            />

            <FechaInput
              label="Desde:"
              value={fechaDesde}
              onChange={setFechaDesde}
              size="sm"
            />
            <FechaInput
              label="Hasta:"
              value={fechaHasta}
              onChange={setFechaHasta}
              size="sm"
            />
          </>
        }
      />
    </div>
  );
};

export default TablaComprobantes;
