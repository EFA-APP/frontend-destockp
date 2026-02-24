import { usePlanDeCuentas } from "../../../../api/hooks/Contabilidad/PlanDeCuenta/usePlanDeCuenta";
import Select from "../../../UI/Select/Select";
import DataTable from "../../../UI/DataTable/DataTable";
import { columnasPlanDeCuentas } from "./columnaPlanDeCuentas";

const TablaPlanDeCuentas = () => {
  const {
    cuentas,
    busqueda,
    setBusqueda,
    tipo,
    setTipo,
    manejarEditar,
    manejarEliminar,
  } = usePlanDeCuentas();

  return (
    <DataTable
      columnas={columnasPlanDeCuentas}
      datos={cuentas}
      /* 🔑 CLAVE PARA EL DESPLIEGUE */
      getChildren={(fila) => [{ key: "children", data: fila.children || [] }]}
      mostrarBuscador
      busqueda={busqueda}
      setBusqueda={setBusqueda}
      mostrarAcciones
      onEditar={manejarEditar}
      onEliminar={manejarEliminar}
      placeholderBuscador="Buscar por código o cuenta..."
      botonAgregar={{
        texto: "Nueva cuenta",
        ruta: "/panel/contabilidad/cuentas/nueva",
      }}
      mostrarFiltros
      filtrosElementos={
        <Select
          label="Tipo"
          valor={tipo}
          setValor={setTipo}
          options={[
            { valor: "TODOS", texto: "Todos" },
            { valor: "ACTIVO", texto: "Activo" },
            { valor: "PASIVO", texto: "Pasivo" },
            { valor: "RESULTADO", texto: "Resultado" },
            { valor: "PATRIMONIO", texto: "Patrimonio" },
          ]}
        />
      }
    />
  );
};

export default TablaPlanDeCuentas;
