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
        initial[field.name] = field.defaultValue || [];
      } else if (field.type === "number") {
        initial[field.name] =
          field.defaultValue !== undefined ? field.defaultValue : 0;
      } else if (field.type === "select") {
        initial[field.name] =
          field.defaultValue !== undefined
            ? field.defaultValue
            : field.options?.[0]?.value || "";
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
      } else if (field.type === "switch") {
        initial[field.name] =
          field.defaultValue !== undefined ? field.defaultValue : false;
      } else {
        initial[field.name] =
          field.defaultValue !== undefined ? field.defaultValue : "";
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

  const formatNumber = (val) => {
    if (val === null || val === undefined || val === "") return "";
    // Usar locale español (punto para miles, coma para decimal)
    return new Intl.NumberFormat("es-AR").format(val);
  };

  const parseNumber = (val) => {
    if (typeof val === "number") return val;
    // Eliminar puntos de miles y cambiar coma por punto decimal
    const clean = val.replace(/\./g, "").replace(",", ".");
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;

    const field = campos.find((f) => f.name === name);

    if (field?.type === "number") {
      newValue = parseNumber(value);
    } else if (type === "checkbox") {
      newValue = e.target.checked;
    }

    setFormData((prev) => {
      let updated = { ...prev, [name]: newValue };

      // 1. Ejecutar cálculo específico si existe (legacy/especial)
      const field = campos.find((f) => f.name === name);
      if (field?.onChangeCalculate) {
        updated = field.onChangeCalculate(updated, name);
      }

      // 2. Recalcular todos los campos que tengan fórmulas dinámicas
      campos.forEach((f) => {
        if (f.formula) {
          try {
            const valorCalculado = evaluateFormula(f.formula, updated);
            if (updated[f.name] !== valorCalculado) {
              updated[f.name] = valorCalculado;
            }
          } catch (e) {
            console.error(`Error en formula de ${f.name}:`, e);
          }
        }
      });

      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const evaluateFormula = (formula, contexto) => {
    let expresion = formula;
    const regex = /\{(\w+)\}/g;
    let match;

    while ((match = regex.exec(formula)) !== null) {
      const clave = match[1];
      const valor = contexto[clave] !== undefined ? contexto[clave] : 0;

      let valorNum;
      if (valor === true || valor === "true" || valor === "on") {
        valorNum = 1;
      } else if (valor === false || valor === "false" || valor === "off") {
        valorNum = 0;
      } else {
        valorNum = typeof valor === "number" ? valor : parseFloat(valor) || 0;
      }
      expresion = expresion.replaceAll(match[0], valorNum);
    }

    try {
      // Limpieza básica (permitiendo ? : > < = ! & |)
      if (/[^0-9+\-*/().\s?:><=!&|]/.test(expresion)) return 0;
      // eslint-disable-next-line no-eval
      return eval(expresion);
    } catch (e) {
      return 0;
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
      resetItem[f.name] =
        f.defaultValue !== undefined
          ? f.defaultValue
          : f.type === "number"
            ? 0
            : f.type === "boolean" || f.type === "switch"
              ? false
              : "";
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
      // Filtrar campos que están ocultos dinámicamente
      const filteredData = { ...formData };
      campos.forEach((field) => {
        if (field.hidden && field.hidden(formData)) {
          delete filteredData[field.name];
        }
      });
      onSubmit(filteredData);
    }
  };

  const renderField = (field) => {
    const isReadOnly =
      typeof field.readOnly === "function"
        ? field.readOnly(formData)
        : field.readOnly;

    const commonClasses = `w-full px-5 py-3 md:px-4 md:py-2.5 rounded-xl! border   bg-[var(--surface-hover)]/20! backdrop-blur-md! shadow-sm ${
      errors[field.name]
        ? "border-red-700/40! focus:ring-red-700/10!"
        : "border-[var(--border-medium)]/40! border-[var(--primary)]/30! focus:ring-[var(--primary)]/10!"
    } focus:ring-4! focus:outline-none placeholder-[var(--text-muted)] ${
      isReadOnly
        ? "cursor-not-allowed opacity-60"
        : "hover:border-[var(--border-medium)]/80 hover:bg-[var(--surface-hover)]/40!"
    } ${formData[field.name] || field.defaultValue ? "text-[var(--secondary)]! font-bold!" : "text-[var(--text-primary)]!"}`;

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
            type="text"
            inputMode="numeric"
            name={field.name}
            value={formatNumber(formData[field.name])}
            onChange={handleChange}
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
                  `input[name="${field.name}"]`,
                );
                input?.showPicker?.();
                input?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--primary)]  cursor-pointer"
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
              bg-black/10
              flex items-center justify-center
              h-28 mt-2 w-full max-w-[8rem] mx-auto
              rounded-md
              shadow-[0px_10px_50px_rgba(0,0,0,0.1)]
                
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
                  <p className="px-3 py-1 rounded-md! bg-[var(--primary-subtle)] text-[var(--primary)] text-[12px] font-bold uppercase tracking-wider">
                    {file.type || "desconocido"}
                  </p>
                </div>
              </div>
            )}
          </div>
        );
      }

      case "boolean":
      case "switch":
        return (
          <div className="flex items-center mt-2 h-10">
            <label className="relative inline-flex items-center cursor-pointer group">
              <input
                type="checkbox"
                name={field.name}
                checked={!!formData[field.name]}
                onChange={handleChange}
                className="sr-only peer"
                disabled={isReadOnly}
              />
              <div
                className={`w-11 h-6 bg-[var(--surface-hover)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--primary)]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-[var(--border-subtle)] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-[var(--surface)] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after: peer-checked:bg-[var(--primary)]  border border-[var(--border-medium)]`}
              ></div>
            </label>
          </div>
        );

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
        initial[f.name] =
          f.defaultValue !== undefined
            ? f.defaultValue
            : f.type === "number"
              ? 0
              : f.type === "boolean" || f.type === "switch"
                ? false
                : "";
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
              <label className="block text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 ml-1">
                {itemField.label}{" "}
                {itemField.required && (
                  <span className="text-red-700 font-bold">*</span>
                )}
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
                        : e.target.value,
                    )
                  }
                  className="w-full px-3 py-2 bg-[var(--surface-hover)]/30! backdrop-blur-sm! border! border-[var(--border-medium)]/50! rounded-md! text-[var(--text-primary)]! border-[var(--primary)]! focus:ring-4! focus:ring-[var(--primary)]/10!  "
                >
                  {itemField.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : itemField.type === "boolean" ||
                itemField.type === "switch" ? (
                <div className="flex items-center h-10">
                  <label className="relative inline-flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!currentItem[itemField.name]}
                      onChange={(e) =>
                        handleItemChange(
                          field.name,
                          itemField.name,
                          e.target.checked,
                        )
                      }
                      className="sr-only peer"
                    />
                    <div
                      className={`w-11 h-6 bg-[var(--surface-hover)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--border-subtle)] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-[var(--surface)] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after: peer-checked:bg-[var(--primary)]  border border-[var(--border-medium)]`}
                    ></div>
                  </label>
                </div>
              ) : (
                <input
                  type={
                    itemField.type === "number"
                      ? "text"
                      : itemField.type || "text"
                  }
                  inputMode={
                    itemField.type === "number" ? "numeric" : undefined
                  }
                  value={
                    itemField.type === "number"
                      ? formatNumber(currentItem[itemField.name])
                      : currentItem[itemField.name] ||
                        itemField.defaultValue ||
                        ""
                  }
                  onChange={(e) =>
                    handleItemChange(
                      field.name,
                      itemField.name,
                      itemField.type === "number"
                        ? parseNumber(e.target.value)
                        : e.target.value,
                    )
                  }
                  className={`w-full px-3 py-2 bg-[var(--surface-hover)]/30! backdrop-blur-sm! border! border-[var(--border-medium)]/50! rounded-md! text-[var(--text-primary)]! border-[var(--primary)]! focus:ring-4! focus:ring-[var(--primary)]/10!  `}
                  placeholder={itemField.placeholder}
                />
              )}
            </div>
          ))}
          <div className="col-span-1 flex items-end">
            <button
              type="button"
              onClick={() => addItem(field)}
              className="w-full py-1 bg-[var(--primary-subtle)]! text-[var(--primary)]! rounded-md! hover:bg-[var(--primary)]! hover:text-black! font-bold text-[12px] uppercase tracking-wider   flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md"
            >
              <AgregarIcono size={16} />
            </button>
          </div>
        </div>

        {/* Tabla / Tarjetas de items agregados */}
        {items.length > 0 && (
          <>
            {/* Vista Mobile (Card Based) */}
            <div className="md:hidden space-y-4">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="relative p-5 rounded-2xl bg-black/5 border border-black/10 backdrop-blur-md shadow-xl    "
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-full bg-[var(--primary-subtle)]/50 text-[var(--primary)] text-[11px] font-black uppercase tracking-widest">
                      Ítem #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(field.name, item.id)}
                      className="w-8 h-8 rounded-full bg-red-700/10 text-red-700 flex items-center justify-center border border-red-700/10 active:scale-90 "
                    >
                      <BorrarIcono size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {field.tableColumns?.map((col) => (
                      <div key={col.key} className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider opacity-60">
                          {col.label}
                        </span>
                        <div className="text-[15px] font-bold text-[var(--text-primary)]">
                          {col.render ? col.render(item) : item[col.key]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Vista Desktop (Tabla Tradicional) */}
            <div className="hidden md:block overflow-x-auto w-full mt-4">
              <table className="w-full text-md border-separate border-spacing-y-2">
                <thead className="text-[var(--text-muted)]">
                  <tr className="bg-[var(--surface-hover)]/50">
                    {field.tableColumns?.map((col) => (
                      <th
                        key={col.key}
                        className={`px-4 py-3 text-[12px] font-bold uppercase tracking-widest ${col.align || "text-left"}`}
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 rounded-r-xl"></th>
                  </tr>
                </thead>
                <tbody className="text-[var(--text-primary)]">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="bg-[var(--surface)]/50 backdrop-blur-sm border border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]/30 "
                    >
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
                          className="p-2 rounded-lg text-red-700 hover:bg-red-700/10  cursor-pointer"
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
      <div className="relative bg-[var(--primary)]/10 px-8 py-4 md:flex md:flex-col md:items-center md:justify-center border-b border-[var(--border-subtle)]">
        <h2 className="text-xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          {titulo}
        </h2>
        <p className="text-[var(--text-secondary)] mt-1.5 text-base font-medium">
          {subtitulo}
        </p>
      </div>

      <div className="flex justify-center p-4 ">
        <div className="w-full md:w-[800px]">
          {/* Renderizar secciones */}
          {Object.entries(sections).map(([sectionName, sectionFields], idx) => (
            <div key={sectionName} className={idx > 0 ? "mb-3" : "mb-3"}>
              {sectionName !== "default" && (
                <h3 className="text-sm font-bold bg-[var(--primary-subtle)] py-3 px-4 rounded-md! text-[var(--primary)] border border-[var(--primary)]/20 mb-6 flex items-center justify-center gap-2 uppercase tracking-[0.15em]">
                  {sectionFields[0]?.sectionIcon &&
                    React?.cloneElement(sectionFields[0].sectionIcon, {
                      size: 16,
                    })}
                  {sectionName}
                </h3>
              )}

              <div
                className={`grid grid-cols-1 ${
                  sectionFields[0]?.cols || "md:grid-cols-2"
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
                        <label className="block text-[13px] font-bold text-[var(--text-theme)] uppercase tracking-wider mb-2 ml-1">
                          {field.label}{" "}
                          {field.required && (
                            <span className="text-red-700 font-bold">*</span>
                          )}
                        </label>
                      )}
                      <div className="col-span-6">{renderField(field)}</div>
                      {field.type !== "items-table" && errors[field.name] && (
                        <p className="text-red-700 text-xs font-medium mt-1.5 ml-1">
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
          <div className="mt-8 pt-8 border-t border-black/5">
            <div className="flex flex-col md:flex-row justify-end gap-4">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full md:w-auto px-8 py-3.5 rounded-md! bg-black/20! border border-[var(--border-subtle)]! text-[var(--text-theme)]! font-bold! text-[12px]! uppercase! tracking-[0.2em]!  cursor-pointer text-center"
                >
                  {cancelLabel}
                </button>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full md:w-auto px-10 py-4 border border-[var(--primary)]/20 bg-[var(--primary)]/20! text-[var(--primary)]! rounded-md! hover:-translate-y-0.5! active:translate-y-0.5! shadow-sm! shadow-[var(--primary)]/10! hover:shadow-[var(--primary)]/20! font-bold! text-[15px]! uppercase! tracking-[0.2em]! cursor-pointer! flex items-center justify-center gap-3 border-t border-[var(--border-subtle)]"
              >
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
