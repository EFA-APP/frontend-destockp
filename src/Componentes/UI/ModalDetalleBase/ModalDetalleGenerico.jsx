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
  width = "w-[320px]",
}) => {
  if (!open || !data) return null;

  return (
    <ModalDetalleBase open={open} onClose={onClose} width={width}>
      <ModalDetalle title={title} icon={icon} onClose={onClose}>
        <div className="space-y-4 text-white">
          {/* SECCIONES DE TEXTO */}
          {sections.map((section, idx) => (
            <div key={idx}>
              <p className="text-xs text-gray-400">{section.label}</p>
              <p className="text-lg font-semibold">{data[section.key]}</p>
              {section.sub && (
                <p className="text-sm text-[var(--primary)]">
                  {section.sub(data)}
                </p>
              )}
            </div>
          ))}

          {/* MÉTRICAS */}
          {metrics.length > 0 && (
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
