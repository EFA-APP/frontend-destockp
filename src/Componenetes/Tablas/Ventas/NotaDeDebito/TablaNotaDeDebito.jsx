import { useNotasDebito } from "../../../../api/hooks/Ventas/NotaDeDebito/useNotaDeDebito";
import FechaInput from "../../../UI/FechaInput/FechaInput";
import Select from "../../../UI/Select/Select";
import TablaReutilizable from "../../../UI/TablaReutilizable/TablaReutilizable";
import TarjetaInformacion from "../../../UI/TarjetaInformacion/TarjetaInformacion";
import { columnasNotasDebito } from "./ColumnaNotaDeDebito";

const TablaNotaDeDebito = () => {
  const {
    notasDebito,
    busqueda,
    setBusqueda,
    estadoNota,
    setEstadoNota,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    isBlanco,
    setIsBlanco,
    tipoNotaDebito,
    setTipoNotaDebito,
  } = useNotasDebito();

  const totalNotas = notasDebito.reduce((acc, n) => acc + n.total, 0);
  const emitidas = notasDebito.filter((n) => n.estado === "emitida").length;

  return (
    <div className="space-y-4">
      {/* Cards */}
      <div className="grid grid-cols-3 gap-4">
        <TarjetaInformacion
          titulo="Total debitado"
          color="text-green-400"
          valorMoneda
          numero={totalNotas}
        />

        <TarjetaInformacion
          titulo="Notas emitidas"
          color="text-blue-400"
          numero={emitidas}
        />

        <TarjetaInformacion
          titulo="Total de notas"
          color="text-gray-300"
          numero={notasDebito.length}
        />
      </div>

      {/* Tabla */}
      <div className="px-6 py-4 card bg-[var(--fill)] shadow-md rounded-md">
        <TablaReutilizable
          columnas={columnasNotasDebito}
          datos={notasDebito}
          mostrarBuscador
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          placeholderBuscador="Buscar por nota, factura o cliente..."
          botonAgregar={{
            texto: "Nueva nota de débito",
            ruta: "/panel/ventas/notas-debitos/nueva",
          }}
          mostrarFiltros
          textoFiltros="Filtros avanzados"
          filtrosAbiertosInicial={false}
          filtrosElementos={
            <div className="flex flex-wrap gap-4 items-end">
              {/* TIPO */}
              <Select
                valor={tipoNotaDebito}
                label="Tipo:"
                setValor={setTipoNotaDebito}
                options={[
                  { valor: "TODAS", texto: "Todas" },
                  { valor: "A", texto: "Nota Débito A" },
                  { valor: "B", texto: "Nota Débito B" },
                  { valor: "C", texto: "Nota Débito C" },
                ]}
              />

              {/* ESTADO */}
              <Select
                label="Estado:"
                valor={estadoNota}
                setValor={setEstadoNota}
                options={[
                  { valor: "TODAS", texto: "Todas" },
                  { valor: "emitida", texto: "Emitidas" },
                  { valor: "aplicada", texto: "Aplicadas" },
                  { valor: "anulada", texto: "Anuladas" },
                ]}
              />

              {/* CONDICIÓN FISCAL */}
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
            </div>
          }
        />
      </div>
    </div>
  );
};

export default TablaNotaDeDebito;
