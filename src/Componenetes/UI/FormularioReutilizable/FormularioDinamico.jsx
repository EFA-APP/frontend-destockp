import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { AgregarIcono, BorrarIcono, GuardarIcono } from "../../../assets/Icons";

const FormularioDinamico = ({
  title = "Formulario",
  subtitle = "Complete los datos",
  fields = [],
  initialData = null,
  onSubmit,
  onCancel,
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
}) => {
  const [formData, setFormData] = useState(() => {
    if (initialData) return initialData;

    const initial = {};
    fields.forEach((field) => {
      if (field.type === "items-table") {
        initial[field.name] = [];
      } else if (field.type === "number") {
        initial[field.name] = field.defaultValue || 0;
      } else if (field.type === "select") {
        initial[field.name] =
          field.defaultValue || field.options?.[0]?.value || "";
      } else if (field.type === "date") {
        if (!field.defaultValue) {
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, "0");
          const day = String(today.getDate()).padStart(2, "0");
          initial[field.name] = `${year}-${month}-${day}`;
        } else {
          initial[field.name] = field.defaultValue;
        }
      } else {
        initial[field.name] = field.defaultValue || "";
      }
    });
    return initial;
  });

  const [errors, setErrors] = useState({});

  // Estado para items actuales en tablas
  const [currentItems, setCurrentItems] = useState({});

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;

    if (type === "number") {
      newValue = parseFloat(value) || 0;
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };

      const field = fields.find((f) => f.name === name);
      if (field?.onChangeCalculate) {
        return field.onChangeCalculate(updated, name);
      }

      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Manejo de items en tablas
  const handleItemChange = (tableName, fieldName, value) => {
    setCurrentItems((prev) => ({
      ...prev,
      [tableName]: {
        ...prev[tableName],
        [fieldName]: value,
      },
    }));
  };

  const addItem = (field) => {
    const currentItem = currentItems[field.name] || {};

    // Validar campos requeridos del item
    const missingFields = field.itemFields
      .filter((f) => f.required)
      .filter((f) => {
        const value = currentItem[f.name];
        return (
          !value ||
          (typeof value === "string" && !value.trim()) ||
          (typeof value === "number" && value <= 0)
        );
      });

    if (missingFields.length > 0) {
      alert(`Complete: ${missingFields.map((f) => f.label).join(", ")}`);
      return;
    }

    // Agregar item con id único
    const newItem = {
      ...currentItem,
      id: Date.now(),
    };

    setFormData((prev) => ({
      ...prev,
      [field.name]: [...(prev[field.name] || []), newItem],
    }));

    // Resetear item actual con valores por defecto
    const resetItem = {};
    field.itemFields.forEach((f) => {
      resetItem[f.name] = f.defaultValue || (f.type === "number" ? 0 : "");
    });
    setCurrentItems((prev) => ({
      ...prev,
      [field.name]: resetItem,
    }));
  };

  const removeItem = (tableName, itemId) => {
    setFormData((prev) => ({
      ...prev,
      [tableName]: prev[tableName].filter((item) => item.id !== itemId),
    }));
  };

  const validate = () => {
    const newErrors = {};

    fields.forEach((field) => {
      if (field.type === "items-table") {
        // Validar que haya al menos un item si es requerido
        if (
          field.required &&
          (!formData[field.name] || formData[field.name].length === 0)
        ) {
          newErrors[field.name] =
            field.errorMessage || "Debe agregar al menos un elemento";
        }
      } else if (field.required) {
        const value = formData[field.name];

        if (field.type === "number") {
          if (value <= 0 && field.min !== undefined && value < field.min) {
            newErrors[field.name] =
              field.errorMessage || `${field.label} es requerido`;
          }
        } else if (!value || (typeof value === "string" && !value.trim())) {
          newErrors[field.name] =
            field.errorMessage || `${field.label} es requerido`;
        }
      }

      if (field.validate) {
        const error = field.validate(formData[field.name], formData);
        if (error) newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
    }
  };

  const renderField = (field) => {
    const commonClasses = `bg-gray-500/5! w-full px-4 py-2 rounded-md! border-1 bg-[var(--fill2)] text-White! ${
      errors[field.name] ? "border-red-400" : "border-gray-300/20!"
    } focus:border-[var(--primary)] focus:outline-none transition-colors placeholder-gray-500 ${
      field.readOnly ? "text-white! cursor-not-allowed" : "text-white!"
    }`;

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleChange}
            rows={field.rows || 3}
            className={`${commonClasses} resize-none`}
            placeholder={field.placeholder}
            readOnly={field.readOnly}
          />
        );

      case "select":
        return (
          <select
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleChange}
            className={`${commonClasses}`}
            disabled={field.readOnly}
          >
            {field.options?.map((opt) => (
              <option
                className="text-[var(--fill)]"
                key={opt.value}
                value={opt.value}
              >
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "number":
        return (
          <input
            type="number"
            name={field.name}
            value={formData[field.name] || 0}
            onChange={handleChange}
            min={field.min}
            max={field.max}
            step={field.step || "1"}
            className={commonClasses}
            placeholder={field.placeholder}
            readOnly={field.readOnly}
          />
        );

      case "items-table":
        return renderItemsTable(field);

      default:
        return (
          <input
            type={field.type || "text"}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleChange}
            className={commonClasses}
            placeholder={field.placeholder}
            readOnly={field.readOnly}
          />
        );
    }
  };

  const renderItemsTable = (field) => {
    const items = formData[field.name] || [];
    const currentItem = currentItems[field.name] || {};

    // Inicializar currentItem con valores por defecto si está vacío
    if (Object.keys(currentItem).length === 0) {
      const initial = {};
      field.itemFields.forEach((f) => {
        initial[f.name] = f.defaultValue || (f.type === "number" ? 0 : "");
      });
      setCurrentItems((prev) => ({
        ...prev,
        [field.name]: initial,
      }));
    }

    return (
      <div className="space-y-4">
        {/* Formulario para agregar items */}
        <div className={`grid gap-3 ${field.itemLayout || "grid-cols-12"}`}>
          {field.itemFields.map((itemField) => (
            <div
              key={itemField.name}
              className={`${itemField.colSpan}` || "col-span-2"}
            >
              <label className="block text-xs text-gray-300 mb-1">
                {itemField.label}{" "}
                {itemField.required && <span className="text-red-400">*</span>}
              </label>
              {itemField.type === "select" ? (
                <select
                  value={
                    currentItem[itemField.name] || itemField.defaultValue || ""
                  }
                  onChange={(e) =>
                    handleItemChange(
                      field.name,
                      itemField.name,
                      itemField.type === "number"
                        ? parseFloat(e.target.value) || 0
                        : e.target.value
                    )
                  }
                  className="w-full px-3 py-2 bg-[var(--fill2)] border border-gray-300/20 rounded-md! text-white!"
                >
                  {itemField.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={itemField.type || "text"}
                  value={
                    currentItem[itemField.name] || itemField.defaultValue || ""
                  }
                  onChange={(e) =>
                    handleItemChange(
                      field.name,
                      itemField.name,
                      itemField.type === "number"
                        ? parseFloat(e.target.value) || 0
                        : e.target.value
                    )
                  }
                  className="w-full px-3 py-2 bg-[var(--fill2)] border border-gray-300/20 rounded-md! text-white!"
                  placeholder={itemField.placeholder}
                  min={itemField.min}
                  max={itemField.max}
                  step={itemField.step}
                />
              )}
            </div>
          ))}
          <div className="col-span-1 flex items-end">
            <button
              type="button"
              onClick={() => addItem(field)}
              className="w-full  py-2 bg-[var(--primary-opacity-10)]! text-[var(--primary)]! rounded-md! hover:bg-[var(--primary-opacity-10)]/60! hover:text-[var(--primary-light)]! font-medium flex items-center justify-center cursor-pointer"
            >
              <AgregarIcono />
            </button>
          </div>
        </div>

        {/* Tabla de items agregados */}
        {items.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--fill2)] text-gray-300">
                  <tr>
                    {field.tableColumns?.map((col) => (
                      <th
                        key={col.key}
                        className={`px-3 py-2 ${col.align || "text-left"}`}
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {items.map((item) => (
                    <tr key={item.id} className="border-t border-gray-700">
                      {field.tableColumns?.map((col) => (
                        <td
                          key={col.key}
                          className={`px-3 py-2 ${col.align || "text-left"}`}
                        >
                          {col.render ? col.render(item) : item[col.key]}
                        </td>
                      ))}
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => removeItem(field.name, item.id)}
                          className="text-red-400! hover:text-red-300! hover:bg-red-400/10! bg-red-400/20! p-1 rounded-md! cursor-pointer"
                        >
                          <BorrarIcono />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales si están definidos */}
            {field.renderTotals && (
              <div className="border-t-2 border-gray-700 pt-4">
                {field.renderTotals(items)}
              </div>
            )}
          </>
        )}

        {errors[field.name] && (
          <p className="text-red-400 text-sm">{errors[field.name]}</p>
        )}
      </div>
    );
  };

  // Agrupar campos por sección
  const sections = fields.reduce((acc, field) => {
    const section = field.section || "default";
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {});

  return (
    <div className="w-full bg-[var(--fill)] rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-[var(--primary-opacity-10)] px-6 py-4">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-[var(--primary-light)] mt-1 text-sm">{subtitle}</p>
      </div>

      <div className="p-6">
        {/* Renderizar secciones */}
        {Object.entries(sections).map(([sectionName, sectionFields], idx) => (
          <div key={sectionName} className={idx > 0 ? "mb-7" : "mb-7"}>
            {sectionName !== "default" && (
              <h3 className="text-md font-semibold text-gray-200 mb-4 flex items-center gap-1">
                {sectionFields[0]?.sectionIcon}
                {sectionName}
              </h3>
            )}

            <div
              className={`grid grid-cols-1 ${
                sectionFields[0]?.cols || "md:grid-cols-2"
              } gap-4`}
            >
              {sectionFields.map((field) => (
                <div
                  key={field.name}
                  className={
                    field.fullWidth || field.type === "items-table"
                      ? "md:col-span-2"
                      : ""
                  }
                >
                  {field.type !== "items-table" && (
                    <label className="block text-xs font-medium text-gray-300 mb-2">
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-400 text-xs">*</span>
                      )}
                    </label>
                  )}
                  <div className="col-span-6">{renderField(field)}</div>
                  {field.type !== "items-table" && errors[field.name] && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors[field.name]}
                    </p>
                  )}
                  {field.type !== "items-table" &&
                    field.helpText &&
                    !errors[field.name] && (
                      <p className="text-[var(--primary-light)] text-xs mt-1">
                        {field.helpText}
                      </p>
                    )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Botones */}
        <div className="flex gap-2 pt-2 border-t-2 border-gray-500/20">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 text-gray-300 font-medium hover:bg-[var(--fill2)] transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 rounded-md! bg-[var(--primary)]! text-white! font-medium hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 hover:bg-[var(--primary)]/70! cursor-pointer"
          >
            <GuardarIcono />
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormularioDinamico;
