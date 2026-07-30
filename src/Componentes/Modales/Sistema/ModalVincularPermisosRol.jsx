import React, { useState, useMemo, useEffect } from "react";
import { CerrarIcono, RolIcono } from "../../../assets/Icons";
import { useObtenerSeccionesQuery } from "../../../Backend/Autenticacion/queries/Secciones/useObtenerSecciones.query";
import { useObtenerAcciones } from "../../../Backend/Autenticacion/queries/Accion/useObtenerAcciones.query";
import { useAsignarAccionesARol } from "../../../Backend/Autenticacion/queries/Rol/useAsignarAccionesARol.mutation";

// rbac-normalizacion-secciones-permisos (R38): resignificado para operar
// sobre Accion+RolSeccionAccion (selección de SubMenu + Acciones concretas
// a conceder al Rol), reemplazando la selección a nivel de Sección
// únicamente que ofrecía Permiso.
//
// Revisión 3 (R44, R65): la granularidad de concesión pasa de Sección a
// SubMenu -- reemplazo total, no una capa adicional (R47). El estado de
// selección pasa de `{ [codigoSeccion]: Set<codigoAccion> }` a
// `{ [codigoSubMenu]: Set<codigoAccion> }`; cada Sección se expande
// mostrando sus SubMenus (nivel de anidamiento adicional respecto del
// acordeón anterior, que expandía directamente Sección -> chips de
// Acción -- ahora es Sección -> SubMenu -> chips de Acción).
// `rol.secciones[].subMenus[].acciones` ya viene armado por
// Rol.repositorio.ts.obtenerTodos()/_agruparPorSeccionYSubMenu (buscarRoles).
const ModalVincularPermisosRol = ({ isOpen, onClose, rol, empresa }) => {
  const [seleccion, setSeleccion] = useState({}); // { [codigoSubMenu]: Set<codigoAccion> }
  const [seccionExpandida, setSeccionExpandida] = useState(null);
  const [subMenuExpandido, setSubMenuExpandido] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const { data: secciones, isLoading: isLoadingSecciones } = useObtenerSeccionesQuery();
  const { data: acciones, isLoading: isLoadingAcciones } = useObtenerAcciones();
  const { mutateAsync: asignarAccionesARol, isPending: isGuardando } = useAsignarAccionesARol();

  const listaSecciones = Array.isArray(secciones) ? secciones : secciones?.data || [];
  const listaAcciones = Array.isArray(acciones) ? acciones : acciones?.data || [];

  const codigoPorNombreAccion = useMemo(() => {
    const mapa = new Map();
    listaAcciones.forEach((a) => mapa.set(a.nombre, a.codigo));
    return mapa;
  }, [listaAcciones]);

  // Inicializar selección cuando se abre el modal o cambia el rol
  useEffect(() => {
    if (isOpen && rol && listaAcciones.length > 0) {
      const inicial = {};
      (rol.secciones || []).forEach((s) => {
        (s.subMenus || []).forEach((sm) => {
          inicial[sm.codigoSubMenu] = new Set(
            (sm.acciones || [])
              .map((nombre) => codigoPorNombreAccion.get(nombre))
              .filter((codigo) => codigo !== undefined),
          );
        });
      });
      setSeleccion(inicial);
    }
  }, [isOpen, rol, listaAcciones, codigoPorNombreAccion]);

  if (!isOpen || !rol) return null;

  const toggleAccion = (codigoSubMenu, codigoAccion) => {
    setSeleccion((prev) => {
      const actual = new Set(prev[codigoSubMenu] || []);
      if (actual.has(codigoAccion)) actual.delete(codigoAccion);
      else actual.add(codigoAccion);
      return { ...prev, [codigoSubMenu]: actual };
    });
  };

  const toggleSubMenu = (codigoSubMenu) => {
    setSeleccion((prev) => {
      const actuales = prev[codigoSubMenu] || new Set();
      // Si tiene TODAS las acciones, las quitamos todas. Si le falta alguna, le damos todas.
      if (actuales.size === listaAcciones.length && listaAcciones.length > 0) {
        return { ...prev, [codigoSubMenu]: new Set() };
      } else {
        return { ...prev, [codigoSubMenu]: new Set(listaAcciones.map((a) => a.codigo)) };
      }
    });
  };

  const handleGuardar = async () => {
    try {
      const codigoEmpresa = Number(empresa.codigo || empresa.codigo);
      const subMenusYaConcedidos = (rol.secciones || []).flatMap((s) => (s.subMenus || []).map((sm) => sm.codigoSubMenu));
      const subMenusATocar = new Set([...Object.keys(seleccion).map(Number), ...subMenusYaConcedidos]);

      for (const codigoSubMenu of subMenusATocar) {
        await asignarAccionesARol({
          codigoEmpresa,
          codigoRol: rol.codigo,
          codigoSubMenu,
          acciones: Array.from(seleccion[codigoSubMenu] || []),
        });
      }
      onClose();
    } catch (error) {
      console.error("Error al actualizar acciones del rol", error);
    }
  };

  const seccionesFiltradas = listaSecciones.filter(
    (s) =>
      s.nombre.toUpperCase().includes(busqueda.toUpperCase()) ||
      s.id_seccion.toUpperCase().includes(busqueda.toUpperCase()) ||
      (s.subMenus || []).some((sm) => sm.nombre?.toUpperCase().includes(busqueda.toUpperCase())),
  );

  const totalAccionesSeleccionadas = Object.values(seleccion).reduce((acc, set) => acc + set.size, 0);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">

        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-black/10 bg-black/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-indigo-600 flex items-center justify-center shadow-md">
              <RolIcono size="20" color="white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tighter text-black uppercase">
                Acciones del Rol: {rol.nombre}
              </h2>
              <p className="text-[11px] font-bold text-[var(--text-muted)] tracking-widest uppercase">
                Elegí, por Sección, qué Acciones concretas tiene este Rol
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

        {/* BUSCADOR */}
        <div className="p-4 border-b border-black/5 bg-black/[0.01]">
          <input
            type="text"
            placeholder="BUSCAR SECCIÓN..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-black/10 rounded-md text-[13px] font-bold focus:outline-none focus:border-black/30 transition-all shadow-sm"
          />
        </div>

        {/* LISTADO DE SECCIONES */}
        <div className="flex-1 overflow-y-auto p-4 bg-black/[0.01]">
          {isLoadingSecciones || isLoadingAcciones ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin"></div>
              <span className="text-[11px] font-black uppercase tracking-widest text-black/40">Cargando...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {seccionesFiltradas.map((seccion) => {
                const subMenus = (seccion.subMenus || []).filter((sm) => sm.activo !== false);
                const totalSeleccionadasSeccion = subMenus.reduce(
                  (acc, sm) => acc + (seleccion[sm.codigo]?.size || 0),
                  0,
                );
                const expandida = seccionExpandida === seccion.codigo;
                return (
                  <div key={seccion.codigo} className="bg-white border border-black/5 rounded-md overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setSeccionExpandida(expandida ? null : seccion.codigo)}
                      className="w-full flex items-center justify-between p-3 hover:bg-black/5 transition-all"
                    >
                      <span className="text-[12px] font-black uppercase tracking-tight text-black">
                        {seccion.nombre}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${
                          totalSeleccionadasSeccion > 0 ? "bg-indigo-600 text-white" : "bg-black/10 text-black/40"
                        }`}
                      >
                        {totalSeleccionadasSeccion} acciones
                      </span>
                    </button>
                    {expandida && (
                      <div className="border-t border-black/5 bg-black/[0.01] divide-y divide-black/5">
                        {subMenus.length === 0 ? (
                          <p className="p-3 text-[11px] font-bold text-black/30 italic">Sin SubMenus activos</p>
                        ) : (
                          subMenus.map((subMenu) => {
                            const seleccionadas = seleccion[subMenu.codigo] || new Set();
                            const isAllSelected = seleccionadas.size === listaAcciones.length && listaAcciones.length > 0;
                            const isSomeSelected = seleccionadas.size > 0 && seleccionadas.size < listaAcciones.length;
                            const expandido = subMenuExpandido === subMenu.codigo;

                            return (
                              <div key={subMenu.codigo} className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => toggleSubMenu(subMenu.codigo)}
                                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                        isAllSelected ? "bg-indigo-600" : isSomeSelected ? "bg-indigo-300" : "bg-gray-200"
                                      }`}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                          isAllSelected || isSomeSelected ? "translate-x-4" : "translate-x-0"
                                        }`}
                                      />
                                    </button>
                                    <span className="text-[12px] font-black uppercase tracking-tight text-black/80">
                                      {subMenu.nombre}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                        seleccionadas.size > 0 ? "bg-indigo-600/80 text-white" : "bg-black/10 text-black/40"
                                      }`}
                                    >
                                      {seleccionadas.size} acciones
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setSubMenuExpandido(expandido ? null : subMenu.codigo)}
                                      className="p-1 hover:bg-black/5 rounded-md transition-colors text-black/50 hover:text-black/80"
                                      title="Configurar acciones específicas"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                
                                {expandido && (
                                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-black/5">
                                    {/* feature accion-vinculada-a-submenu (R5): antes mostraba
                                        TODAS las Acciones del catálogo sin importar a qué SubMenu
                                        pertenecían. Ahora sólo se listan las que tienen
                                        codigoSubMenu === subMenu.codigo -- las que aún no fueron
                                        asignadas (codigoSubMenu null) no aparecen acá hasta que el
                                        humano las asigne desde "Editar Acción". No se toca el switch
                                        "todo o nada" de más arriba (feature 12, ya done). */}
                                    {listaAcciones.filter((a) => a.codigoSubMenu === subMenu.codigo).length === 0 ? (
                                      <p className="text-[10px] font-bold text-black/30 italic uppercase">
                                        Ninguna Acción del catálogo está asignada a este SubMenú todavía
                                      </p>
                                    ) : (
                                      listaAcciones
                                        .filter((a) => a.codigoSubMenu === subMenu.codigo)
                                        .map((accionCatalogo) => {
                                          const isSelected = seleccionadas.has(accionCatalogo.codigo);
                                          return (
                                            <button
                                              key={accionCatalogo.codigo}
                                              type="button"
                                              onClick={() => toggleAccion(subMenu.codigo, accionCatalogo.codigo)}
                                              className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                isSelected
                                                  ? "bg-indigo-600 border-indigo-600 text-white"
                                                  : "bg-white border-black/10 text-black/60 hover:border-black/30"
                                              }`}
                                            >
                                              {accionCatalogo.nombre}
                                            </button>
                                          );
                                        })
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-black/10 bg-black/[0.02] flex items-center justify-between">
          <div className="text-[11px] font-black uppercase tracking-widest text-black/40 ml-2">
            {totalAccionesSeleccionadas} Acciones Seleccionadas
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-black/10 rounded-md text-[12px] font-black uppercase tracking-widest text-black hover:bg-black/5 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={isGuardando}
              className="px-8 py-2.5 bg-black text-white rounded-md text-[12px] font-black uppercase tracking-widest shadow-md hover:bg-black/80 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isGuardando ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalVincularPermisosRol;
