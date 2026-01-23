import { useOrdenesVenta } from "../../../../api/hooks/Ventas/OrdenDeVentas/useOrdenDeVentas";
import Select from "../../../UI/Select/Select";
import TablaReutilizable from "../../../UI/TablaReutilizable/TablaReutilizable";
import FechaInput from "../../../UI/FechaInput/FechaInput";
import TarjetaInformacion from "../../../UI/TarjetaInformacion/TarjetaInformacion";
import { columnasOrdenesVenta } from "./ColumnaOrdenDeVentas";
import { accionesOrdenDeVenta } from "./AccionesOrdenDeVenta";
import ModalDetalleGenerico from "../../../UI/ModalDetalleBase/ModalDetalleGenerico";
import { useState } from "react";
import ordenDeVentaConfig from "../../../Modales/Ventas/ConfigOrdenDeVenta";

const TablaOrdenDeVentas = () => {
  const {
    ordenes,
    busqueda,
    setBusqueda,
    estadoOrden,
    setEstadoOrden,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
  } = useOrdenesVenta();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);

  const handleVerDetalle = (articulo) => {
    setSeleccionado(articulo);
    setModalAbierto(true);
  };

  const totalOrdenes = ordenes.reduce((acc, o) => acc + o.total, 0);

  const pendientes = ordenes.filter((o) => o.estado === "pendiente").length;

  return (
    <div className="space-y-4">
      <ModalDetalleGenerico
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        data={seleccionado}
        {...ordenDeVentaConfig}
        width="w-[420px]"
      />

      {/* Cards */}
      <div className="grid grid-cols-3 gap-4">
        <TarjetaInformacion
          titulo="Total en órdenes"
          color="text-green-400"
          valorMoneda
          numero={totalOrdenes}
        />

        <TarjetaInformacion
          titulo="Órdenes pendientes"
          color="text-yellow-400"
          numero={pendientes}
        />

        <TarjetaInformacion
          titulo="Órdenes emitidas"
          color="text-blue-400"
          numero={ordenes.length}
        />
      </div>

      {/* Tabla */}
      <div className="px-6 py-4 card bg-[var(--fill)] shadow-md rounded-md">
        <TablaReutilizable
          columnas={columnasOrdenesVenta}
          datos={ordenes}
          mostrarBuscador
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          mostrarAcciones={true}
          acciones={accionesOrdenDeVenta({ handleVerDetalle })}
          placeholderBuscador="Buscar por número o cliente..."
          botonAgregar={{
            texto: "Nueva orden",
            ruta: "/panel/ventas/orden-ventas/nueva",
          }}
          mostrarFiltros
          textoFiltros="Filtros avanzados"
          filtrosAbiertosInicial={false}
          filtrosElementos={
            <div className="flex flex-wrap gap-4 items-end">
              {/* Estado */}
              <Select
                label="Estado:"
                valor={estadoOrden}
                setValor={setEstadoOrden}
                options={[
                  { valor: "TODAS", texto: "Todas" },
                  { valor: "pendiente", texto: "Pendientes" },
                  { valor: "confirmada", texto: "Confirmadas" },
                  { valor: "facturada", texto: "Facturadas" },
                  { valor: "cancelada", texto: "Canceladas" },
                ]}
              />

              {/* Fecha */}
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
            </div>
          }
        />
      </div>
    </div>
  );
};

export default TablaOrdenDeVentas;
