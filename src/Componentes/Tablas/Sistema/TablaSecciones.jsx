import React, { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Highlight } from "../../UI/DataTable/DataTable";
import { renderIconoSeccion } from "./RolesPermisos/ColumnasSecciones";
import { accionesReutilizables } from "../../UI/AccionesReutilizables/accionesReutilizables";

// rbac-normalizacion-secciones-permisos, Revisión 3 (R60-R63): reemplaza la
// tabla plana anterior (DataTable.jsx genérico) por una vista jerárquica
// tipo árbol -- cada Sección es una fila padre expandible (ordenada por
// `orden`, R60), con sus SubMenus activos como filas hijas indentadas
// (también ordenados por `orden`) mostrando directamente `nombre` y
// `redireccion` (R62), sin necesidad de abrir ModalCrearSeccion.jsx para
// verlas (R61). ModalCrearSeccion.jsx queda exclusivamente para alta/
// edición (R63). Mismo patrón de acordeón ya usado en
// ModalVincularPermisosRol.jsx (seccionExpandida + chevron).
const TablaSecciones = ({
  secciones,
  cargando,
  busqueda,
  onRefrescar,
  handleEditarClick,
  handleEliminarClick,
}) => {
  const [seccionExpandida, setSeccionExpandida] = useState(null);

  const seccionesFiltradas = useMemo(() => {
    const termino = (busqueda || "").toUpperCase();
    const lista = Array.isArray(secciones) ? secciones : [];
    if (!termino) return lista;
    return lista.filter(
      (s) =>
        s.nombre?.toUpperCase().includes(termino) ||
        s.id_seccion?.toUpperCase().includes(termino) ||
        s.subMenus?.some((sm) => sm.nombre?.toUpperCase().includes(termino)),
    );
  }, [secciones, busqueda]);

  const toggleSeccion = (codigo) => {
    setSeccionExpandida((prev) => (prev === codigo ? null : codigo));
  };

  return (
    <div className="bg-white rounded-md border border-black/5 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 bg-black/[0.01]">
        <div>
          <h3 className="text-[13px] font-black uppercase tracking-tight text-black">Gestión de Secciones</h3>
          <p className="text-[11px] font-bold text-[var(--text-muted)]">Módulos y vistas principales de la plataforma</p>
        </div>
        {onRefrescar && (
          <button
            type="button"
            onClick={onRefrescar}
            className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-black/5 hover:bg-black/10 rounded-md transition-all"
          >
            Refrescar
          </button>
        )}
      </div>

      {cargando ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin" />
          <span className="text-[11px] font-black uppercase tracking-widest text-black/40">Cargando...</span>
        </div>
      ) : seccionesFiltradas.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[11px] font-bold text-black/30 italic uppercase tracking-tighter">No hay secciones</p>
        </div>
      ) : (
        <div className="max-h-[600px] overflow-y-auto divide-y divide-black/5">
          {seccionesFiltradas.map((seccion) => {
            const subMenus = (seccion.subMenus || []).filter((sm) => sm.activo !== false);
            const expandida = seccionExpandida === seccion.codigo;

            return (
              <div key={seccion.codigo}>
                {/* FILA PADRE — SECCIÓN */}
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-black/[0.02] transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleSeccion(seccion.codigo)}
                    className="p-1 rounded-md hover:bg-black/10 transition-colors shrink-0"
                    title={expandida ? "Contraer" : "Expandir"}
                  >
                    <ChevronRight
                      size={16}
                      className={`transition-transform duration-200 ${expandida ? "rotate-90" : ""}`}
                    />
                  </button>

                  {renderIconoSeccion(seccion)}

                  <div className="flex-1 flex flex-col min-w-0">
                    <span className="font-black text-[13px] uppercase tracking-tight text-black leading-tight truncate">
                      <Highlight text={seccion.nombre} term={busqueda} />
                    </span>
                    <span className="text-[10px] font-bold text-[var(--text-muted)] mt-0.5 truncate">
                      ID: {seccion.id_seccion} · Orden: {seccion.orden ?? 0} · {subMenus.length} SubMenú
                      {subMenus.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <span className="text-[10px] font-black text-[var(--text-muted)] shrink-0">
                    #{String(seccion.codigo).padStart(3, "0")}
                  </span>

                  <span
                    className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border shrink-0 ${
                      seccion.activo
                        ? "bg-emerald-700/10 text-emerald-400 border-emerald-700/20"
                        : "bg-red-700/10 text-red-400 border-red-700/20"
                    }`}
                  >
                    {seccion.activo ? "ACTIVO" : "INACTIVO"}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div onClick={() => handleEditarClick(seccion)}>{accionesReutilizables.editar.icono}</div>
                    <div onClick={() => handleEliminarClick(seccion)}>{accionesReutilizables.eliminar.icono}</div>
                  </div>
                </div>

                {/* FILAS HIJAS — SUBMENUS */}
                {expandida && (
                  <div className="bg-black/[0.01] border-t border-black/5">
                    {subMenus.length > 0 ? (
                      subMenus.map((sm) => (
                        <div
                          key={sm.codigo}
                          className="flex items-center gap-3 pl-16 pr-4 py-2.5 border-b border-black/[0.03] last:border-b-0"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-black/20 shrink-0" />
                          <span className="text-[12px] font-bold text-black/80 truncate">
                            <Highlight text={sm.nombre} term={busqueda} />
                          </span>
                          <span className="text-[11px] font-mono text-[var(--text-muted)] truncate">{sm.redireccion}</span>
                          <span className="ml-auto text-[10px] font-bold text-[var(--text-muted)] shrink-0">
                            Orden: {sm.orden ?? 0}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="pl-16 pr-4 py-3">
                        <p className="text-[11px] font-bold text-black/30 italic">Sin SubMenus activos</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TablaSecciones;
