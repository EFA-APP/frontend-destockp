import { useNotasCredito } from "../../../../Backend/hooks/Ventas/NotaDeCredito/useNotaDeCredito";
import DataTable from "../../../UI/DataTable/DataTable";
import TarjetaInformacion from "../../../UI/TarjetaInformacion/TarjetaInformacion";
import { columnasNotasCredito } from "./ColumnaNotaDeCredito";
import { accionesNotaCredito } from "./AccionesNotaCredito";
import { useState } from "react";
import ModalDetalleGenerico from "../../../UI/ModalDetalleBase/ModalDetalleGenerico";
import notaCreditoConfig from "../../../Modales/Ventas/ConfigNotaCredito";
import Select from "../../../UI/Select/Select";
import FechaInput from "../../../UI/FechaInput/FechaInput";

const TablaNotasCredito = () => {
  const {
    notasCredito,
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
    tipoNotaCredito,
    setTipoNotaCredito,
  } = useNotasCredito();

  const [modalAbierto, setModalAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);

  const handleVerDetalle = (articulo) => {
    setSeleccionado(articulo);
    setModalAbierto(true);
  };

  const totalNotas = notasCredito.reduce(
    (acc, n) => acc + Math.abs(n.total),
    0,
  );

  const pendientes = notasCredito.filter((n) => n.estado === "emitida").length;

  return (
    <div className="space-y-4">
      <ModalDetalleGenerico
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        data={seleccionado}
        {...notaCreditoConfig}
        accentColor="rose"
      />

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TarjetaInformacion
          titulo="Total acreditado"
          color="text-red-400"
          valorMoneda
          numero={totalNotas}
        />

        <TarjetaInformacion
          titulo="Notas emitidas"
          color="text-blue-400"
          numero={pendientes}
        />

        <TarjetaInformacion
          titulo="Total notas"
          color="text-gray-300"
          numero={notasCredito.length}
        />
      </div>

      {/* Tabla */}
      <DataTable
        columnas={columnasNotasCredito}
        datos={notasCredito}
        mostrarBuscador
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        mostrarAcciones={true}
        acciones={accionesNotaCredito({ handleVerDetalle })}
        placeholderBuscador="Buscar por nota o cliente..."
        botonAgregar={{
          texto: "Nueva nota de crédito",
          ruta: "/panel/ventas/notas-creditos/nueva",
        }}
        mostrarFiltros
        textoFiltros="Filtros avanzados"
        filtrosAbiertosInicial={false}
        filtrosElementos={
          <>
            {/* TIPO NOTA CREDITO */}
            <Select
              valor={tipoNotaCredito}
              label={"Tipo: "}
              setValor={setTipoNotaCredito}
              options={[
                { valor: "TODAS", texto: "Todas" },
                { valor: "A", texto: "Nota Credito A" },
                { valor: "B", texto: "Nota Credito B" },
                { valor: "C", texto: "Nota Credito C" },
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

            {/* REGISTRO LEGAL */}
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

export default TablaNotasCredito;
