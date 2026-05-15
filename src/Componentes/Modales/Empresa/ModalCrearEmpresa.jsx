import React, { useState } from "react";
import { CerrarIcono, ConfiguracionEmpresaIcono } from "../../../assets/Icons";
import { useCrearEmpresa } from "../../../Backend/Autenticacion/queries/Empresa/useCrearEmpresa.mutation";

const ModalCrearEmpresa = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    condicionIva: "",
    usaContabilidad: false,
  });

  const { mutateAsync: crearEmpresa, isPending } = useCrearEmpresa();

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await crearEmpresa(formData);
      onClose();
    } catch (error) {
      console.error("Error al crear empresa", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-black/10 bg-black/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[var(--primary)] flex items-center justify-center shadow-md shadow-[var(--primary)]/20">
              <ConfiguracionEmpresaIcono size="20" color="white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tighter text-black uppercase">
                Nueva Empresa
              </h2>
              <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase">
                Alta de Organización
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-2 hover:bg-black/10 rounded-md transition-colors"
          >
            <CerrarIcono size={20} />
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* NOMBRE DE FANTASÍA */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">
              Nombre de la Empresa (Requerido)
            </label>
            <input
              type="text"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. EFA S.A."
              className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 focus:bg-white transition-all"
            />
          </div>

          {/* CONDICIÓN IVA */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">
              Condición frente al IVA
            </label>
            <select
              name="condicionIva"
              value={formData.condicionIva}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 focus:bg-white transition-all appearance-none"
            >
              <option value="">Seleccionar condición...</option>
              <option value="RI">Responsable Inscripto</option>
              <option value="M">Monotributo</option>
              <option value="EX">Exento</option>
              <option value="CF">Consumidor Final</option>
            </select>
          </div>

          {/* DESCRIPCIÓN */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">
              Descripción Adicional
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              placeholder="Notas u observaciones sobre esta empresa..."
              className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* OPCIONES AVANZADAS */}
          <div className="flex flex-col gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-md">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  name="usaContabilidad"
                  checked={formData.usaContabilidad}
                  onChange={(e) => setFormData(prev => ({ ...prev, usaContabilidad: e.target.checked }))}
                  className="peer sr-only"
                />
                <div className="w-10 h-5 bg-black/20 rounded-full peer-checked:bg-[var(--primary)] transition-all duration-300"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-all duration-300 shadow-sm"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-black uppercase tracking-tight text-black group-hover:text-[var(--primary)] transition-colors">
                  Activar Módulo Contable
                </span>
                <span className="text-[10px] font-bold text-[var(--text-muted)] leading-tight">
                  Habilita la generación automática de asientos para ventas y compras.
                </span>
              </div>
            </label>
          </div>

          {/* ACCIONES DEL FORMULARIO */}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-black/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-5 py-2.5 bg-white border border-black/20 rounded-md text-[12px] font-black uppercase tracking-widest text-black hover:bg-black/5 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-black rounded-md text-[12px] font-black uppercase tracking-widest text-white shadow-md hover:bg-black/80 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                "Crear Empresa"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCrearEmpresa;
