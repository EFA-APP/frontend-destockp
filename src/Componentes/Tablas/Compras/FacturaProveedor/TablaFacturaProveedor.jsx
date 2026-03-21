import { useState } from "react";
import { useFacturasProveedor } from "../../../../Backend/hooks/Compras/FacturasProveedor/useFacturaProveedor";
import FechaInput from "../../../UI/FechaInput/FechaInput";
import ModalDetalleGenerico from "../../../UI/ModalDetalleBase/ModalDetalleGenerico";
import Select from "../../../UI/Select/Select";
import DataTable from "../../../UI/DataTable/DataTable";
import TarjetaInformacion from "../../../UI/TarjetaInformacion/TarjetaInformacion";
import { accionesFacturaProveedor } from "./AccionesFacturaProveedor";
import { columnasFacturasProveedor } from "./ColumnasFacturaProveedor";

const TablaFacturasProveedor = () => {
  const {
    facturas,
    busqueda,
    setBusqueda,
    tipoFactura,
    setTipoFactura,
    estadoFactura,
    setEstadoFactura,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    isBlanco,
    setIsBlanco,
  } = useFacturasProveedor();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);

  const handleVerDetalle = (articulo) => {
    setSeleccionado(articulo);
    setModalAbierto(true);
  };

  const totalComprado = facturas.reduce((acc, f) => acc + f.total, 0);

  return (
    <div className="space-y-4">
      {/* Cards */}
      <div className="grid grid-cols-3 gap-4">
        <TarjetaInformacion
          titulo="Total compras"
          color="text-red-400"
          valorMoneda
          numero={totalComprado}
        />

        <TarjetaInformacion
          titulo="Pendientes"
          color="text-yellow-400"
          numero={facturas.filter((f) => f.estado === "pendiente").length}
        />

        <TarjetaInformacion
          titulo="Facturas recibidas"
          color="text-blue-400"
          numero={facturas.length}
        />
      </div>

      {/* Tabla */}
      <DataTable id_tabla="facturaproveedor"
        columnas={columnasFacturasProveedor}
        datos={facturas}
        mostrarBuscador
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        acciones={accionesFacturaProveedor({ handleVerDetalle })}
        mostrarAcciones={true}
        placeholderBuscador="Buscar por número o proveedor..."
        botonAgregar={{
          texto: "Nueva factura de proveedor",
          ruta: "/panel/compras/facturas-proveedores/nueva",
        }}
        mostrarFiltros
        textoFiltros="Filtros avanzados"
        filtrosElementos={
          <>
            <Select
              valor={tipoFactura}
              label={"Tipo: "}
              setValor={setTipoFactura}
              options={[
                { valor: "TODAS", texto: "Todas" },
                { valor: "A", texto: "Facturas A" },
                { valor: "B", texto: "Facturas B" },
                { valor: "C", texto: "Facturas C" },
              ]}
            />

            <Select
              valor={estadoFactura}
              label={"Estado: "}
              setValor={setEstadoFactura}
              options={[
                { valor: "TODAS", texto: "Todas" },
                { valor: "pagada", texto: "Pagadas" },
                { valor: "pendiente", texto: "Pendientes" },
                { valor: "vencida", texto: "Vencidas" },
              ]}
            />

            <Select
              label="Condición fiscal"
              valor={isBlanco}
              setValor={setIsBlanco}
              options={[
                { valor: "TODAS", texto: "Todas" },
                { valor: "BLANCO", texto: "Registradas" },
                { valor: "NEGRO", texto: "No registradas" },
              ]}
            />

            <FechaInput
              label="Desde:"
              value={fechaDesde}
              onChange={setFechaDesde}
            />
            <FechaInput
              label="Hasta:"
              value={fechaHasta}
              onChange={setFechaHasta}
            />
          </>
        }
      />
    </div>
  );
};

export default TablaFacturasProveedor;
