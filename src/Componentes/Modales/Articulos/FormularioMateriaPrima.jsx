import React, { useState } from "react";
import { useMateriaPrimaUI } from "../../../Backend/Articulos/hooks/MateriaPrima/useMateriaPrimaUI";
import { useAlertas } from "../../../store/useAlertas";
import {
  Package,
  Scale,
  Calendar,
  X,
  FileText,
  HelpCircle,
  Hash,
} from "lucide-react";
import { CerrarIcono } from "../../../assets/Icons";

const FormularioMateriaPrima = ({
  onClose,
  onExito,
  posicion = "izquierda",
  esEspecie = true,
}) => {
  const { crearMateriaPrima, estaCreando } = useMateriaPrimaUI();
  const { agregarAlerta } = useAlertas();

  const [form, setForm] = useState({
    nombre: "",
    tipo: "INSUMO",
    unidadMedida: "KG",
    stock: "",
    cantidadPorPaquete: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) {
      agregarAlerta({
        title: "Nombre Requerido",
        message: `Debe ingresar el nombre de la ${esEspecie ? "especie" : "materia prima"}.`,
        type: "warning",
      });
      return;
    }

    try {
      const payload = {
        nombre: form.nombre.trim(),
        tipo: form.tipo,
        unidadMedida: form.unidadMedida,
        activo: true,
        stock: parseFloat(form.stock) || 0,
        cantidadPorPaquete: form.cantidadPorPaquete
          ? parseFloat(form.cantidadPorPaquete)
          : null,
      };

      const nuevo = await crearMateriaPrima(payload);

      agregarAlerta({
        title: `${esEspecie ? "Especie" : "Insumo"} Creado`,
        message: `Se ha registrado "${form.nombre.toUpperCase()}" con éxito.`,
        type: "success",
      });

      if (onExito) onExito(nuevo);
      onClose();
    } catch (err) {
      console.error("Error al registrar materia prima:", err);
      // El error ya es capturado por el hook de TanStack Query
    }
  };

  const handleChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const isLeft = posicion === "izquierda";
  const isCenter = posicion === "centro";

  const labelClasses =
    "text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1";
  const inputClasses =
    "w-full bg-[var(--fill-secondary)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-[13px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-all";

  return (
    <div
      className={`fixed inset-0 z-[100] flex ${
        isCenter
          ? "items-start justify-center p-4 md:p-6"
          : isLeft
            ? "items-stretch justify-start"
            : "items-center justify-end"
      } bg-black/50 backdrop-blur-sm transition-all`}
      onClick={onClose}
    >
      <div
        className={`w-full bg-[var(--surface)] shadow-2xl flex flex-col ${
          isCenter
            ? "max-w-2xl max-h-[85vh] rounded-lg border border-[var(--border-subtle)] animate-in zoom-in duration-300"
            : isLeft
              ? "md:w-[500px] h-full border-r border-[var(--border-subtle)] slide-in-from-left animate-in duration-300"
              : "md:w-[500px] h-screen border-l border-[var(--border-subtle)] slide-in-from-right animate-in duration-300"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Elegante */}
        <div className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--surface-hover)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center bg-[var(--primary-subtle)] border border-[var(--primary)]/20 text-[var(--primary)] shadow-sm">
              <Package size={18} />
            </div>
            <div>
              <h2 className="text-[14px] font-black text-[var(--text-primary)] uppercase tracking-widest leading-none mb-1">
                {esEspecie ? "NUEVA ESPECIE" : "NUEVO INSUMO"}
              </h2>
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
                REGISTRO RÁPIDO
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 cursor-pointer rounded-md text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
          >
            <CerrarIcono size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8"
        >
          {/* 1. SECCIÓN: IDENTIFICACIÓN */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[12px] font-black text-[var(--primary)] uppercase tracking-[0.2em] whitespace-nowrap">
                Identificación de Especie
              </span>
              <div className="h-px w-full bg-[var(--border-subtle)]" />
            </div>

            <div className="space-y-1.5">
              <label className={labelClasses}>Nombre de la Especie</label>
              <input
                type="text"
                placeholder="EJ: TRIGO, MAIZ, SOJA..."
                value={form.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className={`${inputClasses} uppercase`}
                required
              />
            </div>

            {/* CATEGORIA DE MATERIA */}
            {/* 
            <div className="space-y-1.5">
              <label className={labelClasses}>
                Categoría de Material
              </label>
              <div className="relative">
                <select
                  value={form.tipo}
                  onChange={(e) => handleChange("tipo", e.target.value)}
                  className={`${inputClasses} appearance-none cursor-pointer uppercase`}
                >
                  <option value="INSUMO">ESPECIE - Tipo especie</option>
                  <option value="FRUTA">FRUTA - Insumo fresco/agrícola</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[var(--text-muted)]">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div> */}
          </div>

          {/* 2. SECCIÓN: CONTROL DE STOCK */}
          {/* <div className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[12px] font-black text-[var(--primary)] uppercase tracking-[0.2em] whitespace-nowrap">
                Control de Stock
              </span>
              <div className="h-px w-full bg-[var(--border-subtle)]" />
            </div>

            <div className="space-y-1.5">
              <label className={labelClasses}>Tipo de Magnitud (Unidad)</label>
              <div className="relative">
                <select
                  value={form.unidadMedida}
                  onChange={(e) => handleChange("unidadMedida", e.target.value)}
                  className={`${inputClasses} appearance-none cursor-pointer uppercase`}
                >
                  <option value="KG">Masa: Kilogramos (KG)</option>
                  <option value="GR">Masa: Gramos (GR)</option>
                  <option value="UND">Conteo: Unidades (UND)</option>
                  <option value="LT">Volumen: Litros (LT)</option>
                  <option value="ML">Volumen: Mililitros (ML)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-[var(--text-muted)]">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelClasses}>Existencia Inicial</label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={form.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                  className={inputClasses}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClasses}>Contenido por Envase</label>
                <input
                  type="number"
                  placeholder="Opcional"
                  step="0.01"
                  min="0"
                  value={form.cantidadPorPaquete}
                  onChange={(e) =>
                    handleChange("cantidadPorPaquete", e.target.value)
                  }
                  className={inputClasses}
                />
              </div>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-medium leading-relaxed italic mt-1">
              * Nota: Al dar de alta, la existencia inicial física impactará el
              inventario base del sistema.
            </p>
          </div> */}

          {/* Botones de Acción */}
          <div className="pt-8 flex flex-col gap-3">
            <button
              type="submit"
              disabled={estaCreando}
              className="w-full py-4 bg-[var(--primary)] disabled:opacity-50 text-white rounded-md text-[12px] font-black uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[var(--primary)]/20 cursor-pointer flex items-center justify-center gap-2"
            >
              {estaCreando && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {estaCreando ? "CREANDO ESPECIE..." : "REGISTRAR ESPECIE"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-[var(--fill-secondary)] text-[var(--text-muted)] rounded-md text-[11px] font-black uppercase tracking-[0.2em] border border-transparent hover:border-[var(--border-subtle)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            >
              DESCARTAR CAMBIOS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioMateriaPrima;
