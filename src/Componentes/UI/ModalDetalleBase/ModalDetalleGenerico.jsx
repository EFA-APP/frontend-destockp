import { useState, useEffect } from "react";
import Metrica from "./Metricas";
import ModalDetalle from "./ModalDetalle";
import ModalDetalleBase from "./ModalDetalleBase";

const ModalDetalleGenerico = ({
  open,
  onClose,
  title,
  icon,
  data,
  metrics = [],
  sections = [],
  editableFields = [],
  mode = "view",
  onSave,
  width = "w-[320px]",
}) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  if (!open || !data) return null;

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isEdit = mode === "editar";

  return (
    <ModalDetalleBase open={open} onClose={onClose} width={width}>
      <ModalDetalle
        title={title}
        icon={icon}
        onClose={onClose}
        footer={
          isEdit && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md! bg-gray-600! text-white!"
              >
                Cancelar
              </button>
              <button
                onClick={() => onSave?.(formData)}
                className="px-4 py-2 rounded-md! bg-[var(--primary)]! text-white!"
              >
                Guardar
              </button>
            </>
          )
        }
      >
        <div className="space-y-4 text-white">
          {/* SECCIONES */}
          {sections.map((section, idx) => {
            const editable = section.editable;
            return (
              <div key={idx}>
                <p className="text-xs text-gray-400">{section.label}</p>

                {isEdit && editable ? (
                  <input
                    value={formData[section.key] ?? ""}
                    onChange={(e) =>
                      handleChange(section.key, e.target.value)
                    }
                    className="mt-1 w-full rounded-md! bg-black/30 border border-white/10 px-3 py-2 text-white"
                  />
                ) : (
                  !section.ocultar && (
                    <p className="text-lg font-semibold">
                      {data[section.key]}
                    </p>
                  )
                )}

                {section.sub && !isEdit && (
                  <p className="text-sm text-[var(--primary)]">
                    {section.sub(data)}
                  </p>
                )}
              </div>
            );
          })}

          {/* MÉTRICAS (solo view) */}
          {!isEdit && metrics.length > 0 && (
            <div className="flex flex-col w-full">
              {metrics.map((m, idx) => (
                <Metrica
                  key={idx}
                  label={m.label}
                  value={
                    typeof m.value === "function"
                      ? m.value(data)
                      : data[m.value]
                  }
                />
              ))}
            </div>
          )}
        </div>
      </ModalDetalle>
    </ModalDetalleBase>
  );
};

export default ModalDetalleGenerico;
