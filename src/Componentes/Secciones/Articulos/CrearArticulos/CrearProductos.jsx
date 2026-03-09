import { useNavigate } from "react-router-dom";
import { useProductoUI } from "../../../../Backend/Articulos/hooks/Producto/useProductoUI";
import { AgregarIcono } from "../../../../assets/Icons";
import ContenedorSeccion from "../../../ContenidoPanel/ContenedorSeccion";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";

const CrearProductos = () => {
  const navigate = useNavigate();
  const { crearProducto, estaCreando } = useProductoUI();

  // Configuración para PRODUCTOS
  const camposProductos = [
    {
      name: "nombre",
      label: "Nombre",
      type: "text",
      required: true,
      placeholder: "Nombre del producto",
      section: "Información Básica",
    },
    {
      name: "descripcion",
      label: "Descripción",
      type: "textarea",
      placeholder: "Descripción detallada",
      fullWidth: true,
      section: "Información Básica",
    },
    {
      name: "unidadMedidaLegend",
      type: "custom",
      section: "Información Básica",
      fullWidth: true,
      render: () => (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-2 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-500">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          <p className="text-[11px] text-amber-200/70 font-bold uppercase tracking-widest">
            Unidad por defecto: <span className="text-amber-500">FRASCO</span>
          </p>
        </div>
      )
    },
    {
      name: "cantidadPorPaquete",
      label: "Cantidad por Paquete",
      type: "number",
      required: true,
      min: 1,
      section: "Stock",
      onChangeCalculate: (data) => {
        const cant = parseFloat(data.cantidadPorPaquete) || 0;
        const paq = parseFloat(data.cantidadDePaquetesActuales) || 0;
        const sobrante = parseFloat(data.cantidadSobrante) || 0;
        const stock = (cant * paq) + sobrante;
        
        return {
          ...data,
          stock: stock,
        };
      },
    },
    {
      name: "cantidadDePaquetesActuales",
      label: "Número de Paquetes",
      type: "number",
      required: true,
      min: 0,
      section: "Stock",
      onChangeCalculate: (data) => {
        const cant = parseFloat(data.cantidadPorPaquete) || 0;
        const paq = parseFloat(data.cantidadDePaquetesActuales) || 0;
        const sobrante = parseFloat(data.cantidadSobrante) || 0;
        const stock = (cant * paq) + sobrante;

        return {
          ...data,
          stock: stock,
        };
      },
    },
    {
      name: "cantidadSobrante",
      label: "Frascos Sobrantes",
      type: "number",
      required: true,
      min: 0,
      section: "Stock",
      defaultValue: 0,
      helpText: "Frascos sueltos que no forman un paquete",
      onChangeCalculate: (data) => {
        const cant = parseFloat(data.cantidadPorPaquete) || 0;
        const paq = parseFloat(data.cantidadDePaquetesActuales) || 0;
        const sobrante = parseFloat(data.cantidadSobrante) || 0;
        const stock = (cant * paq) + sobrante;

        return {
          ...data,
          stock: stock,
        };
      },
    },
    {
      name: "stock",
      label: "Stock Total",
      type: "number",
      readOnly: true,
      section: "Stock",
      helpText: "Packs * Unidades + Sobrantes",
    },
    {
      name: "activo",
      label: "¿Producto Activo?",
      type: "select",
      options: [
        { value: true, label: "Sí" },
        { value: false, label: "No" },
      ],
      section: "Configuración",
      defaultValue: true,
    }
  ];

  const handleSubmit = async (data) => {
    try {
      // Sanitización y parseo antes de enviar
      const payload = {
        ...data,
        unidadMedida: "FRASCO", // Forzado por defecto
        cantidadPorPaquete: parseFloat(data.cantidadPorPaquete) || 0,
        cantidadDePaquetesActuales: parseFloat(data.cantidadDePaquetesActuales) || 0,
        cantidadSobrante: parseFloat(data.cantidadSobrante) || 0,
        stock: parseFloat(data.stock) || 0,
        activo: data.activo === "true" || data.activo === true
      };

      await crearProducto(payload);
      navigate("/panel/inventario/productos");
    } catch (error) {
      console.error("Error al crear producto:", error);
    }
  };

  return (
    <ContenedorSeccion className="px-3 py-4">
      <div className="card no-inset no-ring bg-[var(--surface)] shadow-md rounded-md mb-4">
        <EncabezadoSeccion
          ruta={"Crear Producto"}
          icono={<AgregarIcono />}
          volver={true}
          redireccionAnterior={"/panel/inventario/productos"}
        />
      </div>

      <FormularioDinamico
        titulo="Nuevo Producto"
        subtitulo="Complete los datos del producto"
        campos={camposProductos}
        onSubmit={handleSubmit}
        submitLabel={estaCreando ? "Guardando..." : "Guardar Producto"}
      />
    </ContenedorSeccion>
  );
};

export default CrearProductos;
