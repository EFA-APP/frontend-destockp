import { useState, useEffect } from "react";
import DataTable from "../../../UI/DataTable/DataTable";
import Select from "../../../UI/Select/Select";
import { accionesCuotas } from "./AccionesCuotas";
import { columnasCuotas } from "./columnasCuotas";

const TablaCuotas = ({
  alumnos = [],
  cargando = false,
  mesSeleccionado,
  setMesSeleccionado,
  anioSeleccionado,
  setAnioSeleccionado,
  handlePagarCuota,
  handleEmitirIndividual,
  busqueda,
  setBusqueda,
  paginas,
  paginaActual,
  total,
  setPagina,
}) => {
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const periodoSeleccionado = `${anioSeleccionado}-${String(Number(mesSeleccionado) + 1).padStart(2, "0")}`;

  const [isUpdating, setIsUpdating] = useState(false);

  // Efecto visual para notar el cambio de datos
  useEffect(() => {
    setIsUpdating(true);
    const timer = setTimeout(() => setIsUpdating(false), 400);
    return () => clearTimeout(timer);
  }, [periodoSeleccionado]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val || 0);
  };

  return (
    <div
      className={`transition-all duration-500 ${isUpdating ? "opacity-30 blur-[2px] scale-[0.99] pointer-events-none" : "opacity-100 blur-0 scale-100"}`}
    >
      <DataTable
        id_tabla="tabla-cuotas"
      columnas={columnasCuotas({ periodoSeleccionado, formatCurrency })}
      datos={alumnos}
      loading={cargando}
      mostrarBuscador={true}
      busqueda={busqueda}
      setBusqueda={setBusqueda}
      placeholderBuscador="Buscar alumno por nombre, apellido o documento..."
        acciones={accionesCuotas({
        handlePagarCuota,
        handleEmitirIndividual,
        periodoSeleccionado,
      })}
      paginacion={true}
      paginas={paginas}
      paginaActual={paginaActual}
      total={total}
      setPagina={setPagina}
      elementosSuperior={
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Selector de Mes */}
          <div className="flex-1 sm:w-[150px] sm:flex-none">
            <Select
              valor={mesSeleccionado}
              setValor={setMesSeleccionado}
              options={meses.map((m, idx) => ({ valor: idx, texto: m.toUpperCase() }))}
              placeholder="Elegir Mes..."
            />
          </div>

          {/* Selector de Año */}
          <div className="flex-1 sm:w-[110px] sm:flex-none">
            <Select
              valor={anioSeleccionado}
              setValor={setAnioSeleccionado}
              options={Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return { valor: year, texto: year.toString() };
              })}
              placeholder="Elegir Año..."
            />
          </div>
        </div>
      }
      emptyMessage={`No hay alumnos registrados para ${meses[mesSeleccionado]} ${anioSeleccionado}`}
      llaveTituloMobile="nombre"
    />
    </div>
  );
};

export default TablaCuotas;
