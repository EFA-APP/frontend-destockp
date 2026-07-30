import React, { useState } from "react";
import { CerrarIcono, ConfiguracionIcono, BorrarIcono } from "../../../assets/Icons";
import { useCrearSeccion } from "../../../Backend/Autenticacion/queries/Secciones/useCrearSeccion.mutation";
import { useEditarSeccion } from "../../../Backend/Autenticacion/queries/Secciones/useEditarSeccion.mutation";

// rbac-normalizacion-secciones-permisos (R20, R21, R22): Seccion es un
// catálogo GLOBAL, sin codigoEmpresa. Se elimina el selector "Permiso
// Requerido" (ya no existe Permiso) y el panel "Catálogo Global" de
// plantillas por-empresa (la Sección editada acá YA ES el catálogo
// global, no hay copias por-empresa que crear).
//
// Revisión 3 (R51, R58): agrega input numérico `orden` (Sección y cada
// SubMenu) y valida que `subMenus` no quede vacío antes de permitir el
// submit (espejo de la validación de servidor R49/R50, que sigue siendo
// la autoridad final).
const ModalCrearSeccion = ({ isOpen, onClose, empresa, seccionAEditar = null }) => {
  const [formData, setFormData] = useState({
    id_seccion: "",
    nombre: "",
    icono: "",
    redireccion: "",
    orden: 0,
    subMenus: [],
  });
  const [errorSubMenus, setErrorSubMenus] = useState("");

  const { mutateAsync: crearSeccion, isPending: isPendingCrear } = useCrearSeccion();
  const { mutateAsync: editarSeccion, isPending: isPendingEditar } = useEditarSeccion();

  const isPending = isPendingCrear || isPendingEditar;
  const modoEdicion = !!seccionAEditar;

  // Cargar datos si estamos editando
  React.useEffect(() => {
    if (seccionAEditar) {
      setFormData({
        codigo: seccionAEditar.codigo,
        id_seccion: seccionAEditar.id_seccion || "",
        nombre: seccionAEditar.nombre || "",
        icono: seccionAEditar.icono || "",
        redireccion: seccionAEditar.redireccion || "",
        orden: seccionAEditar.orden ?? 0,
        subMenus: seccionAEditar.subMenus?.map(sm => ({ nombre: sm.nombre, redireccion: sm.redireccion, orden: sm.orden ?? 0 })) || [],
      });
    } else {
      setFormData({ id_seccion: "", nombre: "", icono: "", redireccion: "", orden: 0, subMenus: [] });
    }
    setErrorSubMenus("");
  }, [seccionAEditar, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- LOGICA SUBMENUS ---
  const handleAddSubMenu = () => {
    setFormData(prev => ({
      ...prev,
      subMenus: [...prev.subMenus, { nombre: "", redireccion: "", orden: prev.subMenus.length }]
    }));
    setErrorSubMenus("");
  };

  const handleRemoveSubMenu = (index) => {
    setFormData(prev => ({
      ...prev,
      subMenus: prev.subMenus.filter((_, i) => i !== index)
    }));
  };

  const handleSubMenuChange = (index, field, value) => {
    setFormData(prev => {
      const nuevos = [...prev.subMenus];
      nuevos[index][field] = value;
      return { ...prev, subMenus: nuevos };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const subMenusLimpios = formData.subMenus
        .filter(sm => sm.nombre.trim() !== "" && sm.redireccion.trim() !== "")
        .map(sm => ({ ...sm, orden: Number(sm.orden) || 0 }));

      // R51: espejo de R49/R50 -- toda Sección debe conservar al menos 1
      // SubMenu. No reemplaza la validación de servidor, que sigue siendo
      // la autoridad final.
      if (subMenusLimpios.length === 0) {
        setErrorSubMenus("La Sección debe tener al menos 1 SubMenú con nombre y redirección completos.");
        return;
      }
      setErrorSubMenus("");

      const payload = {
        ...formData,
        id_seccion: formData.id_seccion.trim().toUpperCase(),
        orden: Number(formData.orden) || 0,
        subMenus: subMenusLimpios,
      };

      if (modoEdicion) {
        await editarSeccion(payload);
      } else {
        await crearSeccion(payload);
      }

      onClose();
    } catch (error) {
      console.error("Error al procesar sección", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-black/10 bg-black/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20">
              <ConfiguracionIcono size="20" color="white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tighter text-black uppercase">
                Administrador de Secciones
              </h2>
              <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase">
                Catálogo global de secciones y submenús
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-black/10 rounded-md transition-colors">
            <CerrarIcono size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">

            {/* DATOS BASICOS */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">ID Técnico</label>
                <input
                  type="text"
                  required
                  value={formData.id_seccion}
                  onChange={(e) => setFormData(prev => ({...prev, id_seccion: e.target.value.toUpperCase()}))}
                  placeholder="VENTAS"
                  className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:bg-white transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">Nombre Visible</label>
                <input
                  type="text"
                  required
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Gestión de Ventas"
                  className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:bg-white transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">Icono</label>
                <input
                  type="text"
                  name="icono"
                  value={formData.icono}
                  onChange={handleChange}
                  placeholder="VentasIcono"
                  className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:bg-white transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">Redirección</label>
                <input
                  type="text"
                  name="redireccion"
                  value={formData.redireccion}
                  onChange={handleChange}
                  placeholder="/ventas"
                  className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:bg-white transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">Orden</label>
                <input
                  type="number"
                  name="orden"
                  value={formData.orden}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* GESTIÓN DE SUBMENÚS */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-black/10 pb-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-black">SubMenús Habilitados</label>
                <button
                  type="button"
                  onClick={handleAddSubMenu}
                  className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-black text-white rounded-sm hover:bg-black/80 transition-all"
                >
                  + Añadir SubMenú
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {formData.subMenus.length > 0 ? (
                  formData.subMenus.map((sm, index) => (
                    <div key={index} className="flex items-center gap-3 animate-in slide-in-from-left-2 duration-200">
                      <input
                        type="text"
                        required
                        placeholder="Nombre SubMenú"
                        value={sm.nombre}
                        onChange={(e) => handleSubMenuChange(index, "nombre", e.target.value)}
                        className="flex-1 px-3 py-2 bg-black/5 border border-black/5 rounded-md text-[12px] font-bold focus:bg-white focus:outline-none"
                      />
                      <input
                        type="text"
                        required
                        placeholder="/ruta/destino"
                        value={sm.redireccion}
                        onChange={(e) => handleSubMenuChange(index, "redireccion", e.target.value)}
                        className="flex-1 px-3 py-2 bg-black/5 border border-black/5 rounded-md text-[12px] font-bold focus:bg-white focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Orden"
                        value={sm.orden ?? 0}
                        onChange={(e) => handleSubMenuChange(index, "orden", e.target.value)}
                        className="w-24 px-3 py-2 bg-black/5 border border-black/5 rounded-md text-[12px] font-bold focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSubMenu(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <BorrarIcono size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center border-2 border-dashed border-black/5 rounded-md">
                    <p className="text-[11px] font-bold text-black/30 italic uppercase tracking-tighter">No hay submenús definidos</p>
                  </div>
                )}
                {errorSubMenus && (
                  <p className="text-[11px] font-bold text-red-500 uppercase tracking-tight ml-1">{errorSubMenus}</p>
                )}
              </div>
            </div>

            {/* BOTON GUARDAR */}
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
                className="px-8 py-2.5 bg-emerald-600 rounded-md text-[12px] font-black uppercase tracking-widest text-white shadow-md hover:bg-emerald-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                {isPending ? "Procesando..." : "Guardar Sección"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalCrearSeccion;
