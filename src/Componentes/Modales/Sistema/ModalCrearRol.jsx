import React, { useState, useEffect } from "react";
import { CerrarIcono, RolIcono } from "../../../assets/Icons";
import { useCrearRol } from "../../../Backend/Autenticacion/queries/Rol/useCrearRol.mutation";
import { useActualizarRol } from "../../../Backend/Autenticacion/queries/Rol/useActualizarRol.mutation";

const ModalCrearRol = ({ isOpen, onClose, empresa, rolAEditar = null }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    activo: true,
  });

  const { mutateAsync: crearRol, isPending: isPendingCrear } = useCrearRol();
  const { mutateAsync: actualizarRol, isPending: isPendingEditar } =
    useActualizarRol();

  const isPending = isPendingCrear || isPendingEditar;
  const modoEdicion = !!rolAEditar;

  useEffect(() => {
    if (rolAEditar && isOpen) {
      setFormData({
        nombre: rolAEditar.nombre || "",
        descripcion: rolAEditar.descripcion || "",
        activo: rolAEditar.activo ?? true,
      });
    } else {
      setFormData({ nombre: "", descripcion: "", activo: true });
    }
  }, [rolAEditar, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        nombre: formData.nombre.trim().toUpperCase(),
      };

      if (modoEdicion) {
        // En este sistema, el ID del rol para actualizar suele pasarse como 'codigo'
        await actualizarRol({
          codigo: rolAEditar.codigo || rolAEditar.codigoSecuencial,
          codigoEmpresa: Number(empresa.codigo || empresa.codigoSecuencial),
          data: payload,
        });
      } else {
        await crearRol({
          codigoEmpresa: Number(empresa.codigo || empresa.codigoSecuencial),
          data: payload,
        });
      }
      onClose();
    } catch (error) {
      console.error("Error al procesar rol", error);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-black/10 bg-black/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-black flex items-center justify-center shadow-md shadow-black/20">
              <RolIcono size="20" color="white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tighter text-black uppercase">
                {modoEdicion ? "Editar Rol" : "Nuevo Rol"}
              </h2>
              <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase">
                {modoEdicion
                  ? `Modificando ${rolAEditar.nombre}`
                  : "Define un nuevo perfil de acceso"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-black/10 rounded-md transition-colors"
          >
            <CerrarIcono size={20} />
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">
              Nombre del Rol
            </label>
            <input
              type="text"
              required
              name="nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  nombre: e.target.value.toUpperCase(),
                }))
              }
              placeholder="EJ: ADMINISTRADOR, VENDEDOR..."
              className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:bg-white transition-all placeholder:text-black/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe las responsabilidades de este rol..."
              rows={3}
              className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:bg-white transition-all resize-none placeholder:text-black/20"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-black/5 rounded-md border border-black/5">
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase text-black">
                Estado del Rol
              </span>
              <span className="text-[9px] font-bold text-black/40 uppercase">
                Define si el rol puede ser asignado
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, activo: !prev.activo }))
              }
              className={`w-12 h-6 rounded-full transition-all relative ${formData.activo ? "bg-emerald-500" : "bg-black/20"}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.activo ? "left-7" : "left-1"}`}
              />
            </button>
          </div>

          {/* ACCIONES */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-black/20 rounded-md text-[12px] font-black uppercase tracking-widest text-black hover:bg-black/5 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-8 py-2.5 bg-black text-white rounded-md text-[12px] font-black uppercase tracking-widest shadow-md hover:bg-black/80 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              {isPending
                ? "Procesando..."
                : modoEdicion
                  ? "Guardar Cambios"
                  : "Crear Rol"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCrearRol;
