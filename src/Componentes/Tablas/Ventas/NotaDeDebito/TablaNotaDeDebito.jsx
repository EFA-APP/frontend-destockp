import { useState } from "react";
import { useNotasDebito } from "../../../../Backend/hooks/Ventas/NotaDeDebito/useNotaDeDebito";
import DataTable from "../../../UI/DataTable/DataTable";
import TarjetaInformacion from "../../../UI/TarjetaInformacion/TarjetaInformacion";
import { accionesNotaDebito } from "./AccionesNotaDebito";
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

  const [modalAbierto, setModalAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);

  const handleVerDetalle = (articulo) => {
    setSeleccionado(articulo);
    setModalAbierto(true);
  };

  const totalNotas = notasDebito.reduce((acc, n) => acc + n.total, 0);
  const emitidas = notasDebito.filter((n) => n.estado === "emitida").length;

  return (
    <div className="space-y-4">
      <ModalDetalleGenerico
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        data={seleccionado}
        {...notaDebitoConfig}
      />

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <DataTable id_tabla="notadedebito"
        columnas={columnasNotasDebito}
        datos={notasDebito}
        mostrarBuscador
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        mostrarAcciones={true}
        acciones={accionesNotaDebito({ handleVerDetalle })}
        placeholderBuscador="Buscar por nota, factura o cliente..."
        botonAgregar={{
          texto: "Nueva nota de débito",
          ruta: "/panel/ventas/notas-debitos/nueva",
        }}
        mostrarFiltros
        textoFiltros="Filtros avanzados"
        filtrosAbiertosInicial={false}
        filtrosElementos={
          <>
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
          </>
        }
      />
    </div>
  );
};

export default TablaNotaDeDebito;
