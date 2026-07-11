import React, { useState, useMemo } from "react";
import { CerrarIcono, ConfiguracionIcono, VincularRolUsuarioIcono, BorrarIcono } from "../../../assets/Icons";
import { useCrearSeccion } from "../../../Backend/Autenticacion/queries/Secciones/useCrearSeccion.mutation";
import { useEditarSeccion } from "../../../Backend/Autenticacion/queries/Secciones/useEditarSeccion.mutation";
import { useObtenerSeccionesGlobales } from "../../../Backend/Autenticacion/queries/Secciones/useObtenerSeccionesGlobales.query";
import { useObtenerPermisos } from "../../../Backend/Autenticacion/queries/Permiso/useObtenerPermisos.query";

const ModalCrearSeccion = ({ isOpen, onClose, empresa, seccionAEditar = null }) => {
  const [busquedaGlobal, setBusquedaGlobal] = useState("");
  const [formData, setFormData] = useState({
    id_seccion: "",
    nombre: "",
    icono: "",
    redireccion: "",
    permisoRequerido: "",
    subMenus: [],
  });

  const filtroEmpresa = { codigoEmpresa: empresa.codigo || empresa.codigo };
  const { data: seccionesGlobales, isLoading: isLoadingGlobal } = useObtenerSeccionesGlobales();
  const { data: permisosExistentes, isLoading: isLoadingPermisos } = useObtenerPermisos(filtroEmpresa);
  
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
        permisoRequerido: seccionAEditar.permisoRequerido || "",
        subMenus: seccionAEditar.subMenus?.map(sm => ({ nombre: sm.nombre, redireccion: sm.redireccion })) || [],
      });
    } else {
      setFormData({ id_seccion: "", nombre: "", icono: "", redireccion: "", permisoRequerido: "", subMenus: [] });
    }
  }, [seccionAEditar, isOpen]);

  // Extraer permisos correctamente
  const listaPermisos = Array.isArray(permisosExistentes) ? permisosExistentes : permisosExistentes?.data || [];

  // Filtrado de catálogo global
  const catalogoFiltrado = useMemo(() => {
    if (!seccionesGlobales) return [];
    return seccionesGlobales.filter(s => 
      s.nombre.toLowerCase().includes(busquedaGlobal.toLowerCase()) ||
      s.id_seccion.toLowerCase().includes(busquedaGlobal.toLowerCase())
    );
  }, [seccionesGlobales, busquedaGlobal]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSeleccionarPlantilla = (plantilla) => {
    setFormData({
      id_seccion: plantilla.id_seccion.toUpperCase(),
      nombre: plantilla.nombre,
      icono: plantilla.icono || "",
      redireccion: plantilla.redireccion || "",
      permisoRequerido: plantilla.permisoRequerido || "",
      subMenus: plantilla.subMenus?.map(sm => ({ nombre: sm.nombre, redireccion: sm.redireccion })) || [],
    });
  };

  // --- LOGICA SUBMENUS ---
  const handleAddSubMenu = () => {
    setFormData(prev => ({
      ...prev,
      subMenus: [...prev.subMenus, { nombre: "", redireccion: "" }]
    }));
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
        .filter(sm => sm.nombre.trim() !== "" && sm.redireccion.trim() !== "");

      const { permisoRequerido, ...restoData } = formData;
      const payload = {
        codigoEmpresa: Number(empresa.codigo || empresa.codigo),
        ...restoData,
        id_seccion: formData.id_seccion.trim().toUpperCase(),
        subMenus: subMenusLimpios,
        permisoRequerido: permisoRequerido ? Number(permisoRequerido) : undefined
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
      <div className="bg-white rounded-md shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
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
                Crea o importa módulos para {empresa.nombre}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-black/10 rounded-md transition-colors">
            <CerrarIcono size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* PANEL IZQUIERDO: CATALOGO */}
          <div className="w-1/3 border-r border-black/10 bg-black/[0.01] flex flex-col">
            <div className="p-4 border-b border-black/5">
              <label className="text-[10px] font-black uppercase tracking-widest text-black/50 mb-2 block">
                Catálogo Global
              </label>
              <input 
                type="text" 
                placeholder="Buscar plantilla..."
                value={busquedaGlobal}
                onChange={(e) => setBusquedaGlobal(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-black/10 rounded-md text-[12px] font-bold focus:outline-none focus:border-black/20 transition-all"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
              {isLoadingGlobal ? (
                <div className="p-4 text-center text-[11px] font-bold text-black/40 italic">Cargando catálogo...</div>
              ) : catalogoFiltrado.length > 0 ? (
                catalogoFiltrado.map(plantilla => (
                  <button
                    key={plantilla.id_seccion}
                    onClick={() => handleSeleccionarPlantilla(plantilla)}
                    className="flex flex-col p-3 text-left hover:bg-black/5 rounded-md border border-transparent hover:border-black/10 transition-all group"
                  >
                    <span className="text-[12px] font-black uppercase text-black group-hover:text-emerald-600">{plantilla.nombre}</span>
                    <span className="text-[10px] font-bold text-black/40">{plantilla.id_seccion}</span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-[11px] font-bold text-black/40 italic">No se encontraron plantillas.</div>
              )}
            </div>
          </div>

          {/* PANEL DERECHO: FORMULARIO */}
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
                  <label className="text-[11px] font-black uppercase tracking-widest text-black/70 ml-1">Permiso Requerido</label>
                  <select
                    name="permisoRequerido"
                    value={formData.permisoRequerido}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-black/5 border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:bg-white transition-all appearance-none"
                  >
                    <option value="">-- GENERAR AUTOMÁTICAMENTE --</option>
                    {listaPermisos.map(p => (
                      <option key={p.codigo} value={p.codigo}>
                        {p.nombre} ({p.codigo})
                      </option>
                    ))}
                  </select>
                  <p className="text-[9px] font-bold text-black/40 uppercase ml-1 italic">
                    Si no eliges uno, se creará uno nuevo con el nombre de la sección.
                  </p>
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
    </div>
  );
};

export default ModalCrearSeccion;
