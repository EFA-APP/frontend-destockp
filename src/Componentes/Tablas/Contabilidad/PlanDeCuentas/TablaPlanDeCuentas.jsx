import { usePlanDeCuentas } from "../../../../api/hooks/Contabilidad/PlanDeCuenta/usePlanDeCuenta";
import Select from "../../../UI/Select/Select";
import TablaDesplegableReutilizable from "../../../UI/TablaDesplegableReutilizable/TablaDesplegableReutilizable";
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
    <div className="px-6 py-4 card bg-[var(--fill)] shadow-md rounded-md">
      <TablaDesplegableReutilizable
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
    </div>
  );
};

export default TablaPlanDeCuentas;
