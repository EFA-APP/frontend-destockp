import { React, useState } from "react";
import {
  BorrarIcono,
  AgregarIcono,
  GuardarIcono,
  CalendarioIcono,
  SubirIcono,
} from "../../../assets/Icons";
import { useAlertas } from "../../../store/useAlertas";
const FormularioDinamico = ({
  titulo = "Formulario",
  subtitulo = "Complete los datos",
  campos = [],
  initialData = null,
  onSubmit,
  onCancel,
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
}) => {
  const agregarAlerta = useAlertas((state) => state.agregarAlerta);

  const [formData, setFormData] = useState(() => {
    if (initialData) return initialData;
    const initial = {};
    campos.forEach((field) => {
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

  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      [field.name]: file,
    }));

    if (errors[field.name]) {
      setErrors((prev) => ({ ...prev, [field.name]: "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;

    if (type === "number") {
      newValue = parseFloat(value) || 0;
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };

      const field = campos.find((f) => f.name === name);
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
      agregarAlerta({
        type: "error",
        message: `Complete: ${missingFields.map((f) => f.label).join(", ")}`,
      });
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

    campos.forEach((field) => {
      // Saltar validación si el campo está oculto dinámicamente
      if (field.hidden && field.hidden(formData)) return;

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

    // AGREGAR AQUÍ: Mostrar alerta solo si hay errores
    if (Object.keys(newErrors).length > 0) {
      agregarAlerta({
        type: "error",
        message: "Por favor complete todos los campos requeridos",
      });
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
    }
  };

  const renderField = (field) => {
    const isReadOnly = typeof field.readOnly === "function" ? field.readOnly(formData) : field.readOnly;

    const commonClasses = `w-full px-4 py-2.5 rounded-md! border transition-all duration-300 bg-[var(--surface-hover)]/30! backdrop-blur-sm! ${errors[field.name]
      ? "border-red-500/50! focus:ring-red-500/10!"
      : "border-[var(--border-medium)]! focus:border-[var(--primary)]! focus:ring-[var(--primary)]/10!"
      } focus:ring-4! focus:outline-none placeholder-[var(--text-muted)] ${isReadOnly ? "cursor-not-allowed opacity-60" : "hover:border-[var(--border-medium)]"
      } ${field.defaultValue ? "text-[var(--primary)]! font-medium!" : "text-[var(--text-primary)]!"}`;

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
            readOnly={isReadOnly}
          />
        );

      case "select":
        return (
          <select
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleChange}
            className={`${commonClasses}`}
            disabled={isReadOnly}
          >
            {field.options?.map((opt) => (
              <option
                className="bg-[var(--surface)] text-[var(--text-primary)]"
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
            readOnly={isReadOnly}
          />
        );

      case "items-table":
        return renderItemsTable(field);

      case "custom":
        return field.render ? field.render(formData, setFormData) : null;

      case "date":
        return (
          <div className="relative">
            <input
              type="date"
              name={field.name}
              value={formData[field.name] || ""}
              onChange={handleChange}
              className={`${commonClasses} pr-10`}
              readOnly={isReadOnly}
            />

            {/* Icono calendario */}
            <button
              type="button"
              onClick={() => {
                const input = document.querySelector(
                  `input[name="${field.name}"]`
                );
                input?.showPicker?.();
                input?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors cursor-pointer"
            >
              <CalendarioIcono size={16} color="currentColor" />
            </button>
          </div>
        );
      case "file": {
        const file = formData[field.name];

        const formatSize = (bytes) => (bytes / 1024 / 1024).toFixed(2) + " MB";

        const formatDate = (ts) => new Date(ts).toLocaleDateString("es-AR");

        return (
          <div className="w-full">
            <label
              htmlFor={`file-${field.name}`}
              className="px-6 pt-4 pb-6 group/file block rounded-md cursor-pointer w-[220px] relative overflow-hidden"
            >
              <input
                type="file"
                id={`file-${field.name}`}
                name={field.name}
                className="hidden"
                onChange={(e) => handleFileChange(e, field)}
                accept={field.accept}
              />

              <div className="relative w-full mt-2 mx-auto">
                <div
                  className="
              relative z-40
              bg-white/10
              flex items-center justify-center
              h-28 mt-2 w-full max-w-[8rem] mx-auto
              rounded-md
              shadow-[0px_10px_50px_rgba(0,0,0,0.1)]
              transition-all duration-300 ease-out
              group-hover/file:shadow-2xl
              group-hover/file:opacity-90
              group-hover/file:translate-x-5
              group-hover/file:-translate-y-5
            "
                >
                  <SubirIcono color="#FFF" />
                </div>

                <div
                  className="
              absolute inset-0 z-30
              border-2 border-dashed border-[var(--primary)]/30
              rounded-md!
              opacity-0
              transition-opacity duration-300
              group-hover/file:opacity-100
            "
                />
              </div>
            </label>

            {/* INFO DEL ARCHIVO */}
            {file && (
              <div className="relative overflow-hidden z-40 bg-[var(--surface-hover)]/50 backdrop-blur-md flex flex-col items-start justify-start md:h-20 border border-[var(--border-subtle)] py-3 px-4 mb-4 w-full mx-auto rounded-md! shadow-sm">
                <div className="flex justify-between w-full items-center gap-4">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="rounded-md! px-2 py-1 text-xs font-bold text-[var(--primary)] bg-[var(--primary-subtle)]">
                    {formatSize(file.size)}
                  </p>
                </div>
                <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between">
                  <p className="px-3 py-1 rounded-md! bg-[var(--primary-subtle)] text-[var(--primary)] text-[10px] font-bold uppercase tracking-wider">
                    {file.type || "desconocido"}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      }

      default:
        return (
          <input
            type={field.type || "text"}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleChange}
            className={commonClasses}
            placeholder={field.placeholder}
            readOnly={isReadOnly}
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
      <div className="space-y-4 w-full flex flex-col items-center">
        {/* Formulario para agregar items */}
        <div className={`grid gap-3 ${field.itemLayout || "grid-cols-12"}`}>
          {field.itemFields.map((itemField) => (
            <div
              key={itemField.name}
              className={`${itemField.colSpan}` || "col-span-2"}
            >
              <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 ml-1">
                {itemField.label}{" "}
                {itemField.required && <span className="text-red-500 font-bold">*</span>}
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
                  className="w-full px-3 py-2 bg-[var(--surface-hover)]/30! backdrop-blur-sm! border! border-[var(--border-medium)]/50! rounded-md! text-[var(--text-primary)]! focus:border-[var(--primary)]! focus:ring-4! focus:ring-[var(--primary)]/10! transition-all duration-300"
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
                  className={`w-full px-3 py-2 bg-[var(--surface-hover)]/30! backdrop-blur-sm! border! border-[var(--border-medium)]/50! rounded-md! text-[var(--text-primary)]! focus:border-[var(--primary)]! focus:ring-4! focus:ring-[var(--primary)]/10! transition-all duration-300`}
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
              className="w-full py-1 bg-[var(--primary-subtle)]! text-[var(--primary)]! rounded-md! hover:bg-[var(--primary)]! hover:text-white! font-bold text-[10px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md"
            >
              <AgregarIcono size={16} />
            </button>
          </div>
        </div>

        {/* Tabla de items agregados */}
        {items.length > 0 && (
          <>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-md border-separate border-spacing-y-2">
                <thead className="text-[var(--text-muted)]">
                  <tr className="bg-[var(--surface-hover)]/50">
                    {field.tableColumns?.map((col) => (
                      <th
                        key={col.key}
                        className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest ${col.align || "text-left"}`}
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 rounded-r-xl"></th>
                  </tr>
                </thead>
                <tbody className="text-[var(--text-primary)]">
                  {items.map((item) => (
                    <tr key={item.id} className="bg-[var(--surface)]/50 backdrop-blur-sm border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]/30 transition-colors">
                      {field.tableColumns?.map((col) => (
                        <td
                          key={col.key}
                          className={`px-4 py-3 text-sm ${col.align || "text-left"}`}
                        >
                          {col.render ? col.render(item) : item[col.key]}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(field.name, item.id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                        >
                          <BorrarIcono size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales si están definidos */}
            {field.renderTotals && (
              <div className="border-t border-[var(--border-subtle)] pt-6 w-full">
                {field.renderTotals(items)}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Agrupar campos por sección
  const sections = campos.reduce((acc, field) => {
    const section = field.section || "default";
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {});

  return (
    <div className="w-full bg-[var(--surface)] rounded-md! shadow-md overflow-hidden">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[var(--primary)]/10 to-transparent px-8 py-4 md:flex md:flex-col md:items-center md:justify-center border-b border-[var(--border-subtle)]">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{titulo}</h2>
        <p className="text-[var(--text-secondary)] mt-1.5 text-base font-medium">{subtitulo}</p>
      </div>

      <div className="flex justify-center p-4 ">
        <div className="w-full md:w-[800px]">
          {/* Renderizar secciones */}
          {Object.entries(sections).map(([sectionName, sectionFields], idx) => (
            <div key={sectionName} className={idx > 0 ? "mb-3" : "mb-3"}>
              {sectionName !== "default" && (
                <h3 className="text-sm font-bold bg-[var(--primary-subtle)] py-3 px-4 rounded-md! text-[var(--primary)] border border-[var(--primary)]/20 mb-6 flex items-center justify-center gap-2 uppercase tracking-[0.15em]">
                  {sectionFields[0]?.sectionIcon && React?.cloneElement(sectionFields[0].sectionIcon, { size: 16 })}
                  {sectionName}
                </h3>
              )}

              <div
                className={`grid grid-cols-1 ${sectionFields[0]?.cols || "md:grid-cols-2"
                  } gap-4`}
              >
                {sectionFields.map((field) => {
                  // Soporte para ocultar campos dinámicamente
                  if (field.hidden && field.hidden(formData)) return null;

                  return (
                    <div
                      key={field.name}
                      className={
                        field.fullWidth || field.type === "items-table"
                          ? "md:col-span-2"
                          : ""
                      }
                    >
                    {field.type !== "items-table" && (
                      <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 ml-1">
                        {field.label}{" "}
                        {field.required && (
                          <span className="text-red-500 font-bold">*</span>
                        )}
                      </label>
                    )}
                    <div className="col-span-6">{renderField(field)}</div>
                    {field.type !== "items-table" && errors[field.name] && (
                      <p className="text-red-500 text-xs font-medium mt-1.5 ml-1">
                        {errors[field.name]}
                      </p>
                    )}
                    {field.type !== "items-table" &&
                      field.helpText &&
                      !errors[field.name] && (
                        <p className="text-[var(--primary-light)] text-xs mt-1">
                          {typeof field.helpText === "function"
                            ? field.helpText(formData)
                            : field.helpText}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {/* Botones */}
          <div className="mt-8 pt-8 border-t border-[var(--border-subtle)]">
            <div className="flex justify-end gap-4">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2.5 rounded-md! border border-[var(--border-medium)] text-[var(--text-secondary)] font-bold text-[10px] uppercase tracking-widest hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
                >
                  {cancelLabel}
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                className="px-8 py-3 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-active)]! text-white! rounded-md! hover:-translate-y-0.5! active:translate-y-0! transition-all! duration-300! shadow-lg! shadow-[var(--primary)]/25! hover:shadow-[var(--primary)]/40! font-bold! text-[11px]! uppercase! tracking-[0.1em]! cursor-pointer! flex items-center gap-2"
              >
                <GuardarIcono size={16} />
                {submitLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioDinamico;
