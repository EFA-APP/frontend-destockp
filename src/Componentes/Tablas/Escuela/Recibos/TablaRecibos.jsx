import Select from "../../../UI/Select/Select";
import TablaReutilizable from "../../../UI/TablaReutilizable/TablaReutilizable";
import FechaInput from "../../../UI/FechaInput/FechaInput";
import TarjetaInformacion from "../../../UI/TarjetaInformacion/TarjetaInformacion";
import { columnasRecibos } from "./ColumnasRecibos";
import { useRecibos } from "../../../../api/hooks/Escuela/Recibos/useRecibos";

const TablaRecibos = () => {
  const {
    recibos,
    busqueda,
    setBusqueda,
    metodoPago,
    setMetodoPago,
    estadoRecibo,
    setEstadoRecibo,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    obtenerEstadisticas,
    manejarDetalle,
    manejarImprimir,
    anularRecibo,
  } = useRecibos();

  const estadisticas = obtenerEstadisticas();

  return (
    <div className="space-y-4">
      {/* Cards de estadísticas */}
      <div className="grid grid-cols-4 gap-4">
        <TarjetaInformacion
          titulo="Total recaudado"
          color="text-green-400"
          valorMoneda
          numero={estadisticas.totalRecaudado}
        />

        <TarjetaInformacion
          titulo="Recibos emitidos"
          color="text-blue-400"
          numero={estadisticas.totalRecibos}
        />

        <TarjetaInformacion
          titulo="Con mora"
          color="text-orange-400"
          numero={estadisticas.recibosConMora}
        />

        <TarjetaInformacion
          titulo="Prom. días atraso"
          color="text-yellow-400"
          numero={estadisticas.promedioDiasAtraso}
        />
      </div>

      {/* Tarjetas adicionales de análisis */}
      <div className="grid grid-cols-3 gap-4">
        <TarjetaInformacion
          titulo="Total descuentos"
          color="text-blue-400"
          valorMoneda
          numero={estadisticas.totalDescuentos}
          subtexto="Aplicados este período"
        />

        <TarjetaInformacion
          titulo="Total intereses"
          color="text-red-400"
          valorMoneda
          numero={estadisticas.totalIntereses}
          subtexto="Por pagos con mora"
        />

        <div className="px-4 py-3 card bg-[var(--fill)] shadow-md rounded-md">
          <h3 className="text-sm text-gray-400 mb-2">Métodos de pago</h3>
          <div className="space-y-1">
            {Object.entries(estadisticas.recaudacionPorMetodo).map(
              ([metodo, monto]) => (
                <div
                  key={metodo}
                  className="flex justify-between items-center text-xs"
                >
                  <span className="text-gray-300">{metodo}</span>
                  <span className="font-medium text-green-400">
                    ${monto.toLocaleString("es-AR")}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <div className="px-6 py-4 card bg-[var(--fill)] shadow-md rounded-md">
        <TablaReutilizable
          columnas={columnasRecibos}
          datos={recibos}
          mostrarBuscador
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          mostrarAcciones={true}
          onVer={manejarDetalle}
          onDescargar={manejarImprimir}
          onEliminar={anularRecibo}
          placeholderBuscador="Buscar por número, alumno, DNI o curso..."
          botonAgregar={{
            texto: "Nuevo recibo",
            ruta: "/panel/escuela/recibos/nuevo",
          }}
          // Filtros avanzados
          mostrarFiltros={true}
          textoFiltros="Filtros de búsqueda"
          filtrosAbiertosInicial={false}
          filtrosElementos={
            <>
              {/* Método de pago */}
              <Select
                valor={metodoPago}
                label="Método:"
                setValor={setMetodoPago}
                options={[
                  { valor: "TODOS", texto: "Todos los métodos" },
                  { valor: "Efectivo", texto: "Efectivo" },
                  { valor: "Transferencia", texto: "Transferencia" },
                  { valor: "Mercado Pago", texto: "Mercado Pago" },
                  { valor: "Cheque", texto: "Cheque" },
                  { valor: "Débito", texto: "Débito" },
                  { valor: "Crédito", texto: "Crédito" },
                ]}
              />

              {/* Estado del recibo */}
              <Select
                valor={estadoRecibo}
                label="Estado:"
                setValor={setEstadoRecibo}
                options={[
                  { valor: "TODOS", texto: "Todos" },
                  { valor: "pagado", texto: "Pagados" },
                  { valor: "anulado", texto: "Anulados" },
                ]}
              />

              {/* Fecha desde */}
              <FechaInput
                label="Desde:"
                value={fechaDesde}
                onChange={setFechaDesde}
                size="sm"
              />

              {/* Fecha hasta */}
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

export default TablaRecibos;
