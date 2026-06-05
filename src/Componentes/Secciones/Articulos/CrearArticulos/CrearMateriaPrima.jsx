import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  AgregarIcono,
  ArcaIcono,
  BalanceIcono,
  EditarIcono,
} from "../../../../assets/Icons";
import { useMateriaPrimaUI } from "../../../../Backend/Articulos/hooks/MateriaPrima/useMateriaPrimaUI";
import EncabezadoSeccion from "../../../UI/EncabezadoSeccion/EncabezadoSeccion";
import FormularioDinamico from "../../../UI/FormularioReutilizable/FormularioDinamico";

const CrearMateriaPrima = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = !!id;

  const esEspecie = location.pathname.includes("/inventario/especies");
  const baseRoute = esEspecie
    ? "/panel/inventario/especies"
    : "/panel/inventario/materia-prima";
  const labelSingular = esEspecie ? "Especie" : "Materia Prima";
  const labelPlural = esEspecie ? "Especies" : "Materias Primas";

  const {
    crearMateriaPrima,
    actualizarMateriaPrima,
    materiasPrimas,
    estaCreando,
    estaActualizando,
    cargando,
  } = useMateriaPrimaUI();
  const [initialData, setInitialData] = useState(
    location.state?.materiaPrima || null,
  );

  // Si estamos editando y no tenemos data inicial (ej: F5), buscamos la materia prima
  useEffect(() => {
    if (isEdit && !initialData && materiasPrimas.length > 0) {
      const found = materiasPrimas.find(
        (m) => String(m.codigoSecuencial) === id,
      );
      if (found) setInitialData(found);
    }
  }, [isEdit, id, materiasPrimas, initialData]);

  const materiaPrimaCampos = [
    // ─────────────────────────────
    // CATEGORIZACIÓN E IDENTIFICACIÓN
    // ─────────────────────────────
    {
      name: "nombre",
      label: esEspecie ? "Nombre de la Especie" : "Nombre del Insumo",
      type: "text",
      required: true,
      section: esEspecie
        ? "Identificación de Especie"
        : "Identificación de Insumo",
      sectionIcon: <ArcaIcono />,
    },
    {
      name: "tipo",
      label: "Categoría de Material",
      type: "select",
      required: true,
      options: [
        {
          value: "INSUMO",
          label: esEspecie
            ? "ESPECIE - Tipo especie"
            : "INSUMO - Materia prima base",
        },
        { value: "FRUTA", label: "FRUTA - Insumo fresco/agrícola" },
      ],
      section: esEspecie
        ? "Identificación de Especie"
        : "Identificación de Insumo",
    },

    // ─────────────────────────────
    // GESTIÓN DE EXISTENCIAS
    // ─────────────────────────────
    {
      name: "unidadMedida",
      label: "Tipo de Magnitud (Unidad)",
      type: "select",
      required: true,
      options: [
        { value: "KG", label: "Masa: Kilogramos (KG)" },
        { value: "GR", label: "Masa: Gramos (GR)" },
        { value: "UND", label: "Conteo: Unidades (UND)" },
        { value: "LT", label: "Volumen: Litros (LT)" },
        { value: "ML", label: "Volumen: Mililitros (ML)" },
      ],
      section: "Control de Stock",
      sectionIcon: <BalanceIcono />,
    },
    {
      name: "stock",
      label: "Existencia Inicial Física",
      type: "number",
      required: false,
      min: 0,
      step: "0.01",
      section: "Control de Stock",
      helpText: "Cantidad real disponible en depósito al momento de creación",
    },
    {
      name: "cantidadPorPaquete",
      label: "Contenido por Envase (Pack)",
      type: "number",
      required: false,
      min: 0,
      step: "0.01",
      section: "Control de Stock",
      helpText: "Peso o cantidad neta por cada bulto/pack (Opcional)",
    },
  ];

  const handleSubmit = async (data) => {
    try {
      // eslint-disable-next-line no-unused-vars
      const {
        id: _,
        codigoSecuencial,
        codigoEmpresa,
        codigoUnidadNegocio,
        createdAt,
        cantidadMovimientos,
        stockPorDeposito,
        updatedAt,
        ...rest
      } = data;
      const payload = {
        ...rest,
        activo: true,
        stock: parseFloat(data.stock) || 0,
        cantidadPorPaquete: data.cantidadPorPaquete
          ? parseFloat(data.cantidadPorPaquete)
          : null,
      };

      if (isEdit) {
        await actualizarMateriaPrima(id, payload);
      } else {
        await crearMateriaPrima(payload);
      }
      navigate(baseRoute);
    } catch (error) {
      console.error(`Error al procesar ${labelSingular.toLowerCase()}:`, error);
    }
  };

  if (isEdit && cargando && !initialData) {
    return (
      <div className="flex items-center justify-center p-20  text-emerald-700 font-black uppercase tracking-[0.2em]">
        Cargando Datos de la {labelSingular}...
      </div>
    );
  }

  return (
    <div className="px-3 py-4">
      {/* Encabezado */}
      <div className="card no-inset no-ring bg-[var(--surface)] shadow-md rounded-md mb-6">
        <EncabezadoSeccion
          ruta={
            isEdit
              ? `Registro de ${esEspecie ? "Especies" : "Insumos"} > Editar`
              : `Registro de ${esEspecie ? "Especies" : "Insumos"}`
          }
          icono={isEdit ? <EditarIcono /> : <AgregarIcono />}
          volver={true}
          redireccionAnterior={isEdit ? -1 : baseRoute}
        />
      </div>

      {/* Formulario */}
      <FormularioDinamico
        titulo={
          isEdit ? `Edición de ${labelSingular}` : `Alta de ${labelSingular}`
        }
        subtitulo={
          isEdit
            ? `Modifique los parámetros de la ${labelSingular.toLowerCase()} en el sistema.`
            : `Registre nuevas ${labelPlural.toLowerCase()} para su cadena de producción.`
        }
        campos={materiaPrimaCampos}
        initialData={initialData}
        onSubmit={handleSubmit}
        submitLabel={
          isEdit
            ? estaActualizando
              ? "Guardando..."
              : "Guardar Cambios"
            : estaCreando
              ? "Registrando..."
              : `Confirmar Alta de ${labelSingular}`
        }
        onCancel={() => navigate(baseRoute)}
      />
    </div>
  );
};

export default CrearMateriaPrima;
