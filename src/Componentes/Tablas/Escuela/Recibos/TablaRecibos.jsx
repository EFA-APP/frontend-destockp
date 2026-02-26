import DataTable from "../../../UI/DataTable/DataTable";
import TarjetaInformacion from "../../../UI/TarjetaInformacion/TarjetaInformacion";
import { columnasRecibos } from "./ColumnasRecibos";
import { useRecibos } from "../../../../Backend/hooks/Escuela/Recibos/useRecibos";

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TarjetaInformacion
          titulo="Total descuentos"
          color="text-blue-400"
          valorMoneda
          numero={estadisticas.totalDescuentos}
          subtexto="Aplicados este período"
        />

        <TarjetaInformacion
          titulo="Total intereses"
          color="text-green-400"
          valorMoneda
          numero={estadisticas.totalIntereses}
          subtexto="Por pagos con mora"
        />

        <div className="px-4 py-3 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl shadow-sm">
          <h3 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Métodos de pago</h3>
          <div className="space-y-2">
            {Object.entries(estadisticas.recaudacionPorMetodo).map(
              ([metodo, monto]) => (
                <div
                  key={metodo}
                  className="flex justify-between items-center text-[10px]"
                >
                  <span className="text-[var(--text-secondary)] font-medium">{metodo}</span>
                  <span className="font-bold text-[var(--primary)]">
                    ${monto.toLocaleString("es-AR")}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Tabla principal */}
      <DataTable
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
        mostrarFiltros={true}
        textoFiltros="Filtros de búsqueda"
        filtrosAbiertosInicial={false}
        filtrosElementos={
          <>
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

export default TablaRecibos;
