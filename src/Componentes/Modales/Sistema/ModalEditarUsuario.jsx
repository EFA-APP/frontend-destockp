import React, { useState, useEffect } from "react";
import { CerrarIcono, PersonaIcono } from "../../../assets/Icons";
import { useActualizarUsuario } from "../../../Backend/Autenticacion/queries/Usuario/useActualizarUsuario.mutation";

const ModalEditarUsuario = ({ isOpen, onClose, usuarioAEditar, empresa }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correoElectronico: "",
  });

  const { mutateAsync: actualizarUsuario, isPending } = useActualizarUsuario();

  useEffect(() => {
    if (usuarioAEditar) {
      setFormData({
        nombre: usuarioAEditar.nombre || "",
        apellido: usuarioAEditar.apellido || "",
        correoElectronico: usuarioAEditar.correoElectronico || "",
      });
    }
  }, [usuarioAEditar]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actualizarUsuario({
        codigo: usuarioAEditar.codigo,
        codigoEmpresa: empresa.codigo || empresa.codigo,
        ...formData
      });
      onClose();
    } catch (error) {
      console.error("Error al actualizar usuario", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-black/10 bg-black/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[var(--primary)] flex items-center justify-center shadow-md shadow-[var(--primary)]/20">
              <PersonaIcono size="20" color="white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tighter text-black uppercase">
                Editar Usuario
              </h2>
              <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase">
                Actualizando Datos Personales
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-2 hover:bg-black/10 rounded-md transition-colors"
          >
            <CerrarIcono size={20} />
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* NOMBRE */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">
                Nombre (Requerido)
              </label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Juan"
                className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 focus:bg-white transition-all"
              />
            </div>

            {/* APELLIDO */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">
                Apellido (Requerido)
              </label>
              <input
                type="text"
                name="apellido"
                required
                value={formData.apellido}
                onChange={handleChange}
                placeholder="Ej. Pérez"
                className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 focus:bg-white transition-all"
              />
            </div>

            {/* CORREO ELECTRÓNICO */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="correoElectronico"
                required
                value={formData.correoElectronico}
                onChange={handleChange}
                placeholder="juan.perez@ejemplo.com"
                className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 focus:bg-white transition-all"
              />
            </div>
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
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditarUsuario;
