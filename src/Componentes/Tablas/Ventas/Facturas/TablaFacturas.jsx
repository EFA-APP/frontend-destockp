import { useFacturas } from "../../../../Backend/hooks/Ventas/Facturas/useFacturas";
import Select from "../../../UI/Select/Select";
import DataTable from "../../../UI/DataTable/DataTable";
import TarjetaInformacion from "../../../UI/TarjetaInformacion/TarjetaInformacion";
import { columnasFacturas } from "./ColumnaFacturas";
import { accionesFactura } from "./AccionesFactura";
import { useState } from "react";
import ModalDetalleGenerico from "../../../UI/ModalDetalleBase/ModalDetalleGenerico";
import { facturaConfig } from "../../../Modales/Ventas/ConfigFactura";
import FechaInput from "../../../UI/FechaInput/FechaInput";

const TablaFacturas = () => {
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
  } = useFacturas();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);

  const handleVerDetalle = (articulo) => {
    setSeleccionado(articulo);
    setModalAbierto(true);
  };

  const totalFacturado = facturas.reduce((acc, f) => acc + f.total, 0);

  return (
    <div className="space-y-4">
      {/* Modal de factura */}
      <ModalDetalleGenerico
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        data={seleccionado}
        {...facturaConfig}
      />

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TarjetaInformacion
          titulo="Facturación total"
          color="text-green-400"
          valorMoneda
          numero={totalFacturado}
        />

        <TarjetaInformacion
          titulo="Pendientes"
          color="text-yellow-400"
          numero={facturas.filter((f) => f.estado === "pendiente").length}
        />

        <TarjetaInformacion
          titulo="Facturas emitidas"
          color="text-blue-400"
          numero={facturas.length}
        />
      </div>

      {/* Tabla */}
      <DataTable
        id_tabla="facturas"
        llaveTituloMobile="numero"
        columnas={columnasFacturas}
        datos={facturas}
        mostrarBuscador
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        mostrarAcciones={true}
        acciones={accionesFactura({ handleVerDetalle })}
        placeholderBuscador="Buscar por número o cliente..."
        botonAgregar={{
          texto: "Nueva factura",
          ruta: "/panel/ventas/facturas/nueva",
        }}
        mostrarFiltros={true}
        textoFiltros="Filtros avanzados"
        filtrosAbiertosInicial={false}
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
                { valor: "BLANCO", texto: "Registrada (Fiscal)" },
                { valor: "NEGRO", texto: "No registrada" },
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

export default TablaFacturas;
