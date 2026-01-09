import { useFacturas } from "../../../../api/hooks/Ventas/Facturas/useFacturas";
import Select from "../../../UI/Select/Select";
import TablaReutilizable from "../../../UI/TablaReutilizable/TablaReutilizable";
import FechaInput from "../../../UI/FechaInput/FechaInput";
import TarjetaInformacion from "../../../UI/TarjetaInformacion/TarjetaInformacion";
import { columnasFacturas } from "./ColumnaFacturas";

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
    manejarDetalle,
    manejarEditar,
    manejarEliminar,
  } = useFacturas();

  const totalFacturado = facturas.reduce((acc, f) => acc + f.total, 0);

  return (
    <div className="space-y-4">
      {/* Cards */}
      <div className="grid grid-cols-3 gap-4">
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
      <div className="px-6 py-4 card bg-[var(--fill)] shadow-md rounded-md">
        <TablaReutilizable
          columnas={columnasFacturas}
          datos={facturas}
          mostrarBuscador
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          mostrarAcciones={true}
          onVer={manejarDetalle}
          onEditar={manejarEditar}
          onEliminar={manejarEliminar}
          onDescargar={manejarDetalle}
          placeholderBuscador="Buscar por número o cliente..."
          botonAgregar={{
            texto: "Nueva factura",
            ruta: "/panel/ventas/facturas/nueva",
          }}
          // 👇 NUEVAS PROPS PARA FILTROS
          mostrarFiltros={true}
          textoFiltros="Filtros avanzados"
          filtrosAbiertosInicial={false} // opcional, por defecto cerrado
          filtrosElementos={
            <>
              {/* Tipo de factura */}
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

              {/* Estado */}
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

              {/* Fecha desde */}
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
    </div>
  );
};

export default TablaFacturas;
